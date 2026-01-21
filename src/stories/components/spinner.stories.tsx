import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from "../../ui/feedback/spinner";

const meta: Meta<typeof Spinner> = {
    title: "Components/Feedback/Spinner",
    component: Spinner,
    tags: ["autodocs"],
    argTypes: {
        size: {
            control: "number",
            description:
                "스피너의 크기(px)입니다. 숫자만 입력하면 자동으로 정사각형 크기로 적용됩니다.",
        },
    },
    args: {
        size: 24,
    },
    parameters: {
        docs: {
            description: {
                component: `
**Spinner**는 작업 처리 중임을 사용자에게 알려주는 **회전 형태의 로딩 표시**입니다.

### 언제 사용하나요?
- 버튼 클릭 후 잠시 대기 시간이 있을 때
- 데이터 로딩 중임을 알려야 할 때
- 화면 전체가 아닌 **부분 로딩(인라인 로딩)**이 필요할 때

### TopLoading과의 차이
| Spinner | TopLoading |
|---------|------------|
| 인라인/부분 영역 | 화면 상단 고정 |
| 버튼, 카드 내부 | 페이지 전환, 전역 상태 |
| 크기 조절 가능 | 진행률 표시 가능 |

### 크기 가이드
| 상황 | 권장 크기 |
|------|----------|
| 버튼 내부 | 16–24px |
| 카드/섹션 단위 | 24–32px |
| 화면 중심 강조 | 40px 이상 |

### 디자이너 체크 포인트
- 스피너 색상이 배경과 충분히 대비되는지
- 버튼 내부 사용 시 텍스트와 스피너 간격이 적절한지
- 회전 속도가 너무 빠르거나 느리지 않은지 (현재: 0.8초/1회전)
- 전체 화면 로딩 시 오버레이와 함께 사용하는 것을 권장
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
                background: "#fafafa",
                color: "#666",
                cursor: "not-allowed",
            }}
        >
            <Spinner size={16} />
            처리 중
        </button>
    ),
};
