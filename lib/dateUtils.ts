/**
 * Format a Date object to YYYY-MM-DD using LOCAL timezone.
 * Avoids toISOString() which uses UTC and can shift dates.
 */
export function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Get today's date as YYYY-MM-DD in local timezone.
 */
export function getTodayDate(): string {
  return formatLocalDate(new Date());
}
