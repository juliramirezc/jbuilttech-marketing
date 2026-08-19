"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ConversionCtaProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  disabled?: boolean;
};

/**
 * Dominant homepage conversion CTA — yellow default, green hover + scale.
 * Supports <button> only; use .btn-conversion on anchors for mailto/tel.
 */
export function ConversionCta({
  children,
  onClick,
  className = "",
  type = "button",
  disabled,
}: ConversionCtaProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-conversion ${className}`.trim()}
    >
      {children}
    </button>
  );
}
