"use client";

import * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";
import { ChevronDown, Check } from "lucide-react";

export type SelectSize = "sm" | "md" | "lg";
export type SelectVariant = "outline" | "filled" | "ghost";

export interface SelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

export interface SelectProps {
	id?: string;
	label?: string;
	placeholder?: string;
	options: SelectOption[];
	value?: string | null;
	onChange?: (value: string | null, option?: SelectOption | null) => void;
	defaultValue?: string | null;
	disabled?: boolean;
	size?: SelectSize;
	variant?: SelectVariant;
	fullWidth?: boolean;
	className?: string;
	textAlign?: "left" | "center";
}

/**
 * 셀렉트 컴포넌트를 렌더링한다.
 * 제어형/비제어형 상태를 정리하고, 키보드/마우스 상호작용과 드롭다운 표시를 관리한다.
 * @param props 셀렉트 속성
 * @returns 렌더링된 셀렉트 UI
 */
export const Select = ({
	id,
	label,
	placeholder = "Select…",
	options,
	value,
	onChange,
	defaultValue = null,
	disabled,
	size = "md",
	variant = "outline",
	fullWidth,
	className,
	textAlign = "left",
}: SelectProps) => {
	const internalId = React.useId();
	const selectId = id ?? internalId;

	const isControlled = value !== undefined;
	const [internalValue, setInternalValue] = React.useState<string | null>(defaultValue);
	const currentValue = isControlled ? value ?? null : internalValue;

	const [isOpen, setIsOpen] = React.useState(false);
	const [activeIndex, setActiveIndex] = React.useState(-1);
	const [dropUp, setDropUp] = React.useState(false);

	const wrapperRef = React.useRef<HTMLDivElement>(null);
	const controlRef = React.useRef<HTMLButtonElement>(null);

	const currentOption = React.useMemo(
		() => options.find((o) => o.value === currentValue) ?? null,
		[options, currentValue],
	);

	/**
	 * 값을 갱신하고 변경 이벤트를 전파한다.
	 * @param next 다음 값
	 * @returns void
	 */
	const setValue = React.useCallback(
		(next: string | null) => {
			const option = options.find((o) => o.value === next) ?? null;
			if (!isControlled) setInternalValue(next);
			onChange?.(next, option);
		},
		[isControlled, onChange, options],
	);

	/**
	 * 외부 클릭 시 드롭다운을 닫는다.
	 * @param e 마우스 이벤트
	 * @returns void
	 */
	const handleOutsideClick = React.useEffectEvent((e: MouseEvent) => {
		if (!wrapperRef.current?.contains(e.target as Node)) {
			setIsOpen(false);
		}
	});

	React.useEffect(() => {
		document.addEventListener("mousedown", handleOutsideClick);
		return () => document.removeEventListener("mousedown", handleOutsideClick);
	}, []);

	/**
	 * 활성 옵션을 위/아래로 이동한다.
	 * 닫혀 있으면 먼저 열고, 비활성 옵션은 건너뛴다.
	 * @param dir 이동 방향
	 * @returns void
	 */
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

	/**
	 * 현재 활성 옵션을 선택으로 확정한다.
	 * @returns void
	 */
	const commitActive = () => {
		if (activeIndex < 0 || activeIndex >= options.length) return;
		const opt = options[activeIndex];
		if (!opt.disabled) {
			setValue(opt.value);
			setIsOpen(false);
		}
	};

	/**
	 * 키보드 입력에 따라 열기/선택/이동을 처리한다.
	 * @param e 키보드 이벤트
	 * @returns void
	 */
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
		setActiveIndex(idx >= 0 ? idx : Math.max(0, options.findIndex((o) => !o.disabled)));
	}, [isOpen, options, currentValue]);

	// 드롭다운 방향 계산(자동 플립)
	React.useLayoutEffect(() => {
		if (!isOpen || !controlRef.current) return;

		const rect = controlRef.current.getBoundingClientRect();
		const listHeight = Math.min(options.length * 40, 288);
		const spaceBelow = window.innerHeight - rect.bottom;
		const spaceAbove = rect.top;

		setDropUp(spaceBelow < listHeight && spaceAbove > spaceBelow);
	}, [isOpen, options.length]);

	const rootClassName = cn("select", className);

	const controlClassName = cn(
		"select_control",
		`select_variant_${variant}`,
		`select_size_${size}`,
		{ is_open: isOpen, is_disabled: disabled }
	);

	const listClassName = cn("select_list", { select_list_up: dropUp });

	return (
		<div ref={wrapperRef} className={rootClassName} style={fullWidth ? { width: "100%" } : undefined}>
			{label && (
				<label htmlFor={selectId} className="select_label">
					{label}
				</label>
			)}

			<button
				ref={controlRef}
				id={selectId}
				type="button"
				className={controlClassName}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				aria-controls={`${selectId}_listbox`}
				onClick={() => !disabled && setIsOpen((o) => !o)}
				onKeyDown={onKeyDown}
				disabled={disabled}
			>
				<span
					className={currentOption ? "select_value" : "select_placeholder"}
					style={textAlign === "left" ? { textAlign: "start" } : undefined}
				>
					{currentOption ? currentOption.label : placeholder}
				</span>
				<span className="select_icon" aria-hidden="true">
					<ChevronDown size={16} />
				</span>
			</button>

			{isOpen && (
				<ul
					id={`${selectId}_listbox`}
					role="listbox"
					className={listClassName}
				>
					{options.map((opt, i) => {
						const selected = currentValue === opt.value;
						const active = i === activeIndex;

						const optionClassName = cn(
							"select_option",
							{ is_selected: selected, is_active: active, is_disabled: opt.disabled }
						);

						return (
							<li
								key={opt.value}
								role="option"
								aria-selected={selected}
								className={optionClassName}
								onMouseEnter={() => !opt.disabled && setActiveIndex(i)}
								onClick={() => {
									if (opt.disabled) return;
									setValue(opt.value);
									setIsOpen(false);
								}}
							>
								<span>{opt.label}</span>
								{selected && <Check size={16} aria-hidden="true" />}
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};
