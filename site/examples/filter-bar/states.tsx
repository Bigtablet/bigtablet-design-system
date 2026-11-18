import { FilterBar, TextField } from "@bigtablet/design-system";

// 결과를 불러오는 동안 - 버튼이 잠기고 진행 중임을 알립니다
export default function Example() {
	return (
		<FilterBar isLoading onSubmit={() => {}}>
			<TextField label="검색" defaultValue="환불" />
		</FilterBar>
	);
}
