import type { DocPage } from "../docs";

export const breadcrumb: DocPage = {
	slug: "breadcrumb",
	category: "내비게이션",
	order: 4,
	title: "Breadcrumb",
	summary: "지금 화면이 어디에 있는지 상위 경로를 보여 줍니다. 마지막 항목이 현재 화면입니다.",
	when: [
		["깊이가 있는 관리 화면", "Breadcrumb (PageHeader `breadcrumb`)", true],
		["단계를 밟아 가는 절차", "Stepper", false],
	],
	examples: [{ id: "breadcrumb/basic", title: "기본" }],
	props: "BreadcrumbProps",
};
