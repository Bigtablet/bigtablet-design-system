/**
 * Figma 색상 변경사항 → colors.ts 자동 반영
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

import { readFileSync, writeFileSync, existsSync } from "fs";
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

function rgbToValue(r, g, b, opacity) {
    if (opacity < 1) {
        const ro = Math.round(opacity * 100) / 100;
        return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${ro})`;
    }
    return (
        "#" +
        [r, g, b]
            .map((v) => Math.round(v * 255).toString(16).padStart(2, "0"))
            .join("")
    );
}

// ─── 현재 Figma 색상 스타일 가져오기 ─────────────────────────────
async function fetchColorStyles() {
    const fileData = await figmaFetch(`/v1/files/${FILE_KEY}`);
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
            value = rgbToValue(r, g, b, fill.opacity ?? 1);
        }

        colors[styleMeta.name] = { nodeId, key: styleMeta.key, value };
    }

    return { version: fileData.version, lastModified: fileData.lastModified, colors };
}

// ─── colors.ts 수정 ──────────────────────────────────────────────
function applyToColorsTs(modified, added) {
    const colorsPath = resolve(process.cwd(), "src/styles/ts/colors.ts");
    let content = readFileSync(colorsPath, "utf-8");

    // 수정된 색상값 교체
    for (const { name, after } of modified) {
        // `    name: "값",` 또는 `    name: 'rgba(...)',` 패턴 교체
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`([ \\t]+${escapedName}:\\s*)["'][^"'\\n]*["']`);
        if (regex.test(content)) {
            content = content.replace(regex, `$1"${after}"`);
        } else {
            console.warn(`   ⚠️  colors.ts에서 '${name}' 키를 찾지 못했습니다.`);
        }
    }

    // 새로 추가된 색상 삽입 (} as const 바로 앞)
    if (added.length > 0) {
        const newLines = added
            .map(({ name, value }) => `    ${name}: "${value}",`)
            .join("\n");
        content = content.replace(/^} as const;/m, `${newLines}\n} as const;`);
    }

    writeFileSync(colorsPath, content);
}

// ─── _colors.scss 수정 ───────────────────────────────────────────

// colors.ts 키 → SCSS 변수명 매핑 (기존 파일의 네이밍 불일치 처리)
const SCSS_VAR_MAP = {
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

// 새 색상 추가 시 기본 변수명 생성: camelCase → $color_snake_case
function camelToScss(name) {
    return "$color_" + name.replace(/([A-Z])/g, "_$1").toLowerCase();
}

function applyToColorsSCSS(modified, added) {
    const scssPath = resolve(process.cwd(), "src/styles/scss/_colors.scss");
    let content = readFileSync(scssPath, "utf-8");

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
        const newLines = added
            .map(({ name, value }) => `${camelToScss(name)}: ${value};`)
            .join("\n");
        content = content.trimEnd() + "\n\n/* Figma Synced */\n" + newLines + "\n";
    }

    writeFileSync(scssPath, content);
}

// ─── PR 본문 생성 (git-workflow.md 포맷) ────────────────────────
function buildPrBody(diff, prevVersion, currentVersion, lastModified) {
    const workItems = [];

    for (const { name, before, after } of diff.modified) {
        workItems.push(`- [x] \`${name}\` 색상 수정: \`${before ?? "unknown"}\` → \`${after ?? "unknown"}\``);
    }
    for (const { name, value } of diff.added) {
        workItems.push(`- [x] \`${name}\` 색상 추가: \`${value ?? "unknown"}\``);
    }
    for (const { name } of diff.removed) {
        workItems.push(`- [ ] \`${name}\` 색상 삭제 여부 확인 필요 (자동 반영 제외)`);
    }

    const extraIssues =
        diff.removed.length > 0
            ? diff.removed.map(({ name }) => `- \`${name}\`이 Figma에서 삭제됨 — 코드에서 수동으로 제거 필요`).join("\n")
            : "- 없음";

    return [
        "## 제목",
        `fix/figma-color-sync`,
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

    // 버전 동일 → 변경 없음
    if (prev.version === current.version) {
        console.log(`✅ 변경사항 없음 (버전: ${current.version})`);
        process.exit(0);
    }

    // diff 계산
    const added = [], removed = [], modified = [];
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

    // 변경사항 출력
    console.log(`\n⚠️  색상 변경 감지 (${totalChanges}건)`);
    if (modified.length > 0) {
        console.log(`\n🔄 수정 (${modified.length}개):`);
        modified.forEach(({ name, before, after }) =>
            console.log(`   ${name}: ${before} → ${after}`)
        );
    }
    if (added.length > 0) {
        console.log(`\n➕ 추가 (${added.length}개):`);
        added.forEach(({ name, value }) => console.log(`   ${name}: ${value}`));
    }
    if (removed.length > 0) {
        console.log(`\n➖ 삭제 감지 (${removed.length}개) — colors.ts에서 수동 확인 필요:`);
        removed.forEach(({ name }) => console.log(`   ${name}`));
    }

    // colors.ts 자동 반영
    console.log("\n✏️  colors.ts 업데이트 중...");
    applyToColorsTs(modified, added);
    console.log("   ✅ colors.ts 업데이트 완료");

    // _colors.scss 자동 반영
    console.log("✏️  _colors.scss 업데이트 중...");
    applyToColorsSCSS(modified, added);
    console.log("   ✅ _colors.scss 업데이트 완료");

    // 스냅샷 갱신
    writeFileSync(snapshotPath, JSON.stringify(current, null, 2) + "\n");
    console.log("   ✅ figma-snapshot.json 업데이트 완료");

    // PR 본문 저장
    const prBody = buildPrBody({ added, removed, modified }, prev.version, current.version, current.lastModified);
    writeFileSync(resolve(process.cwd(), ".figma-pr-body.md"), prBody);

    process.exit(1); // 변경 있음 → GitHub Actions PR 생성 트리거
}

main();
