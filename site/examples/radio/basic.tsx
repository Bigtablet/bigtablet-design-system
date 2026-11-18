import { Radio } from "@bigtablet/design-system";

// 단독 Radio 는 같은 name 으로 묶습니다. 라벨 · 에러가 필요하면 RadioGroup 을 씁니다
export default function Example() {
	return (
		<div style={{ display: "flex", gap: 16 }}>
			<Radio name="size" value="s" label="S" />
			<Radio name="size" value="m" label="M" defaultChecked />
			<Radio name="size" value="l" label="L" />
		</div>
	);
}
