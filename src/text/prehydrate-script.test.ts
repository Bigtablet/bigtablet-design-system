// 하이드레이션 전 스크립트(prehydrate-script.ts)는 생성 파일이다 - src/text 를 고치고 `pnpm prehydrate` 를 잊으면
// 서버 HTML 에서 고른 줄과 하이드레이션 뒤 줄이 달라 넘겨받을 때 화면이 움직인다
import { describe, expect, it } from "vitest";
import { isStale } from "../../scripts/build-prehydrate.mjs";
import { balancedTextScript } from "./prehydrate-script";

describe("balancedTextScript", () => {
	it("is generated from the current src/text", async () => {
		expect(await isStale()).toBe(false);
	}, 60_000);

	it("can sit inside a <script> as is", () => {
		expect(balancedTextScript).not.toMatch(/<\/script/i);
	});
});
