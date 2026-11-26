import { Toggle } from "@bigtablet/design-system";
import { useState } from "react";

export default function Example() {
	const [on, setOn] = useState(true);
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
			<Toggle checked={on} onCheckedChange={setOn} ariaLabel="이메일 알림" />
			<span>이메일 알림 {on ? "켜짐" : "꺼짐"}</span>
		</div>
	);
}
