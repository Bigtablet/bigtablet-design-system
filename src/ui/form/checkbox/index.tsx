"use client";

import * as React from "react";
import "./style.scss";

export interface CheckboxProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  indeterminate?: boolean;
}

export const Checkbox = ({
                           label,
                           size = "md",
                           indeterminate,
                           className,
                           ...props
                         }: CheckboxProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);

  const rootClassName = [
    "checkbox",
    `checkbox_size_${size}`,
    className ?? "",
  ]
      .filter(Boolean)
      .join(" ");

  return (
      <label className={rootClassName}>
        <input
            ref={inputRef}
            type="checkbox"
            className="checkbox_input"
            {...props}
        />
        <span className="checkbox_box" aria-hidden="true" />
        {label ? <span className="checkbox_label">{label}</span> : null}
      </label>
  );
};
