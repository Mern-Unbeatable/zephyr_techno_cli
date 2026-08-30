/**
 * Parse storage labels like "128GB", "256 GB", "1TB", "128GBGB" into a comparable GB value.
 */
export function storageSizeInGb(name) {
  const match = String(name || "")
    .trim()
    .match(/^(\d+(?:\.\d+)?)\s*((?:tb|gb|mb)*)\s*$/i);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const value = parseFloat(match[1]);
  const units = (match[2] || "").toLowerCase();
  if (units.includes("tb")) return value * 1024;
  if (units.includes("mb")) return value / 1024;
  return value;
}

/**
 * Normalize storage for display.
 * Strips any GB/TB/MB from the API value (including duplicates like "GBGB"),
 * then the frontend always renders a single unit.
 * - Bare number or GB → "64GB" / "128GB"
 * - TB → "1TB"
 */
export function formatStorageLabel(name) {
  const raw = String(name ?? "")
    .trim()
    // Remove spaces between number and unit: "256 GB" → "256GB"
    .replace(/(\d)\s+(gb|tb|mb)\b/gi, "$1$2");
  if (!raw || raw === "—") return raw;

  const match = raw.match(/^(\d+(?:\.\d+)?)\s*((?:tb|gb|mb)*)\s*$/i);
  if (!match) {
    // Fallback: strip unit tokens and append GB
    const stripped = raw.replace(/\s*(gb|tb|mb)\s*/gi, "").trim();
    return stripped ? `${stripped}GB` : raw;
  }

  const value = match[1];
  const units = (match[2] || "").toLowerCase();
  if (units.includes("tb")) return `${value}TB`;
  if (units.includes("mb")) return `${value}MB`;
  return `${value}GB`;
}

export function sortStorageOptionsBySize(options = [], nameKey = "name") {
  return [...options].sort(
    (a, b) => storageSizeInGb(a?.[nameKey]) - storageSizeInGb(b?.[nameKey]),
  );
}
