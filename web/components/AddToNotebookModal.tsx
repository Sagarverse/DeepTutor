"use client";

import { useState, useEffect } from "react";
import {
  X,
  BookOpen,
  Plus,
  Check,
  Loader2,
  Book,
  FolderOpen,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiUrl } from "@/lib/api";

interface NotebookOption {
  id: string;
  name: string;
  description: string;
  color: string;
  record_count: number;
}

interface AddToNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordType: "solve" | "question" | "research" | "co_writer" | "chat";
  title: string;
  userQuery: string;
  output: string;
  metadata?: Record<string, any>;
  kbName?: string;
}

const COLORS = [
  "#10B981",
  "#14B8A6",
  "#06B6D4",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
];

export default function AddToNotebookModal({
  isOpen,
  onClose,
  recordType,
  title,
  userQuery,
  output,
  metadata = {},
  kbName,
}: AddToNotebookModalProps) {
  const { t } = useTranslation();
  const [notebooks, setNotebooks] = useState<NotebookOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNotebook, setNewNotebook] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotebooks();
      setSelectedIds([]);
      setSuccess(false);
      setShowCreateForm(false);
    }
  }, [isOpen]);

  const fetchNotebooks = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/v1/notebook/list"));
      const data = await res.json();
      setNotebooks(data.notebooks || []);
    } catch (err) {
      console.error("Failed to fetch notebooks:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotebook = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleCreateNotebook = async () => {
    if (!newNotebook.name.trim()) return;

    try {
      const res = await fetch(apiUrl("/api/v1/notebook/create"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNotebook),
      });
      const data = await res.json();
      if (data.success && data.notebook) {
        await fetchNotebooks();
        setSelectedIds((prev) => [...prev, data.notebook.id]);
        setShowCreateForm(false);
        setNewNotebook({ name: "", description: "", color: "#3B82F6" });
      }
    } catch (err) {
      console.error("Failed to create notebook:", err);
    }
  };

  const handleSave = async () => {
    if (selectedIds.length === 0) return;

    setSaving(true);
    try {
      const res = await fetch(apiUrl("/api/v1/notebook/add_record"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notebook_ids: selectedIds,
          record_type: recordType,
          title,
          user_query: userQuery,
          output,
          metadata,
          kb_name: kbName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to add record:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-in fade-in backdrop-blur-sm">
      <div className="bg-[#111a11] border border-[#1a2d1a] rounded-2xl shadow-2xl w-[480px] max-h-[80vh] flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-[#1a2d1a] flex items-center justify-between bg-gradient-to-r from-emerald-900/20 to-teal-900/20 rounded-t-2xl">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Book className="w-5 h-5 text-emerald-400" />
            {t("Add to Notebook")}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#1a2d1a] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {success ? (
            <div className="py-12 text-center animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <h4 className="text-lg font-bold text-white mb-1">
                {t("Added Successfully!")}
              </h4>
              <p className="text-sm text-gray-400">
                {t(
                  selectedIds.length === 1
                    ? "Record has been saved to {n} notebook"
                    : "Record has been saved to {n} notebooks",
                ).replace("{n}", String(selectedIds.length))}
              </p>
            </div>
          ) : loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-2" />
              <p className="text-gray-400">
                {t("Loading notebooks...")}
              </p>
            </div>
          ) : (
            <>
              {/* Record Preview */}
              <div className="mb-4 p-3 bg-[#0a0f0a] rounded-xl border border-[#1a2d1a]">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  {t("Record Preview")}
                </div>
                <h4 className="font-semibold text-white truncate">
                  {title}
                </h4>
                <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                  {userQuery}
                </p>
              </div>

              {/* Notebook Selection */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t("Select Notebooks")}
                  </label>
                  <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    {t("New Notebook")}
                  </button>
                </div>

                {/* Create New Notebook Form */}
                {showCreateForm && (
                  <div className="mb-3 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 animate-in slide-in-from-top-2">
                    <input
                      type="text"
                      value={newNotebook.name}
                      onChange={(e) =>
                        setNewNotebook((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder={t("Notebook name")}
                      className="w-full px-3 py-2 mb-2 border border-[#1a2d1a] rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none bg-[#0a0f0a] text-white placeholder:text-gray-500"
                      autoFocus
                    />
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-400">
                        {t("Color:")}
                      </span>
                      <div className="flex gap-1">
                        {COLORS.slice(0, 6).map((color) => (
                          <button
                            key={color}
                            onClick={() =>
                              setNewNotebook((prev) => ({ ...prev, color }))
                            }
                            className={`w-5 h-5 rounded transition-all ${
                              newNotebook.color === color
                                ? "ring-2 ring-offset-1 ring-emerald-400 ring-offset-[#111a11] scale-110"
                                : ""
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowCreateForm(false)}
                        className="px-3 py-1.5 text-xs text-gray-400 hover:bg-[#1a2d1a] rounded-lg transition-colors"
                      >
                        {t("Cancel")}
                      </button>
                      <button
                        onClick={handleCreateNotebook}
                        disabled={!newNotebook.name.trim()}
                        className="px-3 py-1.5 text-xs bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        {t("Create")}
                      </button>
                    </div>
                  </div>
                )}

                {/* Notebook List */}
                {notebooks.length === 0 ? (
                  <div className="py-8 text-center">
                    <FolderOpen className="w-10 h-10 text-[#1a2d1a] mx-auto mb-2" />
                    <p className="text-sm text-gray-400">
                      {t("No notebooks yet")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t("Create your first notebook above")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[240px] overflow-y-auto">
                    {notebooks.map((nb) => (
                      <button
                        key={nb.id}
                        onClick={() => toggleNotebook(nb.id)}
                        className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all border-2 text-left ${
                          selectedIds.includes(nb.id)
                            ? "bg-emerald-500/10 border-emerald-500/30"
                            : "bg-[#0a0f0a] border-[#1a2d1a] hover:border-emerald-500/20 hover:bg-[#111a11]"
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${nb.color}20`,
                            color: nb.color,
                          }}
                        >
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white truncate text-sm">
                            {nb.name}
                          </h4>
                          <p className="text-xs text-gray-400">
                            {nb.record_count} {t("records")}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            selectedIds.includes(nb.id)
                              ? "bg-emerald-500 border-emerald-500"
                              : "border-[#1a2d1a]"
                          }`}
                        >
                          {selectedIds.includes(nb.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!success && !loading && (
          <div className="p-4 border-t border-[#1a2d1a] flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {selectedIds.length > 0
                ? t(
                    selectedIds.length === 1
                      ? "{n} notebook selected"
                      : "{n} notebooks selected",
                  ).replace("{n}", String(selectedIds.length))
                : t("Select at least one notebook")}
            </span>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:bg-[#1a2d1a] rounded-lg transition-colors text-sm"
              >
                {t("Cancel")}
              </button>
              <button
                onClick={handleSave}
                disabled={selectedIds.length === 0 || saving}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 text-sm flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("Saving...")}
                  </>
                ) : (
                  <>
                    <Book className="w-4 h-4" />
                    {t("Add to Notebook")}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
