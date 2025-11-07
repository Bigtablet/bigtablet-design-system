"use client"

import * as React from "react";
import "./style.scss";

export interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    onFiles?: (files: FileList | null) => void;
}

export const FileInput = ({ label = "Choose file", onFiles, className, ...props }: FileInputProps) => {
    const id = React.useId();
    return (
        <div className={["file", className].filter(Boolean).join(" ")}>
            <input id={id} type="file" className="file__input" onChange={(e) => onFiles?.(e.currentTarget.files)} {...props} />
            <label htmlFor={id} className="file__label">{label}</label>
        </div>
    );
};