import { inferBrand } from './slug';

/** SOW product naming helpers for H1, alt, and opening copy. */
export function getProductSeoParts(product, { storageName, colourName, conditionName } = {}) {
  const brand = inferBrand({
    title: product?.title,
    seriesName: product?.series?.name,
    modelName: product?.deviceModel?.name,
  });
  const model = product?.deviceModel?.name || product?.title || '';
  const storage = storageName || null;
  const colour = colourName || null;
  const condition = conditionName || null;

  const h1 = [brand, model, storage, colour].filter(Boolean).join(' ');
  const imageAlt = [brand, model, colour ? `in ${colour}` : null].filter(Boolean).join(' ');
  const mainKeyword = model ? `buy ${model}` : 'buy iPhone UK';
  const supporting = [
    model && storage ? `${model} ${storage}` : null,
    model && colour ? `${model} ${colour}` : null,
  ].filter(Boolean);

  const opening = [
    `Looking to ${mainKeyword}?`,
    supporting.length ? `This ${supporting.join(' / ')} is available from Zephyr Technology` : null,
    condition ? `in ${condition} condition` : null,
    'with secure checkout and fast UK delivery.',
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  return { brand, model, storage, colour, condition, h1, imageAlt, mainKeyword, supporting, opening };
}

export function cleanCanonicalPath(path = '/') {
  if (!path) return '/';
  const [pathname, search = ''] = String(path).split('?');
  const params = new URLSearchParams(search);
  const next = new URLSearchParams();
  const page = params.get('page');
  if (page && Number(page) > 1) next.set('page', String(Number(page)));
  const qs = next.toString();
  const cleanPath = pathname || '/';
  return qs ? `${cleanPath}?${qs}` : cleanPath;
}
