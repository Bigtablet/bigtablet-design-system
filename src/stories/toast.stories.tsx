import type { Meta, StoryObj } from "@storybook/react";
import { ToastProvider, useToast } from "../ui/feedback/toast";

const meta: Meta<typeof ToastProvider> = {
    title: "Components/Feedback/Toast",
    component: ToastProvider,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "`ToastProvider`를 루트에 두고 `useToast()` 훅으로 메시지를 띄웁니다. 내부는 react-toastify를 래핑합니다."
            }
        }
    }
};
export default meta;

type Story = StoryObj<typeof ToastProvider>;

function Demo() {
    const t = useToast();
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={() => t.message("기본 메시지")}>Default</button>
            <button onClick={() => t.success("✅ 성공!")}>Success</button>
            <button onClick={() => t.warning("⚠️ 경고!")}>Warning</button>
            <button onClick={() => t.error("❌ 에러 발생!")}>Error</button>
            <button onClick={() => t.info("ℹ️ 정보 (4s)")}>Info (4s)</button>
        </div>
    );
}

export const Playground: Story = {
    render: () => (
        <>
            <Demo />
            <ToastProvider />
        </>
    )
};