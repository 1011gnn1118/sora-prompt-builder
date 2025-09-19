import React from "react";

export const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl shadow-sm border border-gray-200 bg-white ${className}`}>{children}</div>
);

export const CardHeader = ({ title, subtitle, right }) => (
  <div className="px-5 pt-5 pb-3 border-b flex items-start justify-between gap-3">
    <div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
    {right}
  </div>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`px-5 py-4 ${className}`}>{children}</div>
);

export const Button = ({
  children,
  onClick,
  className = "",
  variant = "default",
  title,
  type = "button",
  disabled = false,
}) => {
  const base =
    "inline-flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition border focus:outline-none";
  const styles = {
    default: "bg-black text-white border-black hover:opacity-90",
    ghost: "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
    subtle: "bg-gray-900/5 text-gray-800 border-gray-200 hover:bg-gray-900/10",
  };
  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${styles[variant]} ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
};

export const Select = ({
  value,
  onChange,
  options,
  className = "",
  allowCustom = false,
  customPlaceholder = "e.g.",
}) => (
  <>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm ${className}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    {allowCustom && (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={customPlaceholder}
        className={`w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm mt-2 ${className}`}
      />
    )}
  </>
);

export const Input = ({
  value,
  onChange,
  placeholder,
  className = "",
  type = "text",
  min,
  max,
  step,
}) => (
  <input
    value={value}
    onChange={(e) =>
      onChange(type === "number" ? Number(e.target.value) : e.target.value)
    }
    placeholder={placeholder}
    type={type}
    min={min}
    max={max}
    step={step}
    className={`w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm ${className}`}
  />
);

export const Textarea = ({
  value,
  onChange,
  placeholder,
  rows = 4,
  className = "",
  readOnly = false,
  inputRef,
  highlight = false,
  highlightKey,
}) => (
  <textarea
    ref={inputRef}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    readOnly={readOnly}
    data-highlight-key={highlightKey}
    className={`w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm ${
      highlight ? "ring-2 ring-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.25)] animate-pulse" : ""
    } ${className}`}
  />
);

export const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-2 text-sm">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4"
    />
    <span>{label}</span>
  </label>
);

export const ActionBar = ({ children }) => (
  <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white/90 backdrop-blur">
    <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-2 overflow-x-auto">
      {children}
    </div>
  </div>
);

export const FloatingToast = ({ message }) => {
  if (!message) return null;
  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full bg-black px-4 py-2 text-xs font-medium text-white shadow-lg animate-in fade-in duration-150">
      {message}
    </div>
  );
};
