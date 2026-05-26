import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../../ui/general/button";
import { Card } from "../../ui/display/card";
import { TextField } from "../../ui/forms/textfield";
import { ThemeProvider, useTheme } from "../../ui/system/theme-provider";

const meta: Meta = {
	title: "Foundation/Dark Mode",
	tags: ["autodocs"],
	parameters: {
		chromatic: { disableSnapshot: true },
		layout: "fullscreen",
		docs: {
			description: {
				component: `
### Dark Mode

Bigtablet DS는 CSS Custom Properties 기반 dark mode를 지원합니다.

#### 작동 방식

\`<html>\` 또는 임의 root element에 \`data-theme\` 속성을 적용:
- \`data-theme="light"\` → light 모드 (기본)
- \`data-theme="dark"\` → dark 모드
- 속성 없음 → \`prefers-color-scheme\` 자동 응답

#### 사용 예 (React)

\`\`\`tsx
import { ThemeProvider } from "@bigtablet/design-system";

<ThemeProvider defaultMode="system">
  <App />
</ThemeProvider>
\`\`\`

#### 사용 예 (Vanilla / Next.js head)

\`\`\`html
<!-- light mode 명시 -->
<html data-theme="light">

<!-- 시스템 테마 추적 (속성 없음) -->
<html>
\`\`\`

#### dark 모드 컬러 매핑

| Semantic | Light | Dark |
|----------|-------|------|
| bg.solid | #FFFFFF | #1F2630 (navy-900) |
| bg.solid_dim | #F4F4F4 | #303841 (navy-800) |
| text.heading | #121212 | #FFFFFF |
| text.body | #666666 | #B4C2CD (navy-200) |
| text.caption | #888888 | #999999 |
| border.default | #E5E5E5 | #3D4852 (navy-700) |

\`brand_primary\`, \`accent.*\`, \`status.*\` 는 라이트/다크 동일 (브랜드 일관성).

#### Storybook toolbar

상단 툴바의 ☼/🌙 아이콘으로 light/dark/system 전환. 모든 스토리에서 작동.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj;

function ThemeStatus() {
	const { mode, resolved, setMode } = useTheme();
	return (
		<div
			style={{
				display: "flex",
				gap: 12,
				alignItems: "center",
				padding: 16,
				background: "var(--bt-color-bg-solid-dim)",
				borderRadius: 8,
				color: "var(--bt-color-text-heading)",
			}}
		>
			<span>
				mode: <strong>{mode}</strong>
			</span>
			<span>
				resolved: <strong>{resolved}</strong>
			</span>
			<div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
				<button type="button" onClick={() => setMode("light")} style={btnStyle(mode === "light")}>
					Light
				</button>
				<button type="button" onClick={() => setMode("dark")} style={btnStyle(mode === "dark")}>
					Dark
				</button>
				<button type="button" onClick={() => setMode("system")} style={btnStyle(mode === "system")}>
					System
				</button>
			</div>
		</div>
	);
}

function btnStyle(active: boolean): React.CSSProperties {
	return {
		padding: "6px 12px",
		borderRadius: 6,
		border: "1px solid var(--bt-color-border-default)",
		background: active ? "var(--bt-color-accent-default)" : "var(--bt-color-bg-solid)",
		color: active ? "var(--bt-color-accent-on-surface)" : "var(--bt-color-text-heading)",
		cursor: "pointer",
		fontSize: 13,
	};
}

export const Demo: Story = {
	name: "ThemeProvider 데모",
	render: () => (
		<ThemeProvider defaultMode="light">
			<div
				style={{
					padding: 24,
					background: "var(--bt-color-bg-solid)",
					color: "var(--bt-color-text-heading)",
					minHeight: 480,
					transition: "background 0.2s, color 0.2s",
				}}
			>
				<ThemeStatus />

				<div style={{ marginTop: 24, display: "grid", gap: 16, maxWidth: 480 }}>
					<h2 style={{ margin: 0, color: "var(--bt-color-text-heading)" }}>제목 텍스트</h2>
					<p style={{ margin: 0, color: "var(--bt-color-text-body)" }}>
						본문 텍스트 — light/dark 모드에 따라 색이 자동 전환됩니다.
					</p>
					<p style={{ margin: 0, color: "var(--bt-color-text-caption)" }}>caption 텍스트</p>

					<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
						<Button variant="filled">Primary</Button>
						<Button variant="outline">Outline</Button>
						<Button variant="tonal">Tonal</Button>
						<Button variant="text">Text</Button>
					</div>

					<TextField label="이메일" placeholder="name@example.com" />

					<Card heading="카드 제목" bordered>
						<p style={{ margin: 0, color: "var(--bt-color-text-body)" }}>
							카드 본문 — 배경과 border가 테마에 맞춰 전환됩니다.
						</p>
					</Card>
				</div>
			</div>
		</ThemeProvider>
	),
};

export const TokenComparison: Story = {
	name: "토큰 비교 (light vs dark)",
	parameters: { docs: { source: { code: "" } } },
	render: () => {
		const items = [
			{ token: "bg.solid", lightHex: "#FFFFFF", darkHex: "#1F2630" },
			{ token: "bg.solid_dim", lightHex: "#F4F4F4", darkHex: "#303841" },
			{ token: "text.heading", lightHex: "#121212", darkHex: "#FFFFFF" },
			{ token: "text.body", lightHex: "#666666", darkHex: "#B4C2CD" },
			{ token: "text.caption", lightHex: "#888888", darkHex: "#999999" },
			{ token: "border.default", lightHex: "#E5E5E5", darkHex: "#3D4852" },
		];
		return (
			<div
				style={{
					padding: 24,
					background: "var(--bt-color-bg-solid)",
					minHeight: 480,
				}}
			>
				<table
					style={{
						width: "100%",
						maxWidth: 640,
						borderCollapse: "collapse",
						color: "var(--bt-color-text-heading)",
					}}
				>
					<thead>
						<tr>
							<th style={th}>Token</th>
							<th style={th}>Light</th>
							<th style={th}>Dark</th>
						</tr>
					</thead>
					<tbody>
						{items.map(({ token, lightHex, darkHex }) => (
							<tr key={token}>
								<td style={td}>
									<code>{token}</code>
								</td>
								<td style={td}>
									<span style={{ ...swatch, background: lightHex }} />
									{lightHex}
								</td>
								<td style={td}>
									<span style={{ ...swatch, background: darkHex }} />
									{darkHex}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	},
};

const th: React.CSSProperties = {
	textAlign: "left",
	padding: "8px 12px",
	borderBottom: "1px solid var(--bt-color-border-default)",
	fontSize: 13,
};
const td: React.CSSProperties = {
	padding: "10px 12px",
	borderBottom: "1px solid var(--bt-color-border-default)",
	fontSize: 13,
	color: "var(--bt-color-text-body)",
};
const swatch: React.CSSProperties = {
	display: "inline-block",
	width: 14,
	height: 14,
	borderRadius: 3,
	marginRight: 8,
	verticalAlign: "middle",
	border: "1px solid rgba(0,0,0,0.08)",
};
