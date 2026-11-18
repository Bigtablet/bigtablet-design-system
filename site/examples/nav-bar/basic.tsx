import { Button, NavBar, NavLink } from "@bigtablet/design-system";
import { useState } from "react";

const MENU: [string, string][] = [
	["/product", "제품"],
	["/pricing", "가격"],
	["/blog", "블로그"],
];

// 메뉴를 누르면 현재 위치 표시가 옮겨 갑니다. 실제 앱에서는 href 로 이동합니다
export default function Example() {
	const [lang, setLang] = useState("ko");
	const [page, setPage] = useState("/product");
	return (
		<NavBar
			brand={<strong>Bigtablet</strong>}
			actions={<Button size="sm">로그인</Button>}
			locale={{
				current: lang,
				options: [
					{ value: "ko", label: "한국어" },
					{ value: "en", label: "English" },
				],
				onValueChange: setLang,
			}}
		>
			{MENU.map(([href, label]) => (
				<NavLink key={href} href={href} active={page === href} onClick={() => setPage(href)}>
					{label}
				</NavLink>
			))}
		</NavBar>
	);
}
