import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
	title: "Guide/Installation",
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
### 설치 및 설정

프로젝트에 디자인 시스템을 설치하고 사용하는 방법입니다.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj;

export const React: Story = {
	name: "React / Next.js",
	render: () => (
		<div style={{ display: "grid", gap: 24, maxWidth: 640 }}>
			<CodeSection
				title="1. 설치"
				code="pnpm add @bigtablet/design-system"
			/>
			<CodeSection
				title="2. 스타일 import"
				code={`// app/layout.tsx 또는 최상위 파일
import "@bigtablet/design-system/style.css";`}
			/>
			<CodeSection
				title="3. 컴포넌트 사용"
				code={`import { Button, TextField } from "@bigtablet/design-system";

function MyPage() {
  return (
    <div>
      <TextField label="이름" placeholder="이름을 입력하세요" />
      <Button variant="filled" size="md">저장</Button>
    </div>
  );
}`}
			/>
			<CodeSection
				title="SCSS 토큰 사용 (선택)"
				description="컴포넌트 스타일을 커스텀할 때 디자인 토큰을 직접 사용할 수 있습니다."
				code={`@use "@bigtablet/design-system/scss/token" as token;

.my-card {
  padding: token.$spacing_16;
  border-radius: token.$radius_md;
}`}
			/>
		</div>
	),
};

export const Vanilla: Story = {
	name: "Vanilla (Thymeleaf, JSP, PHP)",
	render: () => (
		<div style={{ display: "grid", gap: 24, maxWidth: 640 }}>
			<CodeSection
				title="1. CDN 또는 파일 복사"
				description="dist/vanilla/ 폴더의 CSS와 JS를 프로젝트에 포함합니다."
				code={`<link rel="stylesheet" href="/assets/bigtablet.min.css">
<script src="/assets/bigtablet.min.js"><\/script>`}
			/>
			<CodeSection
				title="2. HTML에서 바로 사용"
				code={`<!-- 버튼 -->
<button class="bt-button bt-button--md bt-button--primary">
  저장
</button>

<!-- 텍스트 필드 -->
<div class="bt-text-field">
  <label class="bt-text-field__label">이름</label>
  <input type="text"
    class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--md"
    placeholder="이름을 입력하세요">
</div>`}
			/>
			<CodeSection
				title="3. JS 초기화 (자동)"
				description="data-bt-* 속성이 있는 요소는 DOMContentLoaded에 자동 초기화됩니다."
				code={`<!-- 자동 초기화 -->
<div class="bt-select" data-bt-select>...</div>
<div class="bt-modal" data-bt-modal>...</div>

<!-- 수동 초기화 -->
<script>
  const select = Bigtablet.Select('#my-select', {
    onChange: (value) => console.log(value)
  });
<\/script>`}
			/>
		</div>
	),
};

function CodeSection({
	title,
	description,
	code,
}: {
	title: string;
	description?: string;
	code: string;
}) {
	return (
		<section>
			<h4 style={{ margin: "0 0 4px", fontSize: 14 }}>{title}</h4>
			{description && (
				<p style={{ margin: "0 0 8px", fontSize: 13, opacity: 0.7, lineHeight: 1.5 }}>
					{description}
				</p>
			)}
			<pre
				style={{
					margin: 0,
					padding: 16,
					background: "#1a1a1a",
					color: "#e5e5e5",
					borderRadius: 8,
					fontSize: 13,
					lineHeight: 1.6,
					overflow: "auto",
				}}
			>
				<code>{code}</code>
			</pre>
		</section>
	);
}
