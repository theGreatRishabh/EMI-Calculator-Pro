import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import matter from "gray-matter";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = useState("");
  const [meta, setMeta] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

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
        const { data, content: markdownBody } = matter(text);

        setMeta(data);
        setContent(markdownBody);
      } catch (error) {
        console.error("Error fetching blog:", error);
        setContent(
          "# Post Not Found\nSorry, the article you are looking for does not exist.",
        );
        setMeta({ title: "Not Found" });
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
        <ReactMarkdown>{content}</ReactMarkdown>

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
      </div>
    </article>
  );
}
