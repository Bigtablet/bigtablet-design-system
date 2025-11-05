import type { Meta, StoryObj } from "@storybook/react";
import { TextField } from "../ui/form/textfield";
import { Search, Mail, Eye } from "lucide-react";

const meta: Meta<typeof TextField> = {
    title: "Components/Form/TextField",
    component: TextField,
    tags: ["autodocs"],
    argTypes: {
        variant: { control: "select", options: ["outline", "filled", "ghost"] },
        size: { control: "select", options: ["sm", "md", "lg"] },
        error: { control: "boolean" },
        success: { control: "boolean" },
        disabled: { control: "boolean" },
        label: { control: "text" },
        helperText: { control: "text" },
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
                    "기본 입력 컴포넌트입니다. `variant`, `size`, `error`, `success`로 다양한 상태를 표현하고, Lucide 아이콘을 `leftIcon`/`rightIcon`으로 넣을 수 있습니다."
            }
        }
    }
};
export default meta;
type Story = StoryObj<typeof TextField>;

export const Outline: Story = {};
export const Filled: Story = { args: { variant: "filled" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Sizes: Story = {
    render: (args) => (
        <div style={{ display: "grid", gap: 12, width: 360 }}>
            <TextField {...args} size="sm" placeholder="Small" />
            <TextField {...args} size="md" placeholder="Medium" />
            <TextField {...args} size="lg" placeholder="Large" />
        </div>
    ),
    args: { label: "Size demo", variant: "outline" }
};
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
        error: true
    }
};
export const Success: Story = {
    args: {
        label: "Code",
        placeholder: "Looks good!",
        success: true
    }
};