import type { Meta, StoryObj } from "@storybook/react";
import { Prose } from ".";

const meta: Meta<typeof Prose> = {
	title: "Components/Display/Prose",
	component: Prose,
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component: `
**Prose** - 마크다운 등으로 렌더된 본문에 조판을 입힌다. **파서를 포함하지 않는다** — 앱이 \`react-markdown\` 등으로 만든 결과를 감싸면 자손 셀렉터로 토큰 기반 타이포·간격·색이 적용된다(다크 모드 자동).

\`size\`: \`md\` (기본, 공지·FAQ·이메일 프리뷰처럼 좁은 폭) / \`lg\` (약관·정책처럼 페이지를 채우는 긴 본문).

표와 코드 블록은 자기 안에서 가로 스크롤되어 페이지를 밀지 않는다.
				`,
			},
		},
	},
	argTypes: {
		size: { control: "radio", options: ["md", "lg"], description: "본문 스케일" },
	},
};

export default meta;
type Story = StoryObj<typeof Prose>;

const Body = () => (
	<>
		<h1>이용약관</h1>
		<p>
			본 약관은 서비스 이용에 관한 조건을 정합니다. 인라인 <code>code</code> 와{" "}
			<a href="#anchor">링크</a>, <strong>강조</strong>, <em>기울임</em>, <del>취소선</del> 을
			포함합니다.
		</p>
		<h2>제1조 (목적)</h2>
		<p>이 절은 목적을 설명합니다.</p>
		<ul>
			<li>
				첫 항목
				<ul>
					<li>중첩 항목</li>
				</ul>
			</li>
			<li>둘째 항목</li>
		</ul>
		<h3>제1항</h3>
		<blockquote>
			<p>인용문입니다.</p>
			<blockquote>
				<p>중첩 인용은 테두리를 겹치지 않습니다.</p>
			</blockquote>
		</blockquote>
		<pre>
			<code>{`const veryLongLine = "코드 블록은 페이지를 밀지 않고 자기 안에서 가로 스크롤됩니다 ----------------";`}</code>
		</pre>
		<h4>표</h4>
		<table>
			<thead>
				<tr>
					<th>항목</th>
					<th>설명</th>
					<th>비고가 아주 긴 열 제목입니다</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>A</td>
					<td>내용</td>
					<td>넓은 표도 자기 안에서 스크롤됩니다</td>
				</tr>
			</tbody>
		</table>
		<hr />
		<p>마지막 문단.</p>
	</>
);

export const Medium: Story = {
	name: "md (공지·FAQ)",
	args: { size: "md" },
	render: (args) => (
		<Prose {...args}>
			<Body />
		</Prose>
	),
};

export const Large: Story = {
	name: "lg (약관·정책)",
	args: { size: "lg" },
	render: (args) => (
		<Prose {...args}>
			<Body />
		</Prose>
	),
};

export const NarrowContainer: Story = {
	name: "좁은 컨테이너 (오버플로 확인)",
	parameters: {
		docs: {
			description: {
				story: "320px 폭에서도 표와 코드 블록이 컨테이너를 밀지 않고 각자 가로 스크롤됩니다.",
			},
		},
	},
	render: () => (
		<div style={{ width: 320, border: "1px dashed var(--bt-color-border-default)" }}>
			<Prose>
				<Body />
			</Prose>
		</div>
	),
};
