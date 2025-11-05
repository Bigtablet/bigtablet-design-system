import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Pagination } from "../src/ui/pagenation";

const meta: Meta<typeof Pagination> = {
    title: "Components/Navigation/Pagination",
    component: Pagination,
    tags: ["autodocs"],
    argTypes: {
        total: { control: "number" },
        siblingCount: { control: "number" }
    },
    args: { total: 20, siblingCount: 1 },
    parameters: {
        docs: {
            description: {
                component:
                    "`page`/`onChange`로 제어하는 페이지네이션입니다. `siblingCount`로 현재 페이지 주변에 보여줄 숫자 수를 조절합니다."
            }
        }
    }
};
export default meta;
type Story = StoryObj<typeof Pagination>;

export const Controlled: Story = {
    render: (args) => {
        const [page, setPage] = useState(7);
        return <Pagination {...args} page={page} onChange={setPage} />;
    }
};