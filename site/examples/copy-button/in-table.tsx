import { CopyButton } from "@bigtablet/design-system";

const servers = ["192.168.10.1", "192.168.10.2"];

// 여러 개면 보이는 글자는 "복사" 로 두고, 이름에 무엇을 복사하는지 담습니다
export default function Example() {
	return (
		<ul style={{ display: "grid", gap: 8, margin: 0, padding: 0, listStyle: "none" }}>
			{servers.map((ip) => (
				<li key={ip} style={{ display: "flex", alignItems: "center", gap: 12 }}>
					<code>{ip}</code>
					<CopyButton text={ip} aria-label={`${ip} 주소 복사`} />
				</li>
			))}
		</ul>
	);
}
