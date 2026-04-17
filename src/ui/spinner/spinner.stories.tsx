import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from ".";

const meta: Meta<typeof Spinner> = {
	title: "Components/Spinner",
	component: Spinner,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "number",
			description: "스피너의 크기(px)입니다. 숫자만 입력하면 자동으로 정사각형 크기로 적용됩니다.",
		},
	},
	args: {
		size: 24,
	},
	parameters: {
		docs: {
			description: {
				component: `
**Spinner**는 작업 처리 중임을 사용자에게 알려주는 **회전 형태의 로딩 표시**입니다.

### 언제 사용하나요?
- 버튼 클릭 후 잠시 대기 시간이 있을 때
- 데이터 로딩 중임을 알려야 할 때
- 화면 전체가 아닌 **부분 로딩(인라인 로딩)**이 필요할 때

### TopLoading과의 차이
| Spinner | TopLoading |
|---------|------------|
| 인라인/부분 영역 | 화면 상단 고정 |
| 버튼, 카드 내부 | 페이지 전환, 전역 상태 |
| 크기 조절 가능 | 진행률 표시 가능 |

### 크기 가이드
| 상황 | 권장 크기 |
|------|----------|
| 버튼 내부 | 16–24px |
| 카드/섹션 단위 | 24–32px |
| 화면 중심 강조 | 40px 이상 |

### 디자이너 체크 포인트
- 트랙 색상 \`color_border_default\` + 헤드 색상 \`color_brand_primary\` — 배경과 충분히 대비되는지
- 테두리 두께 \`border_width_indicator\` — 크기별로 적절히 보이는지 (16px / 48px에서도 어색하지 않은지)
- 회전 속도 0.8s linear infinite — 빠르거나 느리지 않은지
- 버튼 내부 사용 시 텍스트와 \`gap: spacing_8\` 정도 권장 (라벨↔스피너 간격)
- 전체 화면 로딩에는 별도 overlay 컨테이너와 조합 (Spinner만으로는 오버레이 제공 안 함)
- 텍스트와 함께 쓸 때는 "처리 중", "로딩 중…" 등 동사형으로 상태 안내
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Basic: Story = {
	name: "기본",
};

export const Sizes: Story = {
	name: "크기별 예시",
	render: () => (
		<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
			<Spinner size={16} />
			<Spinner size={24} />
			<Spinner size={32} />
			<Spinner size={48} />
		</div>
	),
};

export const InButton: Story = {
	parameters: { chromatic: { disableSnapshot: true } },

	name: "버튼 내부 사용 예",
	render: () => (
		<button
			type="button"
			disabled
			style={{
				display: "inline-flex",
				alignItems: "center",
				gap: 8,
				padding: "8px 16px",
				borderRadius: 8,
				border: "1px solid #e5e5e5",
				background: "#fafafa",
				color: "#666",
				cursor: "not-allowed",
			}}
		>
			<Spinner size={16} />
			처리 중
		</button>
	),
};
