import type { Meta, StoryObj } from "@storybook/react";
import { baseColors, colors } from "src/styles/ts/colors";

const getReadableTextColor = (bgColor: string): string => {
	if (bgColor.startsWith("rgba") || bgColor === "transparent") return "#000000";
	const hex = bgColor.replace("#", "");
	const r = parseInt(hex.slice(0, 2), 16);
	const g = parseInt(hex.slice(2, 4), 16);
	const b = parseInt(hex.slice(4, 6), 16);
	const brightness = (r * 299 + g * 587 + b * 114) / 1000;
	return brightness > 128 ? "#000000" : "#ffffff";
};

const meta: Meta = {
	title: "Foundation/colors",
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
### Colors (색상 시스템)

**Base / Semantic 2계층 구조**로 정의된 공식 색상 토큰입니다.

- **Base**: raw 값 (직접 사용 지양)
- **Semantic**: 역할 기반 (brand / text / bg / state / border / status)

❗️직접 HEX / RGB 값을 쓰지 말고 **반드시 Semantic 토큰**을 사용하세요.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj;

type ColorGroup = Record<string, string>;

function ColorRow({ group, token, value }: { group: string; token: string; value: string }) {
	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "220px 1fr 180px",
				alignItems: "center",
				gap: 12,
				padding: 12,
				background: "#fff",
				border: "1px solid rgba(0,0,0,0.06)",
				borderRadius: 12,
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
				<div
					style={{
						width: 36,
						height: 36,
						borderRadius: 8,
						background: value,
						border: "1px solid rgba(0,0,0,0.08)",
						flexShrink: 0,
					}}
				/>
				<div>
					<code style={{ fontSize: 12 }}>
						{group === "baseColors" ? toJsonKey(token) : `${group}.${token}`}
					</code>
					<div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{value}</div>
				</div>
			</div>
			<div
				style={{
					padding: "6px 10px",
					borderRadius: 8,
					background: value,
					color: getReadableTextColor(value),
					fontSize: 13,
					textAlign: "center",
				}}
			>
				Sample
			</div>
		</div>
	);
}

function Section({
	title,
	description,
	group,
	entries,
}: {
	title: string;
	description: string;
	group: string;
	entries: [string, string][];
}) {
	return (
		<section style={{ display: "grid", gap: 8 }}>
			<div>
				<strong style={{ fontSize: 15 }}>{title}</strong>
				<p style={{ margin: "2px 0 0", fontSize: 13, opacity: 0.7 }}>{description}</p>
			</div>
			{entries.map(([key, value]) => (
				<ColorRow key={key} group={group} token={key} value={value} />
			))}
		</section>
	);
}

export const Semantic: Story = {
	name: "Semantic Colors",
	render: () => (
		<div style={{ display: "grid", gap: 32, maxWidth: 760 }}>
			<Section
				title="Brand"
				description="서비스 아이덴티티를 나타내는 주요 색상. 로고, CTA 버튼, 주요 강조 영역에 사용합니다."
				group="colors.brand"
				entries={Object.entries(colors.brand as ColorGroup)}
			/>
			<Section
				title="Text"
				description="텍스트 위계를 구분하는 색상. heading → body → caption 순으로 시각적 중요도가 낮아집니다."
				group="colors.text"
				entries={Object.entries(colors.text as ColorGroup)}
			/>
			<Section
				title="Background"
				description="페이지·카드·오버레이 등 배경 영역에 사용하는 색상. solid(기본) → solidDim(보조) → overlay(딤드) 순으로 레이어가 나뉩니다."
				group="colors.bg"
				entries={Object.entries(colors.bg as ColorGroup)}
			/>
			<Section
				title="State"
				description="호버·프레스 같은 인터랙션 피드백용 색상. 밝은 배경(onLight)과 어두운 배경(onDark) 각각 대응합니다."
				group="colors.state"
				entries={Object.entries(colors.state as ColorGroup)}
			/>
			<Section
				title="Border"
				description="요소 간 경계·구분선 색상. default(기본) → subtle(약한) → focus(강조) 순으로 시각적 강도가 다릅니다."
				group="colors.border"
				entries={Object.entries(colors.border as ColorGroup)}
			/>
			<Section
				title="Status"
				description="시스템 피드백 색상. 성공(초록), 오류(빨강), 경고(노랑), 정보(파랑)로 상태를 전달합니다."
				group="colors.status"
				entries={Object.entries(colors.status as ColorGroup)}
			/>
		</div>
	),
};

export const Base: Story = {
	name: "Base Colors (raw)",
	render: () => (
		<div style={{ display: "grid", gap: 8, maxWidth: 760 }}>
			<p style={{ margin: "0 0 8px", fontSize: 13, opacity: 0.7 }}>
				⚠️ Base 토큰은 직접 사용을 지양하고 Semantic 토큰을 통해 사용하세요.
			</p>
			{Object.entries(baseColors as Record<string, string>).map(([key, value]) => (
				<ColorRow key={key} group="baseColors" token={key} value={value} />
			))}
		</div>
	),
};

/** camelCase → kebab-case (tokens.json 키 표시용) */
function toJsonKey(key: string) {
	return key.replace(/([a-z])([A-Z0-9])/g, "$1-$2").replace(/([0-9])([a-zA-Z])/g, "$1-$2").toLowerCase();
}
