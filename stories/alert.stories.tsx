import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "../src/ui/alert";

const meta: Meta<typeof Alert> = {
    title: "Components/Feedback/Alert",
    component: Alert,
    tags: ["autodocs"],
    argTypes: {
        variant: { control: "select", options: ["info", "success", "warning", "error"] },
        title: { control: "text" }
    },
    args: {
        variant: "info",
        title: "알림",
        children: "이 영역에는 상세 설명이 들어갑니다."
    },
    parameters: {
        docs: {
            description: {
                component:
                    "페이지 내 상태/결과를 안내하는 컴포넌트입니다. `variant`로 색상을 바꿀 수 있고, `title`/children을 통해 제목과 설명을 표시합니다."
            }
        }
    }
};
export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = {};
export const Success: Story = { args: { variant: "success", title: "성공", children: "정상적으로 처리되었습니다." } };
export const Warning: Story = { args: { variant: "warning", title: "주의", children: "확인이 필요합니다." } };
export const Error: Story = { args: { variant: "error", title: "오류", children: "오류가 발생했습니다." } };