/**
 * figma-snapshot.ts — Save Figma color style snapshot
 *
 * 실행: pnpm figma:snapshot
 *
 * Figma 파일의 현재 색상 스타일(이름 + 색상값)을 읽어
 * figma-snapshot.json으로 저장한다.
 * GitHub Actions에서 diff 비교 기준으로 사용됨.
 */

import { writeFileSync } from "fs";
import { resolve } from "path";
import { loadEnv, fetchColorStyles, FigmaApiError } from "./figma-utils";

loadEnv();

const FIGMA_TOKEN = process.env.FIGMA_TOKEN ?? "";
const FILE_KEY = process.env.FIGMA_FILE_KEY ?? "";

async function main(): Promise<void> {
    if (!FIGMA_TOKEN || !FILE_KEY) {
        console.error("❌ FIGMA_TOKEN 또는 FIGMA_FILE_KEY가 설정되지 않았습니다.");
        process.exit(1);
    }

    console.log("📸 Figma 색상 스냅샷 저장 중...");

    const snapshot = await fetchColorStyles(FILE_KEY, FIGMA_TOKEN);
    const count = Object.keys(snapshot.colors).length;

    const outPath = resolve(process.cwd(), "figma-snapshot.json");
    try {
        writeFileSync(outPath, JSON.stringify(snapshot, null, 2) + "\n");
    } catch (err) {
        throw new Error(`figma-snapshot.json 저장 실패: ${(err as Error).message}`);
    }

    console.log(`✅ ${count}개 색상 스타일 저장 완료`);
    console.log(`   버전: ${snapshot.version}`);
    console.log(`   수정일: ${new Date(snapshot.lastModified).toLocaleString("ko-KR")}`);
    console.log(`   파일: figma-snapshot.json`);
}

main().catch((err) => {
    if (err instanceof FigmaApiError && err.statusCode === 403) {
        console.error("❌ Figma 접근 권한이 없습니다. FIGMA_TOKEN이 유효한지 확인해주세요.");
    } else if (err instanceof FigmaApiError && err.statusCode === 404) {
        console.error("❌ Figma 파일을 찾을 수 없습니다. FIGMA_FILE_KEY를 확인해주세요.");
    } else {
        console.error(`❌ 스냅샷 저장 실패: ${err.message}`);
    }
    process.exit(1);
});
