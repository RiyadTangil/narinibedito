"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  containerClassName?: string;
}

export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  (
    {
      id,
      label,
      error,
      icon,
      suffix,
      className,
      containerClassName,
      required,
      value,
      defaultValue,
      placeholder = " ",
      type,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const isFilled = Boolean(
      (value !== undefined && value !== null && String(value).trim() !== "") ||
        (defaultValue !== undefined &&
          defaultValue !== null &&
          String(defaultValue).trim() !== "")
    );

    return (
      <div className={cn("w-full space-y-1", containerClassName)}>
        <div
          className={cn(
            "relative w-full rounded-xl border border-slate-200 bg-white transition-all duration-200",
            "focus-within:border-[#6B112B] focus-within:ring-2 focus-within:ring-[#6B112B]/15",
            error && "border-red-400 focus-within:border-red-500 focus-within:ring-red-150"
          )}
        >
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {icon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            type={type}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            required={required}
            className={cn(
              "peer w-full h-11 sm:h-12 bg-transparent rounded-xl text-xs sm:text-sm text-slate-900 font-medium",
              "focus:outline-none placeholder-transparent",
              icon ? "pl-9 sm:pl-10 pr-3.5" : "px-3.5",
              suffix ? "pr-10" : "pr-3.5",
              "pt-4 sm:pt-4.5 pb-1",
              className
            )}
            {...props}
          />

          <label
            htmlFor={inputId}
            className={cn(
              "absolute transition-all duration-200 pointer-events-none select-none text-slate-400 font-medium truncate max-w-[85%]",
              icon ? "left-9 sm:left-10" : "left-3.5",
              isFilled
                ? "top-1 text-[10px] sm:text-[11px] font-bold text-slate-600"
                : "top-1/2 -translate-y-1/2 text-xs sm:text-sm",
              "peer-focus:top-1 peer-focus:translate-y-0 peer-focus:text-[10px] sm:peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-[#6B112B]",
              "peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] sm:peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-slate-600"
            )}
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>

          {suffix && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
              {suffix}
            </div>
          )}
        </div>

        {error && (
          <p className="text-[11px] font-medium text-red-500 pl-1">{error}</p>
        )}
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";

export interface FloatingTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  containerClassName?: string;
}

export const FloatingTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FloatingTextareaProps
>(
  (
    {
      id,
      label,
      error,
      className,
      containerClassName,
      required,
      value,
      defaultValue,
      placeholder = " ",
      rows = 3,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const isFilled = Boolean(
      (value !== undefined && value !== null && String(value).trim() !== "") ||
        (defaultValue !== undefined &&
          defaultValue !== null &&
          String(defaultValue).trim() !== "")
    );

    return (
      <div className={cn("w-full space-y-1", containerClassName)}>
        <div
          className={cn(
            "relative w-full rounded-xl border border-slate-200 bg-white transition-all duration-200",
            "focus-within:border-[#6B112B] focus-within:ring-2 focus-within:ring-[#6B112B]/15",
            error && "border-red-400 focus-within:border-red-500"
          )}
        >
          <textarea
            id={textareaId}
            ref={ref}
            rows={rows}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            required={required}
            className={cn(
              "peer w-full bg-transparent rounded-xl px-3.5 pt-5 pb-2 text-xs sm:text-sm text-slate-900 font-medium leading-relaxed resize-y",
              "focus:outline-none placeholder-transparent",
              className
            )}
            {...props}
          />

          <label
            htmlFor={textareaId}
            className={cn(
              "absolute left-3.5 transition-all duration-200 pointer-events-none select-none text-slate-400 font-medium truncate max-w-[85%]",
              isFilled
                ? "top-1.5 text-[10px] sm:text-[11px] font-bold text-slate-600"
                : "top-3.5 text-xs sm:text-sm",
              "peer-focus:top-1.5 peer-focus:text-[10px] sm:peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-[#6B112B]",
              "peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] sm:peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-slate-600"
            )}
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        </div>

        {error && (
          <p className="text-[11px] font-medium text-red-500 pl-1">{error}</p>
        )}
      </div>
    );
  }
);
FloatingTextarea.displayName = "FloatingTextarea";

export interface FloatingSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  containerClassName?: string;
  icon?: React.ReactNode;
}

export const FloatingSelect = React.forwardRef<
  HTMLSelectElement,
  FloatingSelectProps
>(
  (
    {
      id,
      label,
      error,
      icon,
      className,
      containerClassName,
      required,
      children,
      value,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className={cn("w-full space-y-1", containerClassName)}>
        <div
          className={cn(
            "relative w-full rounded-xl border border-slate-200 bg-white transition-all duration-200",
            "focus-within:border-[#6B112B] focus-within:ring-2 focus-within:ring-[#6B112B]/15",
            error && "border-red-400 focus-within:border-red-500"
          )}
        >
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {icon}
            </div>
          )}

          <select
            id={selectId}
            ref={ref}
            value={value}
            required={required}
            className={cn(
              "w-full h-11 sm:h-12 bg-transparent rounded-xl text-xs sm:text-sm text-slate-900 font-medium cursor-pointer appearance-none",
              "focus:outline-none pt-4 sm:pt-4.5 pb-1",
              icon ? "pl-9 sm:pl-10 pr-9" : "px-3.5 pr-9",
              className
            )}
            {...props}
          >
            {children}
          </select>

          <label
            htmlFor={selectId}
            className={cn(
              "absolute transition-all duration-200 pointer-events-none select-none text-[10px] sm:text-[11px] font-bold text-slate-600 truncate max-w-[80%]",
              icon ? "left-9 sm:left-10" : "left-3.5",
              "top-1 focus-within:text-[#6B112B]"
            )}
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>

          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        {error && (
          <p className="text-[11px] font-medium text-red-500 pl-1">{error}</p>
        )}
      </div>
    );
  }
);
FloatingSelect.displayName = "FloatingSelect";
