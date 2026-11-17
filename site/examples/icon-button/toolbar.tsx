import { IconButton } from "@bigtablet/design-system";
import { Bold, Italic, Underline } from "lucide-react";

export default function Example() {
	return (
		<div role="toolbar" aria-label="글자 서식" style={{ display: "flex", gap: 4 }}>
			<IconButton size="sm" icon={<Bold />} aria-label="굵게" />
			<IconButton size="sm" icon={<Italic />} aria-label="기울임" />
			<IconButton size="sm" icon={<Underline />} aria-label="밑줄" />
		</div>
	);
}
