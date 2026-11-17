import { Sidebar, SidebarItem, SidebarSection } from "@bigtablet/design-system";
import { BarChart3, Home, Settings, ShoppingBag, Users } from "lucide-react";
import { useState } from "react";

export default function Example() {
	const [current, setCurrent] = useState("home");
	const item = (id: string, label: string, icon: React.ReactNode) => (
		<SidebarItem icon={icon} active={current === id} onClick={() => setCurrent(id)}>
			{label}
		</SidebarItem>
	);
	return (
		<div style={{ display: "flex", minHeight: 360 }}>
			<Sidebar header={<strong>Bigtablet</strong>} headerCollapsed={<strong>B</strong>} collapsible>
				<SidebarSection label="운영">
					{item("home", "대시보드", <Home size={18} />)}
					{item("orders", "주문", <ShoppingBag size={18} />)}
					{item("sales", "매출", <BarChart3 size={18} />)}
				</SidebarSection>
				<SidebarSection label="관리">
					{item("members", "구성원", <Users size={18} />)}
					{item("settings", "설정", <Settings size={18} />)}
				</SidebarSection>
			</Sidebar>
		</div>
	);
}
