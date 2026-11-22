'use strict';

/**
 * Server-renders /example/[slug].
 *
 * The page's look is still driven by the client script in example/index.html --
 * this function hands that script its record up front (window.__SCHOOL__) so
 * there is no fetch and no loading flash, and it writes the head tags the
 * client could never produce: real <title>, OG/Twitter cards and a per-school
 * og:image, so a link pasted into an email, LinkedIn DM or Teams chat unfurls
 * as "MOOV for Commack High School" instead of nothing.
 *
 * Responses are CDN-cached, so each school renders once and is then served from
 * the edge like a static file.
 */

const fs = require('fs');
const path = require('path');
const { getSchool, sampleSlugs } = require('../lib/schools');

const TEMPLATE_CANDIDATES = [
  path.join(process.cwd(), 'example', 'index.html'),
  path.join(__dirname, '..', 'example', 'index.html'),
  path.join(__dirname, '..', '..', 'example', 'index.html'),
];

let templateCache = null;

function loadTemplate() {
  if (templateCache) return templateCache;
  for (const candidate of TEMPLATE_CANDIDATES) {
    try {
      templateCache = fs.readFileSync(candidate, 'utf8');
      return templateCache;
    } catch (_) { /* try the next one */ }
  }
  throw new Error('example/index.html not found. Tried: ' + TEMPLATE_CANDIDATES.join(', '));
}

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Safe to drop inside a <script> block. */
function escapeJson(value) {
  // U+2028/U+2029 are valid in JSON but terminate a line in JS source.
  const LS = String.fromCharCode(0x2028);
  const PS = String.fromCharCode(0x2029);
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .split(LS).join('\\u2028')
    .split(PS).join('\\u2029');
}

function originOf(req) {
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = (req.headers['x-forwarded-host'] || req.headers.host || 'joinmoov.com').split(',')[0].trim();
  return `${proto}://${host}`;
}

function headTags({ school, canonical, origin }) {
  const title = `MOOV for ${school.name}`;
  const description =
    `See how MOOV brings zero-touch hall passes, real-time attendance and entry ` +
    `verification to ${school.name} -- one ID card tap.`;
  const pageUrl = `${origin}/example/${canonical}`;
  const ogImage = `${origin}/example/${canonical}/og.png`;

  return `
    <link rel="canonical" href="${escapeHtml(pageUrl)}">
    <meta name="robots" content="noindex, nofollow">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="MOOV">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(pageUrl)}">
    <meta property="og:image" content="${escapeHtml(ogImage)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${escapeHtml(title)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(ogImage)}">
    ${school.colors && school.colors.primary ? `<meta name="theme-color" content="${escapeHtml(school.colors.primary)}">` : ''}
    <script>window.__SCHOOL__ = ${escapeJson(school)}; window.__SCHOOL_SLUG__ = ${escapeJson(canonical)};</script>
`;
}

function render({ school, canonical, origin }) {
  const title = `MOOV for ${school.name}`;
  const description =
    `See how MOOV brings zero-touch hall passes, real-time attendance and entry ` +
    `verification to ${school.name} -- one ID card tap.`;

  let html = loadTemplate();

  html = html.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(title)}</title>`
  );
  html = html.replace(
    /<meta\s+name="description"\s+content="[\s\S]*?">/i,
    `<meta name="description" content="${escapeHtml(description)}">`
  );
  html = html.replace(/<\/head>/i, `${headTags({ school, canonical, origin })}</head>`);

  return html;
}

function notFoundPage(slug, samples) {
  const examples = samples
    .map((s) => `<a href="/example/${escapeHtml(s)}">${escapeHtml(s)}</a>`)
    .join('');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>School not found &mdash; MOOV</title>
<link rel="icon" type="image/png" href="/images/moov-logo.png">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
         padding:24px; font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
         background:#fff; color:#111; }
  .box { max-width:520px; text-align:center; }
  img.mark { width:56px; height:56px; margin-bottom:24px; }
  h1 { font-size:28px; font-weight:800; letter-spacing:-0.02em; margin:0 0 12px; }
  p { font-size:16px; line-height:1.6; color:#555; margin:0 0 28px; }
  code { background:#f4f4f5; padding:2px 6px; border-radius:4px; font-size:14px; }
  .cta { display:inline-flex; gap:12px; flex-wrap:wrap; justify-content:center; }
  .cta a { display:inline-block; padding:12px 22px; border-radius:999px; text-decoration:none;
           font-weight:600; font-size:15px; }
  .primary { background:#111; color:#fff; }
  .secondary { border:1px solid #ddd; color:#111; }
  .samples { margin-top:36px; font-size:13px; color:#888; }
  .samples a { color:#666; margin:0 6px; }
</style>
</head>
<body>
  <div class="box">
    <img class="mark" src="/images/moov-logo.png" alt="MOOV">
    <h1>We don't have a page for that school yet</h1>
    <p>Nothing is set up for <code>${escapeHtml(slug || 'that link')}</code>. If you got this link
       from someone at MOOV, let them know &mdash; or just book a demo and we'll walk you through it.</p>
    <div class="cta">
      <a class="primary" href="/demo">Get a demo</a>
      <a class="secondary" href="https://joinmoov.com">See MOOV</a>
    </div>
    <div class="samples">Live examples: ${examples}</div>
  </div>
</body>
</html>`;
}

module.exports = async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const rawSlug = url.searchParams.get('slug') || url.searchParams.get('school') || '';

  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  try {
    const hit = await getSchool(rawSlug);

    if (!hit) {
      // Short CDN cache: a school added tomorrow should start working tomorrow.
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=60');
      res.statusCode = 404;
      res.end(notFoundPage(rawSlug, await sampleSlugs()));
      return;
    }

    // Render once per school, then serve from the edge. stale-while-revalidate
    // means a record correction never costs a visitor a slow page.
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('X-MOOV-School', hit.canonical);
    res.statusCode = 200;
    res.end(render({ school: hit.school, canonical: hit.canonical, origin: originOf(req) }));
  } catch (err) {
    console.error('[example] render failed:', err);
    res.setHeader('Cache-Control', 'no-store');
    res.statusCode = 500;
    res.end('<!DOCTYPE html><html><body><p>Something went wrong rendering this page.</p></body></html>');
  }
};
