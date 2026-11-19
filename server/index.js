import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { injectSeoIntoHtml } from './injectHead.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');

const PORT = Number(process.env.PORT || 3000);
const API_BASE =
  process.env.SEO_API_BASE ||
  process.env.VITE_BASE_URL ||
  'https://api.zephyrtechnology.co.uk';

const app = express();

const indexHtml = () => {
  if (!fs.existsSync(indexPath)) {
    throw new Error(`Missing build output at ${indexPath}. Run npm run build first.`);
  }
  return fs.readFileSync(indexPath, 'utf8');
};

async function fetchSeoMeta(pathname, searchParams) {
  const params = new URLSearchParams({ path: pathname });
  if (searchParams.get('page')) params.set('page', searchParams.get('page'));
  const url = `${API_BASE.replace(/\/$/, '')}/api/public/seo/meta?${params}`;
  const res = await fetch(url);
  if (res.status === 404) return { notFound: true, meta: null };
  if (!res.ok) return { notFound: false, meta: null };
  const json = await res.json();
  return { notFound: false, meta: json?.data || null };
}

const SEO_PATH_RE =
  /^\/(?:$|phones(?:\/[^/]+)?\/?$|sell-your-phone(?:\/[^/]+)?\/?$|products\/?$|product-details\/[^/]+\/?$|sell\/?$)/;

const sendSeoTextFile = async (req, res) => {
  const type = req.path.endsWith('.xml') ? 'application/xml' : 'text/plain';
  // Prefer live API sitemap (full product + sell URLs). Fall back to dist copies.
  try {
    const upstream = await fetch(`${API_BASE.replace(/\/$/, '')}${req.path}`);
    if (upstream.ok) {
      const body = await upstream.text();
      // Guard against API JSON 404 pages that still return 200 in misconfig.
      if (!body.trim().startsWith('{')) {
        res.status(200).type(type).send(body);
        return;
      }
    }
  } catch (err) {
    console.warn('[seo-server] proxy file failed, using dist fallback', err.message);
  }

  const fallback = path.join(distDir, req.path.replace(/^\//, ''));
  if (fs.existsSync(fallback)) {
    res.status(200).type(type).send(fs.readFileSync(fallback, 'utf8'));
    return;
  }
  res.status(404).type('text/plain').send('Not found');
};

app.get('/robots.txt', sendSeoTextFile);
app.get('/sitemap.xml', sendSeoTextFile);
app.get('/llms.txt', sendSeoTextFile);

app.use(
  express.static(distDir, {
    index: false,
    maxAge: '1h',
    setHeaders(res, filePath) {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  }),
);

const KNOWN_APP_PATH_RE =
  /^\/(?:$|phones(?:\/[^/]+)?\/?$|sell-your-phone(?:\/[^/]+)?\/?$|products\/?$|product-details\/[^/]+\/?$|sell\/?$|sell-worth\/?$|confirm-sale\/?$|finalize-sale\/?$|track-request\/?$|cart\/?$|checkout(?:\/success|\/cancel)?\/?$|about-us\/?$|contact\/?$|for-businesses\/?$|privacy-policy\/?$|terms-condition\/?$|sell-terms-condition\/?$|refund-policy\/?$|shipping-policy\/?$|login\/?$|register\/?$|forget-password\/?$|reset-password\/?$|otp-verification\/?$|verify-code\/?$|dashboard(?:\/.*)?$)/;

app.use(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(405).type('text/plain').send('Method Not Allowed');
    return;
  }

  try {
    const pathname = req.path || '/';
    let html = indexHtml();

    if (SEO_PATH_RE.test(pathname)) {
      const { meta, notFound } = await fetchSeoMeta(
        pathname,
        new URLSearchParams(req.query),
      );
      if (notFound && /^\/phones\/(?!new$|used$)[^/]+/.test(pathname)) {
        html = injectSeoIntoHtml(html, null, { notFound: true });
        res.status(404).type('html').send(html);
        return;
      }
      if (notFound && /^\/sell-your-phone\/[^/]+/.test(pathname)) {
        html = injectSeoIntoHtml(html, null, { notFound: true });
        res.status(404).type('html').send(html);
        return;
      }
      html = injectSeoIntoHtml(html, meta);
      res.type('html').send(html);
      return;
    }

    // Real HTTP 404 for unknown addresses (SOW item 1).
    if (!KNOWN_APP_PATH_RE.test(pathname)) {
      html = injectSeoIntoHtml(html, null, { notFound: true });
      res.status(404).type('html').send(html);
      return;
    }

    res.type('html').send(html);
  } catch (err) {
    console.error('[seo-server]', err);
    res.status(500).type('text/plain').send('Server error');
  }
});

app.listen(PORT, () => {
  console.log(`[seo-server] serving ${distDir} on :${PORT}`);
  console.log(`[seo-server] SEO API: ${API_BASE}`);
});
