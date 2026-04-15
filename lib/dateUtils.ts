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

/**
 * Number of whole days between two YYYY-MM-DD strings (endDate - startDate).
 */
export function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}
