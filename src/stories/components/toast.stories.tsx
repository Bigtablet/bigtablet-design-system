import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { ToastProvider } from "src/ui/feedback/toast";
import {useToast} from "src/ui/feedback/toast/use-toast";

const demo_wrap_style: React.CSSProperties = {
    display: "grid",
    gap: 12,
    padding: 20,
    maxWidth: 360,
};

const demo_btn_style: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #e5e5e5",
    background: "#ffffff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
};

const demo_hint_style: React.CSSProperties = {
    margin: 0,
    fontSize: 13,
    color: "#666666",
    lineHeight: 1.5,
};

type ToastDemoButtonsProps = {
    containerId: string;
};

function ToastDemoButtons({ containerId }: ToastDemoButtonsProps) {
    const t = useToast(containerId);

    return (
        <div style={demo_wrap_style}>
            <p style={demo_hint_style}>
                아래 버튼을 누르면 화면 우측 상단에 Toast가 잠깐 표시됩니다.
            </p>

            <button type="button" style={demo_btn_style} onClick={() => t.message("기본 메시지입니다.")}>
                Default (기본)
            </button>

            <button type="button" style={demo_btn_style} onClick={() => t.success("성공적으로 완료되었습니다.")}>
                Success (성공)
            </button>

            <button type="button" style={demo_btn_style} onClick={() => t.warning("주의가 필요한 상황입니다.")}>
                Warning (경고)
            </button>

            <button type="button" style={demo_btn_style} onClick={() => t.error("오류가 발생했습니다. 다시 시도해주세요.")}>
                Error (오류)
            </button>

            <button type="button" style={demo_btn_style} onClick={() => t.info("참고용 안내 메시지입니다.")}>
                Info (정보)
            </button>
        </div>
    );
}

const meta: Meta = {
    title: "Components/Feedback/Toast",
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: `
**Toast**는 화면을 막지 않고 잠깐 나타났다 사라지는 가벼운 알림입니다.

- 저장 완료/복사 완료 같은 “짧은 피드백”에 사용합니다.
- 확인/취소가 필요한 경우는 Alert(모달)를 권장합니다.
        `,
            },
        },
    },
};

export default meta;
type Story = StoryObj;

export const Playground: Story = {
    name: "Playground",
    render: () => {
        const containerId = "toast_playground";

        return (
            <>
                <ToastProvider containerId={containerId} />
                <ToastDemoButtons containerId={containerId} />
            </>
        );
    },
};

export const UsageExample: Story = {
    name: "코드 형태",
    render: () => (
        <div style={{ padding: 20, maxWidth: 720 }}>
      <pre
          style={{
              margin: 0,
              padding: 16,
              borderRadius: 12,
              background: "#fafafa",
              border: "1px solid #e5e5e5",
              fontSize: 13,
              lineHeight: 1.5,
              overflowX: "auto",
          }}
      >{`// 1) 앱 루트에 ToastProvider를 한 번만 렌더링합니다.
<ToastProvider />

// 2) 필요한 곳에서 useToast()로 메시지를 띄웁니다.
const t = useToast();
t.success("저장 완료");`}</pre>
        </div>
    ),
};