import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Settings,
    User,
    Shield,
} from "lucide-react";
import { Sidebar } from "../../ui/navigation/sidebar";
import type { SidebarItem } from "../../ui/navigation/sidebar";

const meta: Meta<typeof Sidebar> = {
    title: "Components/Navigation/Sidebar",
    component: Sidebar,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: `
**Sidebar**는 애플리케이션의 주요 탐색 구조를 담당하는 네비게이션입니다.

### 언제 사용하나요?
- 대시보드, 관리자 페이지 등 다양한 섹션이 있는 앱
- 메뉴 구조가 계층적일 때 (1Depth + 2Depth)

### 메뉴 구조
| 타입 | 설명 |
|------|------|
| **1Depth (Link)** | 즉시 이동 가능한 단일 링크 |
| **2Depth (Group)** | 관련 메뉴를 묶는 아코디언. 클릭하면 하위 메뉴 펼침 |

### 선택 상태(active) 규칙
- 1Depth 메뉴: 해당 메뉴가 active 표시
- 2Depth 메뉴: **하위 메뉴에만** active 표시 (상위 Group은 펼쳐지기만 함)

### 인터랙션 & Motion
| 동작 | 속도 |
|------|------|
| hover / active | base (0.2s) |
| Group 열림/닫힘 | slow (0.3s) |
| Chevron 회전 | base (0.2s) |
| 사이드바 접기/펼치기 | slow (0.3s) |

### 디자이너 체크 포인트
- 현재 페이지(active) 메뉴가 명확히 구분되는지
- Group 펼침/접힘 애니메이션이 부드러운지
- 메뉴 항목 간 간격이 터치하기 충분한지
- 아이콘과 텍스트 정렬이 일관적인지
- 사이드바 접힌 상태에서도 메뉴 인식이 가능한지 (아이콘만 표시)
- 긴 메뉴 텍스트가 잘리거나 줄바꿈 없이 처리되는지
                `,
            },
        },
    },
    argTypes: {
        items: {
            control: "object",
            description: "사이드바에 표시될 메뉴 목록입니다.",
        },
        activePath: {
            control: "text",
            description: "현재 선택된 경로입니다.",
        },
        match: {
            control: "inline-radio",
            options: ["startsWith", "exact"],
            description: "현재 경로와 메뉴 href를 비교하는 방식입니다.",
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
        match: "startsWith",
        brandHref: "/main",
    },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const OneDepthItems: SidebarItem[] = [
    {
        href: "/dashboard",
        label: "대시보드",
        icon: LayoutDashboard,
    },
    {
        href: "/orders",
        label: "주문",
        icon: ShoppingCart,
    },
    {
        href: "/products",
        label: "상품",
        icon: Package,
    },
    {
        href: "/settings",
        label: "설정",
        icon: Settings,
    },
];

const TwoDepthItems: SidebarItem[] = [
    {
        href: "/dashboard",
        label: "대시보드",
        icon: LayoutDashboard,
    },
    {
        href: "/orders",
        label: "주문",
        icon: ShoppingCart,
    },
    {
        type: "group",
        id: "products",
        label: "상품",
        icon: Package,
        children: [
            {
                href: "/products/list",
                label: "상품 목록",
            },
            {
                href: "/products/category",
                label: "카테고리",
            },
        ],
    },
    {
        type: "group",
        id: "settings",
        label: "설정",
        icon: Settings,
        children: [
            {
                href: "/settings/profile",
                label: "프로필",
                icon: User,
            },
            {
                href: "/settings/security",
                label: "보안",
                icon: Shield,
            },
        ],
    },
];

export const OneDepth: Story = {
    name: "1Depth (Group 없음)",
    args: {
        items: OneDepthItems,
        activePath: "/dashboard",
    },
    render: (args) => <Sidebar {...args} />,
};

export const OneDepthControlled: Story = {
    name: "1Depth (선택 상태 제어)",
    render: (args) => {
        const [active, setActive] = useState("/dashboard");

        return (
            <Sidebar
                {...args}
                items={OneDepthItems}
                activePath={active}
                onItemSelect={(href) => setActive(href)}
            />
        );
    },
};

export const WithGroup: Story = {
    name: "2Depth (Group 포함)",
    args: {
        items: TwoDepthItems,
        activePath: "/products/list",
    },
    render: (args) => <Sidebar {...args} />,
};

export const WithGroupControlled: Story = {
    name: "2Depth (Group 포함 · Controlled)",
    render: (args) => {
        const [active, setActive] = useState("/products/list");

        return (
            <Sidebar
                {...args}
                items={TwoDepthItems}
                activePath={active}
                onItemSelect={(href) => setActive(href)}
            />
        );
    },
};