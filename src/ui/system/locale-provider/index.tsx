"use client";

import type * as React from "react";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { catalogs, ko, type LocaleKey, type LocaleMessages, type LocaleName } from "./messages";

export type { LocaleKey, LocaleMessages, LocaleName } from "./messages";
export { catalogs, en, ko } from "./messages";

/** `t(key, vars)` - 카탈로그에서 문구를 꺼내고 `{name}` 자리표시자를 채운다 */
export type LocaleText = (key: LocaleKey, vars?: Record<string, string | number>) => string;

export interface LocaleProviderProps {
	/** 기준 카탈로그 (기본값: "ko") */
	locale?: LocaleName;
	/** 기준 위에 덮어쓸 문구. 한 줄만 바꿀 때 쓴다 */
	messages?: Partial<LocaleMessages>;
	children?: React.ReactNode;
}

interface LocaleContextValue {
	locale: LocaleName;
	t: LocaleText;
}

/** `{name}` 을 vars 로 치환한다. 없는 변수는 자리표시자를 그대로 남긴다 - 조용히 빈 칸이 되면
 * 화면에 무엇이 빠졌는지 알 수 없다. */
function format(template: string, vars?: Record<string, string | number>) {
	if (!vars) return template;
	return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
		name in vars ? String(vars[name]) : whole,
	);
}

function makeText(messages: LocaleMessages): LocaleText {
	return (key, vars) => format(messages[key], vars);
}

const FALLBACK: LocaleContextValue = { locale: "ko", t: makeText(ko) };

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

/**
 * DS 가 스스로 렌더하는 문구를 한곳에서 정한다.
 *
 * Provider 가 없으면 한국어 카탈로그가 그대로 쓰인다 - 기존 소비자의 화면은 바뀌지 않는다.
 *
 * @example 영어 화면
 * ```tsx
 * <LocaleProvider locale="en">
 *   <App />
 * </LocaleProvider>
 * ```
 *
 * @example 한 줄만 바꾸기
 * ```tsx
 * <LocaleProvider messages={{ "table.empty": "주문이 없습니다" }}>
 * ```
 */
export const LocaleProvider = ({ locale = "ko", messages, children }: LocaleProviderProps) => {
	// 소비자는 보통 `messages={{ "table.empty": … }}` 처럼 JSX 안에서 객체 리터럴을 넘긴다.
	// 그러면 참조가 매 렌더 바뀌어 `t` 도 매번 새로 만들어지고, 앱 루트에 놓인 Provider 라
	// 트리 전체의 `useLocaleText()` 소비자가 함께 리렌더된다. 내용이 같으면 같은 값을 유지해
	// 소비자가 상수를 밖으로 끌어올리지 않아도 되게 한다.
	const stableMessages = useStableMessages(messages);

	const value = useMemo<LocaleContextValue>(() => {
		const base = catalogs[locale];
		const merged = stableMessages ? { ...base, ...stableMessages } : base;
		return { locale, t: makeText(merged) };
	}, [locale, stableMessages]);

	return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

/** 내용이 같으면 이전 객체를 그대로 돌려준다 (얕은 비교 - 값이 전부 문자열이라 충분하다). */
function useStableMessages(messages: Partial<LocaleMessages> | undefined) {
	const ref = useRef(messages);
	const previous = ref.current;

	const same =
		previous === messages ||
		(!!previous &&
			!!messages &&
			Object.keys(previous).length === Object.keys(messages).length &&
			(Object.keys(messages) as LocaleKey[]).every((key) => previous[key] === messages[key]));

	// 렌더 중에 ref 를 쓰지 않는다 - React 가 버린 렌더의 값이 남을 수 있다 (#556 에서 같은
	// 지적을 받았다). 비교는 렌더에서 하고 갱신만 커밋 후로 미룬다.
	useEffect(() => {
		if (!same) ref.current = messages;
	}, [same, messages]);

	return same ? previous : messages;
}

/**
 * 컴포넌트가 자기 기본 문구를 꺼내는 통로. Provider 밖에서는 한국어 카탈로그를 돌려준다.
 *
 * prop 으로 받은 값이 항상 우선이다 - `closeLabel ?? t("modal.close")`.
 */
export function useLocaleText(): LocaleText {
	return (useContext(LocaleContext) ?? FALLBACK).t;
}

/** 현재 로케일 이름. 날짜·숫자 포맷을 소비자가 맞출 때 쓴다 */
export function useLocaleName(): LocaleName {
	return (useContext(LocaleContext) ?? FALLBACK).locale;
}
