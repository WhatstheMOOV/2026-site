'use strict';

/**
 * Slug helpers for the /example/[slug] landing pages.
 *
 * The public slug is a human-readable handle that ships inside cold emails, so it
 * has to survive being retyped, copy-pasted with trailing punctuation, and
 * case-mangled by mail clients. normalizeSlug() is deliberately forgiving: it is
 * the only thing standing between a prospect's click and a 404.
 */

/** "Commack High School" -> "commack-high-school" */
function slugify(input) {
  return String(input || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')   // strip diacritics
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Forgiving read of whatever arrived in the URL. */
function normalizeSlug(input) {
  if (!input) return '';
  let s = String(input).trim();
  try { s = decodeURIComponent(s); } catch (_) { /* leave as-is */ }
  return slugify(s);
}

module.exports = { slugify, normalizeSlug };
