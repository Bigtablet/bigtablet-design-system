"use client";

import { animated } from "@react-spring/web";
import * as React from "react";
import { cn, useSpringPresence } from "../../../utils";
import "./style.scss";

export interface MenuItem {
	key: string;
	label: React.ReactNode;
	icon?: React.ReactNode;
	disabled?: boolean;
	/** 클릭 시 호출 - 자동으로 메뉴 닫힘 */
	onSelect?: () => void;
	/** destructive 액션 (삭제 등) - 빨간 텍스트 */
	destructive?: boolean;
}

export interface MenuProps {
	/** 메뉴 아이템들 */
	items: MenuItem[];
	/** trigger 요소 - 클릭 시 메뉴 열림 */
	trigger: React.ReactElement;
	/** 정렬 (기본 "start") */
	align?: "start" | "end";
}

/**
 * 컨텍스트 메뉴. trigger 클릭 시 아래에 메뉴 표시. 외부 클릭/Esc로 닫힘.
 * Form Dropdown과 다름 - 액션 메뉴 (Edit/Delete 등).
 *
 * @example
 * ```tsx
 * <Menu
 *   trigger={<IconButton icon={<MoreIcon />} />}
 *   items={[
 *     { key: "edit", label: "편집", onSelect: handleEdit },
 *     { key: "del", label: "삭제", onSelect: handleDel, destructive: true },
 *   ]}
 * />
 * ```
 */
export const Menu = ({ items, trigger, align = "start" }: MenuProps) => {
	const [open, setOpen] = React.useState(false);
	const wrapperRef = React.useRef<HTMLSpanElement>(null);
	const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
	const menuId = React.useId();

	const style = useSpringPresence({ visible: open, from: "translateY(-4px)" });

	React.useEffect(() => {
		if (!open) return;
		const handleClick = (e: MouseEvent) => {
			if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
		};
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", handleClick);
		document.addEventListener("keydown", handleEsc);
		return () => {
			document.removeEventListener("mousedown", handleClick);
			document.removeEventListener("keydown", handleEsc);
		};
	}, [open]);

	// 열릴 때 첫 활성 아이템에 포커스 (WAI-ARIA menu button 패턴). 이미 메뉴 "아이템"에 포커스가
	// 있으면(사용자 네비 중·items 재생성 re-run) 가로채지 않음 — trigger 포커스는 내부로 치지 않아
	// 트리거 클릭으로 열 때 첫 항목 포커스를 보장한다.
	React.useEffect(() => {
		const active = document.activeElement;
		// active 가 실제 메뉴 아이템일 때만 가로채지 않음. null/trigger 는 첫 항목 포커스를 진행
		// (itemRefs 에 null 이 섞여 있어도 includes(null) 오탐이 나지 않도록 active truthy 체크).
		if (!open || (active && itemRefs.current.includes(active as HTMLButtonElement))) return;
		const first = items.findIndex((it) => !it.disabled);
		if (first >= 0) itemRefs.current[first]?.focus();
	}, [open, items]);

	// 화살표/Home/End 로 메뉴 아이템 간 roving 포커스
	const moveFocus = (dir: 1 | -1 | "first" | "last") => {
		const enabled = items.flatMap((it, i) => (it.disabled ? [] : [i]));
		if (enabled.length === 0) return;
		if (dir === "first") return void itemRefs.current[enabled[0]]?.focus();
		if (dir === "last") return void itemRefs.current[enabled[enabled.length - 1]]?.focus();
		const pos = enabled.findIndex((i) => itemRefs.current[i] === document.activeElement);
		const next =
			pos < 0 ? (dir === 1 ? 0 : enabled.length - 1) : (pos + dir + enabled.length) % enabled.length;
		itemRefs.current[enabled[next]]?.focus();
	};

	const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		// 메뉴 내부에서 소비하는 키만 상위로 전파 차단 — 예: Modal 안의 Menu 에서 Esc 가 둘 다 닫히는 것 방지.
		// Tab 은 제외 — 부모 focus trap(Modal 등)이 Tab 을 감지해 포커스를 가둬야 하므로 전파시킨다.
		if (["ArrowDown", "ArrowUp", "Home", "End", "Escape"].includes(e.key)) {
			e.stopPropagation();
		}
		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				moveFocus(1);
				break;
			case "ArrowUp":
				e.preventDefault();
				moveFocus(-1);
				break;
			case "Home":
				e.preventDefault();
				moveFocus("first");
				break;
			case "End":
				e.preventDefault();
				moveFocus("last");
				break;
			case "Escape":
				e.preventDefault();
				setOpen(false);
				// trigger 로 포커스 복귀
				wrapperRef.current?.querySelector<HTMLElement>("[aria-haspopup]")?.focus();
				break;
			case "Tab":
				setOpen(false);
				break;
		}
	};

	const triggerWithProps = React.cloneElement(
		trigger as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
		{
			onClick: () => setOpen((o) => !o),
			"aria-haspopup": "menu",
			"aria-expanded": open,
			"aria-controls": open ? menuId : undefined,
		} as React.HTMLAttributes<HTMLElement>,
	);

	return (
		<span className="menu_wrapper" ref={wrapperRef}>
			{triggerWithProps}
			{open && (
				<animated.div
					id={menuId}
					role="menu"
					style={style}
					className={cn("menu", `menu_align_${align}`)}
					onKeyDown={handleMenuKeyDown}
				>
					{items.map((item, index) => (
						<button
							key={item.key}
							ref={(el) => {
								itemRefs.current[index] = el;
							}}
							type="button"
							role="menuitem"
							tabIndex={-1}
							disabled={item.disabled}
							className={cn(
								"menu_item",
								item.destructive && "menu_item_destructive",
								item.disabled && "menu_item_disabled",
							)}
							onClick={() => {
								if (item.disabled) return;
								item.onSelect?.();
								setOpen(false);
							}}
						>
							{item.icon && (
								<span className="menu_item_icon" aria-hidden="true">
									{item.icon}
								</span>
							)}
							<span className="menu_item_label">{item.label}</span>
						</button>
					))}
				</animated.div>
			)}
		</span>
	);
};
