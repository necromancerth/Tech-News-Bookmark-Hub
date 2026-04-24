"use client";

import { useState, useEffect, useCallback } from "react";
import BookmarkCard from "@/components/BookmarkCard";
import { Bookmark, Category } from "@/types";

export default function SavedNewsPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterCategory ? `/api/bookmarks?categoryId=${filterCategory}` : "/api/bookmarks";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed");
      setBookmarks(await res.json());
    } catch {
      showToast("Failed to load bookmarks", "error");
    } finally {
      setLoading(false);
    }
  }, [filterCategory]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) setCategories(await res.json());
    } catch {}
  }, []);

  useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleUpdate = async (id: string, note: string, categoryId: string) => {
    try {
      const res = await fetch(`/api/bookmarks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note || null, categoryId: categoryId || null }),
      });
      if (!res.ok) { showToast("Failed to update", "error"); return; }
      showToast("Bookmark updated!");
      fetchBookmarks();
    } catch {
      showToast("Network error", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/bookmarks/${id}`, { method: "DELETE" });
      if (!res.ok) { showToast("Failed to delete", "error"); return; }
      setBookmarks(prev => prev.filter(b => b.id !== id));
      showToast("Bookmark removed");
    } catch {
      showToast("Network error", "error");
    }
  };

  const filtered = bookmarks.filter(b =>
    search === "" ||
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    (b.note && b.note.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Saved News</h1>
        <p className="text-[#8b949e] text-sm">Your bookmarked articles</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58] text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#161b22] border border-[#21262d] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-orange-500/50 transition-colors"
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="bg-[#161b22] border border-[#21262d] rounded-lg px-3 py-2.5 text-sm text-[#e6edf3] focus:outline-none focus:border-orange-500/50 transition-colors min-w-[160px]"
        >
          <option value="">All categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="flex items-center gap-4 mb-5 text-xs text-[#484f58]">
          <span>{filtered.length} of {bookmarks.length} bookmarks</span>
          {filterCategory && (
            <button onClick={() => setFilterCategory("")} className="text-orange-400 hover:text-orange-300 transition-colors">
              ✕ Clear filter
            </button>
          )}
          {search && (
            <button onClick={() => setSearch("")} className="text-orange-400 hover:text-orange-300 transition-colors">
              ✕ Clear search
            </button>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#161b22] border border-[#21262d] rounded-xl p-4 animate-pulse">
              <div className="flex gap-2 mb-3"><div className="h-4 bg-[#21262d] rounded-full w-20"/><div className="h-4 bg-[#21262d] rounded-full w-16"/></div>
              <div className="h-4 bg-[#21262d] rounded w-full mb-2"/><div className="h-4 bg-[#21262d] rounded w-4/5 mb-4"/>
              <div className="h-8 bg-[#21262d] rounded-lg w-full"/>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(bookmark => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              categories={categories}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔖</div>
          <p className="text-[#8b949e] font-medium mb-2">
            {bookmarks.length === 0 ? "No bookmarks yet" : "No matching bookmarks"}
          </p>
          <p className="text-[#484f58] text-sm">
            {bookmarks.length === 0
              ? "Go to News Feed and save articles to read later"
              : "Try adjusting your search or filter"}
          </p>
          {bookmarks.length === 0 && (
            <a href="/" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 text-sm hover:bg-orange-500/20 transition-colors">
              ⚡ Browse News Feed
            </a>
          )}
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
