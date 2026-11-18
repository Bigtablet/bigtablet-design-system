import { CopyButton } from "@bigtablet/design-system";

export default function Example() {
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
			<code>https://bigtablet.com/invite/a8f3</code>
			<CopyButton text="https://bigtablet.com/invite/a8f3" />
			<CopyButton text="https://bigtablet.com/invite/a8f3" iconOnly aria-label="초대 링크 복사" />
		</div>
	);
}
