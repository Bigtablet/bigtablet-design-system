import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../src/ui/card";

const meta: Meta<typeof Card> = {
    title: "Components/Display/Card",
    component: Card,
    tags: ["autodocs"],
    argTypes: {
        shadow: { control: "select", options: ["none", "sm", "md", "lg"] },
        padding: { control: "select", options: ["none", "sm", "md", "lg"] },
        bordered: { control: "boolean" }
    },
    args: {
        shadow: "sm",
        padding: "md",
        bordered: false,
        children: (
            <div>
                <h4 style={{ margin: 0 }}>Card Title</h4>
                <p style={{ margin: "8px 0 0" }}>내용을 감싸는 기본 컨테이너입니다.</p>
            </div>
        )
    },
    parameters: {
        docs: {
            description: {
                component:
                    "`Card`는 콘텐츠를 그룹화하는 컨테이너입니다. `shadow`/`padding`/`bordered`로 스타일을 조절합니다."
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
            <Card {...args} shadow="none">No Shadow</Card>
            <Card {...args} shadow="sm">Shadow sm</Card>
            <Card {...args} shadow="md">Shadow md</Card>
            <Card {...args} shadow="lg">Shadow lg</Card>
        </div>
    ),
    args: { padding: "md" }
};