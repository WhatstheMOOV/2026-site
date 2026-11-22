'use strict';

/**
 * The school record source.
 *
 * Today every record lives in data/schools.json, which is bundled into the
 * function. That will not hold at 35k schools, so reads go through one seam:
 * set SCHOOLS_URL to a JSON endpoint (Firebase Storage, Vercel Blob, an API in
 * front of Firestore) and that becomes the source of truth, with the bundled
 * file as the fallback if the fetch fails.
 *
 * The remote copy is cached in memory and re-checked after REMOTE_TTL_MS, the
 * same pattern moov-print uses for card templates: a record corrected upstream
 * should reach instances that already served the old one, without a redeploy.
 */

const localSchools = require('../data/schools.json');
const aliases = require('../data/aliases.json');
const { normalizeSlug } = require('./slug');

const REMOTE_TTL_MS = 10 * 60 * 1000;
const REMOTE_TIMEOUT_MS = 2500;

let cache = { at: 0, schools: null };

async function fetchRemote(url) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), REMOTE_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctl.signal });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    if (!json || typeof json !== 'object') throw new Error('not an object');
    return json;
  } finally {
    clearTimeout(timer);
  }
}

/** Every record, keyed by slug. Remote when configured and reachable, else local. */
async function allSchools() {
  const url = process.env.SCHOOLS_URL;
  if (!url) return localSchools;

  const fresh = cache.schools && Date.now() - cache.at < REMOTE_TTL_MS;
  if (fresh) return cache.schools;

  try {
    const schools = await fetchRemote(url);
    cache = { at: Date.now(), schools };
    return schools;
  } catch (err) {
    console.error('[schools] remote fetch failed, using bundled copy:', err.message);
    // Serve the last good remote copy if we have one; otherwise the bundled file.
    return cache.schools || localSchools;
  }
}

/**
 * Resolve a URL slug to a record.
 * Returns { slug, canonical, school } or null. `canonical` differs from `slug`
 * when the request came in on an alias, so the caller can set rel=canonical and
 * keep old emailed links working after a school is re-slugged.
 */
async function getSchool(rawSlug) {
  const slug = normalizeSlug(rawSlug);
  if (!slug) return null;

  const schools = await allSchools();
  const canonical = normalizeSlug(aliases[slug]) || slug;
  const school = schools[canonical];
  if (!school) return null;

  return { slug, canonical, school };
}

/** A few real slugs, for the not-found page. */
async function sampleSlugs(limit = 6) {
  const schools = await allSchools();
  return Object.keys(schools).slice(0, limit);
}

module.exports = { getSchool, allSchools, sampleSlugs };
