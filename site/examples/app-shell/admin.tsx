import {
	AppShell,
	Button,
	NavBar,
	PageHeader,
	Sidebar,
	SidebarItem,
	SidebarSection,
} from "@bigtablet/design-system";

export default function Example() {
	return (
		<AppShell
			sidebar={
				<Sidebar header={<strong>Bigtablet</strong>} headerCollapsed={<strong>B</strong>}>
					<SidebarSection label="운영">
						<SidebarItem active>대시보드</SidebarItem>
						<SidebarItem>주문</SidebarItem>
					</SidebarSection>
					<SidebarSection label="관리">
						<SidebarItem>구성원</SidebarItem>
						<SidebarItem>설정</SidebarItem>
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
