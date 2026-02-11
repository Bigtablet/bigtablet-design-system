"use client";

import * as React from "react";
import "./style.scss";

export interface FileInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    onFiles?: (files: FileList | null) => void;
}

/**
 * 파일 입력 컴포넌트를 렌더링한다.
 * 내부 input 변경을 감지해 파일 목록을 콜백으로 전달한다.
 * @param props 파일 입력 속성
 * @returns 렌더링된 파일 입력 UI
 */
export const FileInput = ({
                              label = "파일 선택",
                              onFiles,
                              className,
                              disabled,
                              ...props
                          }: FileInputProps) => {
    const inputId = React.useId();

    const rootClassName = [
        "file_input",
        disabled && "file_input_disabled",
        className ?? ""
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div style={{cursor: "pointer"}} className={rootClassName}>
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
