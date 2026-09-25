import { getVercelOidcToken } from "@vercel/oidc";
import {
  ExternalAccountClient,
  type BaseExternalAccountClient,
  type IdentityPoolClientOptions,
} from "google-auth-library";

const DRIVE_SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets",
] as const;

/**
 * Required env for Vercel OIDC → GCP Workload Identity Federation.
 * No private keys. Values are never returned to clients.
 */
export const REQUIRED_GCP_WIF_ENV = [
  "GCP_PROJECT_ID",
  "GCP_PROJECT_NUMBER",
  "GCP_SERVICE_ACCOUNT_EMAIL",
  "GCP_WORKLOAD_IDENTITY_POOL_ID",
  "GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID",
  "GOOGLE_SHARED_DRIVE_ID",
] as const;

export function getMissingGoogleEnvNames(): string[] {
  return REQUIRED_GCP_WIF_ENV.filter((name) => {
    const value = process.env[name]?.trim();
    return !value;
  });
}

export function assertGoogleDriveConfigured(): void {
  const missing = getMissingGoogleEnvNames();
  if (missing.length > 0) {
    throw new Error(
      `Google Drive is not configured on the server (missing: ${missing.join(", ")}).`
    );
  }
}

function requireEnv(name: (typeof REQUIRED_GCP_WIF_ENV)[number]): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Google Drive is not configured on the server (missing: ${name}).`
    );
  }
  return value;
}

/**
 * GCP "default audience" for the WIF provider (with https://).
 * Must match the provider Default audience URL in Google Cloud Console,
 * and must be passed to getVercelOidcToken({ audience }).
 */
export function getGcpWifAudience(): string {
  const projectNumber = requireEnv("GCP_PROJECT_NUMBER");
  const poolId = requireEnv("GCP_WORKLOAD_IDENTITY_POOL_ID");
  const providerId = requireEnv("GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID");
  return (
    process.env.GCP_AUDIENCE?.trim() ||
    `https://iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`
  );
}

/**
 * google-auth-library external_account audience uses the //iam.googleapis.com form.
 * @see ExternalAccountSupplierContext.audience examples
 */
function getExternalAccountAudience(): string {
  const httpsAudience = getGcpWifAudience();
  if (httpsAudience.startsWith("https:")) {
    return httpsAudience.replace(/^https:/, "");
  }
  return httpsAudience;
}

let cachedClient: BaseExternalAccountClient | null = null;

/**
 * Keyless Google auth via Vercel OIDC + Workload Identity Federation,
 * impersonating GCP_SERVICE_ACCOUNT_EMAIL (no JSON key / private key).
 */
export function getGoogleAuthClient(): BaseExternalAccountClient {
  assertGoogleDriveConfigured();

  if (cachedClient) return cachedClient;

  const serviceAccountEmail = requireEnv("GCP_SERVICE_ACCOUNT_EMAIL");
  const audience = getExternalAccountAudience();
  const httpsAudience = getGcpWifAudience();

  const options: IdentityPoolClientOptions = {
    type: "external_account",
    audience,
    subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
    token_url: "https://sts.googleapis.com/v1/token",
    service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccountEmail}:generateAccessToken`,
    subject_token_supplier: {
      getSubjectToken: async () =>
        getVercelOidcToken({
          audience: httpsAudience,
        }),
    },
    scopes: [...DRIVE_SCOPES],
  };

  const client = ExternalAccountClient.fromJSON(options);
  if (!client) {
    throw new Error("Failed to initialize Google Workload Identity client");
  }

  cachedClient = client;
  return client;
}

export async function getGoogleAccessToken(): Promise<string> {
  const client = getGoogleAuthClient();
  const token = await client.getAccessToken();
  const value = typeof token === "string" ? token : token?.token;
  if (!value) {
    throw new Error("Could not obtain Google access token via OIDC/WIF");
  }
  return value;
}

export function getSharedDriveId(): string {
  return requireEnv("GOOGLE_SHARED_DRIVE_ID");
}
