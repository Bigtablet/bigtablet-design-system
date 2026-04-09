import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { motion } from "src/styles/motion";

const meta: Meta = {
	title: "Foundation/motion",
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
### 모션(Motion) 기준

UI가 **얼마나 빠르게, 얼마나 부드럽게 반응하는지**를 정의하는 기준입니다.

👉 버튼 hover, 카드 강조, 모달 등장 같은  
모든 인터랙션 애니메이션에 공통으로 사용됩니다.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj;

export const Transitions: Story = {
	name: "전환 속도 미리보기",
	render: () => (
		<div style={{ display: "grid", gap: 24, maxWidth: 720 }}>
			{Object.entries(motion.transition).map(([key, value]) => (
				<MotionPreview key={key} name={key} transition={value} />
			))}
		</div>
	),
};

function MotionPreview({ name, transition }: { name: string; transition: string }) {
	const [active, setActive] = React.useState(false);

	return (
		<div
			style={{
				border: "1px solid #e5e5e5",
				borderRadius: 8,
				padding: 16,
			}}
		>
			<div style={{ marginBottom: 8 }}>
				<strong>{name}</strong>
				<span style={{ marginLeft: 8, opacity: 0.7 }}>{transition}</span>
			</div>

			<div
				role="button"
				tabIndex={0}
				onClick={() => setActive((v) => !v)}
				onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActive((v) => !v); }}
				style={{
					width: active ? 160 : 120,
					height: 40,
					borderRadius: 6,
					background: active ? "#000" : "#e5e5e5",
					color: active ? "#fff" : "#000",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					cursor: "pointer",
					transition: `all ${transition}`,
				}}
			>
				클릭해 보세요
			</div>

			<p style={{ marginTop: 8, fontSize: 13, opacity: 0.75 }}>{motionDescription(name)}</p>
		</div>
	);
}

export const ComponentMapping: Story = {
	name: "컴포넌트별 모션 매핑",
	render: () => {
		const mappings = [
			{ component: "Button hover", token: "base", desc: "배경색·테두리 변화" },
			{ component: "Checkbox 체크", token: "fast", desc: "체크 아이콘 표시" },
			{ component: "Modal 등장", token: "slow", desc: "오버레이 + 패널 슬라이드" },
			{ component: "Toast 등장/퇴장", token: "fade", desc: "부드러운 페이드인/아웃" },
			{ component: "Select 드롭다운", token: "base", desc: "목록 열림/닫힘" },
			{ component: "Switch 토글", token: "bounce", desc: "thumb 이동 + 바운스" },
			{ component: "Card hover", token: "scale", desc: "살짝 확대 강조" },
		];

		return (
			<div style={{ background: "#fafafa", borderRadius: 12, padding: 24, maxWidth: 560 }}>
				<h3 style={{ margin: "0 0 16px", fontSize: 14 }}>어떤 컴포넌트에 어떤 모션 토큰을 쓰나요?</h3>
				<div style={{ display: "grid", gap: 8 }}>
					{mappings.map(({ component, token, desc }) => (
						<div key={component} style={{ display: "grid", gridTemplateColumns: "140px 80px 1fr", alignItems: "center", gap: 12, padding: 10, background: "#fff", borderRadius: 8, border: "1px solid rgba(0,0,0,0.06)", fontSize: 13 }}>
							<strong>{component}</strong>
							<code style={{ color: "#2563eb" }}>{token}</code>
							<span style={{ color: "#666" }}>{desc}</span>
						</div>
					))}
				</div>
			</div>
		);
	},
};

function motionDescription(key: string) {
	switch (key) {
		case "fast":
			return "아이콘 hover, 체크 상태 등 미세한 인터랙션";
		case "base":
			return "버튼, 메뉴, 입력창 등 기본 UI 반응";
		case "slow":
			return "모달, 패널, 드로어 등 시선 이동이 필요한 전환";
		case "emphasized":
			return "중요한 상태 변화 (Primary action, 강조 UI)";
		case "bounce":
			return "토글, 아코디언 등 피드백이 필요한 인터랙션";
		case "fade":
			return "툴팁, 도움말 등 부드러운 등장/퇴장";
		case "slide":
			return "리스트 이동, 패널 전환";
		case "scale":
			return "버튼 press, 카드 hover 강조";
		case "state":
			return "disabled → enabled 상태 전환";
		default:
			return "공통 인터랙션 전환";
	}
}
