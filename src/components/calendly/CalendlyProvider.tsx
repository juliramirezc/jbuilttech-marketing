"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  CALENDLY_THANK_YOU_PATH,
  isCalendlyCtaElement,
  isCalendlyEventScheduled,
  openCalendlyPopup,
} from "@/lib/calendly";
import { captureUTMParams } from "@/lib/utm";

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
 * - Redirects to /thank-you ONLY on `calendly.event_scheduled`
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
