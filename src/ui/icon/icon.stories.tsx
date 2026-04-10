import type { Meta, StoryObj } from "@storybook/react";
import { Icon } from ".";
import { ICON_DATA, type IconName } from "./icon-data";

const allIconNames = Object.keys(ICON_DATA) as IconName[];

const meta: Meta<typeof Icon> = {
  title: "Components/Icon",
  component: Icon,
  tags: ["autodocs"],
  argTypes: {
    name: {
      control: "select",
      options: allIconNames,
      description: "아이콘 이름",
    },
    size: {
      control: "radio",
      options: [20, 24],
      description: "아이콘 크기 (px)",
    },
    weight: {
      control: "radio",
      options: [300, 400],
      description: "선 굵기",
    },
    fill: {
      control: "boolean",
      description: "채움 스타일 여부",
    },
  },
  args: {
    name: "search",
    size: 24,
    weight: 400,
    fill: false,
  },
  parameters: {
    docs: {
      description: {
        component: `
**Icon**은 Material Symbols 기반의 인라인 SVG 아이콘 컴포넌트입니다.

### 특징
- 폰트/CDN 의존 없는 인라인 SVG — 오프라인, SSR 완전 지원
- 트리쉐이킹 지원 (사용한 아이콘만 번들에 포함)
- \`currentColor\` 상속 — 부모의 \`color\` CSS로 색상 제어 가능

### 사용법
\`\`\`tsx
import { Icon } from "@bigtablet/design-system";

<Icon name="search" />
<Icon name="settings" size={20} weight={300} fill />
\`\`\`

### Props
| Prop | Type | Default | 설명 |
|------|------|---------|------|
| **name** | IconName | — | 아이콘 이름 (필수) |
| **size** | 20 \\| 24 | 24 | 아이콘 크기 (px) |
| **weight** | 300 \\| 400 | 400 | 선 굵기 |
| **fill** | boolean | false | 채움 스타일 |

> 색상은 \`color\` CSS 속성으로 제어합니다. (\`currentColor\` 상속)
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Basic: Story = {
  name: "기본",
};

export const Variants: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  name: "변형 비교 (weight × fill)",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {(["search", "settings", "edit", "person", "check_circle"] as IconName[]).map((name) => (
        <div key={name} style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <span style={{ width: 140, fontSize: 12, color: "#666", fontFamily: "monospace" }}>{name}</span>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <Icon name={name} weight={300} fill={false} />
              <span style={{ fontSize: 10, color: "#999" }}>300 / no-fill</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <Icon name={name} weight={300} fill />
              <span style={{ fontSize: 10, color: "#999" }}>300 / fill</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <Icon name={name} weight={400} fill={false} />
              <span style={{ fontSize: 10, color: "#999" }}>400 / no-fill</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <Icon name={name} weight={400} fill />
              <span style={{ fontSize: 10, color: "#999" }}>400 / fill</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  name: "크기 비교",
  render: () => (
    <div style={{ display: "flex", gap: 32, alignItems: "flex-end" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <Icon name="search" size={20} />
        <span style={{ fontSize: 11, color: "#666" }}>20px</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <Icon name="search" size={24} />
        <span style={{ fontSize: 11, color: "#666" }}>24px</span>
      </div>
    </div>
  ),
};

export const Colors: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  name: "색상 (currentColor 상속)",
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      {(["#1a1a1a", "#6366f1", "#ef4444", "#10b981", "#f59e0b"] as const).map((color) => (
        <Icon key={color} name="check_circle" size={24} fill style={{ color }} />
      ))}
    </div>
  ),
};

export const AllIcons: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  name: "전체 아이콘 목록",
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      {allIconNames.map((name) => (
        <div
          key={name}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            width: 80,
          }}
        >
          <Icon name={name} size={24} />
          <span style={{ fontSize: 10, color: "#666", textAlign: "center", wordBreak: "break-all" }}>
            {name}
          </span>
        </div>
      ))}
    </div>
  ),
};
