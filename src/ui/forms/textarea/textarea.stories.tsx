import type { Meta, StoryObj } from "@storybook/react";
import { Bold, Italic, Underline } from "lucide-react";
import * as React from "react";
import { iconSize } from "../../../styles/icon";
import { IconButton } from "../../general/icon-button";
import { Textarea } from ".";

const meta: Meta<typeof Textarea> = {
	title: "Components/Forms/Textarea",
	component: Textarea,
	tags: ["autodocs"],
	argTypes: {
		size: { control: "select", options: ["sm", "md", "lg"] },
		resize: { control: "select", options: ["none", "vertical", "both"] },
		imeStrategy: { control: "select", options: ["delayed", "immediate"] },
		label: { control: "text" },
		supportingText: { control: "text" },
		error: { control: "boolean" },
		disabled: { control: "boolean" },
		showCounter: { control: "boolean" },
		fullWidth: { control: "boolean" },
		rows: { control: "number" },
		maxLength: { control: "number" },
	},
	args: {
		label: "내용",
		placeholder: "내용을 입력하세요",
		size: "md",
		rows: 3,
		fullWidth: true,
	},
	parameters: {
		docs: {
			description: {
				component: `
**Textarea** - 멀티라인 텍스트 입력. \`TextField\` 와 동일한 시각·토큰을 쓴다 (border / focus / error / label / helper / disabled).

- **auto-grow** - \`minRows\`/\`maxRows\` 를 지정하면 내용에 따라 높이가 자동으로 늘어난다
- **counter** - \`showCounter\` + \`maxLength\` 로 글자 수를 표시한다
- **resize** - none / vertical (기본) / both
- **한글 IME** - \`imeStrategy="immediate"\` 로 조합 중에도 실시간 콜백을 받는다
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
	render: (args) => {
		const [v, setV] = React.useState("");
		return (
			<div style={{ width: 420 }}>
				<Textarea {...args} value={v} onChangeAction={setV} />
			</div>
		);
	},
};

export const AutoGrow: Story = {
	name: "Auto-grow (minRows/maxRows)",
	parameters: {
		docs: {
			description: {
				story:
					"`minRows={2}` `maxRows={6}` - 입력할수록 늘어나다 6행 초과 시 스크롤. resize 핸들 자동 비활성.",
			},
		},
	},
	render: () => {
		const [v, setV] = React.useState("");
		return (
			<div style={{ width: 420 }}>
				<Textarea
					label="자기소개"
					placeholder="여러 줄 입력해보세요"
					minRows={2}
					maxRows={6}
					fullWidth
					value={v}
					onChangeAction={setV}
				/>
			</div>
		);
	},
};

export const WithCounter: Story = {
	name: "글자 수 카운터",
	render: () => {
		const [v, setV] = React.useState("");
		return (
			<div style={{ width: 420 }}>
				<Textarea
					label="공지 내용"
					placeholder="최대 200자"
					maxLength={200}
					showCounter
					minRows={3}
					maxRows={8}
					fullWidth
					value={v}
					onChangeAction={setV}
				/>
			</div>
		);
	},
};

export const ErrorState: Story = {
	name: "에러 상태",
	render: () => (
		<div style={{ width: 420 }}>
			<Textarea
				label="문의 내용"
				error
				supportingText="내용을 입력해주세요."
				rows={3}
				fullWidth
				defaultValue=""
			/>
		</div>
	),
};

export const Sizes: Story = {
	render: () => (
		<div style={{ display: "grid", gap: 16, width: 420 }}>
			<Textarea label="Small" size="sm" rows={2} fullWidth placeholder="sm" />
			<Textarea label="Medium" size="md" rows={2} fullWidth placeholder="md" />
			<Textarea label="Large" size="lg" rows={2} fullWidth placeholder="lg" />
		</div>
	),
};

export const WithToolbar: Story = {
	name: "서식 툴바 (toolbar 슬롯)",
	parameters: {
		docs: {
			description: {
				story:
					"`toolbar` 는 테두리 **안쪽**, 입력 위에 렌더된다. 컨테이너가 품으므로 포커스 테두리가 툴바까지 감싸고 모서리·구분선을 DS 가 처리한다. 밖에 두면 소비자가 컨테이너 모서리를 깎고 포커스 링을 따로 걸어야 했다.",
			},
		},
	},
	render: () => (
		<div style={{ width: 420 }}>
			<Textarea
				label="공지 내용"
				fullWidth
				minRows={4}
				maxRows={10}
				placeholder="내용을 입력하세요"
				toolbar={
					<>
						<IconButton
							aria-label="굵게"
							size="sm"
							variant="standard"
							icon={<Bold size={iconSize.sm} />}
						/>
						<IconButton
							aria-label="기울임"
							size="sm"
							variant="standard"
							icon={<Italic size={iconSize.sm} />}
						/>
						<IconButton
							aria-label="밑줄"
							size="sm"
							variant="standard"
							icon={<Underline size={iconSize.sm} />}
						/>
					</>
				}
			/>
		</div>
	),
};
