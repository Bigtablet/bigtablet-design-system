import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Sidebar } from "../ui/navigation/sidebar";

const meta: Meta<typeof Sidebar> = {
    title: "Components/Navigation/Sidebar",
    component: Sidebar,
    tags: ["autodocs"],
    argTypes: {
        items: { control: "object" },
        activePath: { control: "text" },
        width: { control: "number" },
        className: { control: "text" },
        style: { control: "object" },
        match: {
            control: "inline-radio",
            options: ["startsWith", "exact"],
        },
        brandHref: { control: "text" },
        onItemSelect: { action: "itemSelected" },
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
                component:
                    "현재 경로(`activePath`)와 매칭 방식(`match`)에 따라 활성 항목을 표시하는 사이드바입니다.",
            },
        },
    },
};
export default meta;

type Story = StoryObj<typeof Sidebar>;

export const Basic: Story = {
    render: (args) => <Sidebar {...args} />,
};

export const ControlledActivePath: Story = {
    render: (args) => {
        const [active, setActive] = useState(args.activePath ?? "/dashboard");
        return (
            <Sidebar
                {...args}
                activePath={active}
                onItemSelect={(href) => setActive(href)}
            />
        );
    },
};