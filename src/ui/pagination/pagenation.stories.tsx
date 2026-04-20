import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Pagination } from ".";

const meta: Meta<typeof Pagination> = {
	title: "Components/Pagination",
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
**Pagination**은 많은 양의 데이터를 여러 페이지로 나누어 탐색할 때 사용하는 네비게이션입니다.

### 언제 사용하나요?
- 상품 목록, 게시판, 검색 결과 등 데이터가 많을 때
- 무한 스크롤 대신 명시적인 페이지 이동이 필요할 때

### 동작 방식
| 상황 | 표시 방식 |
|------|----------|
| 7페이지 이하 | 모든 페이지 번호 표시 |
| 7페이지 초과 | 현재 페이지 주변만 보여주고 \`…\`로 축약 |
| 첫 페이지 | 이전 버튼 비활성화 |
| 마지막 페이지 | 다음 버튼 비활성화 |
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
