import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Pagination } from "../ui/navigation/pagination";

const meta: Meta<typeof Pagination> = {
    title: "Components/Navigation/Pagination",
    component: Pagination,
    tags: ["autodocs"],
    argTypes: {
        hasNext: { control: "boolean" },
        size: { control: "number" },
    },
    args: {
        hasNext: true,
        size: 0,
    },
    parameters: {
        docs: {
            description: {
                component:
                    "`page`/`onChange`로 제어하는 Prev/Next 페이지네이션입니다. `hasNext`로 다음 페이지 존재 여부를 제어합니다.",
            },
        },
    },
};
export default meta;

type Story = StoryObj<typeof Pagination>;

export const Basic: Story = {
    render: (args) => {
        const [page, setPage] = useState(1);
        return <Pagination {...args} page={page} onChange={setPage} />;
    },
};

export const Controlled: Story = {
    render: (args) => {
        const [page, setPage] = useState(7);
        return <Pagination {...args} page={page} onChange={setPage} />;
    },
};