import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Sidebar } from "../ui/navigation/sidebar";
import {Folder, Home, Settings} from "lucide-react";

const meta: Meta<typeof Sidebar> = {
    title: "Components/Navigation/Sidebar",
    component: Sidebar,
    tags: [],
    argTypes: {
        width: { control: "number" },
        collapsible: { control: "boolean" },
        defaultCollapsed: { control: "boolean" },
        items: { table: { disable: true } },
        onItemSelect: { table: { disable: true } }
    },
    parameters: {
        layout: "fullscreen",
        docs: { disable: true },
        controls: { disable: true },
        actions: { disable: true },
        previewTabs: { "storybook/docs/panel": { hidden: true } },
        options: { showPanel: false }
    }
};
export default meta;

type Story = StoryObj<typeof Sidebar>;

export const Basic: Story = {
    render: () => (
        <div style={{ height: 360, border: "1px solid #eee" }}>
            <Sidebar
                items={[
                    { href: "/home", label: "Home", icon: Home },
                    { href: "/projects", label: "Projects", icon: Folder },
                    { href: "/settings", label: "Settings", icon: Settings }
                ]}
                activePath="/home"
                onItemSelect={(href) => console.log("selected:", href)}
            />
        </div>
    )
};