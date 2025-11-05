import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "../src/ui/alert";
import {BadgeInfoIcon,AlertTriangle, CheckCircle2, OctagonAlert} from "lucide-react";

const meta: Meta<typeof Alert> = {
    title: "Components/Feedback/Alert",
    component: Alert,
    tags: ["autodocs"],
    argTypes: {
        variant: { control: "select", options: ["info", "success", "warning", "error"] },
        title: { control: "text" },
        icon: { table: { disable: true } },
        onClose: { action: "close", table: { disable: true } },
    },
    args: {
        variant: "info",
        title: "알림",
        children: "이 영역에는 상세 설명이 들어갑니다.",
    },
    parameters: {
        docs: {
            description: {
                component:
                    "페이지 내 상태/결과 안내에 사용하는 경고 박스입니다. `variant`로 색을 바꾸고, `icon`/`closable`로 아이콘/닫기 버튼을 제어합니다."
            }
        }
    }
};
export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = { args: { icon: <BadgeInfoIcon size={18} /> } };
export const Success: Story = {
    args: { variant: "success", title: "성공", children: "정상적으로 처리되었습니다.", icon: <CheckCircle2 size={18} /> }
};
export const Warning: Story = {
    args: { variant: "warning", title: "주의", children: "확인이 필요합니다.", icon: <AlertTriangle size={18} /> }
};
export const Error: Story = {
    args: { variant: "error", title: "오류", children: "오류가 발생했습니다.", icon: <OctagonAlert size={18} /> }
};

export const Closable: Story = {
    args: {
        title: "닫기가 가능한 알림",
        children: "오른쪽 상단의 × 버튼으로 닫을 수 있습니다.",
        closable: true
    }
};