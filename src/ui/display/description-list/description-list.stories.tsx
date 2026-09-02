import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../card";
import { Chip } from "../chip";
import { DescriptionList } from ".";

const meta: Meta<typeof DescriptionList> = {
	title: "Components/Display/DescriptionList",
	component: DescriptionList,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
**DescriptionList** - 이름·값 쌍의 목록. 상세 보기 화면의 기본 골격.

\`<dl>\` · \`<dt>\` · \`<dd>\` 로 렌더한다. 손으로 만들면 거의 항상 \`<div>\` 두 개가 되고, 그러면
스크린리더에 **이름과 값의 관계가 남지 않는다** — 이름만 읽고 값을 따로 읽어 주는 목록이 된다.

\`row\` 는 좁은 화면(600px 미만)에서 스스로 쌓인다. 두 열을 유지하면 값이 잘린다.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof DescriptionList>;

export const Basic: Story = {
	name: "기본 (row)",
	render: () => (
		<Card bordered padding="lg" style={{ maxWidth: 420 }}>
			<DescriptionList
				divided
				items={[
					{ label: "주문번호", value: "#1024" },
					{ label: "주문일시", value: "2026.05.20 13:32" },
					{ label: "결제수단", value: "신용카드" },
					{ label: "결제금액", value: "₩42,000" },
				]}
			/>
		</Card>
	),
};

export const Stacked: Story = {
	name: "stack",
	parameters: {
		docs: {
			description: { story: "이름을 값 위에 둔다. 좁은 칸이나 모바일 전용 화면에." },
		},
	},
	render: () => (
		<Card bordered padding="lg" style={{ maxWidth: 260 }}>
			<DescriptionList
				layout="stack"
				items={[
					{ label: "담당자", value: "박상민" },
					{ label: "연락처", value: "010-1234-5678" },
				]}
			/>
		</Card>
	),
};

export const FullWidthValue: Story = {
	name: "긴 값은 한 줄로",
	parameters: {
		docs: {
			description: {
				story:
					"`full: true` 인 항목은 값이 한 줄을 다 쓴다. 주소·메모처럼 두 열에 안 들어가는 값에.",
			},
		},
	},
	render: () => (
		<Card bordered padding="lg" style={{ maxWidth: 420 }}>
			<DescriptionList
				divided
				items={[
					{ label: "상태", value: <Chip type="static" tone="success" label="배송 완료" /> },
					{ label: "받는 분", value: "김민준" },
					{
						label: "배송지",
						value: "서울특별시 강남구 테헤란로 123 빅태블릿빌딩 8층 (06234)",
						full: true,
					},
					{ label: "요청사항", value: "문 앞에 놓아 주세요. 벨은 누르지 말아 주세요.", full: true },
				]}
			/>
		</Card>
	),
};
