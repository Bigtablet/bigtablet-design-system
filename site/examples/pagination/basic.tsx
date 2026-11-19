import { Pagination } from "@bigtablet/design-system";
import { useState } from "react";

export default function Example() {
	const [page, setPage] = useState(4);
	return <Pagination page={page} totalPages={20} onPageChange={setPage} showPageJump />;
}
