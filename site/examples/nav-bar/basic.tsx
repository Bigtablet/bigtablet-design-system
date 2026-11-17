import { Button, NavBar, NavLink } from "@bigtablet/design-system";
import { useState } from "react";

export default function Example() {
	const [lang, setLang] = useState("ko");
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
			<NavLink href="/product" active>
				제품
			</NavLink>
			<NavLink href="/pricing">가격</NavLink>
			<NavLink href="/blog">블로그</NavLink>
		</NavBar>
	);
}
