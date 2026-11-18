import { Dropdown } from "@bigtablet/design-system";
import { useState } from "react";

const options = ["디자인", "프론트엔드", "백엔드", "데이터", "운영", "영업"].map((v) => ({
	value: v,
	label: v,
}));

export default function Example() {
	const [value, setValue] = useState<string[]>([]);
	return (
		<div style={{ maxWidth: 280 }}>
			<Dropdown
				multiple
				searchable
				label="팀"
				options={options}
				value={value}
				onValueChange={setValue}
			/>
		</div>
	);
}
