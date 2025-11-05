import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Switch } from "../ui/form/switch";

const meta: Meta<typeof Switch> = {
    title: "Components/Form/Switch",
    component: Switch,
    tags: ["autodocs"],
    argTypes: {
        size: { control: "select", options: ["sm", "md", "lg"] },
        disabled: { control: "boolean" }
    },
    args: { size: "md" },
    parameters: {
        docs: {
            description: {
                component:
                    "ON/OFF 전환용 토글입니다. `checked`/`onChange`로 제어하거나, `defaultChecked`로 언컨트롤드로 사용합니다."
            }
        }
    }
};
export default meta;
type Story = StoryObj<typeof Switch>;

export const Controlled: Story = {
    render: (args) => {
        const [on, setOn] = useState(true);
        return <Switch {...args} checked={on} onChange={setOn} />;
    }
};
export const Sizes: Story = {
    render: (args) => (
        <div style={{ display: "flex", gap: 12 }}>
            <Switch {...args} size="sm" defaultChecked />
            <Switch {...args} size="md" defaultChecked />
            <Switch {...args} size="lg" defaultChecked />
        </div>
    )
};
export const Disabled: Story = { args: { disabled: true } };