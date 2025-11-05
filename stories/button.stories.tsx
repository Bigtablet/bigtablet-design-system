import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../src/ui/button";

/**
 * Button 컴포넌트 스토리
 * variant / size / disabled 등 주요 props 제어 가능
 */
const meta: Meta<typeof Button> = {
    title: "Components/Button",
    component: Button,
    argTypes: {
        variant: {
            control: { type: "select" },
            options: ["primary", "secondary", "ghost"],
            description: "버튼의 스타일 변형 (variant)"
        },
        size: {
            control: { type: "select" },
            options: ["sm", "md", "lg"],
            description: "버튼 크기 (size)"
        },
        disabled: {
            control: "boolean",
            description: "비활성화 여부"
        },
        onClick: { action: "clicked" }
    },
    parameters: {
        docs: {
            description: {
                component:
                    "디자인 시스템에서 사용하는 기본 버튼 컴포넌트입니다. variant와 size를 통해 스타일과 크기를 변경할 수 있습니다."
            }
        }
    },
    tags: ["autodocs"]
};
export default meta;

type Story = StoryObj<typeof Button>;

/* ────────────── 기본 스토리들 ────────────── */

export const Primary: Story = {
    args: {
        children: "Primary",
        variant: "primary",
        size: "md"
    }
};

export const Secondary: Story = {
    args: {
        children: "Secondary",
        variant: "secondary",
        size: "md"
    }
};

export const Ghost: Story = {
    args: {
        children: "Ghost",
        variant: "ghost",
        size: "md"
    }
};

export const Sizes: Story = {
    render: (args) => (
        <div style={{ display: "flex", gap: "1rem" }}>
            <Button {...args} size="sm">
                Small
            </Button>
            <Button {...args} size="md">
                Medium
            </Button>
            <Button {...args} size="lg">
                Large
            </Button>
        </div>
    ),
    args: {
        variant: "primary"
    }
};

export const Disabled: Story = {
    args: {
        children: "Disabled",
        variant: "primary",
        disabled: true
    }
};