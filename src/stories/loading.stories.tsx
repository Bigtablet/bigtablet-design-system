import type { Meta, StoryObj } from "@storybook/react";
import { Loading } from "../ui/feedback/loading";

const meta: Meta<typeof Loading> = {
    title: "Components/Feedback/Loading",
    component: Loading,
    tags: ["autodocs"],
    argTypes: {
        size: {
            control: "number",
            description:
                "로딩 스피너의 크기(px)입니다. 숫자만 입력하면 자동으로 정사각형 크기로 적용됩니다.",
        },
    },
    args: {
        size: 24,
    },
    parameters: {
        docs: {
            description: {
                component: `
**Loading**은 작업 처리 중임을 사용자에게 알려주는 **스피너 형태의 로딩 표시**입니다.

### 언제 사용하나요?
- 버튼 클릭 후 잠시 대기 시간이 있을 때
- 데이터 로딩 중임을 알려야 할 때
- 화면 전체가 아닌 **부분 로딩(인라인 로딩)**이 필요할 때

### 사용 가이드
- 버튼 안에서는 **16–24px** 권장
- 카드/섹션 단위 로딩은 **24–32px**
- 화면 중심 강조 로딩은 **40px 이상**
        `,
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof Loading>;

export const Basic: Story = {
    name: "기본",
};

export const Sizes: Story = {
    name: "크기별 예시",
    render: () => (
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Loading size={16} />
            <Loading size={24} />
            <Loading size={32} />
            <Loading size={48} />
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
            <Loading size={16} />
            처리 중
        </button>
    ),
};