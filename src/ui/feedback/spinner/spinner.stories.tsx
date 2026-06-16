import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from ".";

const meta: Meta<typeof Spinner> = {
	title: "Components/Feedback/Spinner",
	component: Spinner,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "number",
			description: "스피너의 크기(px)입니다. 숫자만 입력하면 자동으로 정사각형 크기로 적용됩니다.",
		},
	},
	args: {
		size: 24,
	},
	parameters: {
		docs: {
			description: {
				component: `
**Spinner** — Inline rotating loading indicator. / 인라인 회전 로딩 표시. For use inside buttons/cards. / 버튼·카드 내부용.

Size / 크기: button 16–24 / 버튼, card 24–32 / 카드, emphasis 40+ / 강조. For page transitions see \`TopLoading\`. / 페이지 전환은 \`TopLoading\` 참고.

> ⚠️ **Docs view note / Docs 뷰 안내** — The preview on this page is a static capture, so the spinner may appear frozen or show a single frame. / 이 페이지의 미리보기는 정적 캡처라 spinner 가 멈춰 있거나 한 프레임만 보일 수 있다. To see the real rotation, open an individual story (e.g. Basic) from the left sidebar. / 실제 회전은 좌측 사이드바에서 개별 스토리 (Basic 등) 를 열면 확인 가능.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Basic: Story = {
	name: "기본",
};

export const Sizes: Story = {
	name: "크기별 예시",
	render: () => (
		<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
			<Spinner size={16} />
			<Spinner size={24} />
			<Spinner size={32} />
			<Spinner size={48} />
		</div>
	),
};

export const InButton: Story = {
	parameters: { chromatic: { disableSnapshot: true } },

	name: "버튼 내부 사용 예",
	render: () => (
		<button
			type="button"
			disabled
			style={{
				display: "inline-flex",
				alignItems: "center",
				gap: 8,
				padding: "8px 16px",
				borderRadius: 8,
				border: "1px solid #e5e5e5",
				background: "var(--bt-color-bg-solid-dim)",
				color: "var(--bt-color-text-body)",
				cursor: "not-allowed",
			}}
		>
			<Spinner size={16} />
			처리 중
		</button>
	),
};
