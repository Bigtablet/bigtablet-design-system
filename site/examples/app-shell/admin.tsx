import {
	AppShell,
	Button,
	NavBar,
	PageHeader,
	Sidebar,
	SidebarItem,
	SidebarSection,
} from "@bigtablet/design-system";
import { Home, Settings, ShoppingBag, Users } from "lucide-react";
import { useState } from "react";

// 사이드바 항목에는 아이콘을 둡니다 - 접으면 라벨이 숨고 아이콘만 남습니다. 접힌 머리에는 정사각 로고(headerCollapsed)를 둡니다.
export default function Example() {
	const [current, setCurrent] = useState("home");
	const item = (id: string, label: string, icon: React.ReactNode) => (
		<SidebarItem icon={icon} active={current === id} onClick={() => setCurrent(id)}>
			{label}
		</SidebarItem>
	);
	return (
		<AppShell
			sidebar={
				<Sidebar header={<strong>Bigtablet</strong>} headerCollapsed={<strong>B</strong>}>
					<SidebarSection label="운영">
						{item("home", "대시보드", <Home size={18} />)}
						{item("orders", "주문", <ShoppingBag size={18} />)}
					</SidebarSection>
					<SidebarSection label="관리">
						{item("members", "구성원", <Users size={18} />)}
						{item("settings", "설정", <Settings size={18} />)}
					</SidebarSection>
				</Sidebar>
			}
			header={<NavBar layout="fluid" sticky brand={<span>관리자</span>} />}
		>
			<PageHeader
				title="대시보드"
				description="오늘 들어온 주문입니다"
				actions={<Button>주문 추가</Button>}
			/>
		</AppShell>
	);
}
