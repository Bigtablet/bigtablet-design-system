import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { skeleton } from "src/styles/ts/skeleton";

const keyframeStyle = `
@keyframes skeleton_loading {
  0%   { background-position: 100% 0; }
  100% { background-position: 0 0; }
}
`;

function SkeletonBlock({
	width = "100%",
	height,
	borderRadius,
}: {
	width?: string | number;
	height: string;
	borderRadius: string;
}) {
	return (
		<div
			style={{
				width,
				height,
				borderRadius,
				background: skeleton.gradient,
				backgroundSize: "400% 100%",
				animation: `skeleton_loading ${skeleton.animation.duration} ${skeleton.animation.timing} infinite`,
			}}
		/>
	);
}

const meta: Meta = {
	title: "Foundation/skeleton",
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
### 스켈레톤(Skeleton) 토큰

콘텐츠가 로딩 중일 때 자리를 채우는 **플레이스홀더 UI**에 사용하는 토큰입니다.

- **color**: 스켈레톤 그라디언트를 구성하는 3가지 색상
- **gradient**: 웨이브 애니메이션에 쓰이는 linear-gradient
- **radius**: 텍스트 / 카드 / 아바타 등 형태별 라운드
- **height**: xs ~ xl 높이 단계 (spacing 토큰과 연동)
- **animation**: 지속 시간과 이징

\`\`\`ts
import { skeleton } from "@bigtablet/design-system";
\`\`\`
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj;

// ── 1. 토큰 레퍼런스 ─────────────────────────────────────────────────────────

export const Tokens: Story = {
	name: "토큰 레퍼런스",
	render: () => (
		<div style={{ display: "grid", gap: 32, maxWidth: 720 }}>
			{/* Colors */}
			<section>
				<h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>skeleton.color</h3>
				<div style={{ display: "grid", gap: 8 }}>
					{Object.entries(skeleton.color).map(([key, value]) => (
						<div
							key={key}
							style={{
								display: "grid",
								gridTemplateColumns: "40px 140px 1fr",
								alignItems: "center",
								gap: 12,
								padding: "10px 14px",
								border: "1px solid #e5e5e5",
								borderRadius: 8,
							}}
						>
							<div
								style={{
									width: 40,
									height: 40,
									borderRadius: 6,
									background: value,
									border: "1px solid #e5e5e5",
								}}
							/>
							<code style={{ fontSize: 13 }}>color.{key}</code>
							<span style={{ fontSize: 12, opacity: 0.6 }}>{value}</span>
						</div>
					))}
				</div>
			</section>

			{/* Radius */}
			<section>
				<h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>skeleton.radius</h3>
				<div style={{ display: "grid", gap: 8 }}>
					{Object.entries(skeleton.radius).map(([key, value]) => (
						<div
							key={key}
							style={{
								display: "grid",
								gridTemplateColumns: "80px 80px 1fr",
								alignItems: "center",
								gap: 12,
								padding: "10px 14px",
								border: "1px solid #e5e5e5",
								borderRadius: 8,
							}}
						>
							<code style={{ fontSize: 13 }}>radius.{key}</code>
							<span style={{ fontSize: 12, opacity: 0.6 }}>{value}</span>
							<div
								style={{
									width: 120,
									height: 24,
									borderRadius: value,
									background: "#e5e5e5",
								}}
							/>
						</div>
					))}
				</div>
			</section>

			{/* Height */}
			<section>
				<h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>skeleton.height</h3>
				<div style={{ display: "grid", gap: 8 }}>
					{Object.entries(skeleton.height).map(([key, value]) => (
						<div
							key={key}
							style={{
								display: "grid",
								gridTemplateColumns: "80px 80px 1fr",
								alignItems: "center",
								gap: 12,
								padding: "10px 14px",
								border: "1px solid #e5e5e5",
								borderRadius: 8,
							}}
						>
							<code style={{ fontSize: 13 }}>height.{key}</code>
							<span style={{ fontSize: 12, opacity: 0.6 }}>{value}</span>
							<div
								style={{
									width: "100%",
									height: value,
									borderRadius: skeleton.radius.md,
									background: "#e5e5e5",
								}}
							/>
						</div>
					))}
				</div>
			</section>

			{/* Animation */}
			<section>
				<h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>skeleton.animation</h3>
				<div style={{ display: "grid", gap: 8 }}>
					{Object.entries(skeleton.animation).map(([key, value]) => (
						<div
							key={key}
							style={{
								display: "grid",
								gridTemplateColumns: "120px 1fr",
								alignItems: "center",
								gap: 12,
								padding: "10px 14px",
								border: "1px solid #e5e5e5",
								borderRadius: 8,
							}}
						>
							<code style={{ fontSize: 13 }}>animation.{key}</code>
							<span style={{ fontSize: 12, opacity: 0.6 }}>{value}</span>
						</div>
					))}
				</div>
			</section>
		</div>
	),
};

// ── 2. 애니메이션 미리보기 ─────────────────────────────────────────────────────

export const Animation: Story = {
	name: "웨이브 애니메이션 미리보기",
	render: () => (
		<div style={{ display: "grid", gap: 16, maxWidth: 480 }}>
			<style>{keyframeStyle}</style>

			{Object.entries(skeleton.height).map(([key, height]) => (
				<div
					key={key}
					style={{
						display: "grid",
						gridTemplateColumns: "60px 1fr",
						alignItems: "center",
						gap: 12,
					}}
				>
					<code style={{ fontSize: 12, opacity: 0.6 }}>{key}</code>
					<div
						style={{
							width: "100%",
							height,
							borderRadius: skeleton.radius.md,
							background: skeleton.gradient,
							backgroundSize: "400% 100%",
							animation: `skeleton_loading ${skeleton.animation.duration} ${skeleton.animation.timing} infinite`,
						}}
					/>
				</div>
			))}
		</div>
	),
};

// ── 3. 실사용 예시 ─────────────────────────────────────────────────────────────

export const CardExample: Story = {
	name: "카드 레이아웃 예시",
	render: () => (
		<div style={{ display: "grid", gap: 24, maxWidth: 720, gridTemplateColumns: "1fr 1fr" }}>
			<style>{keyframeStyle}</style>

			{[0, 1].map((i) => (
				<div
					key={`card-${i}`}
					style={{
						padding: 16,
						border: "1px solid #e5e5e5",
						borderRadius: 12,
						display: "grid",
						gap: 12,
					}}
				>
					{/* 썸네일 */}
					<SkeletonBlock height="120px" borderRadius={skeleton.radius.md} />
					{/* 제목 */}
					<SkeletonBlock height={skeleton.height.xl} borderRadius={skeleton.radius.sm} />
					{/* 본문 2줄 */}
					<SkeletonBlock height={skeleton.height.md} borderRadius={skeleton.radius.sm} />
					<SkeletonBlock
						width="70%"
						height={skeleton.height.md}
						borderRadius={skeleton.radius.sm}
					/>
				</div>
			))}
		</div>
	),
};

export const ProfileExample: Story = {
	name: "프로필 레이아웃 예시",
	render: () => (
		<div style={{ maxWidth: 360 }}>
			<style>{keyframeStyle}</style>

			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 16,
					padding: 16,
					border: "1px solid #e5e5e5",
					borderRadius: 12,
				}}
			>
				{/* 아바타 */}
				<div
					style={{
						flexShrink: 0,
						width: 48,
						height: 48,
						borderRadius: skeleton.radius.lg,
						background: skeleton.gradient,
						backgroundSize: "400% 100%",
						animation: `skeleton_loading ${skeleton.animation.duration} ${skeleton.animation.timing} infinite`,
					}}
				/>
				{/* 이름 + 소개 */}
				<div style={{ flex: 1, display: "grid", gap: 8 }}>
					<SkeletonBlock
						width="60%"
						height={skeleton.height.lg}
						borderRadius={skeleton.radius.sm}
					/>
					<SkeletonBlock height={skeleton.height.md} borderRadius={skeleton.radius.sm} />
				</div>
			</div>
		</div>
	),
};

export const ListExample: Story = {
	name: "리스트 레이아웃 예시",
	render: () => (
		<div style={{ maxWidth: 480, display: "grid", gap: 8 }}>
			<style>{keyframeStyle}</style>

			{Array.from({ length: 4 }).map((_, i) => (
				<div
					key={`list-item-${i}`}
					style={{
						display: "grid",
						gridTemplateColumns: "40px 1fr",
						alignItems: "center",
						gap: 12,
						padding: "12px 16px",
						border: "1px solid #e5e5e5",
						borderRadius: 8,
					}}
				>
					<div
						style={{
							width: 40,
							height: 40,
							borderRadius: skeleton.radius.md,
							background: skeleton.gradient,
							backgroundSize: "400% 100%",
							animation: `skeleton_loading ${skeleton.animation.duration} ${skeleton.animation.timing} infinite`,
						}}
					/>
					<div style={{ display: "grid", gap: 6 }}>
						<SkeletonBlock
							width={`${60 + i * 8}%`}
							height={skeleton.height.md}
							borderRadius={skeleton.radius.sm}
						/>
						<SkeletonBlock
							width={`${40 + i * 5}%`}
							height={skeleton.height.sm}
							borderRadius={skeleton.radius.sm}
						/>
					</div>
				</div>
			))}
		</div>
	),
};
