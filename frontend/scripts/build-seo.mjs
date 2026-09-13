import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { SITE_URL, pages, privatePages, getSeo, organization } from "../src/seo.js";

const dist = new URL("../dist/", import.meta.url);
const template = await readFile(new URL("index.html", dist), "utf8");
const escape = (value) => value.replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);

for (const path of [...Object.keys(pages), ...privatePages]) {
  const seo = getSeo(path);
  const tags = {
    description: seo.description,
    robots: seo.robots,
    "og:type": "website",
    "og:site_name": "MICE-LO",
    "og:locale": "es_MX",
    "og:title": seo.title,
    "og:description": seo.description,
    "og:url": seo.canonical,
    "og:image": `${SITE_URL}/logo1.webp`,
    "og:image:alt": "Logotipo de MICE-LO",
    "twitter:card": "summary",
    "twitter:title": seo.title,
    "twitter:description": seo.description,
    "twitter:image": `${SITE_URL}/logo1.webp`,
  };
  const metadata = Object.entries(tags).map(([name, content]) =>
    `<meta ${name.startsWith("og:") ? "property" : "name"}="${name}" content="${escape(content)}" />`,
  ).join("\n    ");
  const html = template.replace(/<title>.*?<\/title>/s, `<title>${escape(seo.title)}</title>`)
    .replace("</head>", `${metadata}\n    <link rel="canonical" href="${escape(seo.canonical)}" />\n${path === "/" ? `<script id="seo-organization" type="application/ld+json">${JSON.stringify(organization).replace(/</g, "\\u003c")}</script>\n` : ""}  </head>`);
  await writeFile(new URL(path === "/" ? "index.html" : `${path.slice(1)}.html`, dist), html);
}

// Keep the SPA fallback neutral: it must not initially canonicalize dynamic pages to home.
await writeFile(new URL("spa.html", dist), template);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.keys(pages).map((path) => `  <url>\n    <loc>${escape(getSeo(path).canonical)}</loc>\n  </url>`).join("\n")}\n</urlset>\n`;
await writeFile(new URL("sitemap.xml", dist), sitemap);
await writeFile(new URL("../public/sitemap.xml", import.meta.url), sitemap);
console.log(`SEO generado: ${Object.keys(pages).length} páginas públicas en ${fileURLToPath(dist)}`);
