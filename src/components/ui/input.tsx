"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  variant?: "line" | "box";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, variant = "line", className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium uppercase tracking-brand text-forest/70 font-sans"
          >
            {label}
          </label>
        )}

        {variant === "line" ? (
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "input-elegant",
              error && "border-b-burgundy",
              className
            )}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full px-4 py-3 bg-cream-dark border border-forest/15",
              "rounded-sm font-sans text-sm text-forest",
              "placeholder:text-forest/40 transition-colors duration-200",
              "focus:outline-none focus:border-terracotta",
              error && "border-burgundy",
              className
            )}
            {...props}
          />
        )}

        {error && (
          <p className="text-xs text-burgundy font-sans">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-forest/50 font-sans">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-medium uppercase tracking-brand text-forest/70 font-sans"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "w-full px-4 py-3 bg-cream-dark border border-forest/15",
            "rounded-sm font-sans text-sm text-forest",
            "placeholder:text-forest/40 transition-colors duration-200",
            "focus:outline-none focus:border-terracotta resize-none",
            error && "border-burgundy",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-burgundy font-sans">{error}</p>}
        {hint && !error && <p className="text-xs text-forest/50 font-sans">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
  children?: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, children, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-medium uppercase tracking-brand text-forest/70 font-sans"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full px-4 py-3 bg-cream-dark border border-forest/15",
            "rounded-sm font-sans text-sm text-forest appearance-none",
            "focus:outline-none focus:border-terracotta transition-colors",
            error && "border-burgundy",
            className
          )}
          {...props}
        >
          {children ??
            options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
        </select>
        {error && <p className="text-xs text-burgundy font-sans">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
