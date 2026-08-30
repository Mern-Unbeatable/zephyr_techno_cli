import { formatStorageLabel } from './storageSort';

const MAX_CARDS_PER_PRODUCT = 4;

/**
 * Expand one product into colour × storage preview cards for Featured/Home.
 * Prefers in-stock variants first; caps cards per product.
 */
export function expandProductToVariantCards(
  product,
  { maxPerProduct = MAX_CARDS_PER_PRODUCT, inStockFirst = true } = {},
) {
  if (!product?.id) return [];

  const colors = product.availableColors || [];
  const storages = product.availableStorageOptions || [];
  const stocks = product.availableVariantStocks || [];
  const colorThumbById = new Map(
    (product.colorThumbnails || []).map((row) => [row.colorId, row.imageUrl]),
  );
  const colorById = new Map(colors.map((c) => [c.id, c]));
  const storageById = new Map(storages.map((s) => [s.id, s]));

  let pairs = [];

  if (stocks.length > 0) {
    pairs = stocks.map((row) => ({
      colorId: row.colorId,
      storageOptionId: row.storageOptionId,
      stockQuantity: Math.max(0, Number(row.stockQuantity) || 0),
      expressDeliveryEnabled: row.expressDeliveryEnabled !== false,
    }));
  } else {
    for (const color of colors) {
      for (const storage of storages) {
        pairs.push({
          colorId: color.id,
          storageOptionId: storage.id,
          stockQuantity: Math.max(0, Number(product.stockQuantity) || 0),
          expressDeliveryEnabled: true,
        });
      }
    }
  }

  if (inStockFirst) {
    pairs.sort((a, b) => {
      const aIn = a.stockQuantity > 0 ? 0 : 1;
      const bIn = b.stockQuantity > 0 ? 0 : 1;
      return aIn - bIn;
    });
  }

  const limited = pairs.slice(0, Math.max(1, maxPerProduct));

  return limited.map((pair) => {
    const color = colorById.get(pair.colorId);
    const storage = storageById.get(pair.storageOptionId);
    const colorName = color?.name || '';
    const storageLabel = storage ? formatStorageLabel(storage.name) : '';
    const image =
      colorThumbById.get(pair.colorId) || product.thumbnail || null;
    const price =
      storage?.price != null ? storage.price : product.basePrice;
    const oldPrice =
      storage?.compareAtPrice != null
        ? storage.compareAtPrice
        : product.compareAtPrice;

    return {
      id: product.id,
      cardKey: `${product.id}-${pair.colorId}-${pair.storageOptionId}`,
      title: product.title,
      tag: product.category?.name,
      badgeColor: product.isFeatured ? 'bg-cyan-500' : 'bg-gray-400',
      variant: [colorName, storageLabel].filter(Boolean).join(' · '),
      price,
      oldPrice,
      images: [image].filter(Boolean),
      colorId: pair.colorId,
      storageOptionId: pair.storageOptionId,
      stockQuantity: pair.stockQuantity,
      inStock: pair.stockQuantity > 0,
      colors: color ? [color] : [],
      storageOptions: storage ? [storage] : [],
    };
  });
}

/**
 * Expand a list of products into preview cards.
 */
export function expandProductsToVariantCards(products, options) {
  const list = Array.isArray(products) ? products : [];
  return list.flatMap((product) => expandProductToVariantCards(product, options));
}
