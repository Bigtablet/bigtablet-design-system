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
		onPageChange: {
			action: "changed",
			description: "페이지 변경 시 호출되는 콜백입니다.",
		},
	},
	parameters: {
		docs: {
			description: {
				component: `
**Pagination** - 페이지 이동 내비게이션. 7페이지를 넘으면 \`…\` 로 축약하고, 첫/마지막 페이지에서는 prev/next 가 비활성된다.

목록 화면을 만드는 중이라면 이걸 직접 붙이기 전에 \`DataView\` 를 보세요 - 검색·표·선택 액션과
함께 페이지네이션까지 갖고 있어 \`page\` 상태를 화면이 들지 않아도 됩니다.

controlled 전용입니다. \`page\` 를 화면이 들고 \`onPageChange\` 로 받습니다
(구 \`onChange\` 는 deprecated).
        `,
			},
		},
	},
};
export default meta;

type Story = StoryObj<typeof Pagination>;

/** 7페이지 이하면 축약 없이 전부 보인다 - 사용자가 전체 분량을 한눈에 안다. */
export const FewPages: Story = {
	name: "페이지가 적을 때 (1–5)",
	render: () => {
		const [page, setPage] = useState(1);

		return <Pagination page={page} totalPages={5} onPageChange={setPage} />;
	},
};

/**
 * 7페이지를 넘으면 `…` 로 축약한다. 현재 페이지 주변과 첫·마지막은 항상 남으므로
 * 어디쯤인지와 끝이 어딘지를 동시에 알 수 있다. 축약 규칙은 컴포넌트가 갖는다.
 */
export const ManyPages: Story = {
	name: "페이지가 많을 때 (… 표시)",
	render: () => {
		const [page, setPage] = useState(7);

		return <Pagination page={page} totalPages={64} onPageChange={setPage} />;
	},
};

/**
 * 첫 페이지에서는 prev 가 비활성된다 - **숨기지 않는다.** 버튼이 사라지면 다음 버튼의
 * 위치가 밀려 연속 클릭이 어긋난다.
 */
export const FirstPage: Story = {
	name: "첫 페이지",
	render: () => {
		const [page, setPage] = useState(1);

		return <Pagination page={page} totalPages={20} onPageChange={setPage} />;
	},
};

/** 마지막 페이지에서는 next 가 비활성된다. `totalPages` 가 1이면 양쪽 다 잠긴다. */
export const LastPage: Story = {
	name: "마지막 페이지",
	render: () => {
		const [page, setPage] = useState(20);

		return <Pagination page={page} totalPages={20} onPageChange={setPage} />;
	},
};

/**
 * 쪽이 수천 개면 이전·다음과 `…` 만으로는 원하는 쪽에 닿을 수 없다. `showPageJump` 를 켜면 현재 쪽 칸이
 * 테두리 있는 입력칸이 된다 - 눌러서 번호를 적고 Enter. 범위 밖 값은 1 ~ 마지막 쪽으로 맞추고, 숫자가 아니면
 * 오류로 표시한다. Esc 나 포커스를 잃으면 현재 쪽으로 돌아간다. 기본은 꺼져 있다.
 */
export const PageJump: Story = {
	name: "쪽 번호로 바로 가기 (showPageJump)",
	render: () => {
		const [page, setPage] = useState(1234);

		return <Pagination page={page} totalPages={3650} onPageChange={setPage} showPageJump />;
	},
};
