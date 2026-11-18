import { Checkbox } from "@bigtablet/design-system";

export default function Example() {
	return (
		<div style={{ display: "grid", gap: 12 }}>
			<Checkbox label="이용약관에 동의합니다" />
			<Checkbox label="마케팅 수신 (선택)" defaultChecked />
			<Checkbox label="일부만 선택됨" indeterminate />
			<Checkbox label="비활성" disabled />
		</div>
	);
}
