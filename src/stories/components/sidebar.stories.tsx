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
        width: 240,
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