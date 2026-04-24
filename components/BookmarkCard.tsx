"use client";

import { useState } from "react";
import { Bookmark, Category } from "@/types";

interface BookmarkCardProps {
  bookmark: Bookmark;
  categories: Category[];
  onUpdate: (id: string, note: string, categoryId: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
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
    return "";
  }
}

export default function BookmarkCard({ bookmark, categories, onUpdate, onDelete }: BookmarkCardProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [note, setNote] = useState(bookmark.note || "");
  const [categoryId, setCategoryId] = useState(bookmark.categoryId || "");
  const [noteError, setNoteError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleUpdate = async () => {
    if (note.length > 500) {
      setNoteError("Note must be under 500 characters");
      return;
    }
    setNoteError("");
    setSaving(true);
    try {
      await onUpdate(bookmark.id, note, categoryId);
      setShowEdit(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    await onDelete(bookmark.id);
  };

  const domain = getDomain(bookmark.url);

  return (
    <>
      <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-4 hover:border-[#30363d] transition-all duration-200 flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs text-[#484f58] bg-[#21262d] px-2 py-0.5 rounded-full font-mono">
              {domain}
            </span>
            {bookmark.category && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: bookmark.category.color + "20",
                  color: bookmark.category.color,
                  border: `1px solid ${bookmark.category.color}30`,
                }}
              >
                {bookmark.category.name}
              </span>
            )}
            <span className="text-xs text-[#484f58] ml-auto">
              Saved {timeAgo(bookmark.createdAt)}
            </span>
          </div>

          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#e6edf3] font-semibold text-sm leading-snug hover:text-orange-400 transition-colors line-clamp-2"
          >
            {bookmark.title}
          </a>

          {bookmark.description && (
            <p className="text-xs text-[#8b949e] mt-1.5 line-clamp-2">
              {bookmark.description}
            </p>
          )}
        </div>

        {bookmark.note && (
          <div className="bg-[#0d1117] border border-[#21262d] rounded-lg px-3 py-2">
            <p className="text-xs text-[#8b949e] leading-relaxed">
              <span className="text-orange-400 font-medium">Note: </span>
              {bookmark.note}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-[#8b949e] border border-[#30363d] hover:text-white hover:border-[#484f58] transition-colors"
          >
            ✏️ Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              confirmDelete
                ? "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
                : "text-[#8b949e] border border-[#30363d] hover:text-red-400 hover:border-red-500/30"
            }`}
          >
            {deleting ? "Deleting..." : confirmDelete ? "⚠️ Confirm?" : "🗑️ Remove"}
          </button>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-xs text-[#484f58] hover:text-orange-400 transition-colors"
          >
            Open ↗
          </a>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowEdit(false)}
        >
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-semibold text-lg">Edit Bookmark</h3>
                <button
                  onClick={() => setShowEdit(false)}
                  className="text-[#484f58] hover:text-white transition-colors text-xl leading-none"
                >
                  ×
                </button>
              </div>
              <p className="text-[#8b949e] text-sm mb-5 line-clamp-2">{bookmark.title}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1.5">
                    Category
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
                    Note (max 500 chars)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value);
                      if (e.target.value.length <= 500) setNoteError("");
                    }}
                    placeholder="Add a note..."
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
                  onClick={() => setShowEdit(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[#30363d] text-[#8b949e] text-sm hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={saving || note.length > 500}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
