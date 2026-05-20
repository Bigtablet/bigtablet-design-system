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
	/** 클릭 시 호출 — 자동으로 메뉴 닫힘 */
	onSelect?: () => void;
	/** destructive 액션 (삭제 등) — 빨간 텍스트 */
	destructive?: boolean;
}

export interface MenuProps {
	/** 메뉴 아이템들 */
	items: MenuItem[];
	/** trigger 요소 — 클릭 시 메뉴 열림 */
	trigger: React.ReactElement;
	/** 정렬 (기본 "start") */
	align?: "start" | "end";
}

/**
 * 컨텍스트 메뉴. trigger 클릭 시 아래에 메뉴 표시. 외부 클릭/Esc로 닫힘.
 * Form Dropdown과 다름 — 액션 메뉴 (Edit/Delete 등).
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
				>
					{items.map((item) => (
						<button
							key={item.key}
							type="button"
							role="menuitem"
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
