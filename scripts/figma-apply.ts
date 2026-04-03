/**
 * figma-apply.ts — Apply Figma color changes to source files
 *
 * 실행: pnpm figma:apply
 *
 * Figma 현재 색상 스타일과 figma-snapshot.json을 비교해
 * 변경사항을 src/styles/ts/colors.ts에 자동으로 반영한다.
 *
 * Exit code:
 *   0 = 변경 없음
 *   1 = 변경 반영 완료 (GitHub Actions에서 PR 생성 트리거)
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import {
	type ColorSnapshot,
	FigmaApiError,
	fetchColorStyles,
	loadEnv,
	parseJsonFile,
} from "./figma-utils";

loadEnv();

const FIGMA_TOKEN = process.env.FIGMA_TOKEN ?? "";
const FILE_KEY = process.env.FIGMA_FILE_KEY ?? "";

// ── Patch colors.ts ───────────────────────────────────────────────────────────

interface ModifiedEntry {
	name: string;
	before: string | null;
	after: string | null;
}
interface ValueEntry {
	name: string;
	value: string | null;
}

function applyToColorsTs(modified: ModifiedEntry[], added: ValueEntry[]): void {
	const colorsPath = resolve(process.cwd(), "src/styles/ts/colors.ts");

	if (!existsSync(colorsPath)) {
		throw new Error(`colors.ts 파일을 찾을 수 없습니다: ${colorsPath}`);
	}

	let content: string;
	try {
		content = readFileSync(colorsPath, "utf-8");
	} catch (err) {
		throw new Error(`colors.ts 읽기 실패: ${(err as Error).message}`);
	}

	// 백업 저장 (쓰기 실패 시 복구 가능)
	writeFileSync(colorsPath + ".bak", content);

	for (const { name, after } of modified) {
		const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const regex = new RegExp(`([ \\t]+${escapedName}:\\s*)["'][^"'\\n]*["']`);
		if (regex.test(content)) {
			content = content.replace(regex, `$1"${after}"`);
		} else {
			console.warn(`   ⚠️  colors.ts에서 '${name}' 키를 찾지 못했습니다.`);
		}
	}

	if (added.length > 0) {
		const newLines = added.map(({ name, value }) => `    ${name}: "${value}",`).join("\n");
		content = content.replace(/^} as const;/m, `${newLines}\n} as const;`);
	}

	try {
		writeFileSync(colorsPath, content);
	} catch (err) {
		// 쓰기 실패 시 백업 복원
		try {
			writeFileSync(colorsPath, readFileSync(colorsPath + ".bak", "utf-8"));
		} catch {
			/* 복원도 실패하면 포기 */
		}
		throw new Error(`colors.ts 쓰기 실패: ${(err as Error).message}`);
	}
}

// ── Patch _colors.scss ────────────────────────────────────────────────────────

const SCSS_VAR_MAP: Record<string, string> = {
	primary: "$color_primary",
	primaryHover: "$color_primary_hover",
	background: "$color_background",
	backgroundSecondary: "$color_background_secondary",
	textPrimary: "$color_text_primary",
	textSecondary: "$color_text_secondary",
	textTertiary: "$color_text_tertiary",
	textStrong: "$text_strong",
	textNormal: "$text_normal",
	textSubtle: "$text_subtle",
	textDisabled: "$text_disabled",
	textInverse: "$text_inverse",
	border: "$color_border",
	borderLight: "$color_border_light",
	success: "$color_success",
	error: "$color_error",
	warning: "$color_warning",
	info: "$color_info",
	overlay: "$color_overlay",
	hoverSubtle: "$color_hover_subtle",
	hoverLight: "$color_hover_light",
};

function camelToScss(name: string): string {
	return "$color_" + name.replace(/([A-Z])/g, "_$1").toLowerCase();
}

function applyToColorsSCSS(modified: ModifiedEntry[], added: ValueEntry[]): void {
	const scssPath = resolve(process.cwd(), "src/styles/scss/_colors.scss");

	if (!existsSync(scssPath)) {
		throw new Error(`_colors.scss 파일을 찾을 수 없습니다: ${scssPath}`);
	}

	let content: string;
	try {
		content = readFileSync(scssPath, "utf-8");
	} catch (err) {
		throw new Error(`_colors.scss 읽기 실패: ${(err as Error).message}`);
	}

	// 백업 저장
	writeFileSync(scssPath + ".bak", content);

	for (const { name, after } of modified) {
		const scssVar = SCSS_VAR_MAP[name] ?? camelToScss(name);
		const escapedVar = scssVar.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const regex = new RegExp(`(${escapedVar}:\\s*)[^;\\n]+`);
		if (regex.test(content)) {
			content = content.replace(regex, `$1${after}`);
		} else {
			console.warn(`   ⚠️  _colors.scss에서 '${scssVar}' 변수를 찾지 못했습니다.`);
		}
	}

	if (added.length > 0) {
		const newLines = added.map(({ name, value }) => `${camelToScss(name)}: ${value};`).join("\n");
		content = content.trimEnd() + "\n\n/* Figma Synced */\n" + newLines + "\n";
	}

	try {
		writeFileSync(scssPath, content);
	} catch (err) {
		try {
			writeFileSync(scssPath, readFileSync(scssPath + ".bak", "utf-8"));
		} catch {
			/* 복원 실패 포기 */
		}
		throw new Error(`_colors.scss 쓰기 실패: ${(err as Error).message}`);
	}
}

// ── PR body ───────────────────────────────────────────────────────────────────

interface Diff {
	modified: ModifiedEntry[];
	added: ValueEntry[];
	removed: ValueEntry[];
}

function buildPrBody(
	diff: Diff,
	prevVersion: string,
	currentVersion: string,
	lastModified: string,
): string {
	const workItems: string[] = [];

	for (const { name, before, after } of diff.modified) {
		workItems.push(
			`- [x] \`${name}\` 색상 수정: \`${before ?? "unknown"}\` → \`${after ?? "unknown"}\``,
		);
	}
	for (const { name, value } of diff.added) {
		workItems.push(`- [x] \`${name}\` 색상 추가: \`${value ?? "unknown"}\``);
	}
	for (const { name } of diff.removed) {
		workItems.push(`- [ ] \`${name}\` 색상 삭제 여부 확인 필요 (자동 반영 제외)`);
	}

	const extraIssues =
		diff.removed.length > 0
			? diff.removed
					.map(({ name }) => `- \`${name}\`이 Figma에서 삭제됨 — 코드에서 수동으로 제거 필요`)
					.join("\n")
			: "- 없음";

	return [
		"## 제목",
		"fix/figma-color-sync",
		"",
		"## 작업한 내용",
		workItems.join("\n"),
		"",
		`> 피그마 버전: \`${prevVersion}\` → \`${currentVersion}\`  `,
		`> 수정일: ${new Date(lastModified).toLocaleString("ko-KR")}`,
		"",
		"## 전달할 추가 이슈",
		extraIssues,
	].join("\n");
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
	if (!FIGMA_TOKEN || !FILE_KEY) {
		console.error("❌ FIGMA_TOKEN 또는 FIGMA_FILE_KEY가 설정되지 않았습니다.");
		process.exit(1);
	}

	const snapshotPath = resolve(process.cwd(), "figma-snapshot.json");
	if (!existsSync(snapshotPath)) {
		console.log("⚠️  figma-snapshot.json이 없습니다. 먼저 pnpm figma:snapshot을 실행하세요.");
		process.exit(0);
	}

	const prev = parseJsonFile<ColorSnapshot>(snapshotPath, "figma-snapshot.json");

	if (!prev.version || !prev.colors) {
		console.error(
			"❌ figma-snapshot.json 구조가 올바르지 않습니다. pnpm figma:snapshot을 다시 실행해주세요.",
		);
		process.exit(1);
	}

	console.log("🔍 Figma 색상 변경사항 확인 중...");
	const current = await fetchColorStyles(FILE_KEY, FIGMA_TOKEN);

	if (prev.version === current.version) {
		console.log(`✅ 변경사항 없음 (버전: ${current.version})`);
		process.exit(0);
	}

	const added: ValueEntry[] = [];
	const removed: ValueEntry[] = [];
	const modified: ModifiedEntry[] = [];

	for (const [name, data] of Object.entries(current.colors)) {
		if (!prev.colors[name]) {
			added.push({ name, value: data.value });
		} else if (prev.colors[name].value !== data.value) {
			modified.push({ name, before: prev.colors[name].value, after: data.value });
		}
	}
	for (const name of Object.keys(prev.colors)) {
		if (!current.colors[name]) {
			removed.push({ name, value: prev.colors[name].value });
		}
	}

	const totalChanges = added.length + removed.length + modified.length;
	if (totalChanges === 0) {
		console.log("✅ 색상 변경 없음 (파일 버전만 변경됨)");
		writeFileSync(snapshotPath, JSON.stringify(current, null, 2) + "\n");
		process.exit(0);
	}

	console.log(`\n⚠️  색상 변경 감지 (${totalChanges}건)`);
	if (modified.length > 0) {
		console.log(`\n🔄 수정 (${modified.length}개):`);
		modified.forEach(({ name, before, after }) => console.log(`   ${name}: ${before} → ${after}`));
	}
	if (added.length > 0) {
		console.log(`\n➕ 추가 (${added.length}개):`);
		added.forEach(({ name, value }) => console.log(`   ${name}: ${value}`));
	}
	if (removed.length > 0) {
		console.log(`\n➖ 삭제 감지 (${removed.length}개) — colors.ts에서 수동 확인 필요:`);
		removed.forEach(({ name }) => console.log(`   ${name}`));
	}

	console.log("\n✏️  colors.ts 업데이트 중...");
	applyToColorsTs(modified, added);
	console.log("   ✅ colors.ts 업데이트 완료");

	console.log("✏️  _colors.scss 업데이트 중...");
	applyToColorsSCSS(modified, added);
	console.log("   ✅ _colors.scss 업데이트 완료");

	writeFileSync(snapshotPath, JSON.stringify(current, null, 2) + "\n");
	console.log("   ✅ figma-snapshot.json 업데이트 완료");

	const prBody = buildPrBody(
		{ added, removed, modified },
		prev.version,
		current.version,
		current.lastModified,
	);
	writeFileSync(resolve(process.cwd(), ".figma-pr-body.md"), prBody);

	process.exit(1);
}

main().catch((err) => {
	if (err instanceof FigmaApiError && err.statusCode === 403) {
		console.error("❌ Figma 접근 권한이 없습니다. FIGMA_TOKEN이 유효한지 확인해주세요.");
	} else if (err instanceof FigmaApiError && err.statusCode === 404) {
		console.error("❌ Figma 파일을 찾을 수 없습니다. FIGMA_FILE_KEY를 확인해주세요.");
	} else {
		console.error(`❌ apply 실패: ${err.message}`);
	}
	process.exit(1);
});
