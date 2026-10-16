import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { TextField } from "../textfield";
import "../textfield/style.scss";
import "../../general/button/style.scss";
import { FilterBar } from "./index";
import "./style.scss";

const Fields = () => (
	<>
		<TextField label="이름" />
		<TextField label="이메일" />
		<TextField label="전화" />
		<TextField label="소속" />
	</>
);

describe("FilterBar (Chromium)", () => {
	beforeEach(async () => {
		await page.viewport(1200, 600);
	});

	it("submits with the Enter key from a text field, and not when blocked", async () => {
		const onSubmit = vi.fn();
		const { rerender } = render(
			<FilterBar onSubmit={onSubmit}>
				<Fields />
			</FilterBar>,
		);
		await userEvent.click(screen.getByLabelText("이름"));
		await userEvent.keyboard("박상민{Enter}");
		expect(onSubmit).toHaveBeenCalledTimes(1);

		rerender(
			<FilterBar onSubmit={onSubmit} canSubmit={false}>
				<Fields />
			</FilterBar>,
		);
		await userEvent.keyboard("{Enter}");
		expect(onSubmit).toHaveBeenCalledTimes(1);
	});

	it("lays fields out in a row on desktop with the buttons at the end", () => {
		render(
			<FilterBar onSubmit={() => {}} onReset={() => {}}>
				<Fields />
			</FilterBar>,
		);
		const tops = ["이름", "이메일", "전화", "소속"].map(
			(l) => screen.getByLabelText(l).getBoundingClientRect().top,
		);
		expect(new Set(tops.map(Math.round)).size).toBe(1);
		const submit = screen.getByRole("button", { name: "검색" }).getBoundingClientRect();
		const last = screen.getByLabelText("소속").getBoundingClientRect();
		expect(submit.left).toBeGreaterThan(last.right);
		// 버튼은 입력 칸의 아랫변에 맞춘다 (라벨이 위에 있어도)
		expect(Math.abs(submit.bottom - last.bottom)).toBeLessThan(2);
	});

	it("wraps fields and drops the buttons to a full-width row on a phone", async () => {
		await page.viewport(375, 800);
		render(
			<FilterBar onSubmit={() => {}} onReset={() => {}}>
				<Fields />
			</FilterBar>,
		);
		const name = screen.getByLabelText("이름").getBoundingClientRect();
		const email = screen.getByLabelText("이메일").getBoundingClientRect();
		expect(email.top).toBeGreaterThan(name.bottom);
		const form = screen.getByRole("search").getBoundingClientRect();
		const reset = screen.getByRole("button", { name: "초기화" }).getBoundingClientRect();
		const submit = screen.getByRole("button", { name: "검색" }).getBoundingClientRect();
		expect(reset.top).toBeGreaterThan(screen.getByLabelText("소속").getBoundingClientRect().bottom);
		expect(Math.round(submit.right)).toBe(Math.round(form.right));
		expect(Math.round(reset.left)).toBe(Math.round(form.left));
		expect(form.right).toBeLessThanOrEqual(375);
	});
});
