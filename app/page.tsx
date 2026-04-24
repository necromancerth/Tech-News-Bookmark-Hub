"use client";

import { useState, useEffect, useCallback } from "react";
import NewsCard from "@/components/NewsCard";
import { NewsItem, Category, FeedType } from "@/types";

const FEED_TABS = [
  { label: "Top", value: "top" as FeedType, icon: "🔥", desc: "Most upvoted" },
  { label: "New", value: "new" as FeedType, icon: "⚡", desc: "Latest" },
  { label: "Best", value: "best" as FeedType, icon: "⭐", desc: "All-time best" },
];

export default function NewsFeedPage() {
  const [feed, setFeed] = useState<FeedType>("top");
  const [stories, setStories] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bookmarkedUrls, setBookmarkedUrls] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchNews = useCallback(async (type: FeedType) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/news?type=" + type + "&limit=30");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setStories(data.stories);
    } catch {
      setError("Failed to load news. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBookmarks = useCallback(async () => {
    try {
      const res = await fetch("/api/bookmarks");
      if (!res.ok) return;
      const data = await res.json();
      setBookmarkedUrls(new Set(data.map((b: { url: string }) => b.url)));
    } catch {}
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) return;
      setCategories(await res.json());
    } catch {}
  }, []);

  useEffect(() => { fetchNews(feed); }, [feed, fetchNews]);
  useEffect(() => { fetchBookmarks(); fetchCategories(); }, [fetchBookmarks, fetchCategories]);

  const handleBookmark = async (item: NewsItem, note: string, categoryId: string) => {
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title,
          url: item.url,
          description: item.description,
          source: item.source,
          publishedAt: item.publishedAt,
          imageUrl: item.imageUrl || "",
          note: note || undefined,
          categoryId: categoryId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Failed to save", "error"); return; }
      setBookmarkedUrls(prev => new Set([...prev, item.url]));
      showToast("Article saved to bookmarks!");
    } catch {
      showToast("Network error.", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Tech News Feed</h1>
        <p className="text-[#8b949e] text-sm">Latest stories from Hacker News</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {FEED_TABS.map(tab => (
          <button key={tab.value} onClick={() => setFeed(tab.value)}
            className={"flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all " + (feed === tab.value ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-[#161b22] text-[#8b949e] border border-[#21262d] hover:text-white hover:border-[#30363d]")}>
            <span>{tab.icon}</span>{tab.label}
            <span className={"text-xs " + (feed === tab.value ? "text-orange-200" : "text-[#484f58]")}>{tab.desc}</span>
          </button>
        ))}
        <button onClick={() => fetchNews(feed)} disabled={loading}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-[#161b22] text-[#8b949e] border border-[#21262d] hover:text-white hover:border-[#30363d] transition-all disabled:opacity-50">
          <span className={loading ? "animate-spin inline-block" : ""}>↻</span> Refresh
        </button>
      </div>

      {!loading && stories.length > 0 && (
        <div className="flex items-center gap-4 mb-5 text-xs text-[#484f58]">
          <span>{stories.length} stories</span><span>•</span>
          <span>{bookmarkedUrls.size} bookmarked</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400 text-sm flex items-center gap-3">
          ⚠️ {error}
          <button onClick={() => fetchNews(feed)} className="ml-auto underline">Retry</button>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-[#161b22] border border-[#21262d] rounded-xl p-4 animate-pulse">
              <div className="flex gap-2 mb-3"><div className="h-4 bg-[#21262d] rounded-full w-20"/><div className="h-4 bg-[#21262d] rounded-full w-12"/></div>
              <div className="h-4 bg-[#21262d] rounded w-full mb-2"/><div className="h-4 bg-[#21262d] rounded w-3/4 mb-4"/>
              <div className="h-3 bg-[#21262d] rounded w-full mb-1"/><div className="h-3 bg-[#21262d] rounded w-2/3"/>
            </div>
          ))}
        </div>
      )}

      {!loading && stories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {stories.map(item => (
            <NewsCard key={item.id} item={item} categories={categories}
              isBookmarked={bookmarkedUrls.has(item.url)} onBookmark={handleBookmark} />
          ))}
        </div>
      )}

      {!loading && stories.length === 0 && !error && (
        <div className="text-center py-20 text-[#484f58]">
          <div className="text-5xl mb-4">📭</div><p>No stories found</p>
        </div>
      )}

      {toast && (
        <div className={"fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2 " + (toast.type === "success" ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-red-500/10 border border-red-500/30 text-red-400")}>
          {toast.type === "success" ? "✓" : "✗"} {toast.msg}
        </div>
      )}
    </div>
  );
}
