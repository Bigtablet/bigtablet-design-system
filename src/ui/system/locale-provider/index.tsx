"use client";

import type * as React from "react";
import { createContext, useContext, useMemo } from "react";
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
	const value = useMemo<LocaleContextValue>(() => {
		const base = catalogs[locale];
		// 덮어쓸 게 없으면 기준 카탈로그를 그대로 쓴다 - 매 렌더 객체를 새로 만들지 않게.
		const merged = messages ? { ...base, ...messages } : base;
		return { locale, t: makeText(merged) };
	}, [locale, messages]);

	return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

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
