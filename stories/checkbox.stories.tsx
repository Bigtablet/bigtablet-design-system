import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "../src/ui/form/checkbox";

const meta: Meta<typeof Checkbox> = {
    title: "Components/Form/Checkbox",
    component: Checkbox,
    tags: ["autodocs"],
    argTypes: {
        size: { control: "select", options: ["sm", "md", "lg"] },
        disabled: { control: "boolean" },
        indeterminate: { control: "boolean" }
    },
    args: {
        label: "동의합니다",
        size: "md"
    },
    parameters: {
        docs: {
            description: {
                component:
                    "체크/해제 가능한 입력입니다. `indeterminate`로 중간 상태를 표현할 수 있습니다. 폼 라이브러리(react-hook-form 등)와도 쉽게 연동됩니다."
            }
        }
    }
};
export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Basic: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Indeterminate: Story = { args: { indeterminate: true } };
export const Sizes: Story = {
    render: (args) => (
        <div style={{ display: "grid", gap: 8 }}>
            <Checkbox {...args} size="sm" label="Small" />
            <Checkbox {...args} size="md" label="Medium" />
            <Checkbox {...args} size="lg" label="Large" />
        </div>
    )
};