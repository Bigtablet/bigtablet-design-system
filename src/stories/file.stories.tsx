import type { Meta, StoryObj } from "@storybook/react";
import { FileInput } from "../ui/form/file";

const meta: Meta<typeof FileInput> = {
    title: "Components/Form/FileInput",
    component: FileInput,
    tags: ["autodocs"],
    argTypes: {
        multiple: { control: "boolean" },
        disabled: { control: "boolean" }
    },
    args: {
        label: "파일 선택"
    },
    parameters: {
        docs: {
            description: {
                component:
                    "기본 파일 입력의 스타일 버전입니다. 클릭 또는 드래그&드롭(확장 필요)으로 파일을 선택하고, `onFiles` 콜백으로 선택 결과를 받을 수 있습니다."
            }
        }
    }
};
export default meta;
type Story = StoryObj<typeof FileInput>;

export const Basic: Story = {
    render: (args) => (
        <FileInput
            {...args}
            onFiles={(files) => console.log("files", files)}
        />
    )
};
export const Multiple: Story = { args: { multiple: true } };
export const Disabled: Story = { args: { disabled: true } };