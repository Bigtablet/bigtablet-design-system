import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Radio } from "../ui/form/radio";

const meta: Meta<typeof Radio> = {
    title: "Components/Form/Radio",
    component: Radio,
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
                    "하나만 선택 가능한 옵션입니다. `name`을 동일하게 해 그룹을 만들고, `checked`/`onChange`로 제어할 수 있습니다."
            }
        }
    }
};
export default meta;
type Story = StoryObj<typeof Radio>;

export const Group: Story = {
    render: (args) => {
        const [val, setVal] = useState("b");
        return (
            <div style={{ display: "grid", gap: 8 }}>
                <Radio {...args} name="r" value="a" checked={val === "a"} onChange={() => setVal("a")} label="Option A" />
                <Radio {...args} name="r" value="b" checked={val === "b"} onChange={() => setVal("b")} label="Option B" />
                <Radio {...args} name="r" value="c" checked={val === "c"} onChange={() => setVal("c")} label="Option C" />
            </div>
        );
    }
};
export const Disabled: Story = {
    render: (args) => (
        <div style={{ display: "grid", gap: 8 }}>
            <Radio {...args} disabled label="Disabled A" />
            <Radio {...args} disabled label="Disabled B" />
        </div>
    )
};