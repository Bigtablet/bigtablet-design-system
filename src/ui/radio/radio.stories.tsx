import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Radio } from ".";

const meta: Meta<typeof Radio> = {
	title: "Components/Radio",
	component: Radio,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "md", "lg"],
			description: "라디오 버튼의 크기입니다. 텍스트와 선택 원(circle)의 크기가 함께 변경됩니다.",
		},
		disabled: {
			control: "boolean",
			description: "비활성화 상태입니다. 선택할 수 없으며 흐리게 표시됩니다.",
		},
	},
	args: {
		size: "md",
		disabled: false,
	},
	parameters: {
		docs: {
			description: {
				component: `
**Radio**는 여러 선택지 중에서 **하나만 선택해야 할 때** 사용하는 입력 요소입니다.

### 언제 사용하나요?
- 배송 방법 선택 (일반 배송 / 빠른 배송)
- 결제 수단 선택 (카드 / 계좌이체 / 간편결제)
- 설문에서 “하나만 고르세요” 형태의 질문

### Checkbox와의 차이점
- **Radio**: 여러 개 중 **하나만 선택**
- **Checkbox**: 여러 개를 **동시에 선택 가능**

### 사용 방법 (중요)
- 같은 그룹으로 묶으려면 **\`name\` 값을 동일하게 설정**해야 합니다.
- 선택 상태는 \`checked\`와 \`onChange\`로 제어합니다.

### 디자이너 체크 포인트
- 선택된 Radio의 dot border + 내부 점이 \`color_brand_primary\`로 뚜렷이 보이는지
- 크기별 dot 지름 (sm 16px / md 18px / lg 20px)과 라벨 타이포(sm \`label_small\`, md \`body_medium\`, lg \`body_large\`)가 의도한 비율인지
- state layer(원형 배경 오버레이)의 hover/focus/pressed 상태가 눌렀다는 느낌을 주는지 — 배경 토큰 \`state_hover/focus/pressed_on_light\`
- 라벨과 dot 사이 간격 \`spacing_8\`이 적절한지
- 비활성화 시 \`opacity_38\` + \`cursor: not-allowed\` — 선택 불가가 인지되는지
- 그룹 묶음 시 같은 \`name\`을 쓰고, 옵션 간 수직 간격은 호출자 측에서 \`spacing_8\`~\`spacing_12\` 권장
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Group: Story = {
	name: "그룹 선택 예시",
	render: (args) => {
		const groupId = React.useId();
		const groupName = `radio_group_${groupId}`;
		const [value, setValue] = React.useState("b");

		return (
			<div style={{ display: "grid", gap: 8 }}>
				<Radio
					{...args}
					name={groupName}
					value="a"
					checked={value === "a"}
					onChange={() => setValue("a")}
					label="Option A"
				/>
				<Radio
					{...args}
					name={groupName}
					value="b"
					checked={value === "b"}
					onChange={() => setValue("b")}
					label="Option B (기본 선택)"
				/>
				<Radio
					{...args}
					name={groupName}
					value="c"
					checked={value === "c"}
					onChange={() => setValue("c")}
					label="Option C"
				/>
			</div>
		);
	},
};

export const Sizes: Story = {
	name: "크기 비교",
	render: () => (
		<div style={{ display: "flex", gap: 24, alignItems: "center" }}>
			{(["sm", "md", "lg"] as const).map((size) => (
				<Radio key={size} size={size} label={size} name="size-demo" defaultChecked={size === "md"} />
			))}
		</div>
	),
};

export const Disabled: Story = {
	name: "비활성화",
	render: (args) => {
		const groupId = React.useId();
		const groupName = `radio_disabled_${groupId}`;

		return (
			<div style={{ display: "grid", gap: 8 }}>
				<Radio {...args} name={groupName} value="a" disabled label="Disabled A" />
				<Radio {...args} name={groupName} value="b" disabled checked label="Disabled B (선택됨)" />
			</div>
		);
	},
};
