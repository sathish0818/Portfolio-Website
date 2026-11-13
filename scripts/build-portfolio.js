#!/usr/bin/env node
/*
 * Builds everything that depends on the project list, from data/projects.json:
 *   - index.html            homepage grid (newest 4) + ItemList JSON-LD (between the marker comments)
 *   - portfolio.html        the full portfolio page (all projects, newest first)
 *   - sitemap.xml           homepage, portfolio and every on-site case study
 *   - case-studies/*.html   the "Next case study" link, so the loop always includes new case studies
 *
 * Usage:  node scripts/build-portfolio.js
 * No dependencies. Safe to run any number of times.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://www.uxbysathish.com';
const HOME_COUNT = 4;
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const write = (f, s) => fs.writeFileSync(path.join(ROOT, f), s);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(s).replace(/"/g, '&quot;');
const pad = (n) => String(n).padStart(2, '0');

const data = JSON.parse(read('data/projects.json'));
const projects = data.projects;
const cats = data.categories;
const internal = projects.filter((p) => !p.external);

// Guard: a typo here would silently ship a broken card.
for (const p of projects) {
  for (const k of ['slug', 'name', 'type', 'category', 'href', 'image', 'alt', 'theme', 'summary']) {
    if (!p[k]) throw new Error(`Project "${p.slug || '?'}" is missing "${k}"`);
  }
  if (!cats.some((c) => c.id === p.category)) throw new Error(`Project "${p.slug}" has unknown category "${p.category}"`);
  if (!fs.existsSync(path.join(ROOT, p.image))) throw new Error(`Image not found: ${p.image}`);
  if (!p.external && !fs.existsSync(path.join(ROOT, p.href))) throw new Error(`Page not found: ${p.href}`);
}

function between(src, startMarker, endMarker, inner) {
  const a = src.indexOf(startMarker);
  const b = src.indexOf(endMarker);
  if (a < 0 || b < 0) throw new Error(`Marker not found: ${startMarker}`);
  const lineEnd = src.indexOf('\n', a) + 1;
  return src.slice(0, lineEnd) + inner + src.slice(b);
}

/* ───────────── 1. Homepage ───────────── */
const HOME_LAYOUT = ['proj-large', 'proj-small proj-offset', 'proj-small', 'proj-large'];
function homeCard(p, i) {
  const ext = p.external ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `        <a class="proj-card ${HOME_LAYOUT[i]}" href="${attr(p.href)}"${ext}>
          <div class="proj-img-wrap ${p.theme}">
            <img src="${attr(p.image)}" alt="${attr(p.alt)}" class="proj-img" loading="lazy" />
          </div>
          <div class="proj-meta">
            <div class="proj-meta-left">
              <div class="proj-name">${esc(p.name)}</div>
              <div class="proj-type">${esc(p.type)}</div>
            </div>
            <div class="proj-num">${pad(i + 1)}</div>
          </div>
        </a>
`;
}
let index = read('index.html');
index = between(index, '<!-- PROJECTS:START', '<!-- PROJECTS:END -->',
  '      <div class="projects-grid">\n' + projects.slice(0, HOME_COUNT).map(homeCard).join('\n') + '      </div>\n      ');
const itemList = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Case Studies by Sathish Sachithanandam',
  itemListElement: internal.map((p, i) => ({
    '@type': 'ListItem', position: i + 1, name: p.title || p.name, url: `${SITE}/${p.href}`, description: p.ld || p.summary,
  })),
};
index = between(index, '<!-- LD-PROJECTS:START -->', '<!-- LD-PROJECTS:END -->',
  `  <script type="application/ld+json" id="ld-projects">${JSON.stringify(itemList)}</script>\n  `);
write('index.html', index);

/* ───────────── 2. Portfolio page ───────────── */
function pfCard(p, i) {
  const ext = p.external ? ' target="_blank" rel="noopener noreferrer"' : '';
  const cta = p.external ? 'VIEW ON BEHANCE <span aria-hidden="true">&#8599;</span>' : 'READ CASE STUDY <span aria-hidden="true">&rarr;</span>';
  const badge = i === 0 ? '<span class="pf-badge">LATEST</span>' : '';
  const year = p.year ? `<span class="pf-year">${esc(p.year)}</span>` : '';
  return `        <article class="pf-card${i === 0 ? ' pf-featured' : ''}" data-cat="${attr(p.category)}">
          <a class="pf-link" href="${attr(p.href)}"${ext}>
            <div class="pf-img ${p.theme}">
              <img src="${attr(p.image)}" alt="${attr(p.alt)}" loading="${i < 3 ? 'eager' : 'lazy'}" />
              ${badge}${year}
            </div>
            <div class="pf-body">
              <div class="pf-top">
                <div>
                  <h2 class="pf-name">${esc(p.name)}</h2>
                  <p class="pf-type">${esc(p.type)}</p>
                </div>
                <span class="pf-num">${pad(i + 1)}</span>
              </div>
              <p class="pf-sum">${esc(p.summary)}</p>
              <span class="pf-cta">${cta}</span>
            </div>
          </a>
        </article>
`;
}
const fan = projects.slice(0, 3).map((p, i) => `<img class="f${i + 1}" src="${attr(p.image)}" alt="${i === 0 ? attr(p.alt) : ''}"${i === 0 ? '' : ' aria-hidden="true"'} />`).join('');
const chips = ['<button class="pf-chip" type="button" data-filter="all" aria-pressed="true">All <span>' + projects.length + '</span></button>']
  .concat(cats.map((c) => `<button class="pf-chip" type="button" data-filter="${attr(c.id)}" aria-pressed="false">${esc(c.label)} <span>${projects.filter((p) => p.category === c.id).length}</span></button>`)).join('\n          ');

const title = 'Portfolio: UX/UI Case Studies & Brand Work | Sathish S';
const desc = `All work by Sathish Sachithanandam, UX/UI designer in Chennai: ${internal.length} on-site case studies plus UI, branding and graphic design projects, newest first.`;
const url = `${SITE}/portfolio.html`;
const og = `${SITE}/assets/case-studies/${internal[0] ? internal[0].slug : 'habitly'}/og.jpg`;
const ld = [
  { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description: desc, url, inLanguage: 'en',
    author: { '@type': 'Person', name: 'Sathish Sachithanandam', url: SITE },
    isPartOf: { '@type': 'WebSite', name: 'Sathish Sachithanandam Portfolio', url: SITE },
    mainEntity: { '@type': 'ItemList', itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.title || p.name, url: p.external ? p.href : `${SITE}/${p.href}` })) } },
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
    { '@type': 'ListItem', position: 2, name: 'Portfolio', item: url } ] },
];
const nextInternal = internal[0];

const portfolio = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${attr(desc)}" />
  <meta name="author" content="Sathish Sachithanandam" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${url}" />
  <meta property="og:locale" content="en_IN" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${attr(title)}" />
  <meta property="og:description" content="${attr(desc)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${og}" />
  <meta property="og:site_name" content="Sathish Sachithanandam, Portfolio" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${attr(title)}" />
  <meta name="twitter:description" content="${attr(desc)}" />
  <meta name="twitter:image" content="${og}" />
  <meta name="twitter:site" content="@im_super18" />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" sizes="512x512" href="assets/images/favicon-avatar.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="assets/images/favicon-avatar.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&family=Oswald:wght@400;700&family=Space+Grotesk:wght@500;700&family=Epilogue:wght@900&family=ZCOOL+KuaiLe&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css?v=115" />
  <link rel="stylesheet" href="case-study.css?v=5" />
  <link rel="stylesheet" href="portfolio.css?v=1" />
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
  <script type="text/javascript">
      (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "xpxjy56sfj");
  </script>
</head>
<body class="cs-page pf-page">
  <a class="skip-to-main" href="#main">Skip to main content</a>
  <nav class="navbar">
      <div class="navbar-inner">
        <a class="logo" href="index.html" aria-label="Sathish S, Home">SS</a>
        <button class="hamburger" aria-label="Menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
        <ul class="nav-links">
          <li><a href="index.html#home">Home</a></li>
          <li><a href="index.html#about">About</a></li>
          <li><a href="portfolio.html" aria-current="page">Projects</a></li>
          <li><a href="index.html#blog">Blog</a></li>
          <li><a href="index.html#contact">Contact</a></li>
        </ul>
      </div>
    </nav>
  <main id="main">
    <header class="cs-hero">
      <div class="cs-wrap">
        <div class="cs-hero-grid">
          <div class="cs-hero-copy">
            <a class="cs-back" href="index.html"><span aria-hidden="true">&larr;</span> Home</a>
            <p class="cs-eyebrow">PORTFOLIO | ALL WORK</p>
            <h1 class="cs-title">Every project, newest first.</h1>
            <p class="cs-lede">Case studies, UX audits and brand work. The latest sits at the top and older projects follow below.</p>
            <dl class="cs-meta">
              <div><dt>Projects</dt><dd>${projects.length}</dd></div>
              <div><dt>Case studies</dt><dd>${internal.length}</dd></div>
              <div><dt>Latest</dt><dd>${esc(projects[0].title || projects[0].name)}</dd></div>
            </dl>
          </div>
          <div class="pf-fan" aria-hidden="false">${fan}</div>
        </div>
      </div>
    </header>

    <section class="pf-sec">
      <div class="cs-wrap">
        <div class="pf-bar">
          <div class="pf-chips" role="group" aria-label="Filter projects">
          ${chips}
          </div>
          <p class="pf-count" aria-live="polite"><b id="pf-n">${projects.length}</b> projects</p>
        </div>
        <div class="pf-grid" id="pf-grid">
${projects.map(pfCard).join('\n')}        </div>
      </div>
    </section>

    <section class="cs-next">
      <div class="cs-wrap">
        <p class="cs-kicker cs-rv">WANT TO SEE MORE?</p>
        <a class="big cs-rv" href="https://www.behance.net/sathishsachida" target="_blank" rel="noopener noreferrer">More work on Behance <span aria-hidden="true">&rarr;</span></a>
        <div class="links cs-rv">
          <a class="cs-btn" href="${nextInternal ? attr(nextInternal.href) : 'index.html'}">Read the latest case study</a>
          <a class="cs-btn ghost" href="index.html#contact">Get in touch</a>
        </div>
      </div>
    </section>
  </main>
  <footer class="footer">
    <span>Copyright &copy; 2026 Sathish S. All Rights Reserved.</span>
    <span>Made with care &middot; Chennai, India</span>
  </footer>
  <script src="case-study.js?v=2"></script>
  <script src="portfolio.js"></script>
</body>
</html>
`;
write('portfolio.html', portfolio);

/* ───────────── 3. Sitemap ───────────── */
const today = new Date().toISOString().slice(0, 10);
const urlEntry = (loc, pr) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${pr}</priority>\n  </url>\n`;
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urlEntry(`${SITE}/`, '1.0') + urlEntry(`${SITE}/portfolio.html`, '0.9') + internal.map((p) => urlEntry(`${SITE}/${p.href}`, '0.8')).join('') + '</urlset>\n');

/* ───────────── 4. Case study pages: next link + back link ───────────── */
internal.forEach((p, i) => {
  const next = internal[(i + 1) % internal.length];
  const file = p.href;
  let html = read(file);
  html = html.replace(/(<a class="big cs-rv" href=")[^"]*(">)[^<]*(<span)/, `$1${path.basename(next.href)}$2${esc(next.title || next.name)} $3`);
  html = html.replace(/href="\.\.\/index\.html#projects"/g, 'href="../portfolio.html"');
  html = html.replace(/"item": ?"https:\/\/www\.uxbysathish\.com\/#projects"/g, `"item":"${SITE}/portfolio.html"`);
  write(file, html);
});

console.log(`Built: ${projects.length} projects (${internal.length} case studies). Homepage shows ${Math.min(HOME_COUNT, projects.length)}: ${projects.slice(0, HOME_COUNT).map((p) => p.slug).join(', ')}`);
