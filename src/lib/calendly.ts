/**
 * Calendly embed helpers
 *
 * Official flow:
 * 1. Open scheduling via Calendly popup widget (parent page stays on-site)
 * 2. Listen for `calendly.event_scheduled` postMessage
 * 3. Redirect to /thank-you ONLY after a successful booking
 *
 * Opening the popup alone never redirects.
 */

import {
  CALENDLY_BOOKING_URL,
  getCalendlyUrl,
} from "@/lib/links";

export const CALENDLY_WIDGET_JS =
  "https://assets.calendly.com/assets/external/widget.js";
export const CALENDLY_WIDGET_CSS =
  "https://assets.calendly.com/assets/external/widget.css";

/** In-app conversion path (works on localhost and production) */
export const CALENDLY_THANK_YOU_PATH = "/thank-you";

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
      closePopupWidget?: () => void;
    };
  }
}

export type CalendlyMessageData = {
  event: string;
  payload?: unknown;
};

export function isCalendlyMessage(event: MessageEvent): boolean {
  if (event.origin !== "https://calendly.com") return false;
  if (!event.data || typeof event.data !== "object") return false;

  const data = event.data as Partial<CalendlyMessageData>;
  return typeof data.event === "string" && data.event.startsWith("calendly.");
}

export function isCalendlyEventScheduled(event: MessageEvent): boolean {
  return (
    isCalendlyMessage(event) &&
    (event.data as CalendlyMessageData).event === "calendly.event_scheduled"
  );
}

function ensureWidgetStylesheet(): void {
  if (typeof document === "undefined") return;
  if (document.querySelector(`link[href="${CALENDLY_WIDGET_CSS}"]`)) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = CALENDLY_WIDGET_CSS;
  document.head.appendChild(link);
}

function loadWidgetScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Calendly) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${CALENDLY_WIDGET_JS}"]`
  );

  if (existing) {
    return new Promise((resolve, reject) => {
      if (window.Calendly) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Calendly widget")),
        { once: true }
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CALENDLY_WIDGET_JS;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Calendly widget"));
    document.body.appendChild(script);
  });
}

/**
 * Open the official Calendly popup widget.
 * Does not navigate away and does not redirect by itself.
 */
export async function openCalendlyPopup(url?: string): Promise<void> {
  const bookingUrl = url || getCalendlyUrl() || CALENDLY_BOOKING_URL;

  ensureWidgetStylesheet();
  await loadWidgetScript();

  if (!window.Calendly?.initPopupWidget) {
    // Fallback: open booking page (dashboard redirect still applies if configured)
    window.open(bookingUrl, "_blank", "noopener,noreferrer");
    return;
  }

  window.Calendly.initPopupWidget({ url: bookingUrl });
}

/**
 * Whether a clicked element should open the Calendly popup.
 * Only real Calendly booking URLs — never in-page hash links.
 */
export function isCalendlyCtaElement(element: Element): boolean {
  const anchor = element.closest("a");
  if (!anchor) return false;

  const href = anchor.getAttribute("href") ?? "";
  return href.includes("calendly.com");
}
