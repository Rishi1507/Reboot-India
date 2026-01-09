import fs from "fs";
import path from "path";
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "q0df9xfw",
  dataset: "reboot_india_data",
  apiVersion: "2024-01-01",
  useCdn: true,
});

const SITE_URL = "https://rebootindia.co.in";

async function generateSitemap() {
  console.log("🔄 Generating sitemap...");

  const blogs = await client.fetch(`
    *[_type == "blog" && defined(slug.current)]{
      "slug": slug.current
    }
  `);

  const treks = await client.fetch(`
    *[_type == "trek" && defined(slug.current)]{
      "slug": slug.current
    }
  `);

  const urls = [
    `${SITE_URL}/`,
    `${SITE_URL}/blog`,
    `${SITE_URL}/treks`,
  ];

  blogs.forEach((b) => urls.push(`${SITE_URL}/blog/${b.slug}`));
  treks.forEach((t) => urls.push(`${SITE_URL}/treks/${t.slug}`));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `
  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join("")}
</urlset>`;

  const outputPath = path.join(process.cwd(), "public", "sitemap.xml");
  fs.writeFileSync(outputPath, sitemap.trim());

  console.log("✅ Sitemap generated at public/sitemap.xml");
}

generateSitemap().catch((err) => {
  console.error("❌ Sitemap generation failed", err);
  process.exit(1);
});
