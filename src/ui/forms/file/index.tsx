"use client";

import { Image as ImageIcon, X } from "lucide-react";
import * as React from "react";
import { iconSize } from "../../../styles/icon";
import { cn } from "../../../utils";
import "./style.scss";

export type FileInputVariant = "button" | "preview";

export interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	/** 파일 선택 버튼 라벨 / preview variant 빈 상태 텍스트 (기본값: "Choose file") */
	label?: string;
	/** 파일 선택 시 호출되는 콜백 */
	onFiles?: (files: FileList | null) => void;
	/** 입력 필드 아래에 표시할 도움말 텍스트 (예: "PDF, DOC 파일만 업로드 가능합니다") */
	supportingText?: string;
	/** 이미지 파일 선택 시 64×64 썸네일을 버튼 아래 나열 (variant="button" 전용) */
	preview?: boolean;
	/**
	 * 표시 형태 (기본값: "button").
	 * - `"button"`: 일반 파일 선택 버튼. `preview=true` 면 아래에 작은 썸네일 표시.
	 * - `"preview"`: 큰 박스 안에 이미지 채움 (avatar / 이미지 업로더 패턴). 단일 이미지.
	 */
	variant?: FileInputVariant;
	/** variant="preview" 박스 크기 (px, 기본값: 160) */
	previewSize?: number;
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
	variant = "button",
	previewSize = 160,
	className,
	disabled,
	accept,
	onChange,
	...props
}: FileInputProps) => {
	const inputId = React.useId();
	const helperId = React.useId();
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [previewUrls, setPreviewUrls] = React.useState<string[]>([]);
	// 최신 objectURL 목록을 동기적으로 추적 — unmount(특히 onFiles 안에서 부모가 동기 unmount 하는
	// 경우)에도 새로 만든 URL 까지 정리되도록 handleChange/handleRemove 에서 즉시 갱신.
	const previewUrlsRef = React.useRef<string[]>([]);

	const isPreviewVariant = variant === "preview";
	const showPreview = isPreviewVariant || preview;

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.currentTarget.files;

		// preview URL 생성 + ref 갱신을 onFiles/onChange 호출보다 먼저 — 부모가 onFiles 안에서
		// 동기 unmount 해도 ref 가 새 URL 을 이미 담고 있어 unmount cleanup 이 정리할 수 있도록.
		if (showPreview && files) {
			for (const url of previewUrls) {
				URL.revokeObjectURL(url);
			}

			const urls: string[] = [];
			// preview variant 는 단일 이미지만, button variant 는 모든 이미지 썸네일
			const limit = isPreviewVariant ? Math.min(1, files.length) : files.length;
			for (let i = 0; i < limit; i++) {
				if (files[i].type.startsWith("image/")) {
					urls.push(URL.createObjectURL(files[i]));
				}
			}
			setPreviewUrls(urls);
			previewUrlsRef.current = urls;
		} else {
			for (const url of previewUrls) {
				URL.revokeObjectURL(url);
			}
			setPreviewUrls([]);
			previewUrlsRef.current = [];
		}

		onFiles?.(files);
		// 사용자가 onChange 도 넘긴 경우 함께 호출 (back-compat)
		onChange?.(e);
	};

	const handleRemove = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		for (const url of previewUrls) {
			URL.revokeObjectURL(url);
		}
		setPreviewUrls([]);
		previewUrlsRef.current = [];
		if (inputRef.current) {
			inputRef.current.value = "";
		}
		onFiles?.(null);
	};

	// unmount 시 남은 objectURL 정리 (변경 시 revoke 는 handleChange/handleRemove 가 담당)
	React.useEffect(() => {
		return () => {
			for (const url of previewUrlsRef.current) {
				URL.revokeObjectURL(url);
			}
		};
	}, []);

	const hasImage = previewUrls.length > 0;
	const rootClassName = cn(
		"file_input",
		`file_input_variant_${variant}`,
		isPreviewVariant && hasImage && "file_input_variant_preview_filled",
		disabled && "file_input_disabled",
		className,
	);

	return (
		<div className={rootClassName}>
			<input
				{...props}
				ref={inputRef}
				id={inputId}
				type="file"
				className="file_input_control"
				disabled={disabled}
				accept={isPreviewVariant ? (accept ?? "image/*") : accept}
				aria-describedby={supportingText ? helperId : undefined}
				onChange={handleChange}
			/>

			{isPreviewVariant ? (
				<label
					htmlFor={inputId}
					className="file_input_label"
					style={{ width: previewSize, height: previewSize }}
				>
					{hasImage ? (
						// biome-ignore lint/performance/noImgElement: framework-agnostic DS - host app should swap with next/image if needed
						<img
							src={previewUrls[0]}
							alt=""
							className="file_input_preview_image"
						/>
					) : (
						<span className="file_input_preview_empty">
							<ImageIcon size={iconSize.xl} aria-hidden="true" />
							<span className="file_input_preview_empty_text">{label}</span>
						</span>
					)}
				</label>
			) : (
				<label htmlFor={inputId} className="file_input_label">
					{label}
				</label>
			)}

			{isPreviewVariant && hasImage && !disabled && (
				<button
					type="button"
					className="file_input_preview_remove"
					onClick={handleRemove}
					aria-label="이미지 제거"
				>
					<X size={iconSize.xs} aria-hidden="true" />
				</button>
			)}

			{supportingText && (
				<span id={helperId} className="file_input_helper">
					{supportingText}
				</span>
			)}

			{/* button variant + preview=true: 버튼 아래 작은 썸네일들 */}
			{!isPreviewVariant && previewUrls.length > 0 && (
				<div className="file_input_preview">
					{previewUrls.map((url) => (
						// biome-ignore lint/performance/noImgElement: framework-agnostic DS - host app should swap with next/image if needed
						<img
							key={url}
							src={url}
							alt=""
							className="file_input_preview_img"
						/>
					))}
				</div>
			)}
		</div>
	);
};
