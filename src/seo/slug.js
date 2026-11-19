const BRAND_RULES = [
  { test: /(iphone|ipad|\bapple\b)/i, brand: 'Apple' },
  { test: /(samsung|galaxy)/i, brand: 'Samsung' },
  { test: /(google|pixel)/i, brand: 'Google' },
  { test: /(xiaomi|redmi)/i, brand: 'Xiaomi' },
  { test: /(oneplus)/i, brand: 'OnePlus' },
  { test: /(huawei)/i, brand: 'Huawei' },
  { test: /(sony|xperia)/i, brand: 'Sony' },
  { test: /(motorola|moto\b)/i, brand: 'Motorola' },
];

export function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function inferBrand({ title, seriesName, modelName } = {}) {
  const haystack = [title, seriesName, modelName].filter(Boolean).join(' ');
  for (const rule of BRAND_RULES) {
    if (rule.test.test(haystack)) return rule.brand;
  }
  if (seriesName && !/iphone|phone|series/i.test(seriesName)) return seriesName;
  const first = String(title || modelName || '')
    .trim()
    .split(/\s+/)[0];
  return first || 'Phone';
}

export function buildSellModelSlug({ brand, model } = {}) {
  return [brand, model].map((p) => slugify(p)).filter(Boolean).join('-') || 'phone';
}

export function buildProductPath(slug) {
  return `/phones/${slug}`;
}

export function buildSellPath(slug) {
  return `/sell-your-phone/${slug}`;
}
