/**
 * figma-connect.ts — Figma connection diagnostic
 *
 * 실행: pnpm figma:test
 *
 * 확인 항목:
 *   1. Figma API 토큰 유효성
 *   2. 파일 접근 권한
 *   3. 색상 스타일 (Styles API) 목록
 *   4. 컴포넌트 목록
 *   5. 팀 Webhook 등록 가능 여부
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { figmaFetch, FigmaApiError } from "./figma-utils";

// ── Env loader (requires .env — fails hard if missing) ───────────────────────

function loadEnv(): void {
    const envPath = resolve(process.cwd(), ".env");
    if (!existsSync(envPath)) {
        console.error("❌ .env 파일이 없습니다. .env.example을 복사해서 만들어주세요.");
        process.exit(1);
    }
    let lines: string[];
    try {
        lines = readFileSync(envPath, "utf-8").split("\n");
    } catch (err) {
        console.error(`❌ .env 파일을 읽을 수 없습니다: ${(err as Error).message}`);
        process.exit(1);
    }
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const [key, ...rest] = trimmed.split("=");
        if (key && rest.length) {
            process.env[key.trim()] = rest.join("=").trim();
        }
    }
}

loadEnv();

const FIGMA_TOKEN = process.env.FIGMA_TOKEN ?? "";
const FILE_KEY = process.env.FIGMA_FILE_KEY ?? "";
const TEAM_ID = process.env.FIGMA_TEAM_ID ?? "";

// ── Test functions ────────────────────────────────────────────────────────────

async function testToken(): Promise<void> {
    console.log("\n1️⃣  API 토큰 유효성 확인...");
    try {
        const data = await figmaFetch<{ email: string; handle: string }>("/v1/me", FIGMA_TOKEN);
        console.log(`   ✅ 인증 성공: ${data.email} (${data.handle})`);
    } catch (err) {
        const e = err as FigmaApiError;
        if (e.statusCode === 403) {
            throw new FigmaApiError("FIGMA_TOKEN이 유효하지 않거나 만료되었습니다.", 403);
        }
        throw err;
    }
}

async function testFileAccess(): Promise<void> {
    console.log("\n2️⃣  파일 접근 권한 확인...");
    try {
        const data = await figmaFetch<{ name: string; lastModified: string; version: string }>(
            `/v1/files/${FILE_KEY}?depth=1`,
            FIGMA_TOKEN
        );
        console.log(`   ✅ 파일 접근 성공: "${data.name}"`);
        console.log(`   📅 마지막 수정: ${new Date(data.lastModified).toLocaleString("ko-KR")}`);
        console.log(`   🔢 현재 버전: ${data.version}`);
    } catch (err) {
        const e = err as FigmaApiError;
        if (e.statusCode === 404) {
            throw new FigmaApiError(
                `파일을 찾을 수 없습니다. FIGMA_FILE_KEY("${FILE_KEY}")가 올바른지 확인해주세요.`,
                404
            );
        }
        if (e.statusCode === 403) {
            throw new FigmaApiError("파일 접근 권한이 없습니다. 파일이 공유되어 있는지 확인해주세요.", 403);
        }
        throw err;
    }
}

async function testColorStyles(): Promise<void> {
    console.log("\n3️⃣  색상 스타일 (Styles) 확인...");
    try {
        const data = await figmaFetch<{
            styles?: Record<string, { styleType: string; name: string }>;
        }>(`/v1/files/${FILE_KEY}`, FIGMA_TOKEN);

        const stylesMap = data.styles ?? {};
        const styles = Object.entries(stylesMap).map(([id, s]) => ({ id, ...s }));

        if (styles.length === 0) {
            console.log("   ⚠️  스타일이 없습니다. Figma에서 Color Styles를 설정했는지 확인해주세요.");
            return;
        }

        const byType = styles.reduce<Record<string, number>>((acc, s) => {
            acc[s.styleType] = (acc[s.styleType] ?? 0) + 1;
            return acc;
        }, {});

        const colorStyles = styles.filter((s) => s.styleType === "FILL");
        const typeLabels: Record<string, string> = { FILL: "색상", TEXT: "텍스트", EFFECT: "이펙트", GRID: "그리드" };

        console.log(`   ✅ 총 ${styles.length}개 스타일 발견`);
        for (const [type, count] of Object.entries(byType)) {
            console.log(`      - ${typeLabels[type] ?? type}: ${count}개`);
        }

        if (colorStyles.length > 0) {
            console.log(`\n   🎨 색상 스타일 목록 (최대 10개):`);
            colorStyles.slice(0, 10).forEach((s) => console.log(`      - ${s.name}`));
            if (colorStyles.length > 10) {
                console.log(`      ... 외 ${colorStyles.length - 10}개`);
            }
        }
    } catch (err) {
        // 스타일 확인 실패는 치명적이지 않으므로 경고만 출력
        console.log(`   ⚠️  Styles API 오류: ${(err as Error).message}`);
    }
}

async function testComponents(): Promise<void> {
    console.log("\n4️⃣  컴포넌트 목록 확인...");
    try {
        const data = await figmaFetch<{
            meta?: { components?: Record<string, { name: string; updated_at: string }> };
        }>(`/v1/files/${FILE_KEY}/components`, FIGMA_TOKEN);

        const components = Object.values(data.meta?.components ?? {});
        if (components.length === 0) {
            console.log("   ⚠️  컴포넌트가 없습니다.");
            return;
        }

        console.log(`   ✅ ${components.length}개 컴포넌트 발견`);
        const recent = components
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .slice(0, 5);

        console.log("   📦 최근 수정된 컴포넌트:");
        for (const comp of recent) {
            const updated = new Date(comp.updated_at).toLocaleDateString("ko-KR");
            console.log(`      - ${comp.name} (${updated})`);
        }
    } catch (err) {
        // 컴포넌트 목록 실패는 치명적이지 않으므로 경고만 출력
        console.log(`   ⚠️  컴포넌트 목록 조회 실패: ${(err as Error).message}`);
    }
}

async function testWebhookAccess(): Promise<void> {
    console.log("\n5️⃣  Webhook 등록 가능 여부 확인...");
    if (!TEAM_ID) {
        console.log("   ⚠️  FIGMA_TEAM_ID가 .env에 없습니다. 스킵합니다.");
        return;
    }
    try {
        const data = await figmaFetch<{
            webhooks?: { event_type: string; endpoint: string; status: string }[];
        }>(`/v2/teams/${TEAM_ID}/webhooks`, FIGMA_TOKEN);

        const webhooks = data.webhooks ?? [];
        console.log(`   ✅ Webhook API 접근 성공`);

        if (webhooks.length > 0) {
            console.log(`   📡 등록된 Webhook: ${webhooks.length}개`);
            for (const wh of webhooks) {
                console.log(`      - [${wh.event_type}] ${wh.endpoint} (${wh.status})`);
            }
        } else {
            console.log("   📭 등록된 Webhook 없음");
        }
    } catch (err) {
        console.log(`   ❌ Webhook API 오류: ${(err as Error).message}`);
        console.log("      Professional 플랜 확인 또는 Team ID를 다시 확인해주세요.");
    }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
    console.log("🔗 Figma 연결 테스트 시작\n" + "─".repeat(40));

    if (!FIGMA_TOKEN || FIGMA_TOKEN === "figd_xxxxxxxxxxxxxxxxxxxx") {
        console.error("❌ FIGMA_TOKEN이 설정되지 않았습니다. .env 파일을 확인해주세요.");
        process.exit(1);
    }
    if (!FILE_KEY || FILE_KEY === "xxxxxxxxxxxxxxxxxxxx") {
        console.error("❌ FIGMA_FILE_KEY가 설정되지 않았습니다. .env 파일을 확인해주세요.");
        process.exit(1);
    }

    try {
        await testToken();
        await testFileAccess();
        await testColorStyles();
        await testComponents();
        await testWebhookAccess();

        console.log("\n" + "─".repeat(40));
        console.log("✅ 연결 테스트 완료! 다음 단계: pnpm figma:snapshot\n");
    } catch (err) {
        console.error(`\n❌ 연결 실패: ${(err as Error).message}`);
        if (!(err instanceof FigmaApiError)) {
            console.error("확인해주세요:");
            console.error("  - FIGMA_TOKEN이 올바른지");
            console.error("  - FIGMA_FILE_KEY가 올바른지 (URL에서 /file/[KEY]/ 부분)");
        }
        process.exit(1);
    }
}

main();
