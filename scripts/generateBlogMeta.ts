import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const CONTENT_DIR = path.resolve(__dirname, "../public/content/blogs");
const OUTPUT_FILE = path.resolve(__dirname, "../src/blogMeta.json");
const SITEMAP_FILE = path.resolve(__dirname, "../public/sitemap.xml");

// Define shape of frontmatter
interface BlogMeta {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
}

function generateBlogMeta() {
  console.log("Generating Blog Meta & Sitemap...");

  if (!fs.existsSync(CONTENT_DIR)) {
    console.log(
      `No blog directory found at ${CONTENT_DIR}. Creating meta with empty array.`,
    );
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify([], null, 2));
    return;
  }

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".md"));
  const blogList: BlogMeta[] = [];

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const fullPath = path.join(CONTENT_DIR, file);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Parse frontmatter
    const { data } = matter(fileContents);

    blogList.push({
      slug,
      title: data.title || "Untitled",
      excerpt: data.excerpt || "",
      date: data.date || "",
      readTime: data.readTime || "",
      category: data.category || "Uncategorized",
    });
  }

  // Sort by date (you might want to parse real dates for a robust sort)
  blogList.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // Write catalog to src so React can import it statically
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(blogList, null, 2) + "\n");
  console.log(`✅ Indexed ${blogList.length} blogs to src/blogMeta.json`);

  // Write Sitemap
  generateSitemap(blogList);
}

function generateSitemap(blogs: BlogMeta[]) {
  const today = new Date().toISOString().split("T")[0];
  const baseUrl = "https://smartemiplanner.com";

  // Core calculator pages — highest priority for SEO
  const calculatorPages = [
    { path: "/home-loan",     priority: "1.0", changefreq: "weekly", label: "Home Loan EMI Calculator" },
    { path: "/car-loan",      priority: "1.0", changefreq: "weekly", label: "Car Loan EMI Calculator" },
    { path: "/personal-loan", priority: "1.0", changefreq: "weekly", label: "Personal Loan EMI Calculator" },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;

  for (const page of calculatorPages) {
    xml += `
    <url>
        <loc>${baseUrl}${page.path}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`;
  }

  xml += `
    <url>
        <loc>${baseUrl}/blog</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>`;

  for (const blog of blogs) {
    xml += `
    <url>
        <loc>${baseUrl}/blog/${blog.slug}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`;
  }

  xml += `\n</urlset>`;

  fs.writeFileSync(SITEMAP_FILE, xml);
  console.log(
    `✅ Generated public/sitemap.xml with ${blogs.length + calculatorPages.length + 2} entries.`,
  );
}

generateBlogMeta();
