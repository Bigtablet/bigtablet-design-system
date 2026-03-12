/**
 * Figma 색상 스타일 스냅샷 저장
 *
 * 실행: pnpm figma:snapshot
 *
 * Figma 파일의 현재 색상 스타일(이름 + 색상값)을 읽어
 * figma-snapshot.json으로 저장한다.
 * GitHub Actions에서 diff 비교 기준으로 사용됨.
 */

import { writeFileSync, existsSync, readFileSync } from "fs";
import { resolve } from "path";

// ─── 환경변수 로드 ───────────────────────────────────────────────
function loadEnv() {
    const envPath = resolve(process.cwd(), ".env");
    if (!existsSync(envPath)) return; // CI 환경에서는 .env 없이 process.env 사용
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

// ─── RGB → 색상값 (불투명: hex, 반투명: rgba) ─────────────────────
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

// ─── 색상 스타일 가져오기 ─────────────────────────────────────────
export async function fetchColorStyles() {
    // 파일 메타데이터 + 스타일 목록
    const fileData = await figmaFetch(`/v1/files/${FILE_KEY}`);
    const stylesMap = fileData.styles ?? {};

    const colorEntries = Object.entries(stylesMap).filter(
        ([, s]) => s.styleType === "FILL"
    );

    if (colorEntries.length === 0) {
        return { version: fileData.version, lastModified: fileData.lastModified, colors: {} };
    }

    // 노드 상세 정보로 실제 색상값 조회
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

    return {
        version: fileData.version,
        lastModified: fileData.lastModified,
        colors,
    };
}

// ─── 메인 ────────────────────────────────────────────────────────
async function main() {
    if (!FIGMA_TOKEN || !FILE_KEY) {
        console.error("❌ FIGMA_TOKEN 또는 FIGMA_FILE_KEY가 설정되지 않았습니다.");
        process.exit(1);
    }

    console.log("📸 Figma 색상 스냅샷 저장 중...");

    const snapshot = await fetchColorStyles();
    const count = Object.keys(snapshot.colors).length;

    const outPath = resolve(process.cwd(), "figma-snapshot.json");
    writeFileSync(outPath, JSON.stringify(snapshot, null, 2) + "\n");

    console.log(`✅ ${count}개 색상 스타일 저장 완료`);
    console.log(`   버전: ${snapshot.version}`);
    console.log(`   수정일: ${new Date(snapshot.lastModified).toLocaleString("ko-KR")}`);
    console.log(`   파일: figma-snapshot.json`);
}

main();
