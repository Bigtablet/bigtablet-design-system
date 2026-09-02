import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Table } from "../../display/table";
import { Combobox } from "../../forms/combobox";
import { Button } from "../../general/button";
import { Pagination } from "../../navigation/pagination";
import { type LocaleName, LocaleProvider } from ".";

const meta: Meta<typeof LocaleProvider> = {
	title: "Components/System/LocaleProvider",
	component: LocaleProvider,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
**LocaleProvider** - DS 가 스스로 렌더하는 문구를 한곳에서 정한다.

DS 안에는 소비자가 넘기지 않은 문구가 **58개** 있다 — \`Modal\` 의 닫기 버튼, \`Table\` 의 빈 목록,
\`Pagination\` 의 이전/다음, \`TagInput\` 의 라이브 영역 안내 등. 지금까지 이걸 바꾸려면
**인스턴스마다** prop 을 넘겨야 했다. \`Modal\` 을 40번 쓰는 앱이면 \`closeLabel\` 을 40번 적고,
하나라도 빠지면 그 화면만 한국어로 남는다.

- Provider 가 없으면 한국어 카탈로그가 그대로다 — 기존 화면은 바뀌지 않는다
- \`locale="en"\` 으로 전체 교체
- \`messages\` 로 한 줄만 덮어쓰기 (기준 카탈로그 위에 병합)
- 인스턴스 prop 은 **항상** 카탈로그보다 우선한다
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof LocaleProvider>;

const COLUMNS = [
	{ key: "name", header: "이름" },
	{ key: "role", header: "역할" },
];

/** 카탈로그가 실제로 닿는 자리들을 한 화면에 모아 둔다. */
const Surface = () => {
	const [page, setPage] = useState(1);
	return (
		<div style={{ display: "grid", gap: 16, width: 420 }}>
			<Table columns={COLUMNS} data={[]} keyExtractor={(_, i) => i} />
			<Combobox fullWidth ariaLabel="담당자" onSearch={async () => []} />
			<Pagination page={page} totalPages={3} onPageChange={setPage} />
		</div>
	);
};

export const Korean: Story = {
	name: "기본 (한국어)",
	parameters: {
		docs: {
			description: { story: "Provider 없이 그대로 쓰면 한국어 카탈로그다." },
		},
	},
	render: () => <Surface />,
};

export const English: Story = {
	name: "영어로 전환",
	parameters: {
		docs: {
			description: {
				story: '`locale="en"` 하나로 표의 빈 목록·검색 입력·페이지 이동 문구가 함께 바뀐다.',
			},
		},
	},
	render: () => (
		<LocaleProvider locale="en">
			<Surface />
		</LocaleProvider>
	),
};

export const OneLineOverride: Story = {
	name: "한 줄만 바꾸기",
	parameters: {
		docs: {
			description: {
				story:
					"`messages` 는 기준 카탈로그 **위에** 병합된다. 여기서는 표의 빈 목록 문구만 바꾸고 나머지는 한국어 그대로다.",
			},
		},
	},
	render: () => (
		<LocaleProvider messages={{ "table.empty": "등록된 담당자가 없습니다" }}>
			<Surface />
		</LocaleProvider>
	),
};

export const Switchable: Story = {
	name: "런타임 전환",
	parameters: {
		docs: {
			description: {
				story: "언어 전환은 Provider 의 `locale` 을 바꾸는 것으로 끝난다 - 컴포넌트는 그대로다.",
			},
		},
	},
	render: () => {
		const [locale, setLocale] = useState<LocaleName>("ko");
		return (
			<div style={{ display: "grid", gap: 16 }}>
				<div style={{ display: "flex", gap: 8 }}>
					<Button
						size="sm"
						variant={locale === "ko" ? "filled" : "outline"}
						onClick={() => setLocale("ko")}
					>
						한국어
					</Button>
					<Button
						size="sm"
						variant={locale === "en" ? "filled" : "outline"}
						onClick={() => setLocale("en")}
					>
						English
					</Button>
				</div>
				<LocaleProvider locale={locale}>
					<Surface />
				</LocaleProvider>
			</div>
		);
	},
};
