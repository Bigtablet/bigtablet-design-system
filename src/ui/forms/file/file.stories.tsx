import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { FileInput } from ".";

const meta: Meta<typeof FileInput> = {
	title: "Components/FileInput",
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
		onFiles: { control: false },
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
- 프로필 이미지, 첨부파일, 문서 업로드 등 "파일 선택"이 필요한 모든 상황

### 동작 흐름
1. 버튼 클릭 → 파일 선택 창 열림
2. 파일 선택 → \`onFiles(files)\` 콜백 호출
3. 실제 업로드는 별도 API 호출 필요

### 확장 고려사항
- 드래그 & 드롭이 필요하면 별도 Dropzone 컴포넌트 사용 권장
- 이미지 미리보기가 필요하면 별도 구현 필요
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
			<div style={{ display: "grid", gap: 10 }}>
				<FileInput
					{...args}
					onFiles={(files) => {
						const names = files?.length
							? Array.from(files)
									.map((f) => f.name)
									.join(", ")
							: "선택된 파일 없음";
						setFileNames(names);
						console.log("files", files);
					}}
				/>
				<p style={{ margin: 0, fontSize: 13, color: "#666" }}>{fileNames}</p>
			</div>
		);
	},
};

export const Multiple: Story = {
	name: "여러 파일 선택",
	args: { multiple: true, label: "여러 파일 선택" },
};

export const AcceptFilter: Story = {
	name: "파일 형식 제한",
	render: (args) => {
		const [fileNames, setFileNames] = React.useState<string>("선택된 파일 없음");

		return (
			<div style={{ display: "grid", gap: 10 }}>
				<FileInput
					{...args}
					label="이미지 선택"
					accept="image/*"
					onFiles={(files) => {
						const names = files?.length
							? Array.from(files)
									.map((f) => f.name)
									.join(", ")
							: "선택된 파일 없음";
						setFileNames(names);
					}}
					supportingText="JPG, PNG, GIF 등 이미지 파일만 선택 가능합니다."
				/>
				<p style={{ margin: 0, fontSize: 13, color: "#666" }}>{fileNames}</p>
			</div>
		);
	},
};

export const Disabled: Story = {
	name: "비활성화",
	args: { disabled: true },
};
