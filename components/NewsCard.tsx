"use client";

import { useState } from "react";
import { NewsItem, Category } from "@/types";

interface NewsCardProps {
  item: NewsItem;
  categories: Category[];
  isBookmarked: boolean;
  onBookmark: (item: NewsItem, note: string, categoryId: string) => Promise<void>;
}

function timeAgo(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "hacker-news";
  }
}

export default function NewsCard({ item, categories, isBookmarked, onBookmark }: NewsCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [note, setNote] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [noteError, setNoteError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (note.length > 500) {
      setNoteError("Note must be under 500 characters");
      return;
    }
    setNoteError("");
    setSaving(true);
    try {
      await onBookmark(item, note, categoryId);
      setShowModal(false);
      setNote("");
      setCategoryId("");
    } finally {
      setSaving(false);
    }
  };

  const domain = getDomain(item.url);

  return (
    <>
      <div className="group bg-[#161b22] border border-[#21262d] rounded-xl p-4 hover:border-[#30363d] transition-all duration-200 hover:shadow-lg hover:shadow-black/20 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs text-[#484f58] bg-[#21262d] px-2 py-0.5 rounded-full font-mono">
                {domain}
              </span>
              {item.score !== undefined && (
                <span className="text-xs text-orange-400 font-medium">
                  ▲ {item.score}
                </span>
              )}
              {item.publishedAt && (
                <span className="text-xs text-[#484f58]">
                  {timeAgo(item.publishedAt)}
                </span>
              )}
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#e6edf3] font-semibold text-sm leading-snug hover:text-orange-400 transition-colors line-clamp-2 group-hover:text-white"
            >
              {item.title}
            </a>
            {item.description && (
              <p className="text-xs text-[#8b949e] mt-1.5 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          {item.comments !== undefined && (
            <span className="text-xs text-[#484f58]">
              💬 {item.comments} comments
            </span>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <a
              href={`https://news.ycombinator.com/item?id=${item.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#484f58] hover:text-[#8b949e] transition-colors"
            >
              Discuss ↗
            </a>
            <button
              onClick={() => !isBookmarked && setShowModal(true)}
              disabled={isBookmarked}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isBookmarked
                  ? "bg-green-500/10 text-green-400 border border-green-500/20 cursor-default"
                  : "bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 cursor-pointer"
              }`}
            >
              {isBookmarked ? "✓ Saved" : "🔖 Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-semibold text-lg">Save Article</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-[#484f58] hover:text-white transition-colors text-xl leading-none"
                >
                  ×
                </button>
              </div>
              <p className="text-[#8b949e] text-sm mb-5 line-clamp-2">{item.title}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
                    Category (optional)
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2.5 text-sm text-[#e6edf3] focus:outline-none focus:border-orange-500/50 transition-colors"
                  >
                    <option value="">No category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
                    Note (optional, max 500 chars)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value);
                      if (e.target.value.length <= 500) setNoteError("");
                    }}
                    placeholder="Why are you saving this? Add a quick note..."
                    rows={3}
                    maxLength={501}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2.5 text-sm text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                  />
                  <div className="flex items-center justify-between mt-1">
                    {noteError && <p className="text-red-400 text-xs">{noteError}</p>}
                    <span className={`text-xs ml-auto ${note.length > 500 ? "text-red-400" : "text-[#484f58]"}`}>
                      {note.length}/500
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[#30363d] text-[#8b949e] text-sm hover:text-white hover:border-[#484f58] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || note.length > 500}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Article"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
