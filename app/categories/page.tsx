"use client";

import { useState, useEffect, useCallback } from "react";
import { Category } from "@/types";

const PRESET_COLORS = [
  "#f97316", "#ef4444", "#a855f7", "#3b82f6",
  "#06b6d4", "#10b981", "#eab308", "#ec4899",
  "#6366f1", "#84cc16",
];

interface FormState {
  name: string;
  color: string;
  description: string;
}

const EMPTY_FORM: FormState = { name: "", color: "#6366f1", description: "" };

function validateForm(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = "Name is required";
  else if (form.name.length > 50) errors.name = "Max 50 characters";
  else if (!/^[a-zA-Z0-9\s\-_]+$/.test(form.name)) errors.name = "Only letters, numbers, spaces, hyphens and underscores";
  if (!/^#([0-9A-Fa-f]{6})$/.test(form.color)) errors.color = "Must be a valid hex color";
  if (form.description.length > 200) errors.description = "Max 200 characters";
  return errors;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (res.ok) setCategories(await res.json());
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleCreate = async () => {
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Failed to create", "error"); return; }
      setCategories(prev => [...prev, data]);
      setForm(EMPTY_FORM);
      showToast("Category created!");
    } catch {
      showToast("Network error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, color: cat.color, description: cat.description || "" });
    setEditErrors({});
  };

  const handleUpdate = async (id: string) => {
    const errs = validateForm(editForm);
    if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }
    setEditErrors({});
    setSubmitting(true);
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Failed to update", "error"); return; }
      setCategories(prev => prev.map(c => c.id === id ? data : c));
      setEditingId(null);
      showToast("Category updated!");
    } catch {
      showToast("Network error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
      return;
    }
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) { showToast("Failed to delete", "error"); return; }
      setCategories(prev => prev.filter(c => c.id !== id));
      setConfirmDelete(null);
      showToast("Category deleted");
    } catch {
      showToast("Network error", "error");
    }
  };

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-medium text-[#8b949e] mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Category Manager</h1>
        <p className="text-[#8b949e] text-sm">Organize your bookmarks with custom categories</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create form */}
        <div className="lg:col-span-1">
          <div className="bg-[#161b22] border border-[#21262d] rounded-xl p-6 sticky top-24">
            <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-500/20 text-orange-400 rounded flex items-center justify-center text-xs">+</span>
              New Category
            </h2>

            <div className="space-y-4">
              <Field label="Name *" error={errors.name}>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: "" })); }}
                  placeholder="e.g. AI, Frontend, Web3"
                  maxLength={51}
                  className={"w-full bg-[#0d1117] border rounded-lg px-3 py-2.5 text-sm text-[#e6edf3] placeholder-[#484f58] focus:outline-none transition-colors " + (errors.name ? "border-red-500/50" : "border-[#30363d] focus:border-orange-500/50")}
                />
              </Field>

              <Field label="Color *" error={errors.color}>
                <div className="flex flex-wrap gap-2 mb-2">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, color }))}
                      className={"w-7 h-7 rounded-full transition-all " + (form.color === color ? "ring-2 ring-white ring-offset-2 ring-offset-[#161b22] scale-110" : "hover:scale-110")}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.color}
                    onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={form.color}
                    onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                    placeholder="#6366f1"
                    className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] font-mono focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                </div>
              </Field>

              <Field label="Description" error={errors.description}>
                <textarea
                  value={form.description}
                  onChange={e => { setForm(p => ({ ...p, description: e.target.value })); setErrors(p => ({ ...p, description: "" })); }}
                  placeholder="Optional description..."
                  rows={2}
                  maxLength={201}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2.5 text-sm text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                />
                <p className={"text-xs mt-1 text-right " + (form.description.length > 200 ? "text-red-400" : "text-[#484f58]")}>
                  {form.description.length}/200
                </p>
              </Field>

              <button
                onClick={handleCreate}
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium transition-colors disabled:opacity-50 mt-2"
              >
                {submitting ? "Creating..." : "Create Category"}
              </button>
            </div>
          </div>
        </div>

        {/* Categories list */}
        <div className="lg:col-span-2">
          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-[#161b22] border border-[#21262d] rounded-xl p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#21262d] rounded-full"/>
                    <div className="flex-1"><div className="h-4 bg-[#21262d] rounded w-24 mb-1"/><div className="h-3 bg-[#21262d] rounded w-40"/></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && categories.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🏷️</div>
              <p className="text-[#8b949e] font-medium mb-2">No categories yet</p>
              <p className="text-[#484f58] text-sm">Create your first category using the form</p>
            </div>
          )}

          {!loading && categories.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-[#484f58] mb-4">{categories.length} categories</p>
              {categories.map(cat => (
                <div key={cat.id} className="bg-[#161b22] border border-[#21262d] rounded-xl overflow-hidden">
                  {editingId === cat.id ? (
                    /* Edit form */
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm font-medium">Edit Category</span>
                        <button onClick={() => setEditingId(null)} className="text-[#484f58] hover:text-white transition-colors text-lg">×</button>
                      </div>

                      <div>
                        <label className="block text-xs text-[#8b949e] mb-1.5">Name *</label>
                        <input type="text" value={editForm.name}
                          onChange={e => { setEditForm(p => ({ ...p, name: e.target.value })); setEditErrors(p => ({ ...p, name: "" })); }}
                          className={"w-full bg-[#0d1117] border rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:outline-none transition-colors " + (editErrors.name ? "border-red-500/50" : "border-[#30363d] focus:border-orange-500/50")}
                        />
                        {editErrors.name && <p className="text-red-400 text-xs mt-1">{editErrors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-xs text-[#8b949e] mb-1.5">Color</label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {PRESET_COLORS.map(color => (
                            <button key={color} type="button" onClick={() => setEditForm(p => ({ ...p, color }))}
                              className={"w-6 h-6 rounded-full transition-all " + (editForm.color === color ? "ring-2 ring-white ring-offset-1 ring-offset-[#161b22] scale-110" : "hover:scale-110")}
                              style={{ backgroundColor: color }} />
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="color" value={editForm.color} onChange={e => setEditForm(p => ({ ...p, color: e.target.value }))} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
                          <input type="text" value={editForm.color} onChange={e => setEditForm(p => ({ ...p, color: e.target.value }))}
                            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-2 py-1.5 text-xs text-[#e6edf3] font-mono focus:outline-none focus:border-orange-500/50" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-[#8b949e] mb-1.5">Description</label>
                        <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                          rows={2} maxLength={201}
                          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-orange-500/50 resize-none" />
                        {editErrors.description && <p className="text-red-400 text-xs mt-1">{editErrors.description}</p>}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button onClick={() => setEditingId(null)} className="flex-1 py-2 rounded-lg border border-[#30363d] text-[#8b949e] text-sm hover:text-white transition-colors">Cancel</button>
                        <button onClick={() => handleUpdate(cat.id)} disabled={submitting} className="flex-1 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium transition-colors disabled:opacity-50">
                          {submitting ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display */
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: cat.color + "25", color: cat.color, border: `2px solid ${cat.color}40` }}>
                        {cat.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-medium text-sm">{cat.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: cat.color + "20", color: cat.color }}>
                            {cat._count?.bookmarks ?? 0} articles
                          </span>
                        </div>
                        {cat.description && <p className="text-xs text-[#484f58] mt-0.5 truncate">{cat.description}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => startEdit(cat)}
                          className="px-3 py-1.5 rounded-lg text-xs text-[#8b949e] border border-[#30363d] hover:text-white hover:border-[#484f58] transition-colors">
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDelete(cat.id)}
                          className={"px-3 py-1.5 rounded-lg text-xs transition-colors " + (confirmDelete === cat.id ? "bg-red-500/10 text-red-400 border border-red-500/30" : "text-[#8b949e] border border-[#30363d] hover:text-red-400 hover:border-red-500/30")}>
                          {confirmDelete === cat.id ? "⚠️ Confirm?" : "🗑️ Delete"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className={"fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2 " + (toast.type === "success" ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-red-500/10 border border-red-500/30 text-red-400")}>
          {toast.type === "success" ? "✓" : "✗"} {toast.msg}
        </div>
      )}
    </div>
  );
}
