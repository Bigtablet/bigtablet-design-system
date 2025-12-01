import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../ui/display/card";

const meta: Meta<typeof Card> = {
    title: "Components/Display/Card",
    component: Card,
    tags: ["autodocs"],
    argTypes: {
        heading: { control: "text" },
        shadow: { control: "select", options: ["none", "sm", "md", "lg"] },
        padding: { control: "select", options: ["none", "sm", "md", "lg"] },
        bordered: { control: "boolean" }
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
        )
    },
    parameters: {
        docs: {
            description: {
                component:
                    "`Card`는 콘텐츠를 그룹화하는 컨테이너입니다. `heading`을 통해 상단 타이틀을 표시할 수 있으며, `shadow`·`padding`·`bordered`를 조절해 다양한 스타일을 구성할 수 있습니다."
            }
        }
    }
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Basic: Story = {};

export const Variants: Story = {
    render: (args) => (
        <div style={{ display: "grid", gap: 12 }}>
            <Card {...args} shadow="none" heading="No Shadow">
                그림자 없이 카드만 렌더링되는 버전입니다.
            </Card>

            <Card {...args} shadow="sm" heading="Shadow: sm">
                작은 그림자가 적용된 카드입니다.
            </Card>

            <Card {...args} shadow="md" heading="Shadow: md">
                중간 크기 그림자가 적용된 카드입니다.
            </Card>

            <Card {...args} shadow="lg" heading="Shadow: lg">
                큰 그림자가 적용된 카드입니다.
            </Card>
        </div>
    ),
    args: {
        padding: "md"
    }
};