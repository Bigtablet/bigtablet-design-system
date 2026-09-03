import type * as React from "react";

/**
 * `as` 로 렌더 요소를 바꾸는 컴포넌트의 props 타입.
 *
 * 왜 필요한가 - `as?: "button" | "a"` 리터럴 유니온으로는 `as={Link}` 처럼 **컴포넌트**를 넘길
 * 수 없다. Next.js 앱에서 DS 버튼을 라우터 링크로 쓰려면 소비자가 DS 를 우회해 자기 버튼을
 * 만들게 되고, 우회가 시작되는 지점이 DS 이탈이 시작되는 지점이다.
 *
 * `as` 에 준 요소의 props 가 그대로 따라온다 - `as="a"` 면 `href`·`target`, `as={Link}` 면
 * `Link` 의 props 가 타입에 들어오고, 컴포넌트 자기 props(`Own`)와 겹치는 이름은 `Own` 이 이긴다.
 *
 * @example
 * ```tsx
 * interface OwnProps { variant?: "filled" | "text" }
 *
 * const Thing = <T extends React.ElementType = "button">({
 *   as,
 *   variant = "filled",
 *   ...rest
 * }: PolymorphicProps<T, OwnProps>) => {
 *   const Tag = as ?? "button";
 *   return <Tag {...rest} />;
 * };
 * ```
 */
export type PolymorphicProps<T extends React.ElementType, Own> = Own & {
	/** 렌더할 요소나 컴포넌트 */
	as?: T;
	/** 루트 요소 ref (React 19 ref-as-prop) */
	ref?: PolymorphicRef<T>;
} & Omit<React.ComponentPropsWithoutRef<T>, keyof Own | "as" | "ref">;

/** `as` 에 준 요소의 ref 타입 */
export type PolymorphicRef<T extends React.ElementType> = React.ComponentPropsWithRef<T>["ref"];
