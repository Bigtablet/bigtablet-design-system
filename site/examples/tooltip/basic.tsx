import { IconButton, Tooltip } from "@bigtablet/design-system";
import { Save } from "lucide-react";

export default function Example() {
	return (
		<Tooltip content="저장 (⌘S)">
			<IconButton icon={<Save />} aria-label="저장" />
		</Tooltip>
	);
}
