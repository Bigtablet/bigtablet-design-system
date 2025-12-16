"use client";

import * as React from "react";
import "./style.scss";

export interface RadioProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export const Radio = ({ label, size = "md", className, ...props }: RadioProps) => {
  const rootClassName = ["radio", `radio_size_${size}`, className ?? ""]
      .filter(Boolean)
      .join(" ");

  return (
      <label className={rootClassName}>
        <input type="radio" className="radio_input" {...props} />
        <span className="radio_dot" aria-hidden="true" />
        {label ? <span className="radio_label">{label}</span> : null}
      </label>
  );
};