import { IconButton, Menu } from "@bigtablet/design-system";
import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export default function Example() {
	return (
		<Menu
			trigger={<IconButton icon={<MoreHorizontal />} aria-label="더보기" />}
			items={[
				{ key: "edit", label: "이름 바꾸기", icon: <Pencil size={16} /> },
				{ key: "copy", label: "복제", icon: <Copy size={16} /> },
				{ key: "delete", label: "삭제", icon: <Trash2 size={16} />, destructive: true },
			]}
		/>
	);
}
