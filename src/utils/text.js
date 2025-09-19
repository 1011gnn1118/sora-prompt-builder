export function listToOxford(list = []) {
  const filtered = list.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  if (filtered.length === 0) return "";
  if (filtered.length === 1) return filtered[0];
  if (filtered.length === 2) return `${filtered[0]} and ${filtered[1]}`;
  return `${filtered.slice(0, -1).join(", ")}, and ${filtered[filtered.length - 1]}`;
}

export function ensureSentence(text) {
  if (!text) return "";
  const trimmed = text.trim();
  if (!trimmed) return "";
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

export function normalizeEnglish(text) {
  if (!text) return "";
  let normalized = text
    .replace(/[\s\u200B]+/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ", ")
    .replace(/\s+\./g, ".")
    .replace(/\s+;/g, ";")
    .replace(/;\s*/g, "; ")
    .replace(/\s+:/g, ":")
    .replace(/:\s*/g, ": ")
    .replace(/\s+!/g, "!")
    .replace(/\s+\?/g, "?")
    .replace(/\s+-\s+/g, "-")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s+/g, " ")
    .trim();

  normalized = normalized.replace(/(^|[\s\(\[])[Aa] ([aeiouAEIOU])/g, "$1an $2");
  normalized = normalized.replace(/(^|[\s\(\[])[Aa] ([Hh]onor|[Hh]our|[Hh]eir)/g, "$1an $2");
  normalized = normalized.replace(/(^|[\s\(\[])[Aa]n ([^aeiouAEIOU])/g, "$1a $2");

  normalized = normalized.replace(/\s*,\s*,/g, ", ");
  normalized = normalized.replace(/,\s*\./g, ".");
  normalized = normalized.replace(/\.(\s*\.)+/g, ".");

  if (!/[.!?]$/.test(normalized)) {
    normalized = `${normalized}.`;
  }
  return normalized;
}

export function compactSegments(segments = []) {
  return segments.map((seg) => (seg || "").trim()).filter(Boolean);
}
