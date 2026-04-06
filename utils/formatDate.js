/**
 * Converts a date string into a human-readable US format.
 * @param {string} dateStr - ISO date string.
 * @returns {string} Formatted date label.
 */
export default function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
