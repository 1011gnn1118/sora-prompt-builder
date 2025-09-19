import React, { useEffect, useMemo, useState } from "react";
import { BookmarkPlus, Copy, Layers, Search, Trash2, X, Tag } from "lucide-react";
import { Button, Input } from "./ui";

const runtime = typeof window !== "undefined" ? window : null;

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const readPresets = (storageKey) => {
  if (!runtime) return [];
  try {
    const raw = runtime.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to parse presets", error);
    return [];
  }
};

const writePresets = (storageKey, presets) => {
  if (!runtime) return;
  try {
    runtime.localStorage.setItem(storageKey, JSON.stringify(presets));
  } catch (error) {
    console.warn("Failed to persist presets", error);
  }
};

const parseTags = (value) =>
  value
    .split(/[#;,\n]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);

export default function PresetManager({
  open,
  onClose,
  storageKey,
  currentState,
  onApply,
  transformSave = (state) => state,
  transformLoad = (state) => state,
  title = "Presets",
}) {
  const [presets, setPresets] = useState(() => readPresets(storageKey));
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    setPresets(readPresets(storageKey));
  }, [storageKey, open]);

  useEffect(() => {
    writePresets(storageKey, presets);
  }, [presets, storageKey]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return presets;
    return presets.filter((preset) => {
      const haystack = `${preset.name} ${(preset.tags || []).join(" ")}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [presets, search]);

  const handleSave = () => {
    const nextName = name.trim() || `Preset ${presets.length + 1}`;
    const nextTags = parseTags(tags);
    const payload = transformSave(currentState);
    const newPreset = {
      id: createId(),
      name: nextName,
      tags: nextTags,
      createdAt: Date.now(),
      payload,
    };
    setPresets((prev) => [...prev, newPreset]);
    setName("");
    setTags("");
  };

  const handleApply = (preset) => {
    onApply(transformLoad(preset.payload));
    onClose();
  };

  const handleDuplicate = (preset) => {
    const duplicate = {
      ...preset,
      id: createId(),
      name: `${preset.name} copy`,
      createdAt: Date.now(),
    };
    setPresets((prev) => [...prev, duplicate]);
  };

  const handleDelete = (id) => {
    setPresets((prev) => prev.filter((preset) => preset.id !== id));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-2 text-gray-800 font-semibold">
            <Layers className="h-5 w-5" />
            {title}
          </div>
          <Button variant="ghost" onClick={onClose} title="Close presets">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Name</label>
                <Input value={name} onChange={setName} placeholder="e.g. Calm study shot" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" />Tags
                </label>
                <Input value={tags} onChange={setTags} placeholder="#portrait, candid" />
              </div>
            </div>
            <div className="flex items-end justify-end">
              <Button onClick={handleSave} className="w-full sm:w-auto" title="Save current settings as preset">
                <BookmarkPlus className="h-4 w-4" />Save preset
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-2">
              <Search className="h-4 w-4" />Search presets
            </label>
            <Input value={search} onChange={setSearch} placeholder="Search by name or tag" />
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-2xl p-6 text-center text-sm text-gray-500">
                No presets yet. Save your current setup to reuse later.
              </div>
            ) : (
              filtered.map((preset) => (
                <div
                  key={preset.id}
                  className="border border-gray-200 rounded-2xl px-4 py-3 flex flex-col gap-2 hover:border-black transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-gray-900">{preset.name}</div>
                      {preset.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {preset.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                            >
                              <Tag className="h-3 w-3" />{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" onClick={() => handleApply(preset)} title="Load preset">
                        <Copy className="h-4 w-4" />Use
                      </Button>
                      <Button variant="ghost" onClick={() => handleDuplicate(preset)} title="Duplicate preset">
                        <Layers className="h-4 w-4" />Duplicate
                      </Button>
                      <Button variant="ghost" onClick={() => handleDelete(preset.id)} title="Delete preset">
                        <Trash2 className="h-4 w-4" />Delete
                      </Button>
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Saved {new Date(preset.createdAt || Date.now()).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
