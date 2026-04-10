/**
 * Storybook 빌드 결과물에 간이 비번 보호를 추가한다.
 *
 * 1. storybook-static/ 내용물을 storybook-static/storybook/으로 이동
 * 2. storybook-static/index.html에 비번 입력 페이지 생성
 * 3. storybook-static/storybook/index.html에 세션 검증 스크립트 삽입
 *
 * 환경변수:
 *   STORYBOOK_PASSWORD_HASH — SHA-256 해시 (없으면 에러)
 */

import fs from "node:fs";
import path from "node:path";

const DIST = "storybook-static";
const SB_DIR = path.join(DIST, "storybook");
const HASH = process.env.STORYBOOK_PASSWORD_HASH?.trim();

if (!HASH) {
	console.error("❌ STORYBOOK_PASSWORD_HASH 환경변수가 설정되지 않았습니다.");
	process.exit(1);
}

// ── 1. storybook-static/ → storybook-static/storybook/ 이동 ────────────

fs.mkdirSync(SB_DIR, { recursive: true });

for (const entry of fs.readdirSync(DIST)) {
	if (entry === "storybook") continue;
	fs.renameSync(path.join(DIST, entry), path.join(SB_DIR, entry));
}

console.log("✓ Storybook files moved to /storybook/");

// ── 2. 비번 입력 페이지 (index.html) ───────────────────────────────────

const loginPage = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bigtablet Design System</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #fafafa;
    color: #1a1a1a;
  }
  .card {
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 12px;
    padding: 40px;
    width: 100%;
    max-width: 380px;
    text-align: center;
  }
  h1 { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
  p { font-size: 14px; color: #666; margin-bottom: 24px; }
  .field {
    display: flex;
    gap: 8px;
  }
  input {
    flex: 1;
    padding: 10px 14px;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }
  input:focus { border-color: #1a1a1a; }
  button {
    padding: 10px 20px;
    background: #1a1a1a;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    white-space: nowrap;
  }
  button:hover { background: #333; }
  .error {
    margin-top: 12px;
    font-size: 13px;
    color: #ef4444;
    display: none;
  }
</style>
</head>
<body>
<div class="card">
  <h1>Bigtablet Design System</h1>
  <p>Storybook에 접근하려면 비밀번호를 입력하세요.</p>
  <form class="field" onsubmit="return handleSubmit(event)">
    <input id="pw" type="password" placeholder="Password" autofocus autocomplete="off">
    <button type="submit">Enter</button>
  </form>
  <div class="error" id="err">비밀번호가 올바르지 않습니다.</div>
</div>
<script>
const EXPECTED = "${HASH}";
async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}
async function handleSubmit(e) {
  e.preventDefault();
  const hash = await sha256(document.getElementById("pw").value);
  if (hash === EXPECTED) {
    sessionStorage.setItem("sb-auth", hash);
    window.location.href = "./storybook/";
  } else {
    document.getElementById("err").style.display = "block";
  }
  return false;
}
</script>
</body>
</html>`;

fs.writeFileSync(path.join(DIST, "index.html"), loginPage);
console.log("✓ Login page created");

// ── 3. 스토리북 index.html에 세션 검증 삽입 ────────────────────────────

const sbIndex = path.join(SB_DIR, "index.html");
const sbHtml = fs.readFileSync(sbIndex, "utf-8");

const guard = `<script>
(function(){
  var h="${HASH}";
  if(sessionStorage.getItem("sb-auth")!==h){window.location.replace("../");}
})();
</script>`;

const protected_ = sbHtml.replace("<head>", `<head>${guard}`);
fs.writeFileSync(sbIndex, protected_);
console.log("✓ Session guard injected into storybook/index.html");

console.log("\n📦 Storybook protection complete!");
