import type {Meta, StoryObj} from "@storybook/react";
import * as React from "react";
import {AlertProvider, useAlert} from "../ui/feedback/alert";

type AlertDemoProps = {
    variant?: "info" | "success" | "warning" | "error";
    title?: React.ReactNode;
    message?: React.ReactNode;
    showCancel?: boolean;
    actionsAlign?: "left" | "center" | "right";
};

const AlertDemo = ({
                       variant = "info",
                       title = "알림",
                       message = "내용을 확인해주세요.",
                       showCancel = false,
                       actionsAlign = "right",
                   }: AlertDemoProps) => {
    const {showAlert} = useAlert();

    const handleClick = () => {
        showAlert({
            variant,
            title,
            message,
            showCancel,
            actionsAlign,
            onConfirm: () => console.log("확인됨"),
            onCancel: () => console.log("취소됨"),
        });
    };

    return (
        <div style={{padding: 20}}>
            <button
                type="button"
                onClick={handleClick}
                style={{
                    padding: "10px 20px",
                    backgroundColor: "#000000",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                }}
            >
                Alert 열기
            </button>
        </div>
    );
};

const meta: Meta<typeof AlertDemo> = {
    title: "Components/Feedback/Alert",
    component: AlertDemo,
    decorators: [
        (Story) => (
            <AlertProvider>
                <Story/>
            </AlertProvider>
        ),
    ],
    tags: ["autodocs"],
    argTypes: {
        variant: {
            control: "select",
            options: ["info", "success", "warning", "error"],
            description: "알림의 성격을 정합니다 (정보/성공/경고/오류).",
        },
        title: {
            control: "text",
            description: "알림 상단 제목입니다. 비우면 제목 줄이 표시되지 않습니다.",
        },
        message: {
            control: "text",
            description: "알림 본문 메시지입니다.",
        },
        showCancel: {
            control: "boolean",
            description:
                "취소 버튼 표시 여부입니다. 되돌릴 수 없는 작업(삭제/종료 등)에는 보통 true로 사용합니다.",
        },
        actionsAlign: {
            control: "select",
            options: ["left", "center", "right"],
            description: "버튼 정렬 위치입니다. 기본값은 right입니다.",
        },
    },
    args: {
        variant: "info",
        title: "알림",
        message: "이것은 정보 알림입니다.",
        showCancel: false,
        actionsAlign: "right",
    },
    parameters: {
        docs: {
            description: {
                component: `
**Alert**는 사용자의 즉각적인 확인이 필요한 상황에서 사용하는 **모달 형태의 알림 창**입니다.

### 언제 사용하나요?
- 중요한 작업 완료 알림
- 되돌릴 수 없는 행동(삭제/종료 등) 전에 확인 요청
- 오류/경고 메시지 표시

### 버튼 구성
- **확인만 있는 Alert**: 안내/완료/정보성 메시지
- **취소 + 확인 Alert**: 경고/삭제/결제 등 사용자가 “되돌릴 수 있는 선택”이 필요한 상황

### 디자이너 체크 포인트
- 경고/삭제 성격이면 '취소' 버튼을 포함하는 것을 권장합니다.
- 버튼 정렬은 기본적으로 **오른쪽 정렬**이 가장 일반적입니다.
        `,
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof AlertDemo>;

export const Info: Story = {
    name: "정보 알림",
    render: () => (
        <AlertDemo
            variant="info"
            title="알림"
            message="이것은 정보 알림입니다."
            showCancel={false}
            actionsAlign="right"
        />
    ),
};

export const Success: Story = {
    name: "성공 알림",
    render: () => (
        <AlertDemo
            variant="success"
            title="성공"
            message="작업이 성공적으로 완료되었습니다."
            showCancel={false}
            actionsAlign="right"
        />
    ),
};

export const Warning: Story = {
    name: "경고",
    render: () => (
        <AlertDemo
            variant="warning"
            title="경고"
            message="이 작업을 진행하시겠습니까?"
            showCancel={true}
            actionsAlign="right"
        />
    ),
};

export const Error: Story = {
    name: "오류 알림",
    render: () => (
        <AlertDemo
            variant="error"
            title="오류"
            message="작업을 처리하는 중 오류가 발생했습니다."
            showCancel={true}
            actionsAlign="right"
        />
    ),
};

export const ActionsLeft: Story = {
    name: "버튼 왼쪽 정렬",
    render: () => (
        <AlertDemo
            variant="info"
            title="왼쪽 정렬"
            message="버튼이 왼쪽에 정렬됩니다."
            showCancel={true}
            actionsAlign="left"
        />
    ),
};

export const ActionsCenter: Story = {
    name: "버튼 중앙 정렬",
    render: () => (
        <AlertDemo
            variant="info"
            title="중앙 정렬"
            message="버튼이 중앙에 정렬됩니다."
            showCancel={true}
            actionsAlign="center"
        />
    ),
};

export const ActionsRight: Story = {
    name: "버튼 오른쪽 정렬",
    render: () => (
        <AlertDemo
            variant="info"
            title="오른쪽 정렬"
            message="버튼이 오른쪽에 정렬됩니다."
            showCancel={true}
            actionsAlign="right"
        />
    ),
};

export const LongMessage: Story = {
    name: "긴 메시지 처리",
    render: () => (
        <AlertDemo
            variant="info"
            title="긴 메시지"
            message="이것은 매우 긴 메시지입니다. Alert는 자동으로 메시지의 길이에 맞춰 크기가 조정됩니다. 여러 줄의 텍스트도 잘 표시됩니다."
            showCancel={true}
            actionsAlign="right"
        />
    ),
};