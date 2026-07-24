"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  CALENDLY_THANK_YOU_PATH,
  isCalendlyCtaElement,
  isCalendlyEventScheduled,
  openCalendlyPopup,
} from "@/lib/calendly";
import { captureUTMParams } from "@/lib/utm";

const CALENDLY_INVITEE_URI_KEY = "jbuilttech_calendly_invitee_uri";
const CALENDLY_EVENT_URI_KEY = "jbuilttech_calendly_event_uri";

/**
 * Persist Calendly booking URIs from postMessage payload (no PII).
 */
function storeCalendlyBookingUris(data: unknown): void {
  if (!data || typeof data !== "object") return;

  const payload = (data as { payload?: unknown }).payload;
  if (!payload || typeof payload !== "object") return;

  const invitee = (payload as { invitee?: unknown }).invitee;
  const scheduledEvent = (payload as { event?: unknown }).event;

  try {
    if (invitee && typeof invitee === "object") {
      const uri = (invitee as { uri?: unknown }).uri;
      if (typeof uri === "string" && uri.length > 0) {
        sessionStorage.setItem(CALENDLY_INVITEE_URI_KEY, uri);
      }
    }

    if (scheduledEvent && typeof scheduledEvent === "object") {
      const uri = (scheduledEvent as { uri?: unknown }).uri;
      if (typeof uri === "string" && uri.length > 0) {
        sessionStorage.setItem(CALENDLY_EVENT_URI_KEY, uri);
      }
    }
  } catch {
    // sessionStorage unavailable
  }
}

/**
 * Full-page navigation to the thank-you route on the current origin.
 * Uses assign() (not soft router.push) so GTM page_view / conversion
 * tags configured for /thank-you fire reliably after booking.
 */
function navigateToThankYou(): void {
  const url = `${window.location.origin}${CALENDLY_THANK_YOU_PATH}`;
  window.location.assign(url);
}

/**
 * CalendlyProvider
 *
 * - Captures first-touch UTM params once on app load
 * - Intercepts clicks on Calendly booking links and opens the official popup
 * - Stores invitee/event URIs on `calendly.event_scheduled`, then redirects to /thank-you
 * - Opening or closing the popup without booking does not redirect
 */
export function CalendlyProvider({ children }: { children: ReactNode }) {
  const hasRedirectedRef = useRef(false);

  // First-touch UTM capture — once on mount; never overwrites existing session values
  useEffect(() => {
    captureUTMParams();
  }, []);

  // Post-booking redirect (official Calendly postMessage API)
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!isCalendlyEventScheduled(event)) return;
      if (hasRedirectedRef.current) return;

      hasRedirectedRef.current = true;
      storeCalendlyBookingUris(event.data);
      window.Calendly?.closePopupWidget?.();
      navigateToThankYou();
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Open popup instead of navigating away on CTA click
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!isCalendlyCtaElement(target)) return;

      event.preventDefault();
      void openCalendlyPopup();
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return <>{children}</>;
}
