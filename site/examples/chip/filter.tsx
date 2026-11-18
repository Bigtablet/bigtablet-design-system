import { Chip } from "@bigtablet/design-system";
import { useState } from "react";

const STATUS = ["전체", "진행 중", "완료", "보류"];

export default function Example() {
	const [selected, setSelected] = useState("전체");
	const [tags, setTags] = useState(["디자인", "긴급"]);
	return (
		<div style={{ display: "grid", gap: 16 }}>
			<div style={{ display: "flex", gap: 8 }}>
				{STATUS.map((s) => (
					<Chip
						key={s}
						type="filter"
						label={s}
						selected={selected === s}
						onClick={() => setSelected(s)}
					/>
				))}
			</div>
			<div style={{ display: "flex", gap: 8 }}>
				{tags.map((t) => (
					<Chip
						key={t}
						type="input"
						label={t}
						removable
						onRemove={() => setTags(tags.filter((x) => x !== t))}
					/>
				))}
			</div>
		</div>
	);
}
