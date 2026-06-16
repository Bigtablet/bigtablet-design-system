import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { TopLoading } from ".";

const meta: Meta<typeof TopLoading> = {
	title: "Components/Feedback/TopLoading",
	component: TopLoading,
	tags: ["autodocs"],
	argTypes: {
		progress: {
			control: { type: "range", min: 0, max: 100, step: 1 },
			description:
				"진행률(0-100). 지정하지 않으면 무한 애니메이션(indeterminate) 모드로 동작합니다.",
		},
		height: {
			control: { type: "range", min: 1, max: 10, step: 1 },
			description: "로딩바 높이(px)입니다.",
		},
		color: {
			control: "color",
			description: "로딩바 색상입니다. 기본값은 primary 색상입니다.",
		},
		isLoading: {
			control: "boolean",
			description: "로딩 표시 여부입니다.",
		},
		ariaLabel: {
			control: "text",
			description: "스크린 리더용 접근성 레이블입니다. 기본값은 'Page loading'입니다.",
		},
	},
	args: {
		isLoading: true,
		height: 3,
	},
	parameters: {
		docs: {
			description: {
				component: `
**TopLoading** — Progress bar pinned to the top of the screen. / **TopLoading** — 화면 상단 고정 프로그레스 바. For page transitions/global loading. / 페이지 전환·전역 로딩용.

\`progress\` unset → indeterminate infinite animation / 미지정 → indeterminate 무한 애니메이션; set → determinate percent fill / 지정 → determinate 퍼센트 fill.
For inline loading see \`Spinner\`. / 인라인 로딩은 \`Spinner\` 참고.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof TopLoading>;

export const Indeterminate: Story = {
	parameters: { chromatic: { disableSnapshot: true } },

	name: "무한 애니메이션",
	args: {
		isLoading: true,
	},
};

export const WithProgress: Story = {
	parameters: { chromatic: { disableSnapshot: true } },

	name: "진행률 표시",
	args: {
		progress: 60,
		isLoading: true,
	},
};

export const CustomColor: Story = {
	name: "커스텀 색상",
	args: {
		isLoading: true,
		color: "#10b981",
	},
};

export const CustomHeight: Story = {
	name: "높이 조절",
	args: {
		isLoading: true,
		height: 5,
	},
};

export const Animated: Story = {
	parameters: { chromatic: { disableSnapshot: true } },

	name: "진행률 애니메이션 예시",
	render: () => {
		const [progress, setProgress] = useState(0);

		useEffect(() => {
			const interval = setInterval(() => {
				setProgress((prev) => {
					if (prev >= 100) return 0;
					return prev + 10;
				});
			}, 500);
			return () => clearInterval(interval);
		}, []);

		return (
			<div>
				<TopLoading progress={progress} isLoading={true} />
				<p style={{ marginTop: 24 }}>현재 진행률: {progress}%</p>
			</div>
		);
	},
};
