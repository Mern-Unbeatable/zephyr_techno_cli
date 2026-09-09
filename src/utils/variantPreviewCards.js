import { formatStorageLabel } from './storageSort';

const MAX_CARDS_PER_PRODUCT = 4;

/**
 * Expand one product into colour × storage preview cards for Featured/Home.
 * Prefers in-stock variants first; caps cards per product.
 * Prices prefer min from availableVariantStocks (any condition) for that pair.
 * Stock is summed across conditions for the color×storage pair.
 */
export function expandProductToVariantCards(
  product,
  {
    maxPerProduct = MAX_CARDS_PER_PRODUCT,
    inStockFirst = true,
    colorId = null,
    storageOptionId = null,
  } = {},
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
    const byPair = new Map();
    stocks.forEach((row) => {
      if (!row?.colorId || !row?.storageOptionId) return;
      const key = `${row.colorId}::${row.storageOptionId}`;
      const existing = byPair.get(key) || {
        colorId: row.colorId,
        storageOptionId: row.storageOptionId,
        stockQuantity: 0,
        prices: [],
        compareAts: [],
        expressDeliveryEnabled: false,
      };
      existing.stockQuantity += Math.max(0, Number(row.stockQuantity) || 0);
      const price = Number(row.price);
      if (Number.isFinite(price) && price > 0) {
        existing.prices.push(price);
      }
      const compareAt = Number(row.compareAtPrice);
      if (Number.isFinite(compareAt) && compareAt > 0) {
        existing.compareAts.push(compareAt);
      }
      if (row.expressDeliveryEnabled !== false) {
        existing.expressDeliveryEnabled = true;
      }
      byPair.set(key, existing);
    });
    pairs = [...byPair.values()];
  } else {
    for (const color of colors) {
      for (const storage of storages) {
        pairs.push({
          colorId: color.id,
          storageOptionId: storage.id,
          stockQuantity: Math.max(0, Number(product.stockQuantity) || 0),
          prices: [],
          compareAts: [],
          expressDeliveryEnabled: true,
        });
      }
    }
  }

  if (colorId) {
    pairs = pairs.filter((pair) => pair.colorId === colorId);
  }
  if (storageOptionId) {
    pairs = pairs.filter((pair) => pair.storageOptionId === storageOptionId);
  }

  if (!pairs.length && !colorId && !storageOptionId) {
    pairs = [
      {
        colorId: colors[0]?.id || null,
        storageOptionId: storages[0]?.id || null,
        stockQuantity: Math.max(0, Number(product.stockQuantity) || 0),
        prices: [],
        compareAts: [],
        expressDeliveryEnabled: true,
      },
    ];
  }

  if (inStockFirst) {
    pairs.sort((a, b) => {
      const aIn = a.stockQuantity > 0 ? 0 : 1;
      const bIn = b.stockQuantity > 0 ? 0 : 1;
      return aIn - bIn;
    });
  }

  const limited =
    maxPerProduct == null || !Number.isFinite(maxPerProduct)
      ? pairs
      : pairs.slice(0, Math.max(1, maxPerProduct));

  return limited.map((pair) => {
    const color = colorById.get(pair.colorId);
    const storage = storageById.get(pair.storageOptionId);
    const colorName = color?.name || '';
    const storageLabel = storage ? formatStorageLabel(storage.name) : '';
    const image =
      colorThumbById.get(pair.colorId) || product.thumbnail || null;

    const minMatrixPrice =
      pair.prices?.length > 0 ? Math.min(...pair.prices) : null;
    const price =
      minMatrixPrice != null
        ? minMatrixPrice
        : storage?.price != null
          ? storage.price
          : product.basePrice;

    const minMatrixCompare =
      pair.compareAts?.length > 0 ? Math.min(...pair.compareAts) : null;
    const oldPrice =
      minMatrixCompare != null
        ? minMatrixCompare
        : storage?.compareAtPrice != null
          ? storage.compareAtPrice
          : product.compareAtPrice;

    const is256GB = storageLabel === '256GB' || storage?.name?.includes('256GB');
    const badgeText = is256GB ? 'BEST SELLER' : null;
    const badgeColor = is256GB ? 'bg-orange-500' : 'bg-transparent';

    return {
      id: product.id,
      cardKey: `${product.id}-${pair.colorId}-${pair.storageOptionId}`,
      title: product.title,
      tag: badgeText,
      badge: badgeText,
      badgeColor: badgeColor,
      variant: [colorName, storageLabel].filter(Boolean).join(' · '),
      price,
      oldPrice,
      images: [image].filter(Boolean),
      colorId: pair.colorId,
      storageOptionId: pair.storageOptionId,
      stockQuantity: pair.stockQuantity,
      inStock: pair.stockQuantity > 0,
      createdAt: product.createdAt || null,
      isFeatured: Boolean(product.isFeatured),
      featuredAt: product.featuredAt || null,
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
