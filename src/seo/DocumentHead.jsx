import { useEffect } from 'react';
import { DEFAULT_OG_IMAGE, SITE_NAME, absoluteUrl } from './staticPages';
import { cleanCanonicalPath } from './productCopy';

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertJsonLd(id, data) {
  const existing = document.getElementById(id);
  if (!data) {
    existing?.remove();
    return;
  }
  const json = Array.isArray(data) ? data : [data];
  let el = existing;
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(json.length === 1 ? json[0] : json);
}

/**
 * Client-side head manager for SPA navigations.
 * Server injects the first paint; this keeps tags in sync after client routing.
 */
export default function DocumentHead({
  title,
  description,
  canonicalPath,
  image,
  imageAlt,
  ogType = 'website',
  jsonLd,
  noindex = false,
}) {
  useEffect(() => {
    const nextTitle = title || `${SITE_NAME} | Buy & Sell Phones`;
    document.title = nextTitle;

    const canonical = absoluteUrl(cleanCanonicalPath(canonicalPath || '/'));
    const ogImage = image || DEFAULT_OG_IMAGE;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    upsertLink('canonical', canonical);

    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:type', ogType);
    upsertMeta('property', 'og:title', nextTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('property', 'og:image:alt', imageAlt || SITE_NAME);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', nextTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', ogImage);

    upsertJsonLd('zephyr-jsonld', jsonLd);
  }, [title, description, canonicalPath, image, imageAlt, ogType, jsonLd, noindex]);

  return null;
}
