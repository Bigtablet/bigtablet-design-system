import { BottomNav, BottomNavItem, BottomNavSpacer } from "@bigtablet/design-system";
import { Home, Search, ShoppingBag, User } from "lucide-react";
import { useState } from "react";

// 화면 아래에 고정되므로 본문 끝에 BottomNavSpacer 를 깔아 가리지 않게 합니다
export default function Example() {
	const [tab, setTab] = useState("home");
	const items = [
		{ id: "home", label: "홈", icon: <Home /> },
		{ id: "search", label: "검색", icon: <Search /> },
		{ id: "orders", label: "주문", icon: <ShoppingBag /> },
		{ id: "me", label: "내 정보", icon: <User /> },
	];
	return (
		<>
			<p style={{ padding: 16 }}>본문</p>
			<BottomNavSpacer />
			<BottomNav ariaLabel="주요 메뉴">
				{items.map((i) => (
					<BottomNavItem
						key={i.id}
						icon={i.icon}
						label={i.label}
						active={tab === i.id}
						onClick={() => setTab(i.id)}
					/>
				))}
			</BottomNav>
		</>
	);
}
