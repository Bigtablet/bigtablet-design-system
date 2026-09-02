"use client";

import type * as React from "react";
import { cn } from "../../../utils";
import type { PolymorphicProps } from "../../../utils/polymorphic";
import "./style.scss";

export type ButtonVariant = "filled" | "tonal" | "outline" | "text";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

/** button/anchor 공통 스타일·콘텐츠 props */
interface ButtonBaseProps {
	/** 버튼 스타일 변형 (기본값: "filled") */
	variant?: ButtonVariant;
	/** 버튼 크기 (기본값: "md") */
	size?: ButtonSize;
	/** 버튼 앞에 표시할 아이콘 */
	leadingIcon?: React.ReactNode;
	/** 버튼 뒤에 표시할 아이콘 */
	trailingIcon?: React.ReactNode;
	/** 버튼이 컨테이너의 전체 너비를 차지할지 여부 */
	fullWidth?: boolean;
	/** border-radius 토큰 (기본값: "full") */
	radius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "full";
	/**
	 * 위험한 액션 (삭제/취소 등) - 빨간 강조.
	 * filled: 빨간 bg, outline: 빨간 텍스트/border, tonal: 빨간 wash.
	 */
	danger?: boolean;
	/**
	 * 비활성화. button 은 native `disabled`, anchor 는 `aria-disabled`+`tabIndex=-1`+
	 * 클릭 차단으로 처리(anchor 엔 native disabled 가 없으므로).
	 */
	disabled?: boolean;
}

/**
 * Button props. `as` 로 렌더 요소를 바꾼다 - `"a"`, `Link`(Next.js) 등 무엇이든.
 *
 * `as` 를 주지 않으면 `<button>` 이고, `href` 만 주면 `<a>` 로 간다(예전부터 지원한 경로다).
 * 그 경로를 유니온으로 만들면 `ref={(el) => …}` 의 파라미터 추론이 깨진다 - 기본 케이스에만
 * `href` 를 더하는 조건부 교차로 두면 타입이 하나로 남아 추론이 유지된다.
 *
 * `as="a"` 면 `href` 는 **필수**다 - 판별 유니온 시절 `ButtonAsAnchor` 의 계약이고, `href` 없는
 * `<a>` 는 링크 시맨틱(클릭·포커스)이 없어 접근성 트리에서 링크로 잡히지도 않는다. `React` 의
 * `AnchorHTMLAttributes` 는 `href?` 라 그대로 두면 옵션으로 느슨해진다.
 */
export type ButtonProps<T extends React.ElementType = "button"> = PolymorphicProps<
	T,
	ButtonBaseProps
> &
	("button" extends T ? { href?: string } : Record<never, never>) &
	("a" extends T ? { href: string } : Record<never, never>);

/**
 * @deprecated `ButtonProps<"button">` 을 쓰세요. 리터럴 유니온 시절의 이름입니다.
 */
export type ButtonAsButton = ButtonProps<"button">;

/**
 * @deprecated `ButtonProps<"a">` 을 쓰세요. 리터럴 유니온 시절의 이름입니다.
 */
export type ButtonAsAnchor = ButtonProps<"a">;

/**
 * 버튼을 렌더링한다.
 * Figma DS 기준 4가지 variant(filled/tonal/outline/text)와 4가지 size(sm/md/lg/xl)를 지원한다.
 *
 * `as` 로 렌더 요소를 바꾼다 - `as="a"`(또는 `href` 만 지정)는 anchor, `as={Link}` 는 라우터 링크.
 *
 * **native `disabled` 는 `<button>` 에만 준다.** 그 밖의 요소에는 `aria-disabled` +
 * `tabIndex={-1}` + 클릭 차단으로 처리한다 - anchor 와 커스텀 컴포넌트에는 native disabled 가
 * 없어서 그냥 넘기면 조용히 무시되고 비활성 버튼이 눌린다.
 *
 * @example
 * ```tsx
 * <Button as={Link} href="/orders">주문 보기</Button>
 * ```
 */
export const Button = <T extends React.ElementType = "button">(props: ButtonProps<T>) => {
	const {
		variant = "filled",
		size = "md",
		leadingIcon,
		trailingIcon,
		fullWidth = false,
		radius,
		danger = false,
		disabled = false,
		as,
		className,
		children,
		ref,
		...rest
	} = props;

	const buttonClassName = cn(
		"button",
		`button_variant_${variant}`,
		`button_size_${size}`,
		fullWidth && "button_full_width",
		radius && `button_radius_${radius}`,
		danger && "button_danger",
		// anchor 엔 native :disabled 가 안 먹으므로 클래스로 비활성 스타일 적용 (button 도 무해)
		disabled && "button_disabled",
		className,
	);

	const content = (
		<>
			{leadingIcon && (
				<span className="button_icon" aria-hidden="true">
					{leadingIcon}
				</span>
			)}
			{children && <span className="button_label">{children}</span>}
			{trailingIcon && (
				<span className="button_icon" aria-hidden="true">
					{trailingIcon}
				</span>
			)}
		</>
	);

	// 렌더할 요소를 정한다. `as` 가 없고 `href` 만 있으면 anchor - 기존 동작 그대로.
	const anchorRest = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
	const Tag = (as ?? (anchorRest.href != null ? "a" : "button")) as React.ElementType;

	// native `disabled` 는 `<button>` 만 이해한다. anchor 나 커스텀 컴포넌트에 넘기면 조용히
	// 무시되고 비활성 버튼이 눌린다 - 그쪽은 aria-disabled + tabIndex=-1 + 클릭 차단으로 막는다.
	if (Tag === "button") {
		// `as="button"` 과 `href` 를 함께 준 경우 href 를 버린다 - `<button href>` 는 유효하지
		// 않은 HTML 이다. 렌더 요소는 `as` 가 정하므로 href 는 여기서 의미가 없다.
		const {
			type = "button",
			href: _href,
			...buttonRest
		} = rest as React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: string };
		return (
			<button
				ref={ref as React.Ref<HTMLButtonElement>}
				type={type}
				disabled={disabled}
				className={buttonClassName}
				{...buttonRest}
			>
				{content}
			</button>
		);
	}

	const { onClick, tabIndex, ...tagProps } = anchorRest;
	return (
		<Tag
			{...tagProps}
			ref={ref}
			className={buttonClassName}
			aria-disabled={disabled || undefined}
			tabIndex={disabled ? -1 : tabIndex}
			onClick={disabled ? (event: React.MouseEvent) => event.preventDefault() : onClick}
		>
			{content}
		</Tag>
	);
};
