import type { Meta, StoryObj } from "@storybook/react";
import {
	Award,
	Bell,
	Building2,
	Calendar,
	Check,
	ChevronDown,
	Heart,
	Home,
	Mail,
	Menu,
	MoreVertical,
	Package,
	Plus,
	Search,
	Settings,
	ShoppingCart,
	Star,
	Trash2,
	User,
	X,
} from "lucide-react";
import { Icon } from ".";

const meta: Meta<typeof Icon> = {
	title: "Components/Icon",
	component: Icon,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
**Icon** — lucide-react 아이콘 wrapper.

lucide-react는 1000+ 아이콘을 제공하는 오픈소스 SVG 아이콘 라이브러리. 일관된 line weight, 깔끔한 stroke, tree-shakable.

전체 카탈로그: [lucide.dev/icons](https://lucide.dev/icons/)

### 사용

\`\`\`tsx
import { Icon } from "@bigtablet/design-system";
import { Search, X } from "lucide-react";

<Icon icon={Search} size={20} />
<Icon icon={X} size={16} strokeWidth={2.5} aria-label="닫기" />
\`\`\`

### Props
모든 props는 lucide-react로 forward. \`aria-label\` 없으면 \`aria-hidden=true\` 자동 적용.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {
	name: "기본",
	args: { icon: Search },
};

export const Sizes: Story = {
	name: "크기 비교",
	render: () => (
		<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
			{[16, 20, 24, 32, 40].map((size) => (
				<div
					key={size}
					style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
				>
					<Icon icon={Search} size={size} />
					<code style={{ fontSize: 11, color: "#888" }}>{size}px</code>
				</div>
			))}
		</div>
	),
};

export const StrokeWidths: Story = {
	name: "Stroke 굵기",
	render: () => (
		<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
			{[1, 1.5, 2, 2.5, 3].map((sw) => (
				<div
					key={sw}
					style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
				>
					<Icon icon={Settings} size={32} strokeWidth={sw} />
					<code style={{ fontSize: 11, color: "#888" }}>{sw}</code>
				</div>
			))}
		</div>
	),
};

export const Colors: Story = {
	name: "색상 (currentColor 상속)",
	render: () => (
		<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
			{["#121212", "#47555E", "#7AA5D2", "#EF4444", "#10B981"].map((c) => (
				<div key={c} style={{ color: c }}>
					<Icon icon={Heart} size={32} />
				</div>
			))}
		</div>
	),
};

const COMMON_ICONS = [
	{ icon: Search, label: "Search" },
	{ icon: X, label: "X" },
	{ icon: Check, label: "Check" },
	{ icon: ChevronDown, label: "ChevronDown" },
	{ icon: Plus, label: "Plus" },
	{ icon: Menu, label: "Menu" },
	{ icon: MoreVertical, label: "MoreVertical" },
	{ icon: Trash2, label: "Trash2" },
	{ icon: Home, label: "Home" },
	{ icon: Settings, label: "Settings" },
	{ icon: User, label: "User" },
	{ icon: Bell, label: "Bell" },
	{ icon: Mail, label: "Mail" },
	{ icon: Heart, label: "Heart" },
	{ icon: Star, label: "Star" },
	{ icon: Calendar, label: "Calendar" },
	{ icon: ShoppingCart, label: "ShoppingCart" },
	{ icon: Package, label: "Package" },
	{ icon: Building2, label: "Building2" },
	{ icon: Award, label: "Award" },
];

export const CommonIconCatalog: Story = {
	name: "자주 쓰는 아이콘",
	render: () => (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
				gap: 12,
			}}
		>
			{COMMON_ICONS.map(({ icon, label }) => (
				<div
					key={label}
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						gap: 8,
						padding: 16,
						border: "1px solid var(--bt-color-border-default)",
						borderRadius: 8,
						background: "var(--bt-color-bg-solid)",
					}}
				>
					<Icon icon={icon} size={24} />
					<code style={{ fontSize: 11, color: "var(--bt-color-text-body)" }}>{label}</code>
				</div>
			))}
		</div>
	),
};

export const WithAriaLabel: Story = {
	name: "Aria label (스크린리더용)",
	render: () => (
		<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
			<button
				type="button"
				style={{
					padding: 8,
					border: "1px solid var(--bt-color-border-default)",
					borderRadius: 8,
					background: "var(--bt-color-bg-solid)",
					cursor: "pointer",
					color: "var(--bt-color-text-heading)",
				}}
			>
				<Icon icon={Trash2} size={20} aria-label="삭제" />
			</button>
			<span style={{ fontSize: 13, color: "var(--bt-color-text-body)" }}>
				aria-label 지정 시 스크린리더가 "삭제"로 읽음
			</span>
		</div>
	),
};
