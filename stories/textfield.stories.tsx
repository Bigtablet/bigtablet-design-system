import type { Meta, StoryObj } from "@storybook/react";
import { TextField } from "../src/ui/text-field";
import { Search, Mail, Eye } from "lucide-react";

/**
 * TextField 컴포넌트 스토리
 * variant / size / 상태 / 아이콘 등 주요 props 제어 가능
 */
const meta: Meta<typeof TextField> = {
    title: "Components/TextField",
    component: TextField,
    tags: ["autodocs"],
    argTypes: {
        variant: {
            control: { type: "select" },
            options: ["outline", "filled", "ghost"],
            description: "입력 필드 스타일 (variant)"
        },
        size: {
            control: { type: "select" },
            options: ["sm", "md", "lg"],
            description: "입력 필드 크기 (size)"
        },
        error: {
            control: "boolean",
            description: "에러 상태 여부"
        },
        success: {
            control: "boolean",
            description: "성공 상태 여부"
        },
        disabled: {
            control: "boolean",
            description: "비활성화 여부"
        },
        label: {
            control: "text",
            description: "상단 라벨 텍스트"
        },
        helperText: {
            control: "text",
            description: "하단 보조 텍스트"
        },
        leftIcon: { table: { disable: true } },
        rightIcon: { table: { disable: true } }
    },
    args: {
        label: "Label",
        placeholder: "Type something...",
        variant: "outline",
        size: "md"
    },
    parameters: {
        docs: {
            description: {
                component:
                    "디자인 시스템의 기본 입력 컴포넌트입니다. `variant`, `size`, `error`, `success` 등의 속성을 통해 다양한 상태와 스타일을 표현할 수 있습니다. Lucide 아이콘을 `leftIcon` 또는 `rightIcon` prop에 전달하여 아이콘을 함께 표시할 수도 있습니다."
            }
        }
    }
};
export default meta;

type Story = StoryObj<typeof TextField>;

/* ────────────── 기본 스토리들 ────────────── */

export const Outline: Story = {
    args: {
        variant: "outline",
        placeholder: "Outline input"
    }
};

export const Filled: Story = {
    args: {
        variant: "filled",
        placeholder: "Filled input"
    }
};

export const Ghost: Story = {
    args: {
        variant: "ghost",
        placeholder: "Ghost input"
    }
};

/* ────────────── 크기별 스토리 ────────────── */

export const Sizes: Story = {
    render: (args) => (
        <div style={{ display: "grid", gap: "12px", width: 360 }}>
            <TextField {...args} size="sm" placeholder="Small" />
            <TextField {...args} size="md" placeholder="Medium" />
            <TextField {...args} size="lg" placeholder="Large" />
        </div>
    ),
    args: {
        label: "Size demo",
        variant: "outline"
    }
};

/* ────────────── 아이콘 예시 ────────────── */

export const WithIcons: Story = {
    args: {
        label: "Search",
        placeholder: "Search…",
        leftIcon: <Search size={16} />,
        rightIcon: <Eye size={16} />
    }
};

export const WithMailIcon: Story = {
    args: {
        label: "Email",
        placeholder: "you@example.com",
        leftIcon: <Mail size={16} />
    }
};

export const ErrorAndHelper: Story = {
    args: {
        label: "Email",
        placeholder: "name@example.com",
        helperText: "Please enter a valid email.",
        error: true,
        leftIcon: <Mail size={16} />
    }
};

export const Success: Story = {
    args: {
        label: "Code",
        placeholder: "Looks good!",
        success: true
    }
};