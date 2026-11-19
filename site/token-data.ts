// 토큰 원본(tokens.json)을 표로 펼친다 - React 없음. 사이트 Foundation 페이지와 에이전트 문서(dist/llms/tokens.md)가
// 같은 함수로 같은 표를 낸다 (#1093)
import tokens from "../src/styles/tokens.json";
import { undash } from "./undash";

type Node = { [key: string]: unknown };
export interface Token {
	/** 경로 마지막 이름 (text.heading) */
	name: string;
	/** `token.$color_text_heading` · `@include token.heading_large` */
	scss?: string;
	/** `--bt-color-text-heading` */
	css?: string;
	light: unknown;
	dark?: unknown;
	description?: string;
}

const isToken = (n: unknown): n is Node => typeof n === "object" && n !== null && "$value" in n;

/** `{base.color.neutral-900}` 참조를 원값까지 푼다 (문자열 안에 섞인 참조 포함) */
function resolve(value: unknown): unknown {
	if (typeof value === "string") {
		const whole = value.match(/^\{([^}]+)\}$/);
		if (whole) return resolve(lookup(whole[1] as string));
		return value.replace(/\{([^}]+)\}/g, (_, path: string) => String(resolve(lookup(path))));
	}
	if (Array.isArray(value)) return value.map(resolve);
	if (value && typeof value === "object") {
		return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolve(v)]));
	}
	return value;
}

function lookup(path: string): unknown {
	const node = path.split(".").reduce<unknown>((n, key) => (n as Node)?.[key], tokens);
	return isToken(node) ? node.$value : node;
}

/**
 * tokens.json 의 $description 은 대부분 유지보수 메모(대비값 · 예전 값 · 결정 이유)라 표에는 짧은 것만 싣는다.
 * 묶음 전체에 해당하는 메모(spacing 0 의 var() 설명 등)는 페이지의 Group desc 가 맡는다.
 * 묶음 첫 토큰에 붙은 "Text" · "Brand" 같은 묶음 이름도 설명이 아니다
 */
const summaryOf = (description: unknown) => {
	const text = String(description ?? "");
	return /\s/.test(text) && text.length <= 60 ? undash(text) : undefined;
};

const toToken = (name: string, node: Node): Token => {
	const ext = (node.$extensions ?? {}) as Record<string, Record<string, string>>;
	const own = ext["com.bigtablet"] ?? {};
	const scss = own.scss?.split("/")[1];
	return {
		name,
		scss: scss && (scss.startsWith("@") ? `@include token.${scss.slice(1)}` : `token.$${scss}`),
		css: own.css,
		light: resolve(node.$value),
		dark: ext["com.bigtablet.theme"]?.dark && resolve(ext["com.bigtablet.theme"].dark),
		description: summaryOf(node.$description),
	};
};

/**
 * 묶음 아래 토큰을 펼친다 - 이름은 묶음 기준 상대 경로.
 * 경로가 토큰 하나(`semantic.typography.caption`)면 그 토큰 하나를 돌려준다
 */
export function collect(path: string): Token[] {
	const keys = path.split(".");
	const root = keys.reduce<unknown>((n, key) => (n as Node)?.[key], tokens) as Node;
	if (isToken(root)) return [toToken(keys.at(-1) as string, root)];
	const out: Token[] = [];
	const walk = (node: Node, prefix: string) => {
		for (const [key, child] of Object.entries(node)) {
			if (key.startsWith("$")) continue;
			const name = prefix ? `${prefix}.${key}` : key;
			if (isToken(child)) out.push(toToken(name, child));
			else if (child && typeof child === "object") walk(child as Node, name);
		}
	};
	walk(root, "");
	return out;
}

export const shadowOf = (value: unknown) =>
	(Array.isArray(value) ? value : [value])
		.map((s) => {
			const { x, y, blur, spread, color } = s as Record<string, string | number>;
			return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
		})
		.join(", ");

/** 표에 쓸 문자열 - 그림자(배열)는 CSS 값으로 */
export const show = (value: unknown) =>
	typeof value === "object" ? shadowOf(value) : String(value);

/** 색 묶음 - [tokens.json 키, 제목, 설명] */
export const COLOR_GROUPS: [string, string, string][] = [
	["text", "텍스트", "글자색. 테마 표면 위 글자에는 이 묶음만 씁니다."],
	["bg", "배경", "페이지 · 카드 · 입력의 바탕."],
	["border", "테두리", ""],
	["brand", "브랜드", "브랜드 표면과 그 위 글자는 짝으로 씁니다 (primary ↔ on-primary)."],
	["accent", "강조", ""],
	[
		"status",
		"상태",
		"배경 · 테두리용과 글자용(`-on-surface`)이 나뉩니다. 글자에 배경용을 쓰면 다크에서 대비가 무너집니다. `warning-graphic` 은 아이콘 · 막대 전용이라 글자에 쓰지 않습니다.",
	],
	["state", "상호작용 상태", "hover · pressed 등 겹쳐 칠하는 반투명 색."],
	["scrim", "딤", "오버레이 뒤를 가리는 색."],
	["skeleton", "스켈레톤", ""],
];

/** 글자 역할 묶음 - 사이트 순서 */
export const TYPE_GROUPS = [
	"display",
	"heading",
	"title",
	"subtitle",
	"body",
	"label",
	"caption",
	"caption-bold",
	"overline",
	"code",
];
