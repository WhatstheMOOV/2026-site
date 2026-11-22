'use strict';

/**
 * Per-school OG image for /example/[slug]: the school's own ID card.
 *
 * This is what a cold-emailed link is judged by -- in Gmail, LinkedIn, Teams
 * and iMessage the unfurl card is seen before the page is ever opened -- so it
 * shows the thing being sold rather than a marketing banner.
 *
 * Geometry is measured off the card artwork and expressed as fractions of the
 * canvas, so every field keeps its place at any size. satori lays it out and
 * renders SVG; resvg rasterises to PNG. Fonts and the fixed art live under
 * assets/ and public/, so nothing but the school's own logo and photo is
 * fetched at request time.
 */

const fs = require('fs');
const path = require('path');
const satori = require('satori');
const { Resvg } = require('@resvg/resvg-js');
const { getSchool } = require('../lib/schools');

const W = 1200;
const H = 630;
// A real ID card is CR80, 1.586:1. The OG frame is 1.90:1, so the card is
// centred at its true shape rather than stretched to fill the frame.
const CARD_RATIO = 1.586;
const CARD_MARGIN = 28;
const INK = '#111111';
const FETCH_TIMEOUT_MS = 3000;

const satoriFn = typeof satori === 'function' ? satori : satori.default;

/* ---------- geometry, as fractions of the card ---------- */
const G = {
  photo:   { x: 0.039, y: 0.153, h: 0.528, aspect: 0.837, border: 0.016 },
  title:   { centerY: 0.187, font: 0.0873, lineHeight: 1.25, maxW: 0.77 },
  band:    { y: 0.357, h: 0.227 },
  classOf: { center: 0.165, font: 0.0637 },
  year:    { center: 0.761, font: 0.0929 },
  circle:  { center: 0.457, dia: 0.312, offsetY: 0.016 },
  name:    { x: 0.040, centerY: 0.763, font: 0.0788 },

  barcode: { x0: 0.668, x1: 0.922, y0: 0.733, y1: 0.807 },
  footer:  { centerY: 0.868, font: 0.0442, right: 0.957 },
};

const px = (frac, basis) => Math.round(frac * basis);

/* ---------- colour ---------- */
function parseHex(hex) {
  const h = String(hex || '').replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}

function relLuminance(rgb) {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * The card puts white text on the accent AND sets the title in the accent over
 * a white-washed photo, so a pale school colour renders both invisible. The
 * title is the harder case -- it competes with whatever is in the photograph --
 * so darken until the accent clears 4.5:1 against white, not just the 3:1 that
 * white-on-accent would need.
 */
function readableAccent(hex) {
  const rgb = parseHex(hex);
  if (!rgb) return '#8f1e1e';
  let c = rgb;
  for (let i = 0; i < 24; i++) {
    const contrast = 1.05 / (relLuminance(c) + 0.05);
    if (contrast >= 4.5) break;
    c = c.map((v) => Math.round(v * 0.88));
  }
  return '#' + c.map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}

/** The accent mixed down into white, for the surface the card sits on. */
function tint(hex, amount) {
  const rgb = parseHex(hex) || [143, 30, 30];
  const mixed = rgb.map((v) => Math.round(255 - (255 - v) * amount));
  return '#' + mixed.map((v) => v.toString(16).padStart(2, '0')).join('');
}

/* ---------- assets ---------- */
function resolveAsset(relative) {
  const candidates = [
    path.join(process.cwd(), relative),
    path.join(__dirname, '..', relative),
    path.join(__dirname, '..', '..', relative),
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  throw new Error('asset not found: ' + relative);
}

function fileDataUri(relative, mime) {
  const buf = fs.readFileSync(resolveAsset(relative));
  return 'data:' + mime + ';base64,' + buf.toString('base64');
}

let fontCache = null;
function loadFonts() {
  if (fontCache) return fontCache;
  const f = (file, weight) => ({
    name: 'Inter',
    data: fs.readFileSync(resolveAsset('assets/fonts/' + file)),
    weight,
    style: 'normal',
  });
  fontCache = [f('Inter-Regular.woff', 400), f('Inter-ExtraBold.woff', 800), f('Inter-Black.woff', 900)];
  return fontCache;
}

let localArt = null;
function loadLocalArt() {
  if (localArt) return localArt;
  const safe = (rel, mime) => {
    try { return fileDataUri(rel, mime); } catch (e) {
      console.error('[og] missing local art ' + rel + ':', e.message);
      return null;
    }
  };
  localArt = {
    student: safe('public/logos/bart.png', 'image/png'),
    moov: safe('images/moov-logo.png', 'image/png'),
  };
  return localArt;
}

/**
 * A remote image as a data URI; null (never a throw) if it cannot be had.
 *
 * Logos are already mirrored to our own storage, but backgroundImage still
 * points at whatever host the photo was found on, and several of those
 * (Wikimedia among them) throttle clients that send no User-Agent.
 */
async function remoteImage(url) {
  if (!url) return null;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctl.signal,
      headers: { 'User-Agent': 'CardRenderer/1.0 (automated image fetch)' },
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    if (!buf.length) throw new Error('empty body');
    const isPng = buf[0] === 0x89 && buf[1] === 0x50;
    const isJpg = buf[0] === 0xff && buf[1] === 0xd8;
    if (!isPng && !isJpg) throw new Error('unsupported image type');
    return 'data:image/' + (isPng ? 'png' : 'jpeg') + ';base64,' + buf.toString('base64');
  } catch (err) {
    console.error('[og] image fetch failed (' + url + '):', err.message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* ---------- text helpers ---------- */

/** satori has no text-stroke, so the outline is a ring of text-shadows. */
function outline(color, r) {
  const o = [];
  for (const [dx, dy] of [[-1,-1],[1,-1],[-1,1],[1,1],[0,-1],[0,1],[-1,0],[1,0]]) {
    o.push(dx * r + 'px ' + dy * r + 'px 0 ' + color);
  }
  return o.join(', ');
}

/** Title size steps down so long names stay on two lines. */
function titleFont(name, basis) {
  const base = px(G.title.font, basis);
  const len = (name || '').length;
  if (len <= 20) return base;
  if (len <= 28) return Math.round(base * 0.88);
  if (len <= 38) return Math.round(base * 0.76);
  return Math.round(base * 0.64);
}

/** The graduating class a current senior belongs to. */
function classOfYear(now) {
  return now.getMonth() >= 6 ? now.getFullYear() + 1 : now.getFullYear();
}

/* ---------- element helpers ---------- */
const box = (style, children) => ({
  type: 'div',
  props: children === undefined ? { style: { display: 'flex', ...style } } : { style: { display: 'flex', ...style }, children },
});

/**
 * A single line of text whose optical centre sits on `centerY`.
 * Positioning by a centred box beats guessing cap-height offsets: satori's
 * `top` places the line box, not the cap, and the two differ per weight.
 */
const textRow = ({ left, width, centerY, font, align, extra }, children) =>
  box({
    position: 'absolute',
    left,
    width,
    top: Math.round(centerY - font * 0.8),
    height: Math.round(font * 1.6),
    alignItems: 'center',
    justifyContent: align || 'flex-start',
    fontSize: font,
    ...(extra || {}),
  }, Array.isArray(children) ? children : [box({}, children)]);
const img = (src, style) => ({ type: 'img', props: { src, style } });

/** Deterministic bar widths, so a given ID always draws the same code. */
function barcodeBars(seed, count) {
  const bars = [];
  let h = 0;
  for (let i = 0; i < String(seed).length; i++) h = (h * 31 + String(seed).charCodeAt(i)) >>> 0;
  for (let i = 0; i < count; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    bars.push(1 + (h % 3));
  }
  return bars;
}
function card({ name, accent, logo, background, studentId, now }) {
  const art = loadLocalArt();

  /* Card geometry. CW/CH are the card itself, at a real CR80 ratio; the canvas
     around it is wider, so the card is centred on a tint of the school colour
     rather than stretched to fill. */
  const CH = H - CARD_MARGIN * 2;
  const CW = Math.round(CH * CARD_RATIO);
  const CX = Math.round((W - CW) / 2);
  const CY = CARD_MARGIN;

  const photoB = Math.max(2, px(G.photo.border, CH));
  const photoOuterH = px(G.photo.h, CH);
  const photoOuterW = Math.round(photoOuterH * G.photo.aspect);
  const photoX = px(G.photo.x, CW);
  const photoY = px(G.photo.y, CH);

  const bandY = px(G.band.y, CH);
  const bandH = px(G.band.h, CH);
  const bandX = photoX + photoOuterW;
  const bandW = CW - bandX;

  const circleD = px(G.circle.dia, CH);
  const circleCX = bandX + Math.round(G.circle.center * bandW);
  const circleCY = bandY + Math.round(bandH / 2) + px(G.circle.offsetY, CH);

  const tFont = titleFont(name, CH);
  const nameFont = px(G.name.font, CH);
  const bcX0 = px(G.barcode.x0, CW);
  const bcX1 = px(G.barcode.x1, CW);
  const bcY0 = px(G.barcode.y0, CH);
  const bcY1 = px(G.barcode.y1, CH);
  const footFont = px(G.footer.font, CH);

  const inner = [];

  // Base + school photo, then an even wash so card content reads over any
  // photograph, however busy.
  inner.push(box({ position: 'absolute', inset: 0, backgroundColor: '#d9d9d9' }));
  if (background) {
    inner.push(box({
      position: 'absolute', top: 0, left: 0, width: CW, height: CH,
      backgroundImage: 'url(' + background + ')',
      backgroundSize: '' + CW + 'px ' + CH + 'px',
      backgroundPosition: 'center',
    }));
    inner.push(box({
      position: 'absolute', top: 0, left: 0, width: CW, height: CH,
      backgroundColor: 'rgba(255,255,255,0.3)',
    }));
  }

  // Class band, bleeding off the right edge.
  inner.push(box({
    position: 'absolute', left: bandX, top: bandY, width: bandW, height: bandH,
    backgroundColor: accent,
  }));
  inner.push(box({
    position: 'absolute', left: bandX, top: bandY, width: bandW, height: bandH,
    alignItems: 'center', justifyContent: 'center',
  }, [
    textRow({
      left: Math.round(G.classOf.center * bandW) - 200, width: 400,
      centerY: Math.round(bandH / 2), font: px(G.classOf.font, CH), align: 'center',
      extra: { fontWeight: 800, color: '#ffffff' },
    }, 'Class of'),
    textRow({
      left: Math.round(G.year.center * bandW) - 200, width: 400,
      centerY: Math.round(bandH / 2), font: px(G.year.font, CH), align: 'center',
      extra: { fontWeight: 900, color: '#ffffff' },
    }, String(classOfYear(now))),
  ]));

  // Student photo, framed in the school's colour. Drawn after the band so the
  // frame sits over it, as on the artwork -- satori sizes borders outside the
  // given width, so the content box is inset by the border to keep the outer
  // edge exactly where it was measured.
  inner.push(box({
    position: 'absolute', left: photoX, top: photoY,
    width: photoOuterW - photoB * 2, height: photoOuterH - photoB * 2,
    border: photoB + 'px solid ' + accent, backgroundColor: '#ffffff',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  }, art.student ? [img(art.student, { width: '100%', height: '100%', objectFit: 'contain' })] : []));

  // School name, outlined so it holds up over any photo, centred on the seal.
  const titleW = (circleCX - bandX) * 2;
  inner.push(box({
    position: 'absolute', left: bandX, top: 0, width: titleW,
    height: px(G.title.centerY, CH) * 2,
    alignItems: 'center', justifyContent: 'center',
  }, [
    box({
      maxWidth: Math.round(G.title.maxW * titleW),
      fontSize: tFont, fontWeight: 900, color: accent,
      lineHeight: G.title.lineHeight, textAlign: 'center',
      textShadow: outline('#ffffff', Math.max(2, Math.round(tFont * 0.045))),
    }, (name || '').toUpperCase()),
  ]));

  // Seal, overlapping the band.
  inner.push(box({
    position: 'absolute',
    left: circleCX - Math.round(circleD / 2), top: circleCY - Math.round(circleD / 2),
    width: circleD, height: circleD, borderRadius: circleD,
    backgroundColor: '#ffffff', border: Math.round(circleD * 0.03) + 'px solid ' + accent,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  }, logo ? [img(logo, { width: '74%', height: '74%', objectFit: 'contain' })] : []));

  // Student name.
  inner.push(textRow({
    left: px(G.name.x, CW), width: CW, centerY: px(G.name.centerY, CH), font: nameFont,
    extra: { fontWeight: 900, color: INK, textShadow: outline('#ffffff', 2) },
  }, 'BART SIMPSON'));

  // Barcode.
  const bars = barcodeBars(studentId, 48);
  inner.push(box({
    position: 'absolute', left: bcX0, top: bcY0, width: bcX1 - bcX0, height: bcY1 - bcY0,
    backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center',
    padding: '5px 8px',
  }, [
    box({ alignItems: 'stretch', height: '100%', width: '100%', justifyContent: 'space-between' },
      bars.map((w) => box({ width: w, backgroundColor: INK }))),
  ]));

  // Call to action + MOOV mark.
  inner.push(textRow({
    left: 0, width: px(G.footer.right, CW), centerY: px(G.footer.centerY, CH),
    font: footFont, align: 'flex-end',
    extra: { fontWeight: 800, color: INK },
  }, [
    box({}, 'TAP THIS ID TO YOUR PHONE'),
    ...(art.moov ? [img(art.moov, { width: Math.round(footFont * 1.3), height: Math.round(footFont * 1.3), marginLeft: 8 })] : []),
  ]));

  const cardEl = box({
    position: 'absolute', left: CX, top: CY, width: CW, height: CH,
    borderRadius: Math.round(CW * 0.0235),
    overflow: 'hidden',
    boxShadow: '0 16px 44px rgba(0,0,0,0.30)',
  }, inner);

  return box({
    position: 'relative', width: W, height: H, fontFamily: 'Inter',
    backgroundColor: tint(accent, 0.12),
  }, [cardEl]);
}

async function renderPng(opts) {
  const svg = await satoriFn(card(opts), { width: W, height: H, fonts: loadFonts() });
  return new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
}

module.exports = async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const slug = url.searchParams.get('slug') || url.searchParams.get('school') || '';

  try {
    const hit = await getSchool(slug);
    const school = hit ? hit.school : null;

    const name = school ? school.name : 'Your School';
    const accent = readableAccent(
      school && school.showColors && school.colors && school.colors.primary
        ? school.colors.primary
        : '#8f1e1e'
    );

    const [logo, background] = await Promise.all([
      school && school.showLogo ? remoteImage(school.logo) : null,
      school ? remoteImage(school.backgroundImage) : null,
    ]);

    const png = await renderPng({
      name, accent, logo, background,
      studentId: '123456789',
      now: new Date(),
    });

    // A card is only complete if the art it expected actually arrived. One that
    // lost its photo or logo to a throttled host gets a short cache, so it
    // heals on the next request instead of sticking around for a day.
    const wanted = Boolean(school) + Boolean(school && school.showLogo && school.logo);
    const got = Boolean(background) + Boolean(logo);
    const complete = got >= wanted;

    res.setHeader('Content-Type', 'image/png');
    // Unfurl caches are aggressive anyway; let the CDN hold a good card for a
    // day so a corrected logo or colour still works its way out.
    res.setHeader('Cache-Control', complete
      ? 'public, s-maxage=86400, stale-while-revalidate=604800'
      : 'public, s-maxage=120');
    res.setHeader('X-MOOV-Art', complete ? 'complete' : 'degraded');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.statusCode = 200;
    res.end(png);
  } catch (err) {
    console.error('[og] render failed:', err);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.statusCode = 500;
    res.end('og render failed');
  }
};
