import type { Meta, StoryObj } from "@storybook/react";
import { Dropdown } from "../../ui/forms/dropdown";
import { TextField } from "../../ui/forms/textfield";

const meta: Meta = {
	title: "Foundation/Form Comparison",
	parameters: {
		docs: {
			description: {
				component: "**TextField vs Dropdown** — 디자인 차이 비교용 임시 스토리.",
			},
		},
	},
};

export default meta;
type Story = StoryObj;

const sampleOptions = [
	{ value: "1", label: "Option 1" },
	{ value: "2", label: "Option 2" },
];

export const SideBySide: Story = {
	name: "나란히 비교",
	render: () => (
		<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, padding: 24, maxWidth: 800 }}>
			<div>
				<h3 style={{ marginBottom: 16 }}>TextField</h3>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<TextField label="이메일" placeholder="placeholder@example.com" />
					<TextField label="비밀번호" placeholder="••••••••" type="password" />
					<TextField label="값 있음" value="user@example.com" onChange={() => {}} />
				</div>
			</div>
			<div>
				<h3 style={{ marginBottom: 16 }}>Dropdown</h3>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<Dropdown label="국가" placeholder="Select..." options={sampleOptions} />
					<Dropdown label="언어" placeholder="Select..." options={sampleOptions} />
					<Dropdown label="값 있음" value="1" options={sampleOptions} />
				</div>
			</div>
		</div>
	),
};
