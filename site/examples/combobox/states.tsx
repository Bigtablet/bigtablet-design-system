import { Combobox } from "@bigtablet/design-system";

const search = async () => [];

export default function Example() {
	return (
		<div style={{ maxWidth: 320 }}>
			<Combobox
				ariaLabel="담당자"
				value={{ value: "박상민", label: "박상민" }}
				onSearch={search}
				disabled
			/>
		</div>
	);
}
