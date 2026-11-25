"use client";

import { useEffect } from "react";
import { SHARED_TRACKING_IDS } from "@/lib/trackingIsolation";

type AnyFn = (...args: unknown[]) => unknown;

declare global {
  interface Window {
    __jbtTrackingIsolationActive?: boolean;
    __jbtIsolatedEvents?: Array<Record<string, unknown>>;
    __jbtTrackingRestore?: () => void;
    fbq?: AnyFn & { queue?: AnyFn; loaded?: boolean };
    gtag?: AnyFn;
    google_tag_manager?: Record<string, unknown>;
    ga?: AnyFn;
  }
}

const TRACKING_URL_PATTERN =
  /googletagmanager\.com|google-analytics\.com|googleadservices\.com|doubleclick\.net|googlesyndication\.com|facebook\.com\/tr|facebook\.net|connect\.facebook\.net|fbevents\.js/i;

function urlLooksLikeSharedTracking(input: unknown): boolean {
  try {
    const raw =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : typeof Request !== "undefined" && input instanceof Request
            ? input.url
            : String(input ?? "");
    return TRACKING_URL_PATTERN.test(raw);
  } catch {
    return false;
  }
}

function stripTrackingNodes(root: ParentNode = document) {
  root
    .querySelectorAll(
      `script[src*="googletagmanager.com"], script[src*="google-analytics.com"], script[src*="googleadservices.com"], script[src*="doubleclick.net"], script[src*="connect.facebook.net"], script[src*="fbevents.js"], iframe[src*="googletagmanager.com"], iframe[src*="doubleclick.net"], img[src*="facebook.com/tr"], img[src*="google-analytics.com"], img[src*="googletagmanager.com"]`
    )
    .forEach((node) => {
      node.parentElement?.removeChild(node);
    });
}

/**
 * Hard-isolates this route from shared advertising/analytics tags that may
 * already be present after client-side navigation from other pages.
 *
 * - Stubs fbq / gtag / ga
 * - Replaces dataLayer with a local array (no GTM listeners)
 * - Disables known GA4 / Ads IDs
 * - Blocks fetch / XHR / sendBeacon / Image beacons to shared trackers
 * Restores previous hooks on unmount so other site pages keep working.
 */
export function TrackingIsolationGuard() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const w = window;
    const originals = {
      fbq: w.fbq,
      gtag: w.gtag,
      ga: w.ga,
      dataLayer: w.dataLayer,
      fetch: w.fetch.bind(w),
      sendBeacon: navigator.sendBeacon?.bind(navigator),
      xhrOpen: XMLHttpRequest.prototype.open,
      imageSrcDescriptor: Object.getOwnPropertyDescriptor(
        HTMLImageElement.prototype,
        "src"
      ),
    };

    const noop: AnyFn = () => undefined;
    const isolatedQueue: Array<Record<string, unknown> & { event: string }> =
      [];
    const isolatedDataLayer = isolatedQueue as typeof isolatedQueue & {
      push: AnyFn;
    };
    isolatedDataLayer.push = (...args: unknown[]) => {
      Array.prototype.push.apply(isolatedQueue, args);
      return isolatedQueue.length;
    };

    // Prevent GA hits for known shared measurement IDs
    (w as Window & Record<string, boolean>)[
      `ga-disable-${SHARED_TRACKING_IDS.ga4}`
    ] = true;
    (w as Window & Record<string, boolean>)[
      `ga-disable-${SHARED_TRACKING_IDS.googleAdsPrimary}`
    ] = true;
    (w as Window & Record<string, boolean>)[
      `ga-disable-${SHARED_TRACKING_IDS.googleAdsSecondary}`
    ] = true;

    // Deny consent for any already-initialized Google tags
    try {
      if (typeof originals.gtag === "function") {
        originals.gtag("consent", "update", {
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
          analytics_storage: "denied",
        });
      }
    } catch {
      // ignore
    }

    const fbqStub: AnyFn & {
      callMethod?: AnyFn;
      queue?: AnyFn;
      loaded?: boolean;
    } = function fbqStubFn(..._args: unknown[]) {
      return undefined;
    };
    fbqStub.callMethod = noop;
    fbqStub.queue = noop;
    fbqStub.loaded = true;

    w.fbq = fbqStub;
    w.gtag = noop;
    w.ga = noop;
    w.dataLayer = isolatedDataLayer as typeof w.dataLayer;
    w.__jbtTrackingIsolationActive = true;
    w.__jbtIsolatedEvents = w.__jbtIsolatedEvents || [];

    // Drop GTM container object so leftover listeners stop resolving
    try {
      if (w.google_tag_manager) {
        delete w.google_tag_manager;
      }
    } catch {
      // ignore
    }

    stripTrackingNodes();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (
            node.matches?.("script, iframe, img") ||
            node.querySelector?.("script, iframe, img")
          ) {
            stripTrackingNodes(node.parentNode || document);
          }
        });
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    w.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      if (urlLooksLikeSharedTracking(input)) {
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      return originals.fetch(input, init);
    }) as typeof fetch;

    if (originals.sendBeacon) {
      navigator.sendBeacon = ((url: string | URL, data?: BodyInit | null) => {
        if (urlLooksLikeSharedTracking(url)) return true;
        return originals.sendBeacon!(url, data);
      }) as typeof navigator.sendBeacon;
    }

    XMLHttpRequest.prototype.open = function (
      this: XMLHttpRequest,
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null
    ) {
      const safeAsync = async ?? true;
      if (urlLooksLikeSharedTracking(url)) {
        return originals.xhrOpen.call(
          this,
          method,
          "about:blank",
          safeAsync,
          username ?? undefined,
          password ?? undefined
        );
      }
      return originals.xhrOpen.call(
        this,
        method,
        url,
        safeAsync,
        username ?? undefined,
        password ?? undefined
      );
    };

    if (originals.imageSrcDescriptor?.set) {
      Object.defineProperty(HTMLImageElement.prototype, "src", {
        configurable: true,
        enumerable: originals.imageSrcDescriptor.enumerable,
        get: originals.imageSrcDescriptor.get,
        set(this: HTMLImageElement, value: string) {
          if (urlLooksLikeSharedTracking(value)) {
            originals.imageSrcDescriptor!.set!.call(this, "about:blank");
            return;
          }
          originals.imageSrcDescriptor!.set!.call(this, value);
        },
      });
    }

    const restore = () => {
      observer.disconnect();
      w.fbq = originals.fbq;
      w.gtag = originals.gtag;
      w.ga = originals.ga;
      w.dataLayer = originals.dataLayer;
      w.fetch = originals.fetch;
      if (originals.sendBeacon) {
        navigator.sendBeacon = originals.sendBeacon;
      }
      XMLHttpRequest.prototype.open = originals.xhrOpen;
      if (originals.imageSrcDescriptor) {
        Object.defineProperty(
          HTMLImageElement.prototype,
          "src",
          originals.imageSrcDescriptor
        );
      }
      w.__jbtTrackingIsolationActive = false;
      delete (w as Window & Record<string, boolean | undefined>)[
        `ga-disable-${SHARED_TRACKING_IDS.ga4}`
      ];
      delete (w as Window & Record<string, boolean | undefined>)[
        `ga-disable-${SHARED_TRACKING_IDS.googleAdsPrimary}`
      ];
      delete (w as Window & Record<string, boolean | undefined>)[
        `ga-disable-${SHARED_TRACKING_IDS.googleAdsSecondary}`
      ];
    };

    w.__jbtTrackingRestore = restore;

    return () => {
      restore();
      if (w.__jbtTrackingRestore === restore) {
        delete w.__jbtTrackingRestore;
      }
    };
  }, []);

  return null;
}

/**
 * Record an application event locally only — never via shared dataLayer/GTM/fbq.
 */
export function recordIsolatedApplicationEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") return;
  window.__jbtIsolatedEvents = window.__jbtIsolatedEvents || [];
  window.__jbtIsolatedEvents.push({
    event: eventName,
    ts: new Date().toISOString(),
    ...params,
  });
}
