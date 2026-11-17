import { LocaleProvider, Pagination } from "@bigtablet/design-system";
import { useState } from "react";

// DS 가 스스로 렌더하는 문구(이전 · 다음 · 닫기 · 빈 목록 …)가 영어로 바뀝니다
export default function Example() {
	const [page, setPage] = useState(1);
	return (
		<LocaleProvider locale="en">
			<Pagination page={page} totalPages={10} onPageChange={setPage} />
		</LocaleProvider>
	);
}
