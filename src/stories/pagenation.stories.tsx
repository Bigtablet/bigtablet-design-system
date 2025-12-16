import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Pagination } from "../ui/navigation/pagination";

const meta: Meta<typeof Pagination> = {
    title: "Components/Navigation/Pagination",
    component: Pagination,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: `
페이지 이동을 위한 컴포넌트입니다.

- 페이지 수가 **7개 이하**일 경우 모든 페이지 번호가 표시됩니다.
- 페이지 수가 **7개를 초과**하면 현재 페이지 주변만 보여주고,
  앞뒤는 \`…\`로 축약되어 표시됩니다.
- 좌우 화살표로 이전/다음 페이지로 이동할 수 있습니다.
        `,
            },
        },
    },
};
export default meta;

type Story = StoryObj<typeof Pagination>;

/** 페이지가 적은 경우 (전체 페이지가 모두 보임) */
export const FewPages: Story = {
    name: "페이지가 적을 때 (1–5)",
    render: () => {
        const [page, setPage] = useState(1);

        return (
            <Pagination
                page={page}
                totalPages={5}
                onChange={setPage}
            />
        );
    },
};

/** 페이지가 많은 경우 (자동으로 줄여서 표시됨) */
export const ManyPages: Story = {
    name: "페이지가 많을 때 (… 표시)",
    render: () => {
        const [page, setPage] = useState(7);

        return (
            <Pagination
                page={page}
                totalPages={64}
                onChange={setPage}
            />
        );
    },
};

/** 첫 페이지에 있을 때 */
export const FirstPage: Story = {
    name: "첫 페이지",
    render: () => {
        const [page, setPage] = useState(1);

        return (
            <Pagination
                page={page}
                totalPages={20}
                onChange={setPage}
            />
        );
    },
};

/** 마지막 페이지에 있을 때 */
export const LastPage: Story = {
    name: "마지막 페이지",
    render: () => {
        const [page, setPage] = useState(20);

        return (
            <Pagination
                page={page}
                totalPages={20}
                onChange={setPage}
            />
        );
    },
};