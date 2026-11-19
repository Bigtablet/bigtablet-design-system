import { Dropdown } from "@bigtablet/design-system";

const options = [
	{ value: "kr", label: "한국" },
	{ value: "jp", label: "일본" },
];

export default function Example() {
	return (
		<div style={{ display: "grid", gap: 16, maxWidth: 280 }}>
			<Dropdown label="국가" placeholder="선택하세요" options={options} required />
			<Dropdown label="통화" options={options} defaultValue="kr" disabled />
		</div>
	);
}
