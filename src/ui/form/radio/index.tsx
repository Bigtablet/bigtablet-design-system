"use client";

import * as React from "react";
import styles from "./style.module.scss";

export interface RadioProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export const Radio = ({ label, size = "md", className, ...props }: RadioProps) => {
  const rootClassName = [
    styles.radio,
    styles[`size_${size}`],
    className ?? ""
  ]
      .filter(Boolean)
      .join(" ");

  return (
      <label className={rootClassName}>
        <input type="radio" className={styles.input} {...props} />
        <span className={styles.dot} aria-hidden="true" />
        {label ? <span className={styles.label}>{label}</span> : null}
      </label>
  );
};
