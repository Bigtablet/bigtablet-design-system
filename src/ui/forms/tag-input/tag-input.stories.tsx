import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Field } from "../field";
import { TagInput } from ".";

const meta: Meta<typeof TagInput> = {
	title: "Components/Forms/TagInput",
	component: TagInput,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
**TagInput** - 후보 목록에 없는 값을 사용자가 직접 만들어 넣는 다중 입력.

후보가 정해져 있으면 \`Dropdown\` 의 \`multiple\`, 후보를 서버에서 가져와야 하면 \`Combobox\` 를 쓴다.
\`TagInput\` 이 맡는 것은 **목록 자체가 없는** 경우다 - 자유 키워드, 사내 라벨, 검색 필터.

태그 칩은 \`Chip\` 의 \`static\` + \`removable\` 을 그대로 쓴다.

- Enter 또는 쉼표로 확정. 폼 제출로 새지 않는다
- 빈 입력에서 Backspace 로 마지막 태그 제거 (마우스 없이 되돌리는 경로)
- 쉼표·줄바꿈이 섞인 목록을 붙여넣으면 여러 태그로 나뉜다
- 포커스를 옮길 때 남은 입력을 확정한다 - Enter 를 잊어 값이 사라지지 않게
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof TagInput>;

export const Basic: Story = {
	name: "기본",
	parameters: {
		docs: {
			description: {
				story:
					"입력하고 Enter. 쉼표도 같은 역할을 한다. 빈 입력에서 Backspace 는 마지막 태그를 지운다.",
			},
		},
	},
	render: () => {
		const [tags, setTags] = useState<string[]>(["react", "typescript"]);
		return (
			<div style={{ width: 360 }}>
				<TagInput fullWidth ariaLabel="키워드" value={tags} onValueChange={setTags} />
			</div>
		);
	},
};

export const WithField: Story = {
	name: "Field 안에서",
	parameters: {
		docs: {
			description: {
				story:
					"`Field` 가 라벨·도움말·에러를 소유하고, 입력은 `aria-labelledby`·`aria-describedby` 를 그쪽에서 받는다.",
			},
		},
	},
	render: () => {
		const [tags, setTags] = useState<string[]>([]);
		return (
			<div style={{ width: 360 }}>
				<Field name="keywords" label="키워드" required help="Enter 또는 쉼표로 구분합니다">
					<TagInput fullWidth value={tags} onValueChange={setTags} />
				</Field>
			</div>
		);
	},
};

export const MaxTags: Story = {
	name: "개수 제한",
	parameters: {
		docs: {
			description: {
				story:
					"`maxTags` 에 도달하면 입력이 읽기 전용으로 바뀌고, 왜 더 안 들어가는지 라이브 영역으로 알린다. 도움말로도 함께 적어 주는 것이 좋다.",
			},
		},
	},
	render: () => {
		const [tags, setTags] = useState<string[]>(["긴급", "버그"]);
		return (
			<div style={{ width: 360 }}>
				<Field name="labels" label="라벨" help="최대 3개">
					<TagInput fullWidth maxTags={3} value={tags} onValueChange={setTags} />
				</Field>
			</div>
		);
	},
};

export const Paste: Story = {
	name: "붙여넣기로 여러 개",
	parameters: {
		docs: {
			description: {
				story:
					"`react, vue, svelte` 처럼 쉼표로 이어진 목록을 붙여넣어 보라. 줄바꿈·탭도 구분자로 처리한다.",
			},
		},
	},
	render: () => {
		const [tags, setTags] = useState<string[]>([]);
		return (
			<div style={{ width: 360 }}>
				<TagInput
					fullWidth
					ariaLabel="기술 스택"
					value={tags}
					onValueChange={setTags}
					placeholder="목록을 붙여넣어 보세요"
				/>
			</div>
		);
	},
};

export const Sizes: Story = {
	name: "크기",
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 12, width: 360 }}>
			<TagInput fullWidth size="sm" ariaLabel="sm" defaultValue={["sm"]} />
			<TagInput fullWidth size="md" ariaLabel="md" defaultValue={["md"]} />
			<TagInput fullWidth size="lg" ariaLabel="lg" defaultValue={["lg"]} />
		</div>
	),
};

export const Disabled: Story = {
	name: "비활성",
	render: () => (
		<div style={{ width: 360 }}>
			<TagInput fullWidth disabled ariaLabel="키워드" defaultValue={["react", "typescript"]} />
		</div>
	),
};
