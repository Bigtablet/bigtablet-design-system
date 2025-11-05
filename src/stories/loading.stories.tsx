import type { Meta, StoryObj } from "@storybook/react";
import { Loading } from "../ui/feedback/loading";

const meta: Meta<typeof Loading> = {
    title: "Components/Feedback/Loading",
    component: Loading,
    tags: ["autodocs"],
    argTypes: {
        size: { control: "number" }
    },
    args: { size: 24 },
    parameters: {
        docs: {
            description: {
                component:
                    "간단한 스피너 로딩 표시입니다. `size`로 크기를 조절합니다. 버튼 내부 등의 인라인 로딩에도 적합합니다."
            }
        }
    }
};
export default meta;
type Story = StoryObj<typeof Loading>;

export const Basic: Story = {};
export const Sizes: Story = {
    render: () => (
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Loading size={16} />
            <Loading size={24} />
            <Loading size={32} />
            <Loading size={48} />
        </div>
    )
};