"use client";

import * as React from "react";
import "./style.scss";

export interface FileInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    onFiles?: (files: FileList | null) => void;
}

export const FileInput = ({
                              label = "파일 선택",
                              onFiles,
                              className,
                              disabled,
                              ...props
                          }: FileInputProps) => {
    const inputId = React.useId();

    const rootClassName = ["file_input", disabled ? "file_input_disabled" : "", className ?? ""]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={rootClassName}>
            <input
                id={inputId}
                type="file"
                className="file_input_control"
                disabled={disabled}
                onChange={(e) => onFiles?.(e.currentTarget.files)}
                {...props}
            />
            <label htmlFor={inputId} className="file_input_label">
                {label}
            </label>
        </div>
    );
};