import React from "react";

const CONFIGS = {
  gstin: { maxLength: 15, pattern: /[A-Za-z0-9]/g, transform: (v) => v.toUpperCase() },
  phone: { maxLength: 10, pattern: /\d/g, transform: (v) => v },
};

export default function LimitedInput({ kind = "text", value, onChange, style, ...rest }) {
  const cfg = CONFIGS[kind];
  const handleChange = (e) => {
    let v = e.target.value;
    if (cfg) {
      v = (v.match(cfg.pattern) || []).join("").slice(0, cfg.maxLength);
      v = cfg.transform(v);
    }
    if (onChange) onChange({ ...e, target: { ...e.target, value: v, name: e.target.name } });
  };
  return (
    <input
      {...rest}
      value={value}
      onChange={handleChange}
      maxLength={cfg ? cfg.maxLength : rest.maxLength}
      style={style}
    />
  );
}
