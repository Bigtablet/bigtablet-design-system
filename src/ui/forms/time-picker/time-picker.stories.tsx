import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Field } from "../field";
import { TimePicker } from ".";

const meta: Meta<typeof TimePicker> = {
	title: "Components/Forms/TimePicker",
	component: TimePicker,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
**TimePicker** - 시·분 선택. \`DatePicker\` 와 같은 방식으로 DS \`Dropdown\` 두 개를 조합한다.

손으로 만들면 갈리는 것들을 여기서 소유한다.

- **분 간격** — 예약·근무 시간은 5분·30분 단위인데 60개 옵션을 다 그리면 고르기 어렵다
- **영업시간 밖 차단** — \`minTime\`/\`maxTime\` 이 **시 목록까지** 좁힌다. 분만 걸러 두면 09:00 이
  최소인데 08시를 고를 수 있고, 그때 분 목록이 비어 막힌 화면이 된다
- **경계에서의 분 목록** — 최소가 09:30 이면 09시의 분은 30분부터 시작한다. 시를 바꿀 때 지금 분이
  범위 밖이면 가장 이른 분으로 옮긴다

값은 24시간 \`"HH:mm"\` 이다 — 12시간 표기는 화면 표시의 문제라 소비자가 포맷한다.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof TimePicker>;

export const Basic: Story = {
	name: "기본 (5분 간격)",
	render: () => {
		const [time, setTime] = useState("");
		return (
			<div style={{ maxWidth: 320 }}>
				<Field name="at" label="시각">
					<TimePicker value={time} onValueChange={setTime} />
				</Field>
			</div>
		);
	},
};

export const BusinessHours: Story = {
	name: "영업시간 안에서만",
	parameters: {
		docs: {
			description: {
				story:
					'`minTime="09:30"`, `maxTime="18:00"`. 시 목록이 09~18 로 좁혀지고, 09시를 고르면 분이 30분부터 시작한다.',
			},
		},
	},
	render: () => {
		const [time, setTime] = useState("");
		return (
			<div style={{ maxWidth: 320 }}>
				<Field name="pickup" label="픽업 시각" help="영업시간 09:30 ~ 18:00">
					<TimePicker
						value={time}
						onValueChange={setTime}
						minuteStep={30}
						minTime="09:30"
						maxTime="18:00"
					/>
				</Field>
			</div>
		);
	},
};

export const Disabled: Story = {
	name: "비활성",
	render: () => (
		<div style={{ maxWidth: 320 }}>
			<TimePicker label="시각" value="14:30" onValueChange={() => {}} disabled />
		</div>
	),
};
