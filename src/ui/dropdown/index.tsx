"use client";

import * as React from "react";
import { cn } from "../../utils";
import "./style.scss";
import { Check, ChevronDown, X } from "lucide-react";

export type DropdownSize = "sm" | "md" | "lg";

export interface DropdownOption {
	value: string;
	label: string;
	disabled?: boolean;
	/** 옵션 아래에 표시할 보조 텍스트 */
	supportingText?: string;
	/** 옵션 왼쪽 아이콘 */
	leadingIcon?: React.ReactNode;
	/** 옵션 오른쪽 아이콘 (미지정 시 선택 상태에 체크 아이콘 자동 표시) */
	trailingIcon?: React.ReactNode;
	/** 아이템 아래 구분선 표시 여부 */
	showDivider?: boolean;
}

export interface DropdownProps {
	/** 드롭다운 요소의 id (미입력 시 자동 생성) */
	id?: string;
	/** 드롭다운 위에 표시할 플로팅 라벨 텍스트 */
	label?: string;
	/** 선택 전 표시할 플레이스홀더 (기본값: "Select…") */
	placeholder?: string;
	/** 표시할 옵션 목록 */
	options: DropdownOption[];
	/** 제어형 선택 값 */
	value?: string | null;
	/** 값 변경 시 호출되는 콜백. 선택된 값과 전체 옵션 객체를 인자로 전달합니다. */
	onChange?: (value: string | null, option?: DropdownOption | null) => void;
	/** 비제어형 초기 선택 값 */
	defaultValue?: string | null;
	/** 비활성화 여부 */
	disabled?: boolean;
	/** 드롭다운 크기 (기본값: "md") */
	size?: DropdownSize;
	/** 컨테이너 전체 너비 차지 여부 */
	fullWidth?: boolean;
	/** 루트 요소에 추가할 className */
	className?: string;
	/**
	 * @deprecated variant는 더 이상 지원되지 않습니다. Dropdown은 outline 스타일만 사용합니다.
	 */
	variant?: "outline" | "filled" | "ghost";
	/**
	 * @deprecated textAlign은 더 이상 지원되지 않습니다.
	 */
	textAlign?: "left" | "center";
}

/**
 * 드롭다운 컴포넌트를 렌더링한다.
 * 제어형/비제어형 상태를 지원하며, 키보드/마우스 상호작용과 플로팅 라벨을 관리한다.
 * @param props 드롭다운 속성
 * @returns 렌더링된 드롭다운 UI
 */
export const Dropdown = ({
	id,
	label,
	placeholder = "Select…",
	options,
	value,
	onChange,
	defaultValue = null,
	disabled,
	size = "md",
	fullWidth,
	className,
}: DropdownProps) => {
	const internalId = React.useId();
	const dropdownId = id ?? internalId;

	const isControlled = value !== undefined;
	const [internalValue, setInternalValue] = React.useState<string | null>(defaultValue);
	const currentValue = isControlled ? (value ?? null) : internalValue;

	const [isOpen, setIsOpen] = React.useState(false);
	const [activeIndex, setActiveIndex] = React.useState(-1);
	const [dropUp, setDropUp] = React.useState(false);

	const wrapperRef = React.useRef<HTMLDivElement>(null);
	const controlRef = React.useRef<HTMLButtonElement>(null);

	const currentOption = React.useMemo(
		() => options.find((o) => o.value === currentValue) ?? null,
		[options, currentValue],
	);

	/** 라벨: 열려있거나 값이 있을 때만 표시 */
	const isLabelVisible = isOpen || !!currentOption;

	const setValue = React.useCallback(
		(next: string | null) => {
			const option = options.find((o) => o.value === next) ?? null;
			if (!isControlled) setInternalValue(next);
			onChange?.(next, option);
		},
		[isControlled, onChange, options],
	);

	const handleOutsideClick = React.useEffectEvent((e: MouseEvent) => {
		if (!wrapperRef.current?.contains(e.target as Node)) {
			setIsOpen(false);
		}
	});

	React.useEffect(() => {
		document.addEventListener("mousedown", handleOutsideClick);
		return () => document.removeEventListener("mousedown", handleOutsideClick);
	}, []);

	const moveActive = (dir: 1 | -1) => {
		if (!isOpen) {
			setIsOpen(true);
			return;
		}
		let i = activeIndex;
		const len = options.length;
		for (let step = 0; step < len; step++) {
			i = (i + dir + len) % len;
			if (!options[i].disabled) {
				setActiveIndex(i);
				break;
			}
		}
	};

	const commitActive = () => {
		if (activeIndex < 0 || activeIndex >= options.length) return;
		const opt = options[activeIndex];
		if (!opt.disabled) {
			setValue(opt.value);
			setIsOpen(false);
		}
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
		if (disabled) return;
		switch (e.key) {
			case " ":
			case "Enter":
				e.preventDefault();
				if (!isOpen) setIsOpen(true);
				else commitActive();
				break;
			case "ArrowDown":
				e.preventDefault();
				moveActive(1);
				break;
			case "ArrowUp":
				e.preventDefault();
				moveActive(-1);
				break;
			case "Home":
				e.preventDefault();
				setIsOpen(true);
				setActiveIndex(options.findIndex((o) => !o.disabled));
				break;
			case "End":
				e.preventDefault();
				setIsOpen(true);
				for (let i = options.length - 1; i >= 0; i--) {
					if (!options[i].disabled) {
						setActiveIndex(i);
						break;
					}
				}
				break;
			case "Escape":
				e.preventDefault();
				setIsOpen(false);
				break;
		}
	};

	React.useEffect(() => {
		if (!isOpen) return;
		const idx = options.findIndex((o) => o.value === currentValue && !o.disabled);
		setActiveIndex(
			idx >= 0
				? idx
				: Math.max(0, options.findIndex((o) => !o.disabled)),
		);
	}, [isOpen, options, currentValue]);

	React.useLayoutEffect(() => {
		if (!isOpen || !controlRef.current) return;
		const rect = controlRef.current.getBoundingClientRect();
		const listHeight = Math.min(options.length * 56, 288);
		const spaceBelow = window.innerHeight - rect.bottom;
		const spaceAbove = rect.top;
		setDropUp(spaceBelow < listHeight && spaceAbove > spaceBelow);
	}, [isOpen, options.length]);

	const rootClassName = cn("dropdown", `dropdown_size_${size}`, className);
	const fieldsetClassName = cn("dropdown_fieldset", { is_open: isOpen, is_disabled: disabled });
	const listClassName = cn("dropdown_list", { dropdown_list_up: dropUp });

	return (
		<div
			ref={wrapperRef}
			className={rootClassName}
			style={fullWidth ? { width: "100%" } : undefined}
		>
			<div className={fieldsetClassName}>
				{label && (
					<span
						className={cn("dropdown_label", { is_visible: isLabelVisible })}
						aria-hidden="true"
					>
						{label}
					</span>
				)}

				<button
					ref={controlRef}
					id={dropdownId}
					type="button"
					className={cn("dropdown_control", { is_disabled: disabled })}
					aria-haspopup="listbox"
					aria-expanded={isOpen}
					aria-controls={`${dropdownId}_listbox`}
					aria-label={label}
					onClick={() => !disabled && setIsOpen((o) => !o)}
					onKeyDown={onKeyDown}
					disabled={disabled}
				>
					<span className={currentOption ? "dropdown_value" : "dropdown_placeholder"}>
						{currentOption ? currentOption.label : placeholder}
					</span>
					<span className="dropdown_icon" aria-hidden="true">
						{isOpen ? <X size={24} /> : <ChevronDown size={24} />}
					</span>
				</button>
			</div>

			{isOpen && (
				<div
					id={`${dropdownId}_listbox`}
					role="listbox"
					className={listClassName}
				>
					{options.map((opt, i) => {
						const selected = currentValue === opt.value;
						const active = i === activeIndex;

						return (
							<React.Fragment key={opt.value}>
								<div
									role="option"
									tabIndex={-1}
									aria-selected={selected}
									aria-disabled={opt.disabled ? true : undefined}
									className={cn("dropdown_option", {
										is_selected: selected,
										is_active: active,
										is_disabled: opt.disabled,
									})}
									onMouseEnter={() => !opt.disabled && setActiveIndex(i)}
									onClick={() => {
										if (opt.disabled) return;
										setValue(opt.value);
										setIsOpen(false);
									}}
									onKeyDown={(e) => {
										if (opt.disabled) return;
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											setValue(opt.value);
											setIsOpen(false);
										}
									}}
								>
									{opt.leadingIcon && (
										<span className="dropdown_option_icon">{opt.leadingIcon}</span>
									)}
									<span className="dropdown_option_content">
										<span className="dropdown_option_label">{opt.label}</span>
										{opt.supportingText && (
											<span className="dropdown_option_supporting">{opt.supportingText}</span>
										)}
									</span>
									{(selected || opt.trailingIcon) && (
										<span className="dropdown_option_trailing">
											{opt.trailingIcon ?? <Check size={16} aria-hidden="true" />}
										</span>
									)}
								</div>
								{opt.showDivider && (
									<div className="dropdown_option_divider" role="separator" />
								)}
							</React.Fragment>
						);
					})}
				</div>
			)}
		</div>
	);
};
