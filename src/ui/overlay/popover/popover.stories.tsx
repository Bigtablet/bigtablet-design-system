import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Button } from "../../general/button";
import { Checkbox } from "../../forms/checkbox";
import { Stack } from "../../layout/stack";
import { Popover } from ".";

const meta: Meta<typeof Popover> = {
	title: "Components/Overlay/Popover",
	component: Popover,
	tags: ["autodocs"],
	argTypes: {
		placement: {
			control: "select",
			options: ["top", "bottom", "left", "right"],
			description: "trigger 기준 위치. / Position relative to the trigger.",
		},
		trigger: {
			control: false,
			description: "팝오버를 여는 트리거 ReactElement. / Trigger element that opens the popover.",
		},
		content: {
			control: false,
			description: "임의의 interactive 콘텐츠. / Arbitrary interactive content.",
		},
		open: {
			control: false,
			description: "제어 모드 열림 상태. / Controlled open state.",
		},
	},
	args: {
		placement: "bottom",
	},
	parameters: {
		docs: {
			description: {
				component: `
**Popover** - Click-triggered, non-modal panel for arbitrary interactive content (form / explanation / actions). For an action list use \`Menu\`; for hover info use \`Tooltip\`. / **Popover** - 클릭으로 여는 non-modal 패널. 임의의 interactive 콘텐츠(폼/설명/액션)를 담는다. 액션 리스트는 \`Menu\`, hover 정보는 \`Tooltip\`.

Closes on outside click / \`Esc\`. Moves focus into the panel on open; \`Esc\` returns focus to the trigger. / 외부 클릭·\`Esc\`로 닫힘. 열릴 때 패널로 포커스 이동, \`Esc\`로 닫으면 trigger 로 복귀.

\`role="dialog"\` (non-modal) - pass \`aria-label\` or \`aria-labelledby\` for an accessible name. / \`role="dialog"\`(non-modal) - 접근성 이름을 위해 \`aria-label\` 또는 \`aria-labelledby\` 전달.
				`.trim(),
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
	render: (args) => (
		<div style={{ padding: 80, display: "flex", justifyContent: "center" }}>
			<Popover
				{...args}
				aria-label="필터 옵션"
				trigger={<Button variant="outline">필터</Button>}
				content={
					<Stack gap={12}>
						<strong style={{ color: "var(--bt-color-text-heading)" }}>상태 필터</strong>
						<Checkbox label="활성" defaultChecked />
						<Checkbox label="대기" />
						<Checkbox label="종료" />
						<Button size="sm">적용</Button>
					</Stack>
				}
			/>
		</div>
	),
};

export const Placements: Story = {
	name: "위치 (4방향)",
	render: () => (
		<div
			style={{
				padding: 120,
				display: "grid",
				gridTemplateColumns: "repeat(2, auto)",
				gap: 80,
				justifyItems: "center",
			}}
		>
			{(["top", "bottom", "left", "right"] as const).map((placement) => (
				<Popover
					key={placement}
					placement={placement}
					aria-label={`${placement} 팝오버`}
					trigger={<Button variant="outline">{placement}</Button>}
					content={
						<div style={{ color: "var(--bt-color-text-body)" }}>
							placement="{placement}"
						</div>
					}
				/>
			))}
		</div>
	),
};

export const RichContent: Story = {
	name: "리치 콘텐츠",
	render: () => (
		<div style={{ padding: 80, display: "flex", justifyContent: "center" }}>
			<Popover
				placement="bottom"
				aria-labelledby="pop-title"
				trigger={<Button>프로필</Button>}
				content={
					<Stack gap={8}>
						<strong id="pop-title" style={{ color: "var(--bt-color-text-heading)" }}>
							박상민
						</strong>
						<span style={{ color: "var(--bt-color-text-caption)" }}>
							sangmin@bigtablet.com
						</span>
						<Stack direction="horizontal" gap={8}>
							<Button size="sm" variant="outline">
								메시지
							</Button>
							<Button size="sm">팔로우</Button>
						</Stack>
					</Stack>
				}
			/>
		</div>
	),
};

export const Controlled: Story = {
	name: "제어 모드",
	render: () => {
		const [open, setOpen] = React.useState(false);
		return (
			<div style={{ padding: 80, display: "flex", justifyContent: "center", gap: 16 }}>
				<Popover
					open={open}
					onOpenChange={setOpen}
					aria-label="제어 팝오버"
					trigger={<Button variant="outline">토글</Button>}
					content={
						<Stack gap={8}>
							<span style={{ color: "var(--bt-color-text-body)" }}>외부 state 로 제어됨.</span>
							<Button size="sm" onClick={() => setOpen(false)}>
								닫기
							</Button>
						</Stack>
					}
				/>
				<Button variant="text" onClick={() => setOpen((o) => !o)}>
					{open ? "열림" : "닫힘"} (외부 버튼)
				</Button>
			</div>
		);
	},
};
