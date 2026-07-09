"use client";

import { ChevronDown } from "lucide-react";
import * as React from "react";
import { iconSize } from "../../../styles/icon";
import { cn } from "../../../utils";
import "./style.scss";

export interface AccordionItem {
	key: string;
	title: React.ReactNode;
	content: React.ReactNode;
	disabled?: boolean;
}

export interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
	/** 아이템 목록 */
	items: AccordionItem[];
	/** 여러 개 동시에 펼침 허용 (기본 false - 한 번에 하나) */
	multiple?: boolean;
	/** 기본으로 펼쳐진 키들 */
	defaultOpenKeys?: string[];
	/** 제어형: 펼쳐진 키들 */
	openKeys?: string[];
	/** 펼침/접힘 콜백 (canonical). 열린 키 배열 전달 */
	onValueChange?: (openKeys: string[]) => void;
	/** @deprecated `onValueChange` 를 사용하세요. */
	onChange?: (openKeys: string[]) => void;
}

/**
 * 펼침/접힘 영역. FAQ, 설정 그룹, details 패턴.
 *
 * @example
 * ```tsx
 * <Accordion items={faqItems} multiple />
 * ```
 */
export const Accordion = ({
	items,
	multiple = false,
	defaultOpenKeys = [],
	openKeys: controlledKeys,
	onValueChange,
	onChange,
	className,
	...props
}: AccordionProps) => {
	const isControlled = controlledKeys !== undefined;
	const [internalKeys, setInternalKeys] = React.useState<string[]>(defaultOpenKeys);
	const open = isControlled ? (controlledKeys ?? []) : internalKeys;

	const toggle = (key: string) => {
		const isOpen = open.includes(key);
		const next = isOpen
			? open.filter((k) => k !== key)
			: multiple
				? [...open, key]
				: [key];
		if (!isControlled) setInternalKeys(next);
		(onValueChange ?? onChange)?.(next);
	};

	return (
		<div className={cn("accordion", className)} {...props}>
			{items.map((item) => {
				const isOpen = open.includes(item.key);
				const headerId = `${item.key}-header`;
				const panelId = `${item.key}-panel`;

				return (
					<div key={item.key} className={cn("accordion_item", isOpen && "accordion_item_open")}>
						<h3 className="accordion_header">
							<button
								type="button"
								id={headerId}
								className="accordion_trigger"
								aria-expanded={isOpen}
								aria-controls={panelId}
								disabled={item.disabled}
								onClick={() => toggle(item.key)}
							>
								<span className="accordion_title">{item.title}</span>
								<ChevronDown
									size={iconSize.lg}
									className={cn("accordion_chevron", isOpen && "accordion_chevron_open")}
									aria-hidden="true"
								/>
							</button>
						</h3>
						<div
							id={panelId}
							role="region"
							aria-labelledby={headerId}
							aria-hidden={!isOpen}
							// 닫힌 패널은 grid 애니메이션이라 display:none 이 아님 → inert 로 내부 포커스 차단 (WCAG 4.1.2)
							inert={!isOpen}
							className={cn("accordion_panel", isOpen && "accordion_panel_open")}
						>
							<div className="accordion_panel_wrap">
								<div className="accordion_content">{item.content}</div>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};
