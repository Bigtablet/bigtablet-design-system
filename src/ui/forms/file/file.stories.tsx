import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { UPLOAD_COMPARISON } from "../upload-comparison.docs";
import { FileInput } from ".";

const meta: Meta<typeof FileInput> = {
	title: "Components/Forms/FileInput",
	component: FileInput,
	tags: ["autodocs"],
	argTypes: {
		label: {
			control: "text",
			description: "버튼 라벨 / preview 빈 상태 텍스트.",
		},
		variant: {
			control: "radio",
			options: ["button", "preview"],
			description: "표시 형태. `button` 일반 버튼 / `preview` 큰 박스 안 이미지 미리보기.",
		},
		previewSize: {
			control: { type: "number", min: 80, max: 400, step: 8 },
			description: 'variant="preview" 박스 크기 (px).',
		},
		multiple: {
			control: "boolean",
			description: "여러 파일 선택 허용 여부 (button variant 만).",
		},
		disabled: {
			control: "boolean",
			description: "비활성화 상태.",
		},
		onFiles: { control: false },
	},
	args: {
		label: "파일 선택",
		variant: "button",
		previewSize: 160,
		multiple: false,
		disabled: false,
	},
	parameters: {
		docs: {
			description: {
				component: `
**FileInput** - 파일 선택. \`variant\` 로 표시 형태를 고른다.

- \`variant="button"\` (기본): 일반 파일 선택 버튼. \`preview\` 옵션으로 아래에 썸네일을 표시한다.
- \`variant="preview"\`: 큰 박스 안에 단일 이미지 미리보기 (avatar / 이미지 업로더 패턴). \`previewSize\` 로 박스 크기를 조정한다.

주요 prop: \`accept\`, \`multiple\`, \`onFiles(files)\`. 업로드는 별도 API 로 처리한다.

${UPLOAD_COMPARISON}
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof FileInput>;

export const Basic: Story = {
	name: "기본",
	parameters: {
		docs: {
			description: {
				story:
					'`variant="button"`(기본)입니다. **업로드하지 않습니다** - `onFiles(files)` 로 `File` 을 넘겨 주고 전송은 화면의 API 호출입니다.\n\n선택한 파일 이름을 보여 주려면 `preview` 를 켜거나 직접 그립니다.',
			},
		},
	},
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
				<p style={{ margin: 0, fontSize: 13, color: "var(--bt-color-text-body)" }}>{fileNames}</p>
			</div>
		);
	},
};

export const Multiple: Story = {
	name: "여러 파일 선택",
	args: { multiple: true, preview: true, label: "여러 파일 선택" },
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
					}}
				/>
				<p style={{ margin: 0, fontSize: 13, color: "var(--bt-color-text-body)" }}>{fileNames}</p>
			</div>
		);
	},
	parameters: {
		docs: {
			description: {
				story:
					"`multiple={true}` + `preview={true}` - 여러 이미지를 선택하면 64×64 썸네일이 버튼 아래 가로로 나열된다. 파일 이름은 아래 텍스트에서 확인한다.",
			},
		},
	},
};

export const AcceptFilter: Story = {
	name: "파일 형식 제한",
	parameters: {
		docs: {
			description: {
				story:
					'`accept` 는 파일 선택창의 **필터일 뿐 검증이 아닙니다.** 사용자가 "모든 파일" 로 바꿔 고를 수 있고 드래그 앤 드롭도 통과합니다.\n\n확장자·용량·MIME 검사는 `onFiles` 에서, 최종 검증은 서버에서 해야 합니다.',
			},
		},
	},
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
				<p style={{ margin: 0, fontSize: 13, color: "var(--bt-color-text-body)" }}>{fileNames}</p>
			</div>
		);
	},
};

export const Disabled: Story = {
	name: "비활성화",
	args: { disabled: true },
};

export const Preview: Story = {
	name: "이미지 미리보기 (variant=preview)",
	args: {
		variant: "preview",
		label: "이미지 선택",
		supportingText: "JPG, PNG (최대 5MB)",
	},
	parameters: {
		docs: {
			description: {
				story:
					"큰 박스 안에 이미지 미리보기. 비어 있을 때는 점선 border + 아이콘 + 라벨을 보여준다. 선택하면 이미지가 박스를 채우고 우상단 X 로 제거할 수 있다.",
			},
		},
	},
};

export const PreviewLarge: Story = {
	name: "Preview 크기 240",
	parameters: {
		docs: {
			description: {
				story:
					"`previewSize` 로 박스 한 변을 키웁니다. 아바타는 작게, 배너·표지처럼 **비율을 확인해야 하는 이미지**는 크게 두는 편이 낫습니다.",
			},
		},
	},
	args: {
		variant: "preview",
		previewSize: 240,
		label: "프로필 사진",
	},
};

export const PreviewDisabled: Story = {
	name: "Preview 비활성화",
	parameters: {
		docs: {
			description: {
				story:
					"미리보기 형태에서 잠긴 상태입니다. 이미 올린 이미지를 **바꿀 수 없는 화면**(승인 대기 등)에서 값을 보여 주면서 조작만 막을 때 씁니다.",
			},
		},
	},
	args: {
		variant: "preview",
		disabled: true,
		label: "이미지 선택",
	},
};
