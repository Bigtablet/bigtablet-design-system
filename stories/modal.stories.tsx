import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Modal } from "../src/ui/modal";

const meta: Meta<typeof Modal> = {
    title: "Components/Overlay/Modal",
    component: Modal,
    tags: ["autodocs"],
    argTypes: {
        width: { control: "text" },
        closeOnOverlay: { control: "boolean" }
    },
    args: { width: 520, closeOnOverlay: true },
    parameters: {
        docs: {
            description: {
                component:
                    "중앙 표시 오버레이입니다. `open`/`onClose`로 제어하며 `closeOnOverlay`로 바깥 클릭 닫힘을 설정합니다."
            }
        }
    }
};
export default meta;
type Story = StoryObj<typeof Modal>;

export const Playground: Story = {
    render: (args) => {
        const [open, setOpen] = useState(false);
        return (
            <div>
                <button onClick={() => setOpen(true)}>Open modal</button>
                <Modal
                    {...args}
                    open={open}
                    onClose={() => setOpen(false)}
                    title="모달 제목"
                >
                    내용 영역입니다. 버튼이나 폼을 배치하세요.
                </Modal>
            </div>
        );
    }
};