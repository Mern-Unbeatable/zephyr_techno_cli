/**
 * Canonical display order for sell/trade-in conditions.
 */
export function conditionDisplayRank(name = '') {
  const n = String(name).toLowerCase();
  if (n.includes('brand new') || n.includes('sealed')) return 0;
  if (n.includes('excellent')) return 1;
  if (n.includes('good')) return 2;
  if (n.includes('broken') || n.includes('faulty')) return 3;
  return 99;
}

export function sortConditionsForDisplay(conditions = []) {
  return [...conditions].sort((a, b) => {
    const ra = conditionDisplayRank(a?.name);
    const rb = conditionDisplayRank(b?.name);
    if (ra !== rb) return ra - rb;
    return String(a?.name || '').localeCompare(String(b?.name || ''));
  });
}
