import { TagInput } from "@bigtablet/design-system";
import { useState } from "react";

export default function Example() {
	const [tags, setTags] = useState(["디자인", "개발"]);
	return (
		<div style={{ maxWidth: 400 }}>
			<TagInput
				ariaLabel="태그"
				placeholder="입력 후 Enter"
				value={tags}
				onValueChange={setTags}
				maxTags={5}
			/>
		</div>
	);
}
