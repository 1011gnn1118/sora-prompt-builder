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
      onClick={onClick}
      className={`${base} ${styles[variant]} ${className}`}
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
}) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    className={`w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm ${className}`}
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

