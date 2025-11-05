import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../src/ui/button";

const meta: Meta<typeof Button> = {
    title: "Components/General/Button",
    component: Button,
    tags: ["autodocs"],
    argTypes: {
        variant: { control: "select", options: ["primary", "secondary", "ghost"], description: "스타일" },
        size: { control: "select", options: ["sm", "md", "lg"], description: "크기" },
        disabled: { control: "boolean", description: "비활성화" },
        onClick: { action: "clicked" }
    },
    args: { children: "Button", variant: "primary", size: "md" },
    parameters: {
        docs: {
            description: {
                component: "디자인 시스템의 기본 버튼입니다. `variant`, `size`로 스타일을 제어합니다."
            }
        }
    }
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Sizes: Story = {
    render: (args) => (
        <div style={{ display: "flex", gap: 8 }}>
            <Button {...args} size="sm">Small</Button>
            <Button {...args} size="md">Medium</Button>
            <Button {...args} size="lg">Large</Button>
        </div>
    ),
    args: { variant: "primary" }
};
export const Disabled: Story = { args: { disabled: true } };