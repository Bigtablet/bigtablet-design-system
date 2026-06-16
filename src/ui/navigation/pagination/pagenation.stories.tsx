import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Pagination } from ".";

const meta: Meta<typeof Pagination> = {
	title: "Components/Navigation/Pagination",
	component: Pagination,
	tags: ["autodocs"],
	argTypes: {
		page: {
			control: { type: "number", min: 1 },
			description: "현재 페이지 번호입니다.",
		},
		totalPages: {
			control: { type: "number", min: 1 },
			description: "전체 페이지 수입니다.",
		},
		onChange: {
			action: "changed",
			description: "페이지 변경 시 호출되는 콜백입니다.",
		},
	},
	parameters: {
		docs: {
			description: {
				component: `
**Pagination** — Page navigation. Collapses with \`…\` beyond 7 pages; prev/next are disabled at the first/last page. / 페이지 이동 네비게이션. 7페이지 초과 시 \`…\` 축약, 첫/마지막에서 prev/next 비활성.
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

		return <Pagination page={page} totalPages={5} onChange={setPage} />;
	},
};

/** 페이지가 많은 경우 (자동으로 줄여서 표시됨) */
export const ManyPages: Story = {
	name: "페이지가 많을 때 (… 표시)",
	render: () => {
		const [page, setPage] = useState(7);

		return <Pagination page={page} totalPages={64} onChange={setPage} />;
	},
};

/** 첫 페이지에 있을 때 */
export const FirstPage: Story = {
	name: "첫 페이지",
	render: () => {
		const [page, setPage] = useState(1);

		return <Pagination page={page} totalPages={20} onChange={setPage} />;
	},
};

/** 마지막 페이지에 있을 때 */
export const LastPage: Story = {
	name: "마지막 페이지",
	render: () => {
		const [page, setPage] = useState(20);

		return <Pagination page={page} totalPages={20} onChange={setPage} />;
	},
};
