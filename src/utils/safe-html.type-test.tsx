import * as DS from "../index";
import type { PolymorphicProps } from "./polymorphic";

// 공개 export 전체에서 props 로 `dangerouslySetInnerHTML` 을 받는 컴포넌트가 있으면 tsc 가 실패한다
// (W-1-4-6). 새 컴포넌트가 `React.*HTMLAttributes` 를 `SafeHTMLProps` 없이 확장하면 여기서 걸린다.
// 문자열 인덱스 시그니처가 있는 인자(`cn` 의 ClassValue)는 모든 키를 받아 오탐이라 제외한다.
// ponytail: 그 필터에 `as` 제네릭 컴포넌트도 걸린다(T 가 ElementType 으로 풀려 키가 string) - 8개 모두
// PolymorphicProps 를 거치므로 아래에서 그 타입을 직접 단정한다. 다른 제네릭 props 가 생기면 여기에 추가.
type Exports = typeof DS;
type Leaky = {
	[K in keyof Exports]: Exports[K] extends (props: infer P, ...rest: never[]) => unknown
		? P extends object
			? string extends keyof P
				? never
				: "dangerouslySetInnerHTML" extends keyof P
					? K
					: never
			: never
		: never;
}[keyof Exports];

type AssertNever<T extends never> = T;
export type _NoComponentAcceptsInnerHTML = AssertNever<Leaky>;
export type _PolymorphicOmitsInnerHTML = AssertNever<
	Extract<keyof PolymorphicProps<"div", object>, "dangerouslySetInnerHTML">
>;

// 소비자가 실제로 쓰는 JSX 경로 - 폴리모픽 기본값(`as` 생략)과 일반 컴포넌트 각각 하나.
const html = { __html: "<b>x</b>" };
export const _button = (
	<DS.Button
		// biome-ignore lint/security/noDangerouslySetInnerHtml: 타입이 거절하는지만 보는 검사 - 렌더되지 않는다
		// @ts-expect-error - dangerouslySetInnerHTML 은 DS 컴포넌트 props 가 아니다
		dangerouslySetInnerHTML={html}
	/>
);
export const _card = (
	<DS.Card
		// biome-ignore lint/security/noDangerouslySetInnerHtml: 타입이 거절하는지만 보는 검사 - 렌더되지 않는다
		// @ts-expect-error - dangerouslySetInnerHTML 은 DS 컴포넌트 props 가 아니다
		dangerouslySetInnerHTML={html}
	/>
);
