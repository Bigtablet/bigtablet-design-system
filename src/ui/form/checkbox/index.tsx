"use client";

import * as React from "react";
import styles from "./style.module.scss";

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
    styles.checkbox,
    styles[`size_${size}`],
    className ?? "",
  ]
      .filter(Boolean)
      .join(" ");

  return (
      <label className={rootClassName}>
        <input
            ref={inputRef}
            type="checkbox"
            className={styles.input}
            {...props}
        />
        <span className={styles.box} aria-hidden="true" />
        {label ? <span className={styles.label}>{label}</span> : null}
      </label>
  );
};
