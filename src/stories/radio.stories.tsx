import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Radio } from "../ui/form/radio";

const meta: Meta<typeof Radio> = {
    title: "Components/Form/Radio",
    component: Radio,
    tags: ["autodocs"],
    argTypes: {
        size: { control: "select", options: ["sm", "md", "lg"] },
        disabled: { control: "boolean" },
    },
    args: { size: "md", disabled: false },
    parameters: {
        docs: {
            description: {
                component:
                    "하나만 선택 가능한 옵션입니다. 같은 그룹으로 묶으려면 `name`을 동일하게 설정하고, `checked`/`onChange`로 선택 상태를 제어합니다.",
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Group: Story = {
    name: "그룹 선택 예시",
    render: (args) => {
        const groupId = React.useId();
        const groupName = `radio_group_${groupId}`;
        const [value, setValue] = React.useState("b");

        return (
            <div style={{ display: "grid", gap: 8 }}>
                <Radio
                    {...args}
                    name={groupName}
                    value="a"
                    checked={value === "a"}
                    onChange={() => setValue("a")}
                    label="Option A"
                />
                <Radio
                    {...args}
                    name={groupName}
                    value="b"
                    checked={value === "b"}
                    onChange={() => setValue("b")}
                    label="Option B"
                />
                <Radio
                    {...args}
                    name={groupName}
                    value="c"
                    checked={value === "c"}
                    onChange={() => setValue("c")}
                    label="Option C"
                />
            </div>
        );
    },
};

export const Disabled: Story = {
    name: "비활성화",
    render: (args) => {
        const groupId = React.useId();
        const groupName = `radio_disabled_${groupId}`;

        return (
            <div style={{ display: "grid", gap: 8 }}>
                <Radio {...args} name={groupName} value="a" disabled label="Disabled A" />
                <Radio {...args} name={groupName} value="b" disabled label="Disabled B" />
            </div>
        );
    },
};