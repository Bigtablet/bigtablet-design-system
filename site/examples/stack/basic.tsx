import { Avatar, Button, Stack } from "@bigtablet/design-system";

export default function Example() {
	return (
		<Stack direction="horizontal" align="center" justify="between" gap={12}>
			<Stack direction="horizontal" align="center" gap={8}>
				<Avatar name="박상민" size="sm" />
				<span>박상민</span>
			</Stack>
			<Button size="sm" variant="outline">
				초대
			</Button>
		</Stack>
	);
}
