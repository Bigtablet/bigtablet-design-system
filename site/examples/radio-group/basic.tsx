import { Radio, RadioGroup } from "@bigtablet/design-system";

export default function Example() {
	return (
		<RadioGroup name="plan" label="요금제" defaultValue="team">
			<Radio value="free" label="무료 (3명까지)" />
			<Radio value="team" label="팀 (인원 무제한)" />
			<Radio value="enterprise" label="엔터프라이즈 (전용 지원)" />
		</RadioGroup>
	);
}
