export function formatTimelineDateValue(value) {
  if (!value) {
    return "UNKNOWN";
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? "UNKNOWN"
      : value.toISOString().slice(0, 10);
  }

  const trimmed = String(value).trim();
  if (!trimmed) {
    return "UNKNOWN";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime())
    ? "UNKNOWN"
    : parsed.toISOString().slice(0, 10);
}
