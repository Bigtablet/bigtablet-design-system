import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Select, type SelectOption } from "../src/ui/select";

const options: SelectOption[] = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "cherry", label: "Cherry" },
    { value: "disabled", label: "Disabled Option", disabled: true }
];

const meta: Meta<typeof Select> = {
    title: "Components/Select",
    component: Select,
    tags: ["autodocs"],
    argTypes: {
        variant: { control: "select", options: ["outline", "filled", "ghost"], description: "스타일" },
        size:    { control: "select", options: ["sm", "md", "lg"], description: "크기" },
        disabled:{ control: "boolean", description: "비활성화" }
    },
    args: {
        label: "Fruit",
        options,
        placeholder: "Choose a fruit",
        variant: "outline",
        size: "md"
    },
    parameters: {
        docs: {
            description: {
                component:
                    "드롭다운 방식의 Select 컴포넌트. 키보드(↑/↓/Enter/Escape/Home/End)와 마우스를 모두 지원하며, `value/onChange`로 컨트롤드/언컨트롤드 모두 사용 가능합니다."
            }
        }
    }
};
export default meta;

type Story = StoryObj<typeof Select>;

export const Outline: Story = {};

export const Filled: Story = { args: { variant: "filled" } };

export const Ghost: Story  = { args: { variant: "ghost" } };

export const Disabled: Story = { args: { disabled: true } };

export const Sizes: Story = {
    render: (args) => (
        <div style={{ display: "grid", gap: 12, width: 320 }}>
            <Select {...args} size="sm" />
            <Select {...args} size="md" />
            <Select {...args} size="lg" />
        </div>
    )
};

export const Controlled: Story = {
    render: (args) => {
        const [val, setVal] = React.useState<string | null>("banana");
        return (
            <div style={{ width: 320 }}>
                <Select {...args} value={val} onChange={setVal} />
                <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>value: {String(val)}</div>
            </div>
        );
    }
};