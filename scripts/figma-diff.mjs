/**
 * Figma 색상 스타일 변경사항 감지
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

// ─── 환경변수 로드 ───────────────────────────────────────────────
function loadEnv() {
    const envPath = resolve(process.cwd(), ".env");
    if (!existsSync(envPath)) return;
    const lines = readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const [key, ...rest] = trimmed.split("=");
        if (key && rest.length && !process.env[key.trim()]) {
            process.env[key.trim()] = rest.join("=").trim();
        }
    }
}

loadEnv();

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FILE_KEY = process.env.FIGMA_FILE_KEY;

// ─── API 헬퍼 ───────────────────────────────────────────────────
async function figmaFetch(path) {
    const res = await fetch(`https://api.figma.com${path}`, {
        headers: { "X-Figma-Token": FIGMA_TOKEN },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`${res.status} ${res.statusText}: ${err.message ?? ""}`);
    }
    return res.json();
}

function rgbToHex(r, g, b) {
    return (
        "#" +
        [r, g, b]
            .map((v) => Math.round(v * 255).toString(16).padStart(2, "0"))
            .join("")
    );
}

// ─── 현재 Figma 색상 스타일 가져오기 ─────────────────────────────
async function fetchColorStyles() {
    const fileData = await figmaFetch(`/v1/files/${FILE_KEY}?depth=1`);
    const stylesMap = fileData.styles ?? {};

    const colorEntries = Object.entries(stylesMap).filter(
        ([, s]) => s.styleType === "FILL"
    );

    if (colorEntries.length === 0) {
        return { version: fileData.version, lastModified: fileData.lastModified, colors: {} };
    }

    const nodeIds = colorEntries.map(([id]) => id).join(",");
    const nodesData = await figmaFetch(
        `/v1/files/${FILE_KEY}/nodes?ids=${encodeURIComponent(nodeIds)}`
    );

    const colors = {};
    for (const [nodeId, styleMeta] of colorEntries) {
        const doc = nodesData.nodes?.[nodeId]?.document;
        const fill = doc?.fills?.[0];

        let value = null;
        if (fill?.type === "SOLID" && fill.color) {
            const { r, g, b } = fill.color;
            const opacity = fill.opacity ?? 1;
            value = opacity < 1
                ? `${rgbToHex(r, g, b)}${Math.round(opacity * 255).toString(16).padStart(2, "0")}`
                : rgbToHex(r, g, b);
        }

        colors[styleMeta.name] = { nodeId, key: styleMeta.key, value };
    }

    return { version: fileData.version, lastModified: fileData.lastModified, colors };
}

// ─── diff 계산 ──────────────────────────────────────────────────
function calcDiff(prev, current) {
    const added = [];
    const removed = [];
    const modified = [];

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

// ─── GitHub Issue 마크다운 리포트 생성 ───────────────────────────
function buildReport(diff, prevVersion, currentVersion, lastModified) {
    const lines = [
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
        lines.push("### 🔄 수정된 색상");
        lines.push("");
        lines.push("| 이름 | 변경 전 | 변경 후 |");
        lines.push("|------|---------|---------|");
        for (const { name, before, after } of diff.modified) {
            lines.push(`| \`${name}\` | \`${before ?? "unknown"}\` | \`${after ?? "unknown"}\` |`);
        }
        lines.push("");
    }

    if (diff.added.length > 0) {
        lines.push("### ➕ 추가된 색상");
        lines.push("");
        lines.push("| 이름 | 색상값 |");
        lines.push("|------|--------|");
        for (const { name, value } of diff.added) {
            lines.push(`| \`${name}\` | \`${value ?? "unknown"}\` |`);
        }
        lines.push("");
    }

    if (diff.removed.length > 0) {
        lines.push("### ➖ 삭제된 색상");
        lines.push("");
        lines.push("| 이름 | 기존 색상값 |");
        lines.push("|------|------------|");
        for (const { name, value } of diff.removed) {
            lines.push(`| \`${name}\` | \`${value ?? "unknown"}\` |`);
        }
        lines.push("");
    }

    lines.push("---");
    lines.push("");
    lines.push("> 디자인 토큰을 업데이트하려면 `src/styles/ts/colors.ts`를 수정 후 PR을 올려주세요.");

    return lines.join("\n");
}

// ─── 메인 ────────────────────────────────────────────────────────
async function main() {
    if (!FIGMA_TOKEN || !FILE_KEY) {
        console.error("❌ FIGMA_TOKEN 또는 FIGMA_FILE_KEY가 설정되지 않았습니다.");
        process.exit(1);
    }

    const snapshotPath = resolve(process.cwd(), "figma-snapshot.json");
    if (!existsSync(snapshotPath)) {
        console.log("⚠️  figma-snapshot.json이 없습니다. 먼저 pnpm figma:snapshot을 실행하세요.");
        process.exit(0);
    }

    const prev = JSON.parse(readFileSync(snapshotPath, "utf-8"));

    console.log("🔍 Figma 색상 변경사항 확인 중...");
    const current = await fetchColorStyles();

    // 버전이 같으면 변경 없음 (API 호출 최적화)
    if (prev.version === current.version) {
        console.log(`✅ 변경사항 없음 (버전: ${current.version})`);
        process.exit(0);
    }

    const diff = calcDiff(prev, current);
    const totalChanges = diff.added.length + diff.removed.length + diff.modified.length;

    if (totalChanges === 0) {
        console.log(`✅ 색상 변경 없음 (파일 버전은 변경됨: ${prev.version} → ${current.version})`);
        // 버전만 업데이트된 경우 스냅샷 갱신 후 정상 종료
        writeFileSync(snapshotPath, JSON.stringify(current, null, 2) + "\n");
        process.exit(0);
    }

    // 변경사항 출력
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

    // 리포트 파일 저장 (GitHub Actions에서 이슈 생성 시 사용)
    const report = buildReport(diff, prev.version, current.version, current.lastModified);
    const reportPath = resolve(process.cwd(), ".figma-diff-report.md");
    writeFileSync(reportPath, report);
    console.log(`\n📄 리포트 저장: .figma-diff-report.md`);

    process.exit(1); // 변경 있음 → GitHub Actions에서 이슈 생성 트리거
}

main();
