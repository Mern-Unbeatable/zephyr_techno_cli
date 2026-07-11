/**
 * Parse storage labels like "128GB", "256 GB", "1TB" into a comparable GB value.
 */
export function storageSizeInGb(name) {
  const match = String(name || "")
    .trim()
    .match(/^(\d+(?:\.\d+)?)\s*(tb|gb|mb)?$/i);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const value = parseFloat(match[1]);
  const unit = (match[2] || "gb").toLowerCase();
  if (unit === "tb") return value * 1024;
  if (unit === "mb") return value / 1024;
  return value;
}

export function sortStorageOptionsBySize(options = [], nameKey = "name") {
  return [...options].sort(
    (a, b) => storageSizeInGb(a?.[nameKey]) - storageSizeInGb(b?.[nameKey]),
  );
}
