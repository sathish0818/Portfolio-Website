#!/usr/bin/env node
/*
 * Crawls the site from "/" and checks every internal link, stylesheet, script and image.
 * Usage:  node scripts/check-links.js [baseUrl]      (default http://localhost:5190)
 * Fails on: non-200 responses, broken #anchors, and any internal link that still uses .html or index.html.
 */
const base = (process.argv[2] || 'http://localhost:5190').replace(/\/$/, '');
const seen = new Map(); const problems = []; const pages = new Set(); const queue = ['/'];
const decode = (s) => s.replace(/&amp;/g, '&');

async function get(u) { try { return await fetch(base + u, { redirect: 'manual' }); } catch (e) { return { status: 0 }; } }

(async () => {
  while (queue.length) {
    const path = queue.shift();
    if (pages.has(path)) continue; pages.add(path);
    const res = await get(path);
    if (res.status !== 200) { problems.push(`PAGE ${path} -> ${res.status}`); continue; }
    const html = (await res.text()).replace(/<link[^>]*rel="canonical"[^>]*>/g, '');
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    const refs = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => decode(m[1]));
    for (const ref of refs) {
      if (/^(mailto:|tel:|data:|javascript:)/.test(ref)) continue;
      if (/^https?:\/\//.test(ref)) {
        if (ref.startsWith('https://www.uxbysathish.com')) problems.push(`ABSOLUTE own-domain link on ${path}: ${ref}`);
        continue;
      }
      if (ref.startsWith('#')) { if (ref.length > 1 && !ids.has(ref.slice(1))) problems.push(`ANCHOR ${ref} missing on ${path}`); continue; }
      const u = new URL(ref, base + path);
      const target = u.pathname + u.search;
      if (/\.html$/.test(u.pathname) || /\/index$/.test(u.pathname)) problems.push(`UGLY url on ${path}: ${ref}`);
      if (!ref.startsWith('/')) problems.push(`RELATIVE url on ${path}: ${ref}`);
      if (!seen.has(target)) { const r = await get(target); seen.set(target, r.status); if (r.status !== 200) problems.push(`BROKEN ${target} -> ${r.status} (from ${path})`); }
      if (u.hash && !/\.(css|js|webp|png|jpg|svg|ico|pdf)$/.test(u.pathname)) {
        if (u.pathname === path) continue;
        const r2 = await get(u.pathname); if (r2.status === 200) { const h2 = await r2.text(); if (!new RegExp(`\\sid="${u.hash.slice(1)}"`).test(h2)) problems.push(`ANCHOR ${ref} missing on ${u.pathname} (from ${path})`); }
      }
      if (!/\.[a-z0-9]+$/i.test(u.pathname) && !pages.has(u.pathname)) queue.push(u.pathname);
    }
  }
  console.log(`Pages crawled: ${[...pages].join(', ')}`);
  console.log(`Internal URLs checked: ${seen.size}`);
  if (problems.length) { console.log('\nPROBLEMS:'); [...new Set(problems)].forEach((p) => console.log(' - ' + p)); process.exit(1); }
  console.log('All links OK');
})();
