import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Accordion } from ".";

const meta: Meta<typeof Accordion> = {
	title: "Components/Accordion",
	component: Accordion,
	tags: ["autodocs"],
	argTypes: {
		multiple: {
			control: "boolean",
			description: "여러 개 동시에 펼침 허용. false면 한 번에 하나만.",
		},
		defaultOpenKeys: {
			control: "object",
			description: "기본으로 펼쳐진 키 배열 (비제어형).",
		},
		openKeys: {
			control: false,
			description: "제어형 — 현재 펼쳐진 키 배열.",
		},
		onChange: {
			action: "changed",
			description: "펼침/접힘 시 호출되는 콜백.",
		},
		items: {
			control: false,
			description: "아이템 배열 (key, title, content, disabled).",
		},
	},
	args: {
		multiple: false,
		defaultOpenKeys: [],
	},
	parameters: {
		docs: {
			description: {
				component: `
**Accordion**은 펼침/접힘으로 컨텐츠를 점진적으로 노출하는 영역.

### 언제 쓰는가
- ✅ FAQ, 설정 그룹, details 패턴, 사이드바 분류
- ❌ 카테고리 간 전환은 **Tabs** 사용
- ❌ 단순 토글 1개 항목은 native **\`<details>\`** 사용

### multiple
- \`multiple={false}\` (기본) — 한 번에 하나만 펼침. 설정/step gathering 패턴
- \`multiple={true}\` — 독립 토글. FAQ/분류 트리 패턴

### 접근성
WAI-ARIA Disclosure 패턴 자동 적용: \`aria-expanded\`, \`aria-controls\`, \`role="region"\`. 키보드 <kbd>Enter</kbd>/<kbd>Space</kbd>로 토글.

### 애니메이션
200ms grid-template-rows transition (height auto). \`prefers-reduced-motion: reduce\` 사용자에겐 자동 비활성.
`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Playground: Story = {
	name: "Playground (Controls로 조작)",
	parameters: {
		docs: {
			description: {
				story: "우측 Controls 패널에서 multiple/defaultOpenKeys를 바꿔보세요. items는 sample FAQ 사용.",
			},
		},
	},
	args: {
		items: [
			{
				key: "1",
				title: "Bigtablet은 무엇인가요?",
				content: "B2B 매장 운영을 위한 통합 관리 솔루션입니다.",
			},
			{
				key: "2",
				title: "어떻게 시작하나요?",
				content: "무료 체험을 신청하시면 영업팀이 연락드립니다.",
			},
			{
				key: "3",
				title: "결제 방식은요?",
				content: "월간 / 연간 구독 방식입니다.",
			},
		],
	},
	render: (args) => (
		<div style={{ width: 560 }}>
			<Accordion {...args} />
		</div>
	),
};

const FAQ = [
	{
		key: "1",
		title: "Bigtablet은 무엇인가요?",
		content: "B2B 매장 운영을 위한 통합 관리 솔루션입니다. 주문/재고/직원 관리 등을 제공합니다.",
	},
	{
		key: "2",
		title: "어떻게 시작하나요?",
		content: "무료 체험을 신청하시면 영업팀이 연락드려 도입을 도와드립니다.",
	},
	{
		key: "3",
		title: "결제 방식은요?",
		content: "월간 / 연간 구독 방식이며, 매장 규모에 따라 요금이 다릅니다. 견적은 상담 후 안내드립니다.",
	},
];

export const Default: Story = {
	name: "기본 (단일 펼침)",
	render: () => (
		<div style={{ width: 560 }}>
			<Accordion items={FAQ} />
		</div>
	),
};

export const Multiple: Story = {
	name: "여러 개 동시 펼침",
	render: () => (
		<div style={{ width: 560 }}>
			<Accordion items={FAQ} multiple defaultOpenKeys={["1", "2"]} />
		</div>
	),
};

export const WithDisabled: Story = {
	name: "비활성 아이템",
	render: () => (
		<div style={{ width: 560 }}>
			<Accordion
				items={[
					{ key: "a", title: "Available", content: "Open this." },
					{ key: "b", title: "Coming soon (disabled)", content: "...", disabled: true },
					{ key: "c", title: "Available", content: "Another one." },
				]}
			/>
		</div>
	),
};

// ─── Controlled ───────────────────────────────────────────────────────────

export const Controlled: Story = {
	name: "제어형 (openKeys + onChange)",
	parameters: {
		docs: {
			description: {
				story: "URL 쿼리/외부 state와 동기화할 때. 부모가 `openKeys`를 관리.",
			},
		},
	},
	render: () => {
		const [openKeys, setOpenKeys] = useState<string[]>(["q1"]);
		return (
			<div style={{ width: 560 }}>
				<div style={{ marginBottom: 12, fontSize: 13, color: "var(--bt-color-text-body)" }}>
					현재 열린 키:{" "}
					<code style={{ color: "var(--bt-color-accent-default)" }}>
						{JSON.stringify(openKeys)}
					</code>
				</div>
				<Accordion items={FAQ} openKeys={openKeys} onChange={setOpenKeys} multiple />
				<div style={{ marginTop: 12, display: "flex", gap: 8 }}>
					<button
						type="button"
						onClick={() => setOpenKeys(FAQ.map((i) => i.key))}
						style={{ padding: "6px 12px", fontSize: 13 }}
					>
						All open
					</button>
					<button
						type="button"
						onClick={() => setOpenKeys([])}
						style={{ padding: "6px 12px", fontSize: 13 }}
					>
						All close
					</button>
				</div>
			</div>
		);
	},
};

// ─── Long content (애니메이션 확인용) ──────────────────────────────────────

export const LongContent: Story = {
	name: "긴 컨텐츠 (애니메이션 효과)",
	parameters: {
		docs: {
			description: {
				story: "본문이 길어도 200ms 안에 자연스럽게 펼침. `grid-template-rows: 0fr → 1fr` 트릭.",
			},
		},
	},
	render: () => (
		<div style={{ width: 560 }}>
			<Accordion
				items={[
					{
						key: "long",
						title: "이용약관 (긴 본문)",
						content: (
							<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
								<p>
									제1조 (목적) 본 약관은 Bigtablet이 제공하는 매장 운영 솔루션 서비스의 이용과
									관련하여 회사와 회원의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로
									합니다.
								</p>
								<p>
									제2조 (용어의 정의) "회원"이란 본 약관에 동의하고 회사가 제공하는 서비스를 이용하는
									자를 말합니다. "유료서비스"란 회사가 유료로 제공하는 각종 매장 운영 도구를
									의미합니다.
								</p>
								<p>
									제3조 (약관의 효력 및 변경) 본 약관은 서비스를 이용하고자 하는 모든 회원에게 그
									효력이 발생합니다. 회사는 필요시 관련법령을 위배하지 않는 범위 내에서 본 약관을
									변경할 수 있습니다.
								</p>
								<p>
									제4조 (서비스의 제공) 회사는 회원에게 주문/재고/직원 관리, 매출 분석, 멤버십 관리
									등의 서비스를 제공합니다. 서비스는 연중무휴 24시간 제공함을 원칙으로 합니다.
								</p>
							</div>
						),
					},
					{ key: "short", title: "짧은 본문", content: "한 줄짜리." },
				]}
			/>
		</div>
	),
};

// ─── Rich content ─────────────────────────────────────────────────────────

export const RichContent: Story = {
	name: "리치 컨텐츠 (폼/리스트/이미지)",
	parameters: {
		docs: {
			description: {
				story: "content에 ReactNode 자유 삽입 가능. 폼/리스트/이미지/다른 컴포넌트 OK.",
			},
		},
	},
	render: () => (
		<div style={{ width: 560 }}>
			<Accordion
				multiple
				defaultOpenKeys={["form"]}
				items={[
					{
						key: "form",
						title: "📝 추가 정보 입력",
						content: (
							<form style={{ display: "flex", flexDirection: "column", gap: 12 }}>
								<label style={{ fontSize: 13 }}>
									매장 이름
									<input
										type="text"
										placeholder="예: 강남 1호점"
										style={{
											display: "block",
											width: "100%",
											marginTop: 4,
											padding: 8,
											border: "1px solid var(--bt-color-border-default)",
											borderRadius: 6,
											background: "var(--bt-color-bg-solid)",
											color: "var(--bt-color-text-heading)",
										}}
									/>
								</label>
								<label style={{ fontSize: 13 }}>
									사업자 등록번호
									<input
										type="text"
										placeholder="123-45-67890"
										style={{
											display: "block",
											width: "100%",
											marginTop: 4,
											padding: 8,
											border: "1px solid var(--bt-color-border-default)",
											borderRadius: 6,
											background: "var(--bt-color-bg-solid)",
											color: "var(--bt-color-text-heading)",
										}}
									/>
								</label>
							</form>
						),
					},
					{
						key: "list",
						title: "📋 체크리스트",
						content: (
							<ul style={{ paddingLeft: 20, margin: 0 }}>
								<li>POS 설치 확인</li>
								<li>네트워크 연결 확인</li>
								<li>직원 계정 발급</li>
								<li>초기 메뉴 등록</li>
							</ul>
						),
					},
				]}
			/>
		</div>
	),
};

// ─── Settings panel (single mode) ──────────────────────────────────────────

export const SettingsPanel: Story = {
	name: "설정 패널 (단일 모드)",
	parameters: {
		docs: {
			description: {
				story: "`multiple={false}` — 설정 그룹처럼 동시에 하나만 열어야 하는 경우.",
			},
		},
	},
	render: () => (
		<div style={{ width: 560 }}>
			<Accordion
				items={[
					{
						key: "general",
						title: "일반",
						content: <div style={{ fontSize: 14 }}>언어, 시간대, 테마 등 일반 설정</div>,
					},
					{
						key: "notification",
						title: "알림",
						content: (
							<div style={{ fontSize: 14 }}>이메일 / SMS / 푸시 알림 수신 여부 설정</div>
						),
					},
					{
						key: "billing",
						title: "결제",
						content: <div style={{ fontSize: 14 }}>결제 수단, 자동 결제 설정</div>,
					},
					{
						key: "danger",
						title: "위험 구역",
						content: (
							<div style={{ fontSize: 14, color: "var(--bt-color-status-error)" }}>
								⚠️ 계정 삭제, 데이터 영구 삭제
							</div>
						),
					},
				]}
			/>
		</div>
	),
};
