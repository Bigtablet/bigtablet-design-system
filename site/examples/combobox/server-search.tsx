import { Combobox, type ComboboxOption } from "@bigtablet/design-system";
import { useState } from "react";

const PEOPLE = ["박상민", "김지원", "이수아", "최현우", "정다은"].map((name) => ({
	value: name,
	label: name,
}));

// 실제로는 서버에 묻는 함수입니다. 입력이 멈추고 250ms 뒤에 한 번만 불립니다
const search = async (query: string) => {
	await new Promise((r) => setTimeout(r, 300));
	return PEOPLE.filter((p) => p.label.includes(query));
};

export default function Example() {
	const [value, setValue] = useState<ComboboxOption | null>(null);
	return (
		<div style={{ maxWidth: 320 }}>
			<Combobox
				ariaLabel="담당자"
				placeholder="이름으로 찾기"
				value={value}
				onValueChange={setValue}
				onSearch={search}
			/>
		</div>
	);
}
