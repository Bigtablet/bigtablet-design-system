"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	/** 파일 선택 버튼 라벨 텍스트 (기본값: "Choose file") */
	label?: string;
	/** 파일 선택 시 호출되는 콜백 */
	onFiles?: (files: FileList | null) => void;
	/** 입력 필드 아래에 표시할 도움말 텍스트 (예: "PDF, DOC 파일만 업로드 가능합니다") */
	supportingText?: string;
}

/**
 * 파일 입력 컴포넌트를 렌더링한다.
 * 내부 input 변경을 감지해 파일 목록을 콜백으로 전달한다.
 * @param props 파일 입력 속성
 * @returns 렌더링된 파일 입력 UI
 */
export const FileInput = ({
	label = "Choose file",
	onFiles,
	supportingText,
	className,
	disabled,
	...props
}: FileInputProps) => {
	const inputId = React.useId();
	const helperId = React.useId();

	const rootClassName = cn("file_input", disabled && "file_input_disabled", className);

	return (
		<div className={rootClassName}>
			<input
				id={inputId}
				type="file"
				className="file_input_control"
				disabled={disabled}
				aria-describedby={supportingText ? helperId : undefined}
				onChange={(e) => onFiles?.(e.currentTarget.files)}
				{...props}
			/>
			<label htmlFor={inputId} className="file_input_label">
				{label}
			</label>
			{supportingText && (
				<span id={helperId} className="file_input_helper">
					{supportingText}
				</span>
			)}
		</div>
	);
};
