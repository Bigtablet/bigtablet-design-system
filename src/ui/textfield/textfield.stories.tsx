import type { Meta, StoryObj } from "@storybook/react";
import { TextField } from ".";

const SearchIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
		<circle cx="11" cy="11" r="8" />
		<line x1="21" y1="21" x2="16.65" y2="16.65" />
	</svg>
);

const CloseIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
		<line x1="18" y1="6" x2="6" y2="18" />
		<line x1="6" y1="6" x2="18" y2="18" />
	</svg>
);

const meta: Meta<typeof TextField> = {
	title: "Components/TextField",
	component: TextField,
	tags: ["autodocs"],
	argTypes: {
		label: {
			control: "text",
			description: "입력창 위에 표시되는 floating label입니다.",
		},
		showLabel: {
			control: "boolean",
			description: "라벨 표시 여부입니다.",
		},
		supportingText: {
			control: "text",
			description: "입력창 아래에 표시되는 안내 문구입니다.",
		},
		error: {
			control: "boolean",
			description: "오류 상태입니다.",
		},
		disabled: {
			control: "boolean",
			description: "비활성화 상태입니다.",
		},
		fullWidth: {
			control: "boolean",
			description: "부모 너비에 맞춰 가로폭을 100%로 확장합니다.",
		},
		onChangeAction: { control: false },
	},
	args: {
		label: "Label",
		placeholder: "Input",
		disabled: false,
		fullWidth: false,
	},
	parameters: {
		docs: {
			description: {
				component: `
**TextField**는 사용자가 글자를 입력하는 기본 입력창입니다.

### 언제 사용하나요?
- 이름, 이메일, 비밀번호 등 한 줄 텍스트 입력
- 검색창 (leadingIcon에 돋보기 아이콘 조합)
- 폼 입력 필드 전반

### 구성 요소
- **Floating Label**: 입력 필드 상단 테두리 위에 표시
- **Leading/Trailing Icon**: 입력의 의미 보조 또는 액션 제공
- **Supporting Text**: 입력 안내 또는 에러 메시지

### 상태
| State | 설명 |
|-------|------|
| Enable | 기본 상태 |
| Hover | 마우스 오버 시 테두리 강조 |
| Focus | 포커스 시 테두리 검정 |
| Error | 오류 시 빨간 테두리 + 라벨/도움말 색상 변경 |
| Disabled | 비활성화 (배경 회색) |

### 접근성 (구현 완료)
- \`<label>\`과 \`<input>\`이 \`htmlFor\`/\`id\`로 자동 연결 → 라벨 클릭 시 입력 필드 포커스
- \`error\` 상태에서 \`aria-invalid="true"\` + \`aria-describedby\`로 에러 메시지 연결
- Tab으로 포커스 이동, 네이티브 \`<input>\` 동작 그대로 사용
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = {
	name: "기본",
};

export const WithIcons: Story = {
	name: "아이콘 포함",
	args: {
		label: "Search",
		placeholder: "Search…",
		leadingIcon: <SearchIcon />,
		trailingIcon: <CloseIcon />,
	},
};

export const ErrorState: Story = {
	name: "오류 상태",
	args: {
		label: "Email",
		placeholder: "name@example.com",
		supportingText: "이메일 형식이 올바르지 않습니다.",
		error: true,
	},
};

export const DisabledState: Story = {
	name: "비활성화",
	args: {
		label: "이름",
		placeholder: "입력할 수 없습니다",
		disabled: true,
	},
};

export const NoLabel: Story = {
	name: "라벨 없음",
	args: {
		label: "Label",
		showLabel: false,
		placeholder: "라벨 없는 입력 필드",
	},
};

export const AllStates: Story = {
	name: "전체 상태 비교",
	render: () => (
		<div style={{ display: "grid", gap: 24, width: 320 }}>
			<TextField label="Enable" placeholder="Input" supportingText="Supporting text" />
			<TextField label="Error" placeholder="Input" supportingText="Error message" error />
			<TextField label="Disabled" placeholder="Input" supportingText="Supporting text" disabled />
			<TextField label="With Icons" placeholder="Search" leadingIcon={<SearchIcon />} trailingIcon={<CloseIcon />} supportingText="Supporting text" />
		</div>
	),
};
