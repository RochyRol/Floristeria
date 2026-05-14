"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/* ─── shared admin field styles ─────────────────────────────────────────── */
const fieldBase = [
  "w-full",
  "bg-white",
  "border border-[#D1D5DB]",
  "text-[#111827] text-[13.5px]",
  "font-sans placeholder:text-[#9CA3AF]",
  "transition-colors duration-150",
  "focus:outline-none focus:border-[#1F3A2E] focus:ring-1 focus:ring-[#1F3A2E]/20",
  "disabled:opacity-50 disabled:cursor-not-allowed",
].join(" ");

/* ─── Label ──────────────────────────────────────────────────────────────── */
function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#374151]"
      style={{ fontFamily: "var(--font-manrope, sans-serif)", marginBottom: 6 }}
    >
      {children}
    </label>
  );
}

/* ─── Input ──────────────────────────────────────────────────────────────── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** @deprecated kept for backwards compat, ignored */
  variant?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, variant: _v, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col">
        {label && <FieldLabel htmlFor={inputId}>{label}</FieldLabel>}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            fieldBase,
            "h-9 px-3 rounded-[4px]",
            error ? "border-red-400 focus:border-red-500 focus:ring-red-200" : "",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-[11px] text-red-500" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1 text-[11px] text-[#6B7280]" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

/* ─── Textarea ───────────────────────────────────────────────────────────── */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col">
        {label && <FieldLabel htmlFor={textareaId}>{label}</FieldLabel>}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            fieldBase,
            "px-3 py-2 rounded-[4px] resize-none",
            error ? "border-red-400 focus:border-red-500 focus:ring-red-200" : "",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-[11px] text-red-500" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1 text-[11px] text-[#6B7280]" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

/* ─── Select ─────────────────────────────────────────────────────────────── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
  children?: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, children, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col">
        {label && <FieldLabel htmlFor={selectId}>{label}</FieldLabel>}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            fieldBase,
            "h-9 px-3 rounded-[4px] appearance-none cursor-pointer",
            error ? "border-red-400 focus:border-red-500" : "",
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            paddingRight: 32,
          }}
          {...props}
        >
          {children ?? options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {error && (
          <p className="mt-1 text-[11px] text-red-500" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
