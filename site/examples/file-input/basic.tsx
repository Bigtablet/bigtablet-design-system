import { FileInput } from "@bigtablet/design-system";
import { useState } from "react";

export default function Example() {
	const [names, setNames] = useState<string[]>([]);
	return (
		<div style={{ display: "grid", gap: 16 }}>
			<FileInput
				label="첨부 파일"
				supportingText={names.length ? names.join(", ") : "PDF · 10MB 이하"}
				onFiles={(files) => setNames(files ? [...files].map((f) => f.name) : [])}
			/>
			<FileInput label="프로필 사진" variant="preview" accept="image/*" />
		</div>
	);
}
