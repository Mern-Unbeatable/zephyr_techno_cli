export const SITE_NAME = 'Zephyr Technology';
export const SITE_ORIGIN = 'https://www.zephyrtechnology.co.uk';
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-default.webp`;

/** Meta-only SEO copy. Not rendered as visible page UI. */
export const STATIC_SEO = {
  home: {
    title: `Buy & Sell Phones in the UK | ${SITE_NAME}`,
    description:
      'Buy new and used phones at great prices, or sell your old phone in minutes. Genuine, checked devices with fast UK delivery from Zephyr Technology.',
    canonicalPath: '/',
    h1: 'Buy & Sell Phones in the UK',
    mainKeyword: 'buy and sell phones UK',
  },
  phonesNew: {
    title: `Buy New iPhones & Phones UK | ${SITE_NAME}`,
    description:
      'Shop new iPhones and phones from Zephyr Technology. Genuine devices, secure checkout and fast UK delivery.',
    canonicalPath: '/products?filter=NEW',
    h1: 'Buy New iPhones & Phones UK',
    mainKeyword: 'buy new iPhone',
  },
  phonesUsed: {
    title: `Buy Used iPhones & Phones UK | ${SITE_NAME}`,
    description:
      'Shop used iPhones and phones that have been professionally checked. Great prices, secure checkout and fast UK delivery from Zephyr Technology.',
    canonicalPath: '/products?filter=USED',
    h1: 'Buy Used iPhones & Phones UK',
    mainKeyword: 'buy used iPhone',
  },
  sellHub: {
    title: `Sell Your iPhone & Phone Online UK | ${SITE_NAME}`,
    description:
      'Sell your iPhone or old phone in minutes with Zephyr Technology. Competitive market rates and a simple, seamless process.',
    canonicalPath: '/sell',
    h1: 'Sell Your iPhone & Phone Online UK',
    mainKeyword: 'sell my iPhone',
  },
};

export function absoluteUrl(path = '/') {
  if (!path || path === '/') return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}
