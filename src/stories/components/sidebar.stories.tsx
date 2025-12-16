import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Sidebar } from "../../ui/navigation/sidebar";

const meta: Meta<typeof Sidebar> = {
    title: "Components/Navigation/Sidebar",
    component: Sidebar,
    tags: ["autodocs"],
    argTypes: {
        items: {
            control: "object",
            description: "사이드바에 표시될 메뉴 목록입니다.",
        },
        activePath: {
            control: "text",
            description: "현재 선택된 경로입니다.",
        },
        width: {
            control: "number",
            description: "사이드바의 너비(px)입니다.",
        },
        match: {
            control: "inline-radio",
            options: ["startsWith", "exact"],
            description:
                "현재 경로와 메뉴 href를 비교하는 방식입니다.",
        },
        brandHref: {
            control: "text",
            description: "상단 로고 클릭 시 이동할 경로입니다.",
        },
        onItemSelect: {
            action: "itemSelected",
            description: "메뉴 클릭 시 호출됩니다.",
        },
    },
    args: {
        width: 240,
        match: "startsWith",
        brandHref: "/main",
        items: [
            { href: "/dashboard", label: "대시보드" },
            { href: "/orders", label: "주문" },
            { href: "/products", label: "상품" },
            { href: "/settings", label: "설정" },
        ],
        activePath: "/dashboard",
    },
    parameters: {
        docs: {
            description: {
                component: `
**Sidebar**는 좌측 내비게이션 영역에 사용되는 컴포넌트입니다.

### 언제 사용하나요?
- 관리자 페이지
- 대시보드
- 메뉴 구조가 명확한 화면

### 핵심 포인트
- \`activePath\`로 현재 선택된 메뉴를 표시합니다.
- \`match\` 옵션으로 경로 매칭 방식을 제어할 수 있습니다.
- 상태를 외부에서 제어할 수도 있고(Controlled),
  단순 표시용으로도 사용할 수 있습니다.

### 디자이너 체크 포인트
- 활성 메뉴가 충분히 눈에 띄는지
- hover / active 상태가 일관적인지
        `,
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Basic: Story = {
    name: "기본 사용",
    render: (args) => <Sidebar {...args} />,
};

export const ControlledActivePath: Story = {
    name: "선택 상태 제어",
    render: (args) => {
        const [active, setActive] = useState(
            args.activePath ?? "/dashboard"
        );

        return (
            <Sidebar
                {...args}
                activePath={active}
                onItemSelect={(href) => setActive(href)}
            />
        );
    },
};