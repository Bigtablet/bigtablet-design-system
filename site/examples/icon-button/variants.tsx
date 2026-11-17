import { IconButton } from "@bigtablet/design-system";
import { Settings } from "lucide-react";

export default function Example() {
	return (
		<div style={{ display: "flex", gap: 8 }}>
			<IconButton variant="text" icon={<Settings />} aria-label="설정" />
			<IconButton variant="filled" icon={<Settings />} aria-label="설정" />
			<IconButton variant="tonal" icon={<Settings />} aria-label="설정" />
			<IconButton variant="outline" icon={<Settings />} aria-label="설정" />
		</div>
	);
}
