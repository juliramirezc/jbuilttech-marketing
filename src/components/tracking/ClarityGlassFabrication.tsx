"use client";

import { useEffect } from "react";
import {
  CLARITY_PROJECT_ID,
  GLASS_FABRICATION_CLARITY_TAG,
  initClarity,
  setClarityTag,
} from "@/lib/clarity";

/**
 * Loads the shared Microsoft Clarity project used by Glazier (via GTM),
 * without enabling GTM / Meta / Google Ads on this isolated careers route.
 */
export function ClarityGlassFabrication() {
  useEffect(() => {
    initClarity(CLARITY_PROJECT_ID);
    setClarityTag(
      GLASS_FABRICATION_CLARITY_TAG.key,
      GLASS_FABRICATION_CLARITY_TAG.value
    );
  }, []);

  return null;
}
