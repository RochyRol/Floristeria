"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "whatsapp";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-forest text-cream hover:bg-forest-light border border-forest hover:border-forest-light shadow-fine",
  secondary:
    "bg-terracotta text-cream hover:bg-terracotta-dark border border-terracotta hover:border-terracotta-dark shadow-fine",
  ghost:
    "bg-transparent text-forest hover:bg-forest/5 border border-transparent",
  outline:
    "bg-transparent text-forest border border-forest/30 hover:border-forest/70 hover:bg-forest/3",
  danger:
    "bg-burgundy text-cream hover:bg-burgundy-light border border-burgundy",
  whatsapp:
    "bg-[#25D366] text-white hover:bg-[#1DA851] border border-[#25D366] shadow-fine",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-4 py-2 text-xs tracking-brand",
  md: "px-6 py-3 text-sm tracking-brand",
  lg: "px-8 py-4 text-sm tracking-brand",
  icon: "w-10 h-10 p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "font-sans font-medium uppercase letter-spacing-brand",
          "rounded-sm transition-all duration-200 ease-elegant",
          "focus-visible:outline-2 focus-visible:outline-terracotta focus-visible:outline-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <Spinner />
            {children}
          </>
        ) : (
          <>
            {icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>}
            {children}
            {icon && iconPosition === "right" && <span className="shrink-0">{icon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
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
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
