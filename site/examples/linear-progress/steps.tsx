import { LinearProgress } from "@bigtablet/design-system";

export default function Example() {
	return <LinearProgress totalSteps={4} currentStep={2} aria-label="가입 진행" />;
}
