/** Date helpers. The API returns ISO-8601 UTC strings. */

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Bogota',
});

const DATE_FORMATTER = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeZone: 'America/Bogota',
});

/** Format an ISO-8601 string as a localized date+time in America/Bogota. */
export function formatDateTime(iso: string): string {
  return DATE_TIME_FORMATTER.format(new Date(iso));
}

/** Format an ISO-8601 string as a localized date in America/Bogota. */
export function formatDate(iso: string): string {
  return DATE_FORMATTER.format(new Date(iso));
}
