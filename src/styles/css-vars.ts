import type { a11y } from "./a11y";
import { colors } from "./colors";
import { elevation } from "./elevation";
import { radius } from "./radius";
import { spacing } from "./spacing";

/** `errorOnContainer` → `error-on-container` */
const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

type VarsOf<T> = { readonly [K in keyof T]: string };

const varsOf = <T extends object>(source: T, prefix: string): VarsOf<T> =>
	Object.fromEntries(
		Object.keys(source).map((key) => [key, `var(--bt-${prefix}${kebab(key)})`]),
	) as VarsOf<T>;

/**
 * 테마를 따라가는 토큰 - 값 대신 `var(--bt-*)` 문자열이다.
 *
 * `colors` · `elevation` · `a11y.focusRing*` 는 light 고정값이라 인라인 스타일에 넣으면 dark 테마에서도
 * light 색이 남는다. 같은 키로 이쪽을 쓰면 브라우저가 현재 테마의 값을 고른다. `style.css` 가 로드돼
 * 있어야 변수가 정의된다.
 *
 * `radius` · `spacing` · `fontFamily` 는 테마와 무관하지만 사용처가 `:root` 에서 덮어쓸 수 있다 - 숫자 export
 * (`radius.md` = `"8px"`) 대신 이쪽을 쓰면 그 덮어쓴 값을 DS 컴포넌트와 같이 따라간다.
 *
 * @example
 * ```tsx
 * <div style={{ color: cssVars.colors.text.caption, borderRadius: cssVars.radius.md }} />
 * ```
 */
export const cssVars = {
	colors: Object.fromEntries(
		Object.entries(colors).map(([group, values]) => [group, varsOf(values, `color-${group}-`)]),
	) as { readonly [G in keyof typeof colors]: VarsOf<(typeof colors)[G]> },
	elevation: varsOf(elevation, "elevation-"),
	a11y: {
		focusRing: "var(--bt-focus-ring)",
		focusRingError: "var(--bt-focus-ring-error)",
		focusRingSuccess: "var(--bt-focus-ring-success)",
	} satisfies Partial<VarsOf<typeof a11y>>,
	radius: varsOf(radius, "radius-"),
	spacing: varsOf(spacing, "spacing-"),
	fontFamily: "var(--bt-font-family)",
} as const;
