import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { TopLoading } from ".";
import { LOADING_COMPARISON } from "../loading-comparison.docs";

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
**TopLoading** - 화면 상단에 고정되는 프로그레스 바. 페이지 전환·전역 로딩용.

\`progress\` 미지정 → indeterminate 무한 애니메이션, 지정 → determinate 퍼센트 fill.
인라인 로딩은 \`Spinner\` 를 참고.

${LOADING_COMPARISON}

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
	parameters: {
		docs: {
			description: {
				story:
					"`progress` 를 주면 퍼센트만큼 채워지는 determinate 모드입니다. 업로드처럼 **전체 크기를 아는 작업**에 씁니다.\n\n진행률을 모르면 값을 주지 마세요 - 값이 없으면 끝을 약속하지 않는 무한 애니메이션이 됩니다.",
			},
		},
		chromatic: { disableSnapshot: true },
	},
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
	parameters: {
		docs: {
			description: {
				story:
					"라우팅 전환을 흉내낸 예시입니다. 페이지 이동이 시작될 때 띄우고 끝나면 내리는 것이 기본 사용법입니다.",
			},
		},
		chromatic: { disableSnapshot: true },
	},
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
