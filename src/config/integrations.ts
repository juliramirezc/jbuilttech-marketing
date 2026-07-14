/**
 * Integrations Configuration
 * Third-party service URLs and settings
 */

export const integrationsConfig = {
  calendly: {
    url: process.env.NEXT_PUBLIC_CALENDLY_URL || "",
    enabled: !!process.env.NEXT_PUBLIC_CALENDLY_URL,
  },
} as const;

export type IntegrationsConfig = typeof integrationsConfig;
