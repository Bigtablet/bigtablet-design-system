import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Toggle } from ".";
import { SELECTION_COMPARISON } from "../selection-comparison.docs";

const meta: Meta<typeof Toggle> = {
	title: "Components/Forms/Toggle",
	component: Toggle,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "md"],
			description: "토글 크기입니다. 화면에서 토글이 차지하는 크기(가로/세로)가 함께 바뀝니다.",
		},
		disabled: {
			control: "boolean",
			description: "비활성화 상태입니다. 켜기/끄기 조작이 불가능하며 흐리게 표시됩니다.",
		},
		checked: { control: false },
		defaultChecked: { control: false },
		onChange: { control: false },
	},
	args: {
		size: "sm",
		disabled: false,
		ariaLabel: "토글",
	},
	parameters: {
		docs: {
			description: {
				component: `
**Toggle** - ON/OFF 를 즉시 전환하는 스위치. 다중 선택은 Checkbox 를 쓴다.

제어형: \`checked\` + \`onChange\` / 비제어형: \`defaultChecked\`.

${SELECTION_COMPARISON}
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Controlled: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"`checked` + `onChange` 로 화면이 상태를 듭니다. 서버 반영이 실패했을 때 되돌려야 하므로, **저장이 비동기면 제어형이 맞습니다.**",
			},
		},
		chromatic: { disableSnapshot: true },
	},

	name: "제어형",
	render: ({ size, disabled }) => {
		const [isOn, setIsOn] = React.useState(true);

		return (
			<div style={{ display: "grid", gap: 16, padding: 20 }}>
				<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
					<Toggle
						size={size}
						disabled={disabled}
						checked={isOn}
						onChange={setIsOn}
						ariaLabel="토글"
					/>
					<span style={{ fontSize: 14, color: "var(--bt-color-text-body)" }}>
						현재 상태: {isOn ? "ON" : "OFF"}
					</span>
				</div>

				<p style={{ margin: 0, fontSize: 13, color: "var(--bt-color-text-body)", lineHeight: 1.5 }}>
					이 예시는 Toggle의 상태가 화면의 텍스트와 항상 동일하게 유지되는 형태입니다.
					<br />
					(실서비스에서는 이 방식이 가장 안전합니다)
				</p>
			</div>
		);
	},
};

export const Uncontrolled: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"`defaultChecked` 만 주고 이후는 DOM 에 맡깁니다. 폼 제출 때 값만 읽는 설정 화면에 씁니다.\n\n`Toggle` 은 라벨 prop 이 없습니다 - 무엇을 켜는지 알리려면 `Field` 로 감싸거나 옆에 라벨을 두고 `aria-label` 을 주세요.",
			},
		},
		chromatic: { disableSnapshot: true },
	},

	name: "비제어형",
	render: ({ size, disabled }) => (
		<div style={{ display: "grid", gap: 16, padding: 20 }}>
			<Toggle size={size} disabled={disabled} defaultChecked ariaLabel="토글" />
			<p style={{ margin: 0, fontSize: 13, color: "var(--bt-color-text-body)", lineHeight: 1.5 }}>
				이 예시는 처음에만 ON으로 시작하고, 이후에는 컴포넌트 내부에서 켜짐/꺼짐을 관리합니다.
			</p>
		</div>
	),
};

export const Sizes: Story = {
	name: "크기 비교",
	render: () => (
		// 토글을 세로로 쌓을 때 16px 이상 - 히트 영역이 트랙보다 넓어(모바일 40px)
		// 그보다 좁으면 인접 토글끼리 겹친다.
		<div style={{ display: "grid", gap: 16, padding: 20 }}>
			<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
				<Toggle size="sm" defaultChecked ariaLabel="sm 토글" />
				<span style={{ fontSize: 13, color: "var(--bt-color-text-body)" }}>sm (기본)</span>
			</div>

			<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
				<Toggle size="md" defaultChecked ariaLabel="md 토글" />
				<span style={{ fontSize: 13, color: "var(--bt-color-text-body)" }}>md</span>
			</div>
		</div>
	),
};

export const Disabled: Story = {
	name: "비활성화",
	render: () => (
		<div style={{ display: "grid", gap: 16, padding: 20 }}>
			<Toggle disabled defaultChecked ariaLabel="토글" />
			<p style={{ margin: 0, fontSize: 13, color: "var(--bt-color-text-body)", lineHeight: 1.5 }}>
				비활성화 상태에서는 토글을 눌러도 상태가 바뀌지 않습니다.
			</p>
		</div>
	),
};
