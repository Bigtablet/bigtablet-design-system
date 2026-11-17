import { Dropdown } from "@bigtablet/design-system";

const options = [
	{ value: "kr", label: "한국" },
	{ value: "jp", label: "일본" },
	{ value: "us", label: "미국" },
];

export default function Example() {
	return (
		<div style={{ maxWidth: 280 }}>
			<Dropdown label="국가" placeholder="선택하세요" options={options} />
		</div>
	);
}
