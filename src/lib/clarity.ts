/**
 * Microsoft Clarity helpers for routes that cannot load shared GTM.
 * Project ID matches the Glazier / DC78 Clarity tag installed via GTM-MGZPGP8C.
 */

import { SHARED_CLARITY_PROJECT_ID } from "@/lib/trackingIsolation";

export const CLARITY_PROJECT_ID = SHARED_CLARITY_PROJECT_ID;

export const GLASS_FABRICATION_CLARITY_TAG = {
  key: "application_type",
  value: "glass_fabrication",
} as const;

export const GLASS_FABRICATION_CLARITY_SUBMIT_EVENT =
  "glass_fabrication_application_submitted" as const;

type ClarityFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    clarity?: ClarityFn & { q?: unknown[] };
    __jbtClarityProjectId?: string;
  }
}

function clarityCall(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  if (typeof window.clarity === "function") {
    window.clarity(...args);
  }
}

/**
 * Inject the official Clarity bootstrap once for the given project.
 * Safe to call repeatedly — skips when the same project is already present.
 */
export function initClarity(projectId: string = CLARITY_PROJECT_ID): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (!projectId) return;

  if (window.__jbtClarityProjectId === projectId) {
    return;
  }

  const existingTag = document.querySelector(
    `script[src*="clarity.ms/tag/${projectId}"]`
  );
  if (existingTag) {
    window.__jbtClarityProjectId = projectId;
    return;
  }

  // Official Clarity snippet (queue-first, then async tag script)
  const w = window;
  w.clarity =
    w.clarity ||
    (function (...args: unknown[]) {
      ((w.clarity as ClarityFn & { q?: unknown[] }).q =
        (w.clarity as ClarityFn & { q?: unknown[] }).q || []).push(args);
    } as ClarityFn);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${projectId}`;
  script.dataset.jbtClarity = projectId;
  const first = document.getElementsByTagName("script")[0];
  first?.parentNode?.insertBefore(script, first);

  window.__jbtClarityProjectId = projectId;
}

export function setClarityTag(key: string, value: string | string[]): void {
  clarityCall("set", key, value);
}

export function trackClarityEvent(eventName: string): void {
  clarityCall("event", eventName);
}
