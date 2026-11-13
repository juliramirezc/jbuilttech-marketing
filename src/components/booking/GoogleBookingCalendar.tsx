"use client";

import { useCallback, useMemo, useState } from "react";
import { pushDataLayerEvent, trackCTAClick } from "@/lib/analytics";
import { resolveGoogleBookingConfig } from "@/lib/googleBooking";
import { cn } from "@/lib/cn";

export type GoogleBookingCalendarProps = {
  /** Optional override; defaults to NEXT_PUBLIC_GOOGLE_BOOKING_URL */
  bookingUrl?: string | null;
  className?: string;
  iframeTitle?: string;
  /** Verified contact email shown when booking is unavailable in production */
  contactEmail?: string;
};

function trackFallbackClick() {
  pushDataLayerEvent("google_booking_fallback_click", {
    page_path: "/book-review",
    location: "booking_calendar",
  });
  trackCTAClick("open_booking_calendar", "book_review_calendar");
}

/**
 * Official Google Calendar Appointment Scheduling inline embed.
 * Uses Google's iframe format — availability and Meet are handled by Google.
 */
export function GoogleBookingCalendar({
  bookingUrl,
  className,
  iframeTitle = "Book a free 15-minute business review with JBUILTTECH",
  contactEmail = "info@jbuilttech.com",
}: GoogleBookingCalendarProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);

  const resolved = useMemo(
    () => resolveGoogleBookingConfig(bookingUrl),
    [bookingUrl]
  );

  const isDev = process.env.NODE_ENV === "development";

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setIframeError(true);
  }, []);

  if (!resolved.ok) {
    return (
      <div
        className={cn("book-review-calendar-fallback", className)}
        role="status"
      >
        {isDev ? (
          <>
            <p className="book-review-calendar-fallback__title">
              Booking calendar not configured
            </p>
            <p className="book-review-calendar-fallback__body">
              Set{" "}
              <code className="book-review-calendar-fallback__code">
                NEXT_PUBLIC_GOOGLE_BOOKING_URL
              </code>{" "}
              to your Google Calendar appointment scheduling link (from Calendar
              → Booking pages → Copy link or Website embed).
              {resolved.reason === "invalid"
                ? " The current value is not a valid Google appointment URL."
                : null}
            </p>
          </>
        ) : (
          <>
            <p className="book-review-calendar-fallback__title">
              Online booking is being prepared
            </p>
            <p className="book-review-calendar-fallback__body">
              Please contact us to arrange your free review.
            </p>
            <a
              href={`mailto:${contactEmail}`}
              className="book-review-calendar-fallback__contact"
            >
              {contactEmail}
            </a>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={cn("book-review-calendar", className)}>
      <div className="book-review-calendar__frame-wrap">
        {isLoading && !iframeError ? (
          <div
            className="book-review-calendar__loading"
            aria-live="polite"
            aria-busy="true"
          >
            <span className="book-review-calendar__spinner" aria-hidden="true" />
            <p>Loading available times…</p>
          </div>
        ) : null}

        {iframeError ? (
          <div className="book-review-calendar-fallback" role="alert">
            <p className="book-review-calendar-fallback__title">
              Calendar couldn&apos;t load here
            </p>
            <p className="book-review-calendar-fallback__body">
              You can still book your free review in a new tab.
            </p>
          </div>
        ) : (
          <iframe
            src={resolved.embedUrl}
            title={iframeTitle}
            className={cn(
              "book-review-calendar__iframe",
              isLoading && "book-review-calendar__iframe--loading"
            )}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allow="camera; microphone; fullscreen"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        )}
      </div>

      <div className="book-review-calendar__actions">
        <a
          href={resolved.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="book-review-calendar__fallback-btn"
          onClick={trackFallbackClick}
        >
          Open Booking Calendar
        </a>
        <p className="book-review-calendar__hint">
          Prefer a larger view? Open the booking calendar in a new tab.
        </p>
      </div>
    </div>
  );
}
