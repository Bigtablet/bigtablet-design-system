import type { Meta, StoryObj } from "@storybook/react";
import { ListItem } from ".";

const meta: Meta<typeof ListItem> = {
	title: "Components/Display/ListItem",
	component: ListItem,
	tags: ["autodocs"],
	argTypes: {
		label: {
			control: "text",
			description: "주요 텍스트입니다. 리스트 아이템의 핵심 정보를 표시합니다.",
		},
		overline: {
			control: "text",
			description:
				"라벨 위에 표시되는 작은 텍스트입니다. 카테고리, 날짜 등 부가 정보에 사용합니다.",
		},
		supportingText: {
			control: "text",
			description:
				"라벨 아래 표시되는 보조 텍스트입니다. 설명이나 상세 정보를 제공합니다.",
		},
		metadata: {
			control: "text",
			description:
				"하단에 표시되는 메타데이터 텍스트입니다. 날짜, 상태 등 부가 정보에 사용합니다.",
		},
		leadingElement: {
			control: false,
			description:
				"왼쪽에 표시되는 요소입니다. 아이콘, 이미지, 체크박스 등을 배치합니다.",
		},
		trailingElement: {
			control: false,
			description:
				"오른쪽에 표시되는 요소입니다. 아이콘 버튼, 체크박스 등을 배치합니다.",
		},
		alignment: {
			control: "radio",
			options: ["top", "middle"],
			description:
				"내부 요소의 수직 정렬입니다. top은 상단 정렬, middle은 중앙 정렬입니다.",
		},
		disabled: {
			control: "boolean",
			description: "비활성화 상태입니다. 투명도가 낮아지고 클릭이 불가합니다.",
		},
		onClick: {
			control: false,
			description: "클릭 시 호출되는 콜백입니다. 설정 시 인터랙티브 상태가 됩니다.",
		},
		className: { control: false },
	},
	args: {
		label: "리스트 아이템",
		alignment: "top",
		disabled: false,
	},
	parameters: {
		docs: {
			description: {
				component: `
**ListItem**은 목록에서 하나의 항목을 표현하는 컴포넌트입니다.

### 언제 사용하나요?
- 설정 화면의 항목 리스트
- 연락처, 알림, 메시지 목록
- 파일/폴더 탐색기 항목

### 속성 가이드
| 속성 | 설명 |
|------|------|
| **label** | 주요 텍스트 (필수) |
| **overline** | 라벨 위 작은 텍스트 (카테고리 등) |
| **supportingText** | 라벨 아래 보조 설명 |
| **metadata** | 하단 메타 정보 (날짜, 상태 등) |
| **leadingElement** | 왼쪽 슬롯 (아이콘, 이미지 등) |
| **trailingElement** | 오른쪽 슬롯 (버튼, 아이콘 등) |
| **alignment** | 수직 정렬: top(기본) / middle |

### 정렬 가이드
- **top**: 텍스트가 여러 줄일 때 적합 (기본값)
- **middle**: 한 줄 텍스트 + 아이콘 조합에 적합
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof ListItem>;

export const OneLine: Story = {
	name: "한 줄",
	args: {
		label: "한 줄 리스트 아이템",
	},
};

export const MultiLine: Story = {
	name: "두 줄",
	args: {
		label: "두 줄 리스트 아이템",
		supportingText: "보조 텍스트가 라벨 아래에 표시됩니다.",
	},
};

export const WithOverline: Story = {
	name: "오버라인 포함",
	args: {
		overline: "카테고리",
		label: "오버라인이 있는 리스트 아이템",
		supportingText: "오버라인은 라벨 위에 작은 글씨로 표시됩니다.",
	},
};

export const WithMetadata: Story = {
	name: "메타데이터 포함",
	args: {
		label: "메타데이터가 있는 리스트 아이템",
		supportingText: "보조 텍스트 영역입니다.",
		metadata: "2026-04-09 · 3분 전",
	},
};

export const WithLeading: Story = {
	name: "리딩 요소",
	args: {
		label: "이미지가 있는 리스트 아이템",
		supportingText: "왼쪽에 이미지 플레이스홀더가 배치됩니다.",
		leadingElement: (
			<div
				style={{
					width: 56,
					height: 56,
					borderRadius: 8,
					background: "#E5E5E5",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontSize: 12,
					color: "#444",
				}}
			>
				56x56
			</div>
		),
	},
};

export const WithTrailing: Story = {
	name: "트레일링 요소",
	args: {
		label: "트레일링 아이콘이 있는 리스트 아이템",
		supportingText: "오른쪽에 아이콘 버튼이 배치됩니다.",
		trailingElement: (
			<button
				type="button"
				aria-label="더보기"
				style={{
					width: 40,
					height: 40,
					border: "none",
					background: "transparent",
					cursor: "pointer",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					borderRadius: 8,
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<svg
					width="20"
					height="20"
					viewBox="0 0 20 20"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M8 4L14 10L8 16"
						stroke="#666666"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</button>
		),
	},
};

export const MiddleAlignment: Story = {
	name: "중앙 정렬",
	args: {
		label: "중앙 정렬된 리스트 아이템",
		alignment: "middle",
		leadingElement: (
			<div
				style={{
					width: 40,
					height: 40,
					borderRadius: "50%",
					background: "#E5E5E5",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontSize: 11,
					color: "#444",
				}}
			>
				40
			</div>
		),
		trailingElement: (
			<button
				type="button"
				aria-label="더보기"
				style={{
					width: 40,
					height: 40,
					border: "none",
					background: "transparent",
					cursor: "pointer",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<svg
					width="20"
					height="20"
					viewBox="0 0 20 20"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M8 4L14 10L8 16"
						stroke="#666666"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</button>
		),
	},
};

export const Disabled: Story = {
	name: "비활성화",
	args: {
		label: "비활성화된 리스트 아이템",
		supportingText: "opacity 0.38이 적용되고 클릭할 수 없습니다.",
		disabled: true,
		onClick: () => alert("클릭됨"),
	},
};

export const Interactive: Story = {
	name: "인터랙티브",
	args: {
		label: "클릭 가능한 리스트 아이템",
		supportingText: "hover, focus, pressed 상태가 있습니다.",
		onClick: () => alert("리스트 아이템 클릭!"),
	},
};

export const AllVariants: Story = {
	name: "모든 변형",
	render: () => (
		<div style={{ display: "grid", gap: 12, maxWidth: 480 }}>
			<ListItem label="한 줄 아이템" />

			<ListItem
				label="두 줄 아이템"
				supportingText="보조 텍스트가 있는 아이템입니다."
			/>

			<ListItem
				overline="카테고리"
				label="오버라인 + 라벨 + 보조"
				supportingText="세 줄 구조의 리스트 아이템입니다."
			/>

			<ListItem
				label="메타데이터 포함"
				supportingText="보조 텍스트 영역"
				metadata="2026-04-09"
			/>

			<ListItem
				label="리딩 요소 포함"
				supportingText="왼쪽 이미지"
				leadingElement={
					<div
						style={{
							width: 56,
							height: 56,
							borderRadius: 8,
							background: "#E5E5E5",
						}}
					/>
				}
			/>

			<ListItem
				label="중앙 정렬"
				alignment="middle"
				leadingElement={
					<div
						style={{
							width: 40,
							height: 40,
							borderRadius: "50%",
							background: "#E5E5E5",
						}}
					/>
				}
			/>

			<ListItem
				label="인터랙티브 아이템"
				supportingText="hover 해 보세요"
				onClick={() => {}}
			/>

			<ListItem
				label="비활성화 아이템"
				supportingText="클릭 불가"
				disabled
				onClick={() => {}}
			/>
		</div>
	),
};
