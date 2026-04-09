"use client";

import * as React from "react";
import { cn } from "../../utils";
import "./style.scss";

export interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	/** 파일 선택 버튼 라벨 텍스트 (기본값: "Choose file") */
	label?: string;
	/** 파일 선택 시 호출되는 콜백 */
	onFiles?: (files: FileList | null) => void;
	/** 입력 필드 아래에 표시할 도움말 텍스트 (예: "PDF, DOC 파일만 업로드 가능합니다") */
	supportingText?: string;
	/** 이미지 파일 선택 시 썸네일 미리보기 표시 여부 (기본값: false) */
	preview?: boolean;
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
	preview = false,
	className,
	disabled,
	...props
}: FileInputProps) => {
	const inputId = React.useId();
	const helperId = React.useId();
	const [previewUrls, setPreviewUrls] = React.useState<string[]>([]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.currentTarget.files;
		onFiles?.(files);

		if (preview && files) {
			// 이전 URL 해제
			previewUrls.forEach((url) => URL.revokeObjectURL(url));

			const urls: string[] = [];
			for (let i = 0; i < files.length; i++) {
				if (files[i].type.startsWith("image/")) {
					urls.push(URL.createObjectURL(files[i]));
				}
			}
			setPreviewUrls(urls);
		} else {
			previewUrls.forEach((url) => URL.revokeObjectURL(url));
			setPreviewUrls([]);
		}
	};

	// cleanup on unmount
	React.useEffect(() => {
		return () => {
			previewUrls.forEach((url) => URL.revokeObjectURL(url));
		};
	}, [previewUrls]);

	const rootClassName = cn("file_input", disabled && "file_input_disabled", className);

	return (
		<div className={rootClassName}>
			<input
				id={inputId}
				type="file"
				className="file_input_control"
				disabled={disabled}
				aria-describedby={supportingText ? helperId : undefined}
				onChange={handleChange}
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
			{previewUrls.length > 0 && (
				<div className="file_input_preview">
					{previewUrls.map((url) => (
						<img key={url} src={url} alt="" className="file_input_preview_img" />
					))}
				</div>
			)}
		</div>
	);
};
