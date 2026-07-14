"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Button Component
 * 
 * Reusable button with variants for primary/secondary/ghost actions.
 * Follows the construction design language with precise, engineered feel.
 */

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: cn(
    "bg-amber-500 text-charcoal-950 font-semibold",
    "hover:bg-amber-400 active:bg-amber-600",
    "shadow-lg shadow-amber-500/20",
    "border border-amber-400/50"
  ),
  secondary: cn(
    "bg-transparent text-concrete-50 font-medium",
    "border border-concrete-700 hover:border-concrete-500",
    "hover:bg-concrete-800/50 active:bg-concrete-800"
  ),
  ghost: cn(
    "bg-transparent text-concrete-300 font-medium",
    "hover:text-concrete-50 hover:bg-concrete-800/30",
    "active:bg-concrete-800/50"
  ),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-body-sm rounded-subtle",
  md: "px-6 py-3 text-body-md rounded-subtle",
  lg: "px-8 py-4 text-body-lg rounded-md",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "transition-all duration-fast ease-smooth",
          "focus-ring",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
