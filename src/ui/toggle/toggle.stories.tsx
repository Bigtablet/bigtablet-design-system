import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Toggle } from ".";

const meta: Meta<typeof Toggle> = {
	title: "Components/Toggle",
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
**Toggle**은 설정을 **켜기/끄기(ON/OFF)** 로 전환할 때 사용하는 토글입니다.

### 언제 사용하나요?
- 알림 받기 ON/OFF
- 다크 모드 ON/OFF
- 공개/비공개 전환처럼 "상태를 즉시 바꾸는 설정"

### 언제는 Checkbox가 더 나은가요?
- "여러 개 중 일부 선택"처럼 선택 항목이 여러 개인 경우 → **Checkbox**
- "단 하나의 설정을 켜고 끄는 경우" → **Toggle**

### 동작 방식(중요)
- **제어형(권장)**: 앱 상태에 따라 ON/OFF를 확실히 맞출 때 사용
  \`checked\`와 \`onChange\`로 상태를 관리합니다.
- **비제어형(간단 사용)**: 초기값만 주고 내부에서 상태를 관리할 때 사용
  \`defaultChecked\`를 사용합니다.

### 디자이너 체크 포인트
- OFF 배경 \`color_base_neutral_400\` / ON 배경 \`color_brand_primary\` — 색 대비가 충분한지
- 크기: sm 40x24 / md 48x28 — 터치 영역 44px 기준에 미달하므로 라벨 영역까지 포함해 확보 권장
- thumb 크기: OFF sm 12px / md 16px, ON sm 20px / md 24px — 눌렸을 때 grow 애니메이션 (active 상태)
- 애니메이션: transform/width/height/background 모두 \`transition_base\` — 자연스러운 전환
- hover 시 \`opacity: 0.88\` — 너무 과하지 않은지
- 키보드 포커스 \`:focus-visible\`에서 \`focus_ring\` — 접근성 유지
- disabled: neutral_400 배경 + \`cursor: not-allowed\` — ON/OFF 관계없이 동일 — 상태 불가가 인지되는지
- 실시간 반영이 중요한 설정에는 제어형(\`checked\` + \`onChange\`) 사용 권장
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Controlled: Story = {
	parameters: { chromatic: { disableSnapshot: true } },

	name: "제어형",
	render: ({ size, disabled }) => {
		const [isOn, setIsOn] = React.useState(true);

		return (
			<div style={{ display: "grid", gap: 10, padding: 20 }}>
				<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
					<Toggle size={size} disabled={disabled} checked={isOn} onChange={setIsOn} ariaLabel="토글" />
					<span style={{ fontSize: 14, color: "#666" }}>현재 상태: {isOn ? "ON" : "OFF"}</span>
				</div>

				<p style={{ margin: 0, fontSize: 13, color: "#666", lineHeight: 1.5 }}>
					이 예시는 Toggle의 상태가 화면의 텍스트와 항상 동일하게 유지되는 형태입니다.
					<br />
					(실서비스에서는 이 방식이 가장 안전합니다)
				</p>
			</div>
		);
	},
};

export const Uncontrolled: Story = {
	parameters: { chromatic: { disableSnapshot: true } },

	name: "비제어형",
	render: ({ size, disabled }) => (
		<div style={{ display: "grid", gap: 10, padding: 20 }}>
			<Toggle size={size} disabled={disabled} defaultChecked ariaLabel="토글" />
			<p style={{ margin: 0, fontSize: 13, color: "#666", lineHeight: 1.5 }}>
				이 예시는 처음에만 ON으로 시작하고, 이후에는 컴포넌트 내부에서 켜짐/꺼짐을 관리합니다.
			</p>
		</div>
	),
};

export const Sizes: Story = {
	name: "크기 비교",
	render: () => (
		<div style={{ display: "grid", gap: 10, padding: 20 }}>
			<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
				<Toggle size="sm" defaultChecked ariaLabel="sm 토글" />
				<span style={{ fontSize: 13, color: "#666" }}>sm (기본)</span>
			</div>

			<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
				<Toggle size="md" defaultChecked ariaLabel="md 토글" />
				<span style={{ fontSize: 13, color: "#666" }}>md</span>
			</div>
		</div>
	),
};

export const Disabled: Story = {
	name: "비활성화",
	render: () => (
		<div style={{ display: "grid", gap: 10, padding: 20 }}>
			<Toggle disabled defaultChecked ariaLabel="토글" />
			<p style={{ margin: 0, fontSize: 13, color: "#666", lineHeight: 1.5 }}>
				비활성화 상태에서는 토글을 눌러도 상태가 바뀌지 않습니다.
			</p>
		</div>
	),
};
