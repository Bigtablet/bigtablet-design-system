"use client";

import type * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
	/** 좌측 네비게이션. 보통 `Sidebar` */
	sidebar?: React.ReactNode;
	/** 콘텐츠 열 위에 고정되는 헤더. 보통 `NavBar` */
	header?: React.ReactNode;
	/** 본문 여백 (기본값: true). 자체 여백을 가진 화면은 false */
	padded?: boolean;
}

/**
 * 관리자·대시보드 화면의 껍데기. 사이드바 열 + 고정 헤더 + 본문을 한 곳에서 잡는다.
 *
 * 화면마다 `<div style={{ display: "flex", minHeight: "100vh" }}>` 로 다시 만들던 층이고,
 * 그때마다 조용히 빠지던 것들을 여기서 소유한다.
 *
 * - **문서가 스크롤한다.** 본문을 `overflow-y: auto` 로 만들면 `Modal`·`Drawer` 의 스크롤
 *   잠금(`body { overflow: hidden }`)이 본문에 닿지 않아 모달 뒤 배경이 계속 스크롤된다.
 *   사이드바와 헤더는 `sticky` 로 붙인다.
 * - **콘텐츠 열은 `minmax(0, 1fr)`.** 없으면 자기 넘침을 스스로 처리하지 않는 자식(줄바꿈 없는
 *   긴 문자열, 폭이 고정된 블록)이 열 자체를 자기 폭까지 늘린다. 실측 - 1800px 자식을 넣으면
 *   열이 1024px → 1869px 로 늘어나 고정 헤더와 모든 행이 화면보다 넓어진다. 이 값이 있으면
 *   열은 뷰포트 폭에 머물고 넘침은 그 자식 안에 남는다.
 * - **하단 크롬 여백.** `Sidebar` 는 600px 아래에서 fixed BottomBar 로 변신해 문서 흐름에서
 *   빠지고, `BottomNav` 도 fixed 다. 본문 끝이 그 아래로 가려지지 않게 `--bt-bottom-inset`
 *   만큼 띄운다.
 *
 * 헤더를 사이드바 위까지 꽉 채우려면 `AppShell` 밖에 두면 된다.
 *
 * @example
 * ```tsx
 * <AppShell sidebar={<Sidebar … />} header={<NavBar layout="fluid" sticky … />}>
 *   <PageHeader title="대시보드" actions={<Button>추가</Button>} />
 *   <DataView … />
 * </AppShell>
 * ```
 */
export const AppShell = ({
	sidebar,
	header,
	padded = true,
	className,
	children,
	...props
}: AppShellProps) => (
	<div className={cn("app_shell", { app_shell_with_sidebar: !!sidebar }, className)} {...props}>
		{sidebar && <div className="app_shell_sidebar">{sidebar}</div>}
		<div className="app_shell_body">
			{header && <div className="app_shell_header">{header}</div>}
			<main className={cn("app_shell_main", { app_shell_main_padded: padded })}>{children}</main>
		</div>
	</div>
);
