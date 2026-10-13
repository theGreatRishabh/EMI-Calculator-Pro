import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Calendar, Clock, ArrowRight, Search, X } from "lucide-react";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import blogPosts from "../blogMeta.json";
import { trackClick } from "../lib/analytics";

export default function BlogList() {
  useDocumentMeta({
    title: "EMI & Loan Management Blog | Smart EMI Planner",
    description:
      "Read our latest guides, tips, and strategies for managing your Home Loans, Car Loans, and Personal Loans effectively. Learn how to save money on interest.",
  });

  const POSTS_PER_PAGE = 6;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    blogPosts.forEach((post) => {
      if (post.category) cats.add(post.category);
    });
    return ["All", ...Array.from(cats)];
  }, []);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return [...blogPosts]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter((post) => {
        const matchesCategory =
          selectedCategory === "All" || post.category === selectedCategory;
        const matchesQuery =
          !query ||
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          (post.category && post.category.toLowerCase().includes(query));
        return matchesCategory && matchesQuery;
      });
  }, [searchQuery, selectedCategory]);

  const displayedPosts = useMemo(() => {
    return filteredPosts.slice(0, visibleCount);
  }, [filteredPosts, visibleCount]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setVisibleCount(POSTS_PER_PAGE);
  };

  const handleCategoryChange = (cat: string) => {
    trackClick("click_blog_category_filter", "blog", { category: cat });
    setSelectedCategory(cat);
    setVisibleCount(POSTS_PER_PAGE);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setVisibleCount(POSTS_PER_PAGE);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4 flex items-center justify-center gap-3">
          <BookOpen className="w-8 h-8 text-emerald-600" />
          Smart Loan Insights
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Expert advice, mathematical breakdowns, and actionable strategies to
          help you navigate loans and save money on interest.
        </p>
      </div>

      {blogPosts.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
          <p className="text-slate-500">
            No blog posts found. Add markdown files to{" "}
            <code>public/content/blogs</code>.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Search Bar & Category Filters */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                aria-label="Search articles"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search articles by keyword, topic, or country (e.g. 'Canada', 'Prepayment', 'Tax', 'Snowball')..."
                className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs font-semibold">
              <span className="text-slate-400 uppercase tracking-wider text-[11px] mr-1 hidden sm:inline">
                Filter:
              </span>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-3 py-1.5 rounded-full transition-all text-nowrap cursor-pointer ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>
                Showing <strong>{displayedPosts.length}</strong> of{" "}
                <strong>{filteredPosts.length}</strong>{" "}
                {filteredPosts.length === 1 ? "article" : "articles"}
                {filteredPosts.length !== blogPosts.length && (
                  <span className="text-slate-400 ml-1">
                    ({blogPosts.length} total)
                  </span>
                )}
              </span>
              {(searchQuery || selectedCategory !== "All") && (
                <button
                  onClick={handleResetFilters}
                  className="text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* Posts List or No Match State */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 space-y-3 p-6 shadow-sm">
              <p className="text-slate-700 font-bold text-base">
                No articles match your search
              </p>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                We couldn't find any articles matching{" "}
                {searchQuery && (
                  <span className="font-semibold">"{searchQuery}"</span>
                )}
                {selectedCategory !== "All" && (
                  <span>
                    {" "}
                    in category{" "}
                    <span className="font-semibold">{selectedCategory}</span>
                  </span>
                )}
                . Try searching for different keywords.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {displayedPosts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-200 transition-all group"
                >
                  <div className="flex items-center flex-wrap gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
                    <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                      {post.category || "Insights"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {post.date || new Date().toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime || "5 min read"}
                    </span>
                  </div>

                  <Link
                    to={`/blog/${post.slug}`}
                    onClick={() =>
                      trackClick("click_blog_card", "blog", {
                        slug: post.slug,
                        title: post.title,
                        category: post.category,
                      })
                    }
                    className="block"
                  >
                    <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-slate-600 mb-6 leading-relaxed font-medium">
                      {post.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700">
                      Read Article <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </article>
              ))}

              {/* Load More Button */}
              {visibleCount < filteredPosts.length && (
                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((prev) => prev + POSTS_PER_PAGE)
                    }
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-700 text-slate-700 rounded-xl font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer group"
                  >
                    <span>Load More Articles</span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 group-hover:bg-emerald-50 rounded-full text-slate-500 group-hover:text-emerald-700">
                      +
                      {Math.min(
                        POSTS_PER_PAGE,
                        filteredPosts.length - visibleCount,
                      )}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
