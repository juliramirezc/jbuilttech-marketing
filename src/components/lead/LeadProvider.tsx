"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { LeadModal } from "./LeadModal";
import { ReferralDelayPopup } from "./ReferralDelayPopup";
import { pushDataLayerEvent } from "@/lib/analytics";

const LEAD_SUBMITTED_KEY = "jbuilttech_lead_submitted";
const REFERRAL_DISMISSED_KEY = "jbuilttech_referral_popup_dismissed";
/** Midpoint of 30–45s window */
const REFERRAL_DELAY_MS = 37_500;

export type LeadFormSource =
  | "hero_inline"
  | "final_form"
  | "hero_primary"
  | "competitor_section"
  | "referral_popup"
  | "hero_launch"
  | "consultation"
  | "process";

/** @deprecated Use LeadFormSource */
export type LeadModalSource = LeadFormSource;

type LeadContextValue = {
  openLeadModal: (source: LeadFormSource) => void;
  closeLeadModal: () => void;
  isLeadModalOpen: boolean;
  hasSubmittedLead: boolean;
  markLeadSubmitted: () => void;
  setLeadFormFocused: (focused: boolean) => void;
  isLeadFormFocused: boolean;
};

const LeadContext = createContext<LeadContextValue | null>(null);

function readSessionFlag(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeSessionFlag(key: string): void {
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    // ignore
  }
}

export function LeadProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  /** Member-story and other /dc78 routes must not show marketing referral promo */
  const suppressReferralPromo =
    typeof pathname === "string" && pathname.startsWith("/dc78");

  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [modalSource, setModalSource] = useState<LeadFormSource>("hero_primary");
  const [hasSubmittedLead, setHasSubmittedLead] = useState(false);
  const [referralDismissed, setReferralDismissed] = useState(false);
  const [showReferralPopup, setShowReferralPopup] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isLeadFormFocused, setIsLeadFormFocused] = useState(false);
  const isLeadModalOpenRef = useRef(false);
  const isLeadFormFocusedRef = useRef(false);

  useEffect(() => {
    setHasSubmittedLead(readSessionFlag(LEAD_SUBMITTED_KEY));
    setReferralDismissed(readSessionFlag(REFERRAL_DISMISSED_KEY));
    setHydrated(true);
  }, []);

  useEffect(() => {
    isLeadModalOpenRef.current = isLeadModalOpen;
  }, [isLeadModalOpen]);

  useEffect(() => {
    isLeadFormFocusedRef.current = isLeadFormFocused;
  }, [isLeadFormFocused]);

  useEffect(() => {
    if (suppressReferralPromo) setShowReferralPopup(false);
  }, [suppressReferralPromo]);

  const setLeadFormFocused = useCallback((focused: boolean) => {
    setIsLeadFormFocused(focused);
  }, []);

  const openLeadModal = useCallback((source: LeadFormSource) => {
    setModalSource(source);
    setIsLeadModalOpen(true);
    setShowReferralPopup(false);
    pushDataLayerEvent("lead_modal_opened", { source });

    if (source === "competitor_section") {
      pushDataLayerEvent("competitor_cta_click", { source });
    } else if (source === "referral_popup") {
      pushDataLayerEvent("referral_popup_cta_click");
    }
  }, []);

  const closeLeadModal = useCallback(() => {
    setIsLeadModalOpen(false);
  }, []);

  const markLeadSubmitted = useCallback(() => {
    setHasSubmittedLead(true);
    writeSessionFlag(LEAD_SUBMITTED_KEY);
    setShowReferralPopup(false);
    setReferralDismissed(true);
    writeSessionFlag(REFERRAL_DISMISSED_KEY);
  }, []);

  const dismissReferralPopup = useCallback(() => {
    setShowReferralPopup(false);
    setReferralDismissed(true);
    writeSessionFlag(REFERRAL_DISMISSED_KEY);
    pushDataLayerEvent("referral_popup_dismissed");
  }, []);

  // Delayed referral popup — homepage/marketing only (not /dc78)
  useEffect(() => {
    if (!hydrated) return;
    if (suppressReferralPromo) return;
    if (hasSubmittedLead || referralDismissed) return;

    const timer = window.setTimeout(() => {
      if (suppressReferralPromo) return;
      if (readSessionFlag(LEAD_SUBMITTED_KEY)) return;
      if (readSessionFlag(REFERRAL_DISMISSED_KEY)) return;
      if (isLeadModalOpenRef.current) return;
      if (isLeadFormFocusedRef.current) return;
      setShowReferralPopup((already) => {
        if (already) return already;
        pushDataLayerEvent("referral_popup_shown");
        return true;
      });
    }, REFERRAL_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [hydrated, hasSubmittedLead, referralDismissed, suppressReferralPromo]);

  useEffect(() => {
    if (isLeadModalOpen || isLeadFormFocused) setShowReferralPopup(false);
  }, [isLeadModalOpen, isLeadFormFocused]);

  const value = useMemo(
    () => ({
      openLeadModal,
      closeLeadModal,
      isLeadModalOpen,
      hasSubmittedLead,
      markLeadSubmitted,
      setLeadFormFocused,
      isLeadFormFocused,
    }),
    [
      openLeadModal,
      closeLeadModal,
      isLeadModalOpen,
      hasSubmittedLead,
      markLeadSubmitted,
      setLeadFormFocused,
      isLeadFormFocused,
    ]
  );

  return (
    <LeadContext.Provider value={value}>
      {children}
      <LeadModal
        open={isLeadModalOpen}
        source={modalSource}
        onClose={closeLeadModal}
        onSubmitted={() => {
          markLeadSubmitted();
          window.setTimeout(() => closeLeadModal(), 1200);
        }}
      />
      <ReferralDelayPopup
        open={
          !suppressReferralPromo &&
          showReferralPopup &&
          !isLeadModalOpen &&
          !isLeadFormFocused &&
          !hasSubmittedLead &&
          !referralDismissed
        }
        onClose={dismissReferralPopup}
        onCta={() => {
          dismissReferralPopup();
          openLeadModal("referral_popup");
        }}
      />
    </LeadContext.Provider>
  );
}

export function useLeadModal(): LeadContextValue {
  const ctx = useContext(LeadContext);
  if (!ctx) {
    throw new Error("useLeadModal must be used within LeadProvider");
  }
  return ctx;
}
