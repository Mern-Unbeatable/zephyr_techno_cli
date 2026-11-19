function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const DEFAULT_OG = 'https://www.zephyrtechnology.co.uk/og-default.webp';

/**
 * Inject SEO tags + bot-readable content into the Vite index.html shell.
 */
export function injectSeoIntoHtml(html, meta, { notFound = false } = {}) {
  if (!meta && !notFound) return html;

  const title = notFound
    ? 'Page not found | Zephyr Technology'
    : meta.title || 'Zephyr Technology | Buy & Sell Phones';
  const description = notFound
    ? 'The page you requested could not be found.'
    : meta.description || '';
  const canonical = meta?.canonical || '';
  const image = meta?.image || DEFAULT_OG;
  const imageAlt = meta?.imageAlt || 'Zephyr Technology';
  const ogType = meta?.ogType || 'website';
  const robots = notFound ? 'noindex, nofollow' : 'index, follow';

  const jsonLd = meta?.jsonLd
    ? `<script type="application/ld+json" id="zephyr-jsonld">${JSON.stringify(
        Array.isArray(meta.jsonLd) && meta.jsonLd.length === 1
          ? meta.jsonLd[0]
          : meta.jsonLd,
      )}</script>`
    : '';

  const headTags = `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="${robots}" />
    ${canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}" />` : ''}
    <meta property="og:site_name" content="Zephyr Technology" />
    <meta property="og:type" content="${escapeHtml(ogType)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    ${canonical ? `<meta property="og:url" content="${escapeHtml(canonical)}" />` : ''}
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
    ${jsonLd}
  `;

  const extras = [];
  if (meta?.mainKeyword) {
    extras.push(`<p>Main topic: ${escapeHtml(meta.mainKeyword)}</p>`);
  }
  if (meta?.opening || meta?.openingParagraph) {
    extras.push(`<p>${escapeHtml(meta.opening || meta.openingParagraph)}</p>`);
  }
  if (meta?.brand || meta?.model) {
    extras.push(
      `<p>${escapeHtml(
        [meta.brand, meta.model, meta.storage, meta.colour, meta.condition]
          .filter(Boolean)
          .join(' '),
      )}</p>`,
    );
  }
  if (meta?.price != null) {
    extras.push(
      `<p>Price: £${escapeHtml(meta.price)} · ${escapeHtml(
        meta.stockQuantity > 0 ? 'In stock' : 'Out of stock',
      )}</p>`,
    );
  }
  if (Array.isArray(meta?.supportingKeywords) && meta.supportingKeywords.length) {
    extras.push(
      `<p>${escapeHtml(meta.supportingKeywords.join(', '))}</p>`,
    );
  }
  extras.push(`
    <nav>
      <a href="https://www.zephyrtechnology.co.uk/">Home</a>
      <a href="https://www.zephyrtechnology.co.uk/phones/new">Buy new iPhone</a>
      <a href="https://www.zephyrtechnology.co.uk/phones/used">Buy used iPhone</a>
      <a href="https://www.zephyrtechnology.co.uk/sell-your-phone">Sell my iPhone</a>
    </nav>
  `);

  // Bot-readable block stays in HTML but is visually hidden so the UI looks unchanged.
  const bodyBlock = `
    <main id="seo-prerender" aria-hidden="true" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">
      <article>
        <h1>${escapeHtml(meta?.h1 || title)}</h1>
        <p>${escapeHtml(description)}</p>
        ${extras.join('\n')}
      </article>
    </main>
  `;

  let next = html.replace(/<title>[^<]*<\/title>/i, '');
  // Strip default OG/description from shell so injected tags win cleanly.
  next = next.replace(/<meta name="description"[^>]*>/gi, '');
  next = next.replace(/<link rel="canonical"[^>]*>/gi, '');
  next = next.replace(/<meta property="og:[^"]+"[^>]*>/gi, '');
  next = next.replace(/<meta name="twitter:[^"]+"[^>]*>/gi, '');
  next = next.replace(/<meta name="robots"[^>]*>/gi, '');
  next = next.replace(/<\/head>/i, `${headTags}</head>`);
  next = next.replace(/<div id="root"><\/div>/i, `${bodyBlock}<div id="root"></div>`);
  return next;
}
