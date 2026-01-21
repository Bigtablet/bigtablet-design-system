import type { Meta, StoryObj } from "@storybook/react";
import { useState, useEffect } from "react";
import { TopLoading } from "../../ui/feedback/top-loading";

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
- 로딩바가 다른 UI 요소(헤더 등)와 겹치지 않는지
- 색상이 배경과 충분히 대비되는지
- 애니메이션 속도가 자연스러운지
- 진행률 모드에서 변화가 부드럽게 전환되는지
        `,
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof TopLoading>;

export const Indeterminate: Story = {
    name: "무한 애니메이션",
    args: {
        isLoading: true,
    },
};

export const WithProgress: Story = {
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
