import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely parses a Date object or date string (e.g. "2026-08-19", "2026-08-19T00:00:00.000Z")
 * into a local Date object preserving local year, month, and day without UTC offset shift.
 */
export function parseLocalDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return null

    // Match YYYY-MM-DD or YYYY/MM/DD prefix
    let match = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
    if (match) {
      const year = parseInt(match[1], 10)
      const month = parseInt(match[2], 10) - 1
      const day = parseInt(match[3], 10)
      const d = new Date(year, month, day)
      return isNaN(d.getTime()) ? null : d
    }

    // Match DD-MM-YYYY or DD/MM/YYYY prefix
    match = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
    if (match) {
      const day = parseInt(match[1], 10)
      const month = parseInt(match[2], 10) - 1
      const year = parseInt(match[3], 10)
      const d = new Date(year, month, day)
      return isNaN(d.getTime()) ? null : d
    }

    const d = new Date(trimmed)
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

/**
 * Formats a Date object or date string to YYYY-MM-DD string in local timezone (never UTC).
 */
export function formatLocalDate(date: Date | string | null | undefined): string {
  if (!date) return ""
  const parsed = parseLocalDate(date)
  if (!parsed) return ""
  return format(parsed, "yyyy-MM-dd")
}

export const toYmd = (d: Date | string | null | undefined): string => {
  if (!d) return ""
  if (typeof d === "string") {
    const parsed = parseLocalDate(d)
    return parsed ? format(parsed, "yyyy-MM-dd") : d
  }
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const da = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${da}`
}

export const parseYmdLocal = (s?: string): Date | undefined => {
  if (!s) return undefined
  const d = parseLocalDate(s)
  return d || undefined
}


