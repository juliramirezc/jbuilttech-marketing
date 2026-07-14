/**
 * Shared TypeScript Types
 */

export type { Industry } from "@/constants/industries";
export type { Service } from "@/constants/services";
export type { StoryBeat } from "@/constants/story";
export type { PricingPlan } from "@/constants/pricing";
export type { NavItem } from "@/config/navigation";
export type { UTMParams } from "@/lib/utm";

/**
 * Common component props
 */
export interface BaseComponentProps {
  className?: string;
}

/**
 * Form field state
 */
export interface FieldState {
  value: string;
  error?: string;
  touched: boolean;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}
