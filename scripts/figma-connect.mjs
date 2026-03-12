/**
 * Figma 연결 테스트 스크립트
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

// ─── 환경변수 로드 ──────────────────────────────────────────────
function loadEnv() {
    const envPath = resolve(process.cwd(), ".env");
    if (!existsSync(envPath)) {
        console.error("❌ .env 파일이 없습니다. .env.example을 복사해서 만들어주세요.");
        process.exit(1);
    }

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
const TEAM_ID = process.env.FIGMA_TEAM_ID;

// ─── API 헬퍼 ──────────────────────────────────────────────────
async function figmaFetch(path) {
    const res = await fetch(`https://api.figma.com${path}`, {
        headers: { "X-Figma-Token": FIGMA_TOKEN },
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(`${res.status} ${res.statusText}: ${error.message ?? ""}`);
    }

    return res.json();
}

// ─── 테스트 함수들 ────────────────────────────────────────────
async function testToken() {
    console.log("\n1️⃣  API 토큰 유효성 확인...");
    const data = await figmaFetch("/v1/me");
    console.log(`   ✅ 인증 성공: ${data.email} (${data.handle})`);
    return true;
}

async function testFileAccess() {
    console.log("\n2️⃣  파일 접근 권한 확인...");
    const data = await figmaFetch(`/v1/files/${FILE_KEY}?depth=1`);
    console.log(`   ✅ 파일 접근 성공: "${data.name}"`);
    console.log(`   📅 마지막 수정: ${new Date(data.lastModified).toLocaleString("ko-KR")}`);
    console.log(`   🔢 현재 버전: ${data.version}`);
    return data;
}

async function testColorStyles() {
    console.log("\n3️⃣  색상 스타일 (Styles) 확인...");
    try {
        // /styles 엔드포인트는 팀 라이브러리에 publish된 스타일만 반환하므로
        // 파일 전체 데이터에서 로컬 스타일을 직접 읽어옴
        const data = await figmaFetch(`/v1/files/${FILE_KEY}`);
        const stylesMap = data.styles ?? {};
        const styles = Object.entries(stylesMap).map(([id, s]) => ({ id, ...s }));

        if (styles.length === 0) {
            console.log("   ⚠️  스타일이 없습니다. Figma에서 Color Styles를 설정했는지 확인해주세요.");
            return [];
        }

        // styleType별 분류: FILL(색상), TEXT(타이포), EFFECT(그림자 등), GRID
        const byType = styles.reduce((acc, s) => {
            acc[s.styleType] = (acc[s.styleType] ?? 0) + 1;
            return acc;
        }, {});

        const colorStyles = styles.filter((s) => s.styleType === "FILL");

        console.log(`   ✅ 총 ${styles.length}개 스타일 발견`);
        for (const [type, count] of Object.entries(byType)) {
            const label = { FILL: "색상", TEXT: "텍스트", EFFECT: "이펙트", GRID: "그리드" }[type] ?? type;
            console.log(`      - ${label}: ${count}개`);
        }

        if (colorStyles.length > 0) {
            console.log(`\n   🎨 색상 스타일 목록 (최대 10개):`);
            colorStyles.slice(0, 10).forEach((s) => {
                console.log(`      - ${s.name}`);
            });
            if (colorStyles.length > 10) {
                console.log(`      ... 외 ${colorStyles.length - 10}개`);
            }
        }

        return styles;
    } catch (err) {
        console.log(`   ⚠️  Styles API 오류: ${err.message}`);
        return [];
    }
}

async function testComponents() {
    console.log("\n4️⃣  컴포넌트 목록 확인...");
    const data = await figmaFetch(`/v1/files/${FILE_KEY}/components`);
    const components = Object.values(data.meta?.components ?? {});

    if (components.length === 0) {
        console.log("   ⚠️  컴포넌트가 없습니다.");
        return [];
    }

    console.log(`   ✅ ${components.length}개 컴포넌트 발견`);

    // 최근 수정된 컴포넌트 5개 출력
    const recent = components
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 5);

    console.log("   📦 최근 수정된 컴포넌트:");
    for (const comp of recent) {
        const updated = new Date(comp.updated_at).toLocaleDateString("ko-KR");
        console.log(`      - ${comp.name} (${updated})`);
    }

    return components;
}

async function testWebhookAccess() {
    console.log("\n5️⃣  Webhook 등록 가능 여부 확인...");

    if (!TEAM_ID) {
        console.log("   ⚠️  FIGMA_TEAM_ID가 .env에 없습니다. 스킵합니다.");
        return false;
    }

    try {
        const data = await figmaFetch(`/v2/teams/${TEAM_ID}/webhooks`);
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

        return true;
    } catch (err) {
        console.log(`   ❌ Webhook API 오류: ${err.message}`);
        console.log("      Professional 플랜 확인 또는 Team ID를 다시 확인해주세요.");
        return false;
    }
}

// ─── 메인 ────────────────────────────────────────────────────
async function main() {
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
        console.error("\n❌ 연결 실패:", err.message);
        console.error("\n확인해주세요:");
        console.error("  - FIGMA_TOKEN이 올바른지");
        console.error("  - FIGMA_FILE_KEY가 올바른지 (URL에서 /file/[KEY]/ 부분)");
        process.exit(1);
    }
}

main();
