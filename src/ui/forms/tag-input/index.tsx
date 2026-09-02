"use client";

import type * as React from "react";
import { useId, useRef, useState } from "react";
import { cn } from "../../../utils";
import { Chip } from "../../display/chip";
import { useFieldControl } from "../field";
import "./style.scss";

export type TagInputSize = "sm" | "md" | "lg";

export interface TagInputProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
	/** 태그 목록 (제어형). 주지 않으면 내부 상태로 동작한다 */
	value?: string[];
	/** 비제어형 초기 태그 */
	defaultValue?: string[];
	/** 태그가 추가·제거될 때 */
	onValueChange?: (tags: string[]) => void;
	/** 입력 placeholder (기본값: "입력 후 Enter") */
	placeholder?: string;
	/** 최대 개수. 도달하면 더 추가되지 않는다 */
	maxTags?: number;
	/** 같은 값을 여러 번 넣도록 허용 (기본값: false) */
	allowDuplicates?: boolean;
	/** 크기 (기본값: "md") */
	size?: TagInputSize;
	/** 비활성 여부 */
	disabled?: boolean;
	/** 전체 너비 차지 */
	fullWidth?: boolean;
	/** 접근성 이름 - `Field` 로 감싸면 그쪽 라벨이 우선한다 */
	ariaLabel?: string;
}

/** 쉼표·탭·줄바꿈으로 끊는다. 붙여넣기 한 번에 여러 태그가 들어오는 경로다. */
const SEPARATORS = /[,\t\n\r]+/;

const splitTags = (text: string) =>
	text
		.split(SEPARATORS)
		.map((part) => part.trim())
		.filter(Boolean);

/**
 * 후보 목록에 없는 값을 사용자가 직접 만들어 넣는 다중 입력.
 *
 * 후보가 정해져 있으면 `Dropdown` 의 `multiple` 을, 후보를 서버에서 가져와야 하면 `Combobox` 를
 * 쓴다. `TagInput` 이 맡는 것은 **목록 자체가 없는** 경우다 - 자유 키워드, 사내 라벨, 검색 필터처럼
 * 사용자가 만들어 내는 값.
 *
 * 태그 칩은 `Chip` 의 `static` + `removable` 을 그대로 쓴다.
 *
 * @example
 * ```tsx
 * <Field name="keywords" label="키워드">
 *   <TagInput value={tags} onValueChange={setTags} maxTags={10} />
 * </Field>
 * ```
 */
export const TagInput = ({
	value,
	defaultValue = [],
	onValueChange,
	placeholder = "입력 후 Enter",
	maxTags,
	allowDuplicates = false,
	size = "md",
	disabled = false,
	fullWidth = false,
	ariaLabel,
	className,
	...props
}: TagInputProps) => {
	const generatedId = useId();
	const field = useFieldControl();
	const inputId = field?.inputId ?? generatedId;

	const isControlled = value !== undefined;
	const [innerTags, setInnerTags] = useState<string[]>(defaultValue);
	const tags = isControlled ? value : innerTags;

	const [draft, setDraft] = useState("");
	// 추가·제거는 화면 밖 변화라 눈으로 확인할 수 없는 경로가 있다(빈 입력에서 Backspace).
	const [announcement, setAnnouncement] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const isFull = maxTags !== undefined && tags.length >= maxTags;

	const setTags = (next: string[]) => {
		if (!isControlled) setInnerTags(next);
		onValueChange?.(next);
	};

	/** 입력·붙여넣기로 들어온 텍스트를 태그로 확정한다. 넣은 개수를 돌려준다. */
	const addTags = (text: string) => {
		const candidates = splitTags(text);
		if (candidates.length === 0) return 0;

		const next = [...tags];
		const added: string[] = [];
		for (const candidate of candidates) {
			if (maxTags !== undefined && next.length >= maxTags) break;
			// 중복은 조용히 버린다 - 이미 화면에 같은 칩이 있어 사용자가 결과를 볼 수 있다.
			if (!allowDuplicates && next.includes(candidate)) continue;
			next.push(candidate);
			added.push(candidate);
		}

		if (added.length === 0) {
			// 개수 제한에 막혀 하나도 못 넣은 경우. 입력이 readOnly 로 바뀌는 것만으로는
			// 이유를 알 수 없어, 왜 안 들어갔는지 알려 준다.
			if (maxTags !== undefined && next.length >= maxTags) {
				setAnnouncement(`최대 ${maxTags}개까지 추가할 수 있습니다`);
			}
			return 0;
		}
		setTags(next);
		setAnnouncement(`${added.join(", ")} 추가됨`);
		return added.length;
	};

	const removeAt = (index: number) => {
		const removed = tags[index];
		setTags(tags.filter((_, i) => i !== index));
		setAnnouncement(`${removed} 제거됨`);
	};

	const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		// IME 조합 중 Enter 는 조합 확정용 - 태그를 만들지 않는다.
		if (event.nativeEvent.isComposing) return;

		if (event.key === "Enter" || event.key === ",") {
			// Enter 가 폼을 제출해 버리면 태그를 만들 기회 자체가 없다.
			event.preventDefault();
			if (addTags(draft) > 0) setDraft("");
			return;
		}
		// 빈 입력에서 Backspace 는 마지막 태그를 지운다 - 마우스 없이 되돌리는 유일한 경로.
		if (event.key === "Backspace" && draft === "" && tags.length > 0) {
			event.preventDefault();
			removeAt(tags.length - 1);
		}
	};

	const onPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
		const text = event.clipboardData.getData("text");
		// 구분자가 없으면 그냥 타이핑처럼 두고, 있을 때만 가로채 여러 태그로 나눈다.
		if (!SEPARATORS.test(text)) return;
		event.preventDefault();
		if (addTags(`${draft}${text}`) > 0) setDraft("");
	};

	const rootClassName = cn(
		"tag_input",
		`tag_input_size_${size}`,
		{ tag_input_full_width: fullWidth, tag_input_disabled: disabled },
		className,
	);

	return (
		<div className={rootClassName} {...props}>
			{/* 칩을 클릭해도 입력으로 들어가야 한다 - 컨트롤 전체가 하나의 입력으로 읽힌다.
			    칩 제거 클릭도 여기까지 버블하므로, 칩이 사라진 뒤 포커스가 입력으로 돌아온다.
			    이게 없으면 포커스가 body 로 떨어져 다음 Tab 이 문서 처음부터 시작한다. */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: 실제 컨트롤은 안쪽 input 이다. 이 클릭은 여백을 눌렀을 때 포커스를 넘겨주는 편의 동작일 뿐 키보드 경로가 아니다 */}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: 같은 이유 - 포커스를 안쪽 input 으로 넘길 뿐이고 이 요소 자체는 조작 대상이 아니다 */}
			<div className="tag_input_control" onClick={() => inputRef.current?.focus()}>
				{tags.length > 0 && (
					<ul className="tag_input_tags">
						{tags.map((tag, index) => (
							/* biome-ignore lint/suspicious/noArrayIndexKey: allowDuplicates 면 같은 라벨이 여러 개라 값만으로는 구분되지 않는다 */
							<li key={`${tag}-${index}`} className="tag_input_tag">
								{/* disabled 를 Chip 에 넘기지 않는다 - Chip 의 disabled 라벨색은 대비가
								    1.68 로 읽히지 않는다. 편집만 막고 값은 그대로 읽히게 둔다. */}
								<Chip
									type="static"
									size="sm"
									label={tag}
									removable={!disabled}
									onRemove={() => removeAt(index)}
								/>
							</li>
						))}
					</ul>
				)}
				<input
					ref={inputRef}
					id={inputId}
					className="tag_input_field"
					type="text"
					autoComplete="off"
					value={draft}
					disabled={disabled}
					readOnly={isFull}
					placeholder={isFull ? "" : placeholder}
					aria-labelledby={field?.labelId}
					aria-label={field?.labelId ? undefined : ariaLabel}
					aria-describedby={field?.describedBy}
					aria-invalid={field?.invalid || undefined}
					aria-required={field?.required || undefined}
					onChange={(event) => setDraft(event.target.value)}
					onKeyDown={onKeyDown}
					onPaste={onPaste}
					onBlur={() => {
						// 포커스를 옮기며 입력을 버리면 사용자는 Enter 를 잊은 것을 모른 채 값을 잃는다.
						if (addTags(draft) > 0) setDraft("");
					}}
				/>
			</div>
			<span className="tag_input_live" role="status">
				{announcement}
			</span>
		</div>
	);
};
