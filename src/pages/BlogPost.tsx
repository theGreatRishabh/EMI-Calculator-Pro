import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Calendar, Clock, ArrowRight } from "lucide-react";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import blogPosts from "../blogMeta.json";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = useState("");
  // Find meta from pre-generated catalog
  const postMeta = blogPosts.find((p) => p.slug === slug) || {
    title: "Loading Blog...",
    excerpt: "Read our latest financial insights.",
    category: "Insights",
    date: new Date().toLocaleDateString(),
    readTime: "5 min read",
  };

  const [meta, setMeta] = useState<any>(postMeta);
  const [isLoading, setIsLoading] = useState(true);

  // Find related posts (same category first, fallback to recent posts, max 3)
  const relatedPosts = (() => {
    const otherPosts = blogPosts.filter((p) => p.slug !== slug);
    const sameCategory = otherPosts.filter((p) => p.category === meta.category);
    const differentCategory = otherPosts.filter((p) => p.category !== meta.category);
    
    // Sort different category by date to get recent ones
    differentCategory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return [...sameCategory, ...differentCategory].slice(0, 3);
  })();

  // Fallback for metadata
  useDocumentMeta({
    title: meta.title ? `${meta.title} | Smart EMI Planner` : "Loading Blog...",
    description: meta.excerpt || "Read our latest financial insights.",
  });

  useEffect(() => {
    async function fetchPost() {
      setIsLoading(true);
      try {
        const response = await fetch(`/content/blogs/${slug}.md`);
        if (!response.ok) {
          throw new Error("Post not found");
        }
        const text = await response.text();

        // Strip frontmatter manually instead of using gray-matter in browser
        let markdownBody = text;
        if (text.startsWith("---")) {
          const endMatch = text.indexOf("---", 3);
          if (endMatch !== -1) {
            markdownBody = text.substring(endMatch + 3).trim();
          }
        }

        // Update meta if it wasn't found in catalog
        const found = blogPosts.find((p) => p.slug === slug);
        if (found) {
          setMeta(found);
        }

        setContent(markdownBody);
      } catch (error) {
        console.error("Error fetching blog:", error);
        setContent(
          "# Post Not Found\nSorry, the article you are looking for does not exist.",
        );
        setMeta({
          title: "Not Found",
          category: "",
          date: "",
          readTime: "",
          excerpt: "",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 sm:px-6 flex justify-center">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-12 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 sm:px-6 bg-white min-h-screen">
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to all articles
      </Link>

      <header className="mb-12">
        <div className="flex items-center flex-wrap gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
          <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            {meta.category || "Insights"}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {meta.date || new Date().toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {meta.readTime || "5 min read"}
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
          {meta.title}
        </h1>
        {meta.excerpt && (
          <p className="text-xl text-slate-600 leading-relaxed font-medium">
            {meta.excerpt}
          </p>
        )}
      </header>

      <div className="prose prose-slate prose-lg prose-emerald max-w-none text-slate-700">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            table: ({ children }) => (
              <div className="overflow-x-auto my-8 rounded-xl border border-slate-200 shadow-sm max-w-full">
                <table className="w-full text-sm text-left text-slate-600 border-collapse">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="text-xs uppercase bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                {children}
              </thead>
            ),
            tbody: ({ children }) => (
              <tbody className="divide-y divide-slate-100 bg-white">
                {children}
              </tbody>
            ),
            tr: ({ children }) => (
              <tr className="hover:bg-slate-50 transition-colors">
                {children}
              </tr>
            ),
            th: ({ children }) => (
              <th className="px-6 py-4 font-semibold text-slate-900 border-r border-slate-100 last:border-r-0">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-6 py-4 border-r border-slate-100 last:border-r-0 text-slate-700 font-medium">
                {children}
              </td>
            ),
          }}
        >
          {content}
        </ReactMarkdown>

        <hr className="my-10 border-slate-200" />

        <div className="mt-8 text-center bg-slate-50 p-8 rounded-2xl border border-slate-200">
          <h4 className="text-lg font-bold text-slate-900 mb-2">
            Ready to plan your loan?
          </h4>
          <p className="text-slate-600 mb-6">
            Use our free Smart EMI Planner to visualize your savings.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Open Calculator
          </Link>
        </div>

        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-200">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-8">
              Recommended for You
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="flex flex-col bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all group h-full"
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full self-start mb-3">
                    {post.category || "Insights"}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed flex-grow">
                    {post.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 group-hover:text-emerald-700 mt-auto">
                    Read Article <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
