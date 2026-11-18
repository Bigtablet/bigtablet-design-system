import { Breadcrumb, Button, PageHeader } from "@bigtablet/design-system";

export default function Example() {
	return (
		<PageHeader
			breadcrumb={<Breadcrumb items={[{ label: "홈", href: "#" }, { label: "주문" }]} />}
			title="주문 관리"
			description="결제 완료된 주문만 보입니다"
			actions={<Button>주문 추가</Button>}
		/>
	);
}
