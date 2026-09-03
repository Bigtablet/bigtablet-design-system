import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../../general/button";
import { DatePicker } from "../date-picker";
import { Dropdown } from "../dropdown";
import { Form } from "../form";
import { Radio } from "../radio";
import { RadioGroup } from "../radio-group";
import { Textarea } from "../textarea";
import { TextField } from "../textfield";
import { Field } from ".";

const meta: Meta<typeof Field> = {
	title: "Components/Forms/Field",
	component: Field,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
**Field** - 라벨·필수 표시·도움말·에러와 그 접근성 연결을 소유하는 폼 필드 래퍼.

입력 11종은 label/supportingText/error 를 서로 다르게 갖고 있다 - label 은 9종, error 는 5종뿐이라
폼 화면은 입력 밖에 문구를 직접 그려 왔다. \`Field\` 가 그 자리를 가져가면 어떤 입력을 넣어도
라벨 위치·간격·에러 문구·\`aria-describedby\` 가 같아진다.

입력의 기존 prop 은 그대로 살아 있다. \`Field\` 없이 쓰면 지금과 동일하게 동작한다.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Field>;

const ROLES = [
	{ value: "admin", label: "관리자" },
	{ value: "member", label: "멤버" },
];

export const Basic: Story = {
	name: "기본 (라벨 + 도움말)",
	parameters: {
		docs: {
			description: {
				story: "라벨은 `htmlFor` 로, 도움말은 `aria-describedby` 로 입력에 연결된다.",
			},
		},
	},
	render: () => (
		<div style={{ width: 360 }}>
			<Field name="email" label="이메일" required help="로그인 ID 로 사용됩니다">
				<TextField fullWidth placeholder="name@example.com" />
			</Field>
		</div>
	),
};

export const WithError: Story = {
	name: "에러 (도움말을 대체)",
	parameters: {
		docs: {
			description: {
				story:
					"에러가 있으면 도움말 대신 에러가 보인다. 둘을 동시에 띄우면 어느 쪽을 고쳐야 하는지 흐려지고 세로 간격이 필드마다 달라진다.",
			},
		},
	},
	render: () => (
		<div style={{ width: 360 }}>
			<Field
				name="email"
				label="이메일"
				required
				help="로그인 ID 로 사용됩니다"
				error="이미 사용 중인 이메일입니다"
			>
				<TextField fullWidth defaultValue="taken@example.com" />
			</Field>
		</div>
	),
};

export const AnyInput: Story = {
	name: "입력 종류 무관",
	parameters: {
		docs: {
			description: {
				story:
					'단일 컨트롤은 `htmlFor` 로, `role="group"` 컨테이너(DatePicker·RadioGroup·OtpInput)는 `aria-labelledby` 로 연결된다 - 그룹은 `<label htmlFor>` 로 이름이 붙지 않기 때문이다.',
			},
		},
	},
	render: () => (
		<div style={{ display: "grid", gap: 20, width: 360 }}>
			<Field name="role" label="권한" help="나중에 변경할 수 있습니다">
				<Dropdown options={ROLES} fullWidth placeholder="선택하세요" />
			</Field>
			<Field name="joinedAt" label="가입일">
				<DatePicker value="" onValueChange={() => {}} />
			</Field>
			<Field name="plan" label="요금제" error="요금제를 선택하세요">
				<RadioGroup name="plan">
					<Radio value="free" label="무료" />
					<Radio value="pro" label="프로" />
				</RadioGroup>
			</Field>
			<Field name="memo" label="메모">
				<Textarea fullWidth minRows={3} />
			</Field>
		</div>
	),
};

export const ServerErrors: Story = {
	name: "서버 검증 결과 배분 (Form)",
	parameters: {
		docs: {
			description: {
				story:
					"`Form` 의 `errors` 맵을 각 `Field` 가 자기 `name` 으로 찾아 표시한다. 422 응답을 그대로 넣는 자리다. 제출을 눌러 확인.",
			},
		},
	},
	render: () => {
		const [errors, setErrors] = useState<Record<string, string>>({});
		return (
			<div style={{ width: 360 }}>
				<Form
					errors={errors}
					onSubmit={() =>
						setErrors({
							email: "이미 사용 중인 이메일입니다",
							nickname: "2자 이상이어야 합니다",
						})
					}
				>
					<Field name="email" label="이메일" required help="로그인 ID 로 사용됩니다">
						<TextField fullWidth />
					</Field>
					<Field name="nickname" label="닉네임">
						<TextField fullWidth />
					</Field>
					<Field name="role" label="권한">
						<Dropdown options={ROLES} fullWidth placeholder="선택하세요" />
					</Field>
					<Form.Actions>
						<Button type="button" variant="outline" onClick={() => setErrors({})}>
							초기화
						</Button>
						<Button type="submit">저장</Button>
					</Form.Actions>
				</Form>
			</div>
		);
	},
};
