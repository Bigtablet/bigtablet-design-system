import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../../ui/display/card";

const meta: Meta<typeof Card> = {
    title: "Components/Display/Card",
    component: Card,
    tags: ["autodocs"],
    argTypes: {
        heading: {
            control: "text",
            description: "카드 상단에 표시되는 제목 영역입니다. 비워두면 제목 줄이 렌더링되지 않습니다.",
        },
        shadow: {
            control: "select",
            options: ["none", "sm", "md", "lg"],
            description:
                "카드의 ‘입체감(그림자)’ 단계입니다. none은 평면, lg는 가장 강조된 카드에 적합합니다.",
        },
        padding: {
            control: "select",
            options: ["none", "sm", "md", "lg"],
            description:
                "카드 내부 여백입니다. 콘텐츠가 촘촘하면 sm, 일반적인 콘텐츠는 md, 여유 있는 레이아웃은 lg가 잘 맞습니다.",
        },
        bordered: {
            control: "boolean",
            description:
                "테두리 표시 여부입니다. 배경이 흰 화면에서 카드 경계를 또렷하게 보여주고 싶을 때 사용합니다.",
        },
        children: {
            control: false,
            description: "카드 안에 들어가는 콘텐츠 영역입니다.",
        },
        className: { control: false },
    },
    args: {
        heading: "Card Title",
        shadow: "sm",
        padding: "md",
        bordered: false,
        children: (
            <p style={{ margin: 0 }}>
                내용이 들어가는 영역입니다. 카드 레이아웃을 테스트하기 위한 기본 텍스트입니다.
            </p>
        ),
    },
    parameters: {
        docs: {
            description: {
                component: `
**Card**는 화면에서 콘텐츠를 '한 덩어리'로 묶어 보여주는 컨테이너입니다.

### 언제 사용하나요?
- 대시보드의 요약 정보 블록
- 리스트 아이템(상품, 게시글 등)
- 폼이나 설정 영역을 구분할 때

### 속성 가이드
| 속성 | 설명 |
|------|------|
| **heading** | 카드 상단 타이틀. 비워두면 제목 줄 없음 |
| **shadow** | 입체감 (none → lg로 갈수록 강조) |
| **padding** | 내부 여백 (sm: 밀도 높음, lg: 여유 있음) |
| **bordered** | 테두리 표시. 흰 배경에서 경계 구분용 |

### 그림자 선택 가이드
- **none**: 평면 디자인, 배경 대비가 충분할 때
- **sm**: 일반 리스트/요약 카드 (기본값)
- **md**: 섹션 내 강조 카드
- **lg**: 주요 CTA, 핵심 정보 카드

### 디자이너 체크 포인트
- 한 화면에 shadow 레벨이 너무 다양하지 않은지 (일관성)
- 카드 간 간격(gap)이 충분한지
- 모바일에서 카드가 화면을 벗어나지 않는지
- heading과 body 사이 시각적 구분이 명확한지
        `,
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Basic: Story = {
    name: "기본",
};

export const Shadows: Story = {
    name: "그림자 단계",
    render: (args) => (
        <div style={{ display: "grid", gap: 12 }}>
            <Card {...args} shadow="none" heading="Shadow: none">
                평면 카드(그림자 없음) — 정보가 단순하거나 배경 대비가 충분할 때 적합합니다.
            </Card>

            <Card {...args} shadow="sm" heading="Shadow: sm">
                기본 강조 — 일반적인 리스트/요약 카드에 가장 무난합니다.
            </Card>

            <Card {...args} shadow="md" heading="Shadow: md">
                중간 강조 — 섹션 내에서 조금 더 눈에 띄어야 하는 카드에 적합합니다.
            </Card>

            <Card {...args} shadow="lg" heading="Shadow: lg">
                강한 강조 — 주요 CTA/핵심 정보를 담는 카드에 사용하면 좋습니다.
            </Card>
        </div>
    ),
    args: {
        padding: "md",
    },
};

export const Padding: Story = {
    name: "여백 단계",
    render: (args) => (
        <div style={{ display: "grid", gap: 12 }}>
            <Card {...args} padding="sm" heading="Padding: sm">
                여백이 작아 콘텐츠 밀도가 높게 보입니다.
            </Card>

            <Card {...args} padding="md" heading="Padding: md">
                기본 여백 — 대부분의 카드에 가장 안정적입니다.
            </Card>

            <Card {...args} padding="lg" heading="Padding: lg">
                여백이 넉넉해 ‘프리미엄/강조’ 느낌이 납니다.
            </Card>
        </div>
    ),
    args: {
        shadow: "sm",
    },
};

export const Border: Story = {
    name: "테두리 사용",
    render: (args) => (
        <div style={{ display: "grid", gap: 12 }}>
            <Card {...args} bordered heading="Bordered: true">
                배경이 흰 화면에서 카드 경계를 또렷하게 보여주고 싶을 때 사용합니다.
            </Card>

            <Card {...args} bordered={false} heading="Bordered: false">
                경계선 없이 더 미니멀한 카드 느낌입니다(그림자로만 구분).
            </Card>
        </div>
    ),
    args: {
        shadow: "sm",
        padding: "md",
    },
};