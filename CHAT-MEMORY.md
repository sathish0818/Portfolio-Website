# Portfolio Project — Claude Chat Memory
**Last updated:** 2026-07-03  
**Site:** https://uxbysathish.com  
**GitHub:** https://github.com/sathish0818/Portfolio-Website  
**Deployed on:** Vercel (auto-deploys on every push to main)

---

## Project Structure
```
/Users/sathish.s/Downloads/Portfolio Website 2026/portfolio-site/
├── index.html
├── style.css
├── script.js
├── robots.txt
├── sitemap.xml
└── assets/
    ├── images/
    │   ├── favicon-avatar.png       ← 512x512 square (from Figma node 305-32)
    │   ├── hero-avatar-vector.png
    │   ├── profile-photo.jpg
    │   └── ...
    └── files/
        └── Sathish-S-UXUI-Designer-Resume.pdf
```

---

## Owner
- **Name:** Sathish Sachithanandam (also known as Sathish S)
- **Role:** AI-Driven UX/UI Designer, Graphic Designer & Motion Designer
- **Location:** Chennai, Tamil Nadu, India
- **Experience:** 8+ years
- **Current Company:** ESDS Software Solutions
- **Email:** sathishmmn93@gmail.com

## Social Links
- LinkedIn: https://www.linkedin.com/in/sathishsachithanandam
- Behance: https://www.behance.net/sathishsachida
- Dribbble: https://dribbble.com/Sathish0818
- Instagram: https://www.instagram.com/im_super18/
- Medium: https://medium.com/@sathishmmn93

---

## What We Built / Fixed

### 1. Mobile Overlap Fix (327–376px)
- `.hero-follow` was overlapping the hero content at small screen sizes
- Fixed by adding `bottom: 26px; right: 12px` to `@media (max-width: 600px)` block in `style.css`

### 2. Favicon Fix
- Old favicon was 72×64 (non-square) — Google rejected it, showed globe icon
- Replaced with 512×512 square image exported from Figma
- Figma file: `ObcWIurw3JpkM3rxCaZXoY` node `305-32`
- Added multiple size declarations in `index.html` (512, 192, 32, 180)

### 3. SEO Improvements
- Fixed `robots.txt` — added real sitemap URL: `https://uxbysathish.com/sitemap.xml`
- Added `og:locale: en_IN` meta tag
- Upgraded structured data (JSON-LD):
  - `Person` schema — added `image`, `worksFor`, `hasOccupation`, Medium profile
  - Added `WebSite` schema (helps Google understand site as an entity)
  - Added `ItemList` schema for projects (case studies)
  - Added `ItemList` schema for blog articles
- Fixed gallery image alt texts — replaced generic "Digital experiment 1-6" with keyword-rich descriptions

### 4. Google Indexing
- Site is indexed and ranking #1 for "sathish sachithanandam"
- Ranking #3 for "sathish ux designer" (as of 2026-07-03)
- Sitemap submitted to Google Search Console
- www version: Success | non-www: redirects to www (normal)

### 5. Social Media Backlinks
- Added `uxbysathish.com` to LinkedIn, Behance, Dribbble, Instagram bios
- This is the most important SEO step for domain authority

---

## Important Rules (Never Break These)
1. **Don't make design changes without Sathish's knowledge**
2. **Whatever we change must reflect in: Local → GitHub → Vercel → Figma**
3. **Make changes, don't disturb the designs**

---

## Figma Design File
- File key: (check memory folder for figma-design-source.md)
- Tablet node: 59-2
- Mobile node: 27-51
- Breakpoints: tablet and mobile

---

## CSS Key Breakpoints
```css
@media (max-width: 600px) {
  .social-icons a { min-width: unset; min-height: unset; }
  .hero-follow { right: 12px; bottom: 26px; }
  .hero-main { bottom: 26px; }
}

@media (max-width: 378px) {
  .hero-main { padding-left: 12px; padding-right: 10px; bottom: 26px; }
  .hero-resume-col { position: relative; z-index: 5; }
  .btn-resume { height: 26px; font-size: 8px; padding: 0 8px; gap: 4px; letter-spacing: 0; }
  .btn-resume img { width: 10px; height: 10px; }
}
```

---

## Pending / Next Steps
- Wait 1 week for Google to re-crawl and reflect all SEO changes
- Check if favicon appears in Google search results (takes a few weeks)
- Add `uxbysathish.com` link in Medium bio for additional backlink
- Consider adding more detailed case studies directly on the site (not just Behance links)
- LinkedIn: Turn on "Open to Work" badge, update headline with keywords

---

## LinkedIn Caption (Posted 2026-07-03)
For Behance case study: https://www.behance.net/gallery/252079183/From-Figma-To-Production

> From Figma to Production — I built my entire portfolio without writing a single line of code manually.
> Designed every pixel in Figma. Connected it to Claude AI. Shipped it live.
> → Designed the full layout in Figma
> → Used AI to translate design into clean HTML & CSS
> → Fixed responsive layouts for every screen size
> → Optimized for Google — now ranking #1 for my name
> → Deployed on Vercel with auto-publish on every update
> 🔗 uxbysathish.com

---

## How to Continue This Project on a New Machine
1. Copy `/Users/sathish.s/.claude/` folder to new laptop (same path)
2. Clone GitHub repo: `git clone https://github.com/sathish0818/Portfolio-Website.git`
3. Open Claude Code in the portfolio folder
4. Claude will remember everything from the `.claude` folder memory

---

## URLs (clean, no .html, no index.html)
- Public URLs: `/` , `/projects` (all work), `/projects/<slug>` (each case study). Files: `projects.html`, `projects/<slug>.html`. `vercel.json` has `cleanUrls: true` plus 308 redirects from the old `/portfolio` and `/case-studies/*` URLs.
- Always link with root-absolute clean paths (`/projects`, `/#contact`, `/assets/...`). Never `index.html`, `.html` or `../`.
- Check all flows after any change: `node scripts/check-links.js [baseUrl]` (default http://localhost:5190; works on the live site too).

## Adding a new project (/projects + homepage are generated)
- Single source of truth: `data/projects.json`, **newest project first**.
- Homepage shows the first 4 (layout slots are fixed: large, small offset, small, large). Everything shows on `/projects`. Older projects drop off the homepage automatically.
- Steps: add the card image to `assets/images/`, (for an on-site case study also add `projects/<slug>.html`), insert the entry at the TOP of `projects` in `data/projects.json` with `"href": "/projects/<slug>"`, then run `node scripts/build-portfolio.js`, then `node scripts/check-links.js`, then commit and push.
- The script regenerates: homepage grid + ItemList JSON-LD (between the marker comments in `index.html`), `projects.html`, `sitemap.xml`, and the "Next case study" link in every `projects/*.html`. Do not hand-edit those generated parts.
- Behance-only projects: set `"external": true` and `href` to the Behance URL.

## Share previews (Open Graph images)
- Every page has its own unique, project-specific 1200x630 JPG (under 300 KB): `assets/case-studies/<slug>/og.jpg` for each project and `assets/images/og-projects.jpg` for /projects. Homepage uses `assets/images/og-preview.png`.
- Designed full-bleed (title, key product visuals, stickers), nothing clipped. For a new project, make a new one in the same style, and bump the `?v=` on the og:image URL in the generators so WhatsApp, LinkedIn and X re-fetch it.
- Test with the LinkedIn Post Inspector, Facebook Sharing Debugger and opengraph.xyz after deploying.
