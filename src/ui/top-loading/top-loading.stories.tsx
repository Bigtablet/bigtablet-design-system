import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { TopLoading } from ".";

const meta: Meta<typeof TopLoading> = {
	title: "Components/TopLoading",
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
			description:
				"스크린 리더용 접근성 레이블입니다. 기본값은 'Page loading'입니다.",
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
**TopLoading**은 화면 상단에 고정되어 페이지 로딩 상태를 표시하는 프로그레스 바입니다.

### 언제 사용하나요?
- 페이지 전환 시 로딩 상태 표시
- API 호출 중 전역 로딩 표시
- 파일 업로드/다운로드 진행률 표시

### Spinner와의 차이
| TopLoading | Spinner |
|------------|---------|
| 화면 상단 고정 | 인라인/부분 영역 |
| 페이지 전환, 전역 상태 | 버튼, 카드 내부 |
| 진행률 표시 가능 | 크기 조절 가능 |

### 모드
| 모드 | 설명 |
|------|------|
| **Indeterminate** | progress 미지정 시 무한 애니메이션 |
| **Determinate** | progress 지정 시 해당 퍼센트만큼 채움 |

### 디자이너 체크 포인트
- \`position: fixed; top: 0\` + \`z_level4\` — 헤더/모달 등과 겹치는 z-index 관계 확인 (모달보다는 뒤)
- 기본 바 색상 \`color_brand_primary\` — 페이지 배경과 충분히 대비되는지 (custom color prop으로 오버라이드 가능)
- 기본 높이 3px — 얇아서 콘텐츠 밀어내지 않지만 인지되는지
- Indeterminate 모드: 폭 30%가 1.5s 주기로 좌→우 슬라이드 — 속도가 자연스러운지
- Determinate(progress) 모드: \`transition: width transition_base\` — 퍼센트 변화 전환이 튀지 않는지
- 전역 로딩 vs 특정 영역 로딩: 이 컴포넌트는 전역 전용. 영역 로딩은 Spinner / LinearProgress 사용
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
