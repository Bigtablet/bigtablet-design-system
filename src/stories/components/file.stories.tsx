import type {Meta, StoryObj} from "@storybook/react";
import * as React from "react";
import {FileInput} from "../../ui/form/file";

const meta: Meta<typeof FileInput> = {
    title: "Components/Form/FileInput",
    component: FileInput,
    tags: ["autodocs"],
    argTypes: {
        label: {
            control: "text",
            description: "버튼(라벨)에 표시되는 문구입니다.",
        },
        multiple: {
            control: "boolean",
            description: "여러 파일 선택 허용 여부입니다.",
        },
        disabled: {
            control: "boolean",
            description: "비활성화 상태입니다. 선택할 수 없습니다.",
        },
        onFiles: {control: false},
    },
    args: {
        label: "파일 선택",
        multiple: false,
        disabled: false,
    },
    parameters: {
        docs: {
            description: {
                component: `
**FileInput**은 기본 파일 업로드 입력을 버튼 형태로 스타일링한 컴포넌트입니다.

### 언제 사용하나요?
- 프로필 이미지, 첨부파일, 문서 업로드 등 “파일 선택”이 필요한 모든 상황

### 동작
- 버튼을 클릭하면 파일 선택 창이 열립니다.
- 파일을 선택하면 \`onFiles(files)\` 콜백으로 선택 결과를 받을 수 있습니다.
- 실제 파일 업로드 로직은 별도의 gcp 쿼리를 이용해 사용해주세요.

### 참고
- “드래그 & 드롭 업로드”는 별도 Dropzone 컴포넌트로 확장하는 것을 권장합니다.
        `,
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof FileInput>;

export const Basic: Story = {
    name: "기본",
    render: (args) => {
        const [fileNames, setFileNames] = React.useState<string>("선택된 파일 없음");

        return (
            <div style={{display: "grid", gap: 10}}>
                <FileInput
                    {...args}
                    onFiles={(files) => {
                        const names = files?.length ? Array.from(files).map((f) => f.name).join(", ") : "선택된 파일 없음";
                        setFileNames(names);
                        console.log("files", files);
                    }}
                />
                <p style={{margin: 0, fontSize: 13, color: "#666"}}>{fileNames}</p>
            </div>
        );
    },
};

export const Multiple: Story = {
    name: "여러 파일 선택",
    args: {multiple: true, label: "여러 파일 선택"},
};

export const Disabled: Story = {
    name: "비활성화",
    args: {disabled: true},
};