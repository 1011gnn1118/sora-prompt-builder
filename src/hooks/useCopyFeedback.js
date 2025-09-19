import { useCallback, useEffect, useRef, useState } from "react";

const getRuntime = () => (typeof window !== "undefined" ? window : globalThis);

export function useCopyFeedback(duration = 600) {
  const [toast, setToast] = useState(null);
  const [highlightKey, setHighlightKey] = useState(null);
  const toastTimerRef = useRef(null);
  const highlightTimerRef = useRef(null);

  useEffect(() => {
    const runtime = getRuntime();
    return () => {
      runtime.clearTimeout(toastTimerRef.current);
      runtime.clearTimeout(highlightTimerRef.current);
    };
  }, []);

  const showToast = useCallback(
    (message) => {
      const runtime = getRuntime();
      runtime.clearTimeout(toastTimerRef.current);
      setToast(message);
      toastTimerRef.current = runtime.setTimeout(() => setToast(null), duration);
    },
    [duration]
  );

  const highlight = useCallback(
    (key) => {
      if (!key) return;
      const runtime = getRuntime();
      runtime.clearTimeout(highlightTimerRef.current);
      setHighlightKey(key);
      highlightTimerRef.current = runtime.setTimeout(() => setHighlightKey(null), duration);
    },
    [duration]
  );

  const copyWithFeedback = useCallback(
    async (text, { element, label = "Copied", failLabel = "Copy failed" } = {}) => {
      if (!text) {
        showToast(failLabel);
        return false;
      }
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        showToast(failLabel);
        return false;
      }
      try {
        await navigator.clipboard.writeText(text);
        if (typeof navigator.vibrate === "function") {
          navigator.vibrate(35);
        }
        if (element?.current) {
          const node = element.current;
          node.focus?.();
          if (typeof node.select === "function") {
            node.select();
            try {
              node.setSelectionRange?.(0, text.length);
            } catch (_) {
              // Ignore selection range errors (e.g., for read-only nodes)
            }
          } else if (typeof window !== "undefined" && window.getSelection) {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(node);
            selection.removeAllRanges();
            selection.addRange(range);
          }
          highlight(node.dataset.highlightKey || node.id || label);
        } else {
          highlight(label);
        }
        showToast(label);
        return true;
      } catch (error) {
        console.error("Clipboard error", error);
        showToast(failLabel);
        return false;
      }
    },
    [highlight, showToast]
  );

  return { toast, highlightKey, copyWithFeedback };
}
