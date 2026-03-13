/**
 * figma-diff.ts — Detect Figma color style changes
 *
 * 실행: pnpm figma:diff
 *
 * figma-snapshot.json(이전)과 현재 Figma 상태를 비교한다.
 * - 변경 없음: exit 0
 * - 변경 있음: .figma-diff-report.md 저장 후 exit 1
 *   (GitHub Actions에서 이슈 자동 생성 트리거)
 */

import { writeFileSync, existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { loadEnv, fetchColorStyles, type ColorSnapshot } from "./figma-utils";

loadEnv();

const FIGMA_TOKEN = process.env.FIGMA_TOKEN ?? "";
const FILE_KEY = process.env.FIGMA_FILE_KEY ?? "";

// ── Diff ─────────────────────────────────────────────────────────────────────

interface DiffEntry { name: string; value: string | null }
interface ModifiedEntry { name: string; before: string | null; after: string | null }

interface Diff {
    added: DiffEntry[];
    removed: DiffEntry[];
    modified: ModifiedEntry[];
}

function calcDiff(prev: ColorSnapshot, current: ColorSnapshot): Diff {
    const added: DiffEntry[] = [];
    const removed: DiffEntry[] = [];
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

    return { added, removed, modified };
}

// ── Markdown report ───────────────────────────────────────────────────────────

function buildReport(
    diff: Diff,
    prevVersion: string,
    currentVersion: string,
    lastModified: string
): string {
    const lines: string[] = [
        "## 🎨 Figma 색상 스타일 변경 감지",
        "",
        `| | |`,
        `|---|---|`,
        `| **이전 버전** | \`${prevVersion}\` |`,
        `| **현재 버전** | \`${currentVersion}\` |`,
        `| **수정일** | ${new Date(lastModified).toLocaleString("ko-KR")} |`,
        "",
    ];

    if (diff.modified.length > 0) {
        lines.push("### 🔄 수정된 색상", "", "| 이름 | 변경 전 | 변경 후 |", "|------|---------|---------|");
        for (const { name, before, after } of diff.modified) {
            lines.push(`| \`${name}\` | \`${before ?? "unknown"}\` | \`${after ?? "unknown"}\` |`);
        }
        lines.push("");
    }

    if (diff.added.length > 0) {
        lines.push("### ➕ 추가된 색상", "", "| 이름 | 색상값 |", "|------|--------|");
        for (const { name, value } of diff.added) {
            lines.push(`| \`${name}\` | \`${value ?? "unknown"}\` |`);
        }
        lines.push("");
    }

    if (diff.removed.length > 0) {
        lines.push("### ➖ 삭제된 색상", "", "| 이름 | 기존 색상값 |", "|------|------------|");
        for (const { name, value } of diff.removed) {
            lines.push(`| \`${name}\` | \`${value ?? "unknown"}\` |`);
        }
        lines.push("");
    }

    lines.push(
        "---",
        "",
        "> 디자인 토큰을 업데이트하려면 `src/styles/ts/colors.ts`를 수정 후 PR을 올려주세요."
    );

    return lines.join("\n");
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

    const prev: ColorSnapshot = JSON.parse(readFileSync(snapshotPath, "utf-8"));

    console.log("🔍 Figma 색상 변경사항 확인 중...");
    const current = await fetchColorStyles(FILE_KEY, FIGMA_TOKEN);

    if (prev.version === current.version) {
        console.log(`✅ 변경사항 없음 (버전: ${current.version})`);
        process.exit(0);
    }

    const diff = calcDiff(prev, current);
    const totalChanges = diff.added.length + diff.removed.length + diff.modified.length;

    if (totalChanges === 0) {
        console.log(`✅ 색상 변경 없음 (파일 버전은 변경됨: ${prev.version} → ${current.version})`);
        writeFileSync(snapshotPath, JSON.stringify(current, null, 2) + "\n");
        process.exit(0);
    }

    console.log(`\n⚠️  색상 변경 감지 (${totalChanges}건)`);
    if (diff.modified.length > 0) {
        console.log(`\n🔄 수정 (${diff.modified.length}개):`);
        diff.modified.forEach(({ name, before, after }) =>
            console.log(`   ${name}: ${before} → ${after}`)
        );
    }
    if (diff.added.length > 0) {
        console.log(`\n➕ 추가 (${diff.added.length}개):`);
        diff.added.forEach(({ name, value }) => console.log(`   ${name}: ${value}`));
    }
    if (diff.removed.length > 0) {
        console.log(`\n➖ 삭제 (${diff.removed.length}개):`);
        diff.removed.forEach(({ name }) => console.log(`   ${name}`));
    }

    const report = buildReport(diff, prev.version, current.version, current.lastModified);
    const reportPath = resolve(process.cwd(), ".figma-diff-report.md");
    writeFileSync(reportPath, report);
    console.log(`\n📄 리포트 저장: .figma-diff-report.md`);

    process.exit(1);
}

main();
