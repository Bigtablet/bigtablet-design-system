import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Field } from "../field";
import { Combobox, type ComboboxOption } from ".";

const PEOPLE: ComboboxOption[] = [
	{ value: "1", label: "박상민" },
	{ value: "2", label: "김민준" },
	{ value: "3", label: "이서연" },
	{ value: "4", label: "박지훈" },
	{ value: "5", label: "최유진" },
	{ value: "6", label: "정하늘" },
	{ value: "7", label: "한도윤" },
	{ value: "8", label: "오채원" },
];

/** 네트워크 흉내 - 실제 소비자는 여기서 API 를 부른다. */
const searchPeople = (query: string, delay = 400) =>
	new Promise<ComboboxOption[]>((resolve) => {
		setTimeout(() => resolve(PEOPLE.filter((p) => p.label.includes(query))), delay);
	});

/**
 * 순서가 뒤집히는 네트워크. 짧은 검색어일수록 느리게 답하므로, 한 글자 치고 이어서 두 글자를
 * 치면 **먼저 보낸 요청이 나중에 도착한다** - 고정 지연으로는 이 경합이 재현되지 않는다.
 */
const searchPeopleOutOfOrder = (query: string) =>
	searchPeople(query, Math.max(400, 2400 - query.length * 800));

const meta: Meta<typeof Combobox> = {
	title: "Components/Forms/Combobox",
	component: Combobox,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
**Combobox** - 후보를 서버에서 가져오는 선택 입력 (APG Combobox).

\`Dropdown\` 도 \`searchable\` 로 타이핑 검색을 지원하지만 **이미 받아 둔 옵션 배열 안에서만**
거른다. 담당자·회사·상품처럼 후보가 수백 개인 필드는 그 목록을 통째로 내려받을 수 없다.

팝업의 거동(개폐·활성 항목·키보드·바깥 클릭)은 \`useListboxPopup\` 을 \`Dropdown\` 과 공유한다.
여기 있는 것은 **비동기 네 가지**뿐이다 - 디바운스, 로딩 표시, 응답 경합 차단,
"아직 검색 안 함" 과 "결과 없음" 의 구분.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Combobox>;

export const Basic: Story = {
	name: "기본 (비동기 검색)",
	parameters: {
		docs: {
			description: {
				story:
					"입력하면 250ms 뒤에 한 번만 조회한다. 조회 중에는 스피너가 돌고, 검색 전과 결과 없음은 다른 문구로 구분한다. '박' 을 쳐보라.",
			},
		},
	},
	render: () => {
		const [value, setValue] = useState<ComboboxOption | null>(null);
		return (
			<div style={{ width: 320 }}>
				<Combobox
					fullWidth
					ariaLabel="담당자"
					value={value}
					onValueChange={setValue}
					onSearch={(q) => searchPeople(q)}
					placeholder="담당자 검색"
					emptyMessage="일치하는 담당자가 없습니다"
				/>
			</div>
		);
	},
};

export const WithField: Story = {
	name: "Field 안에서",
	parameters: {
		docs: {
			description: {
				story:
					"`Field` 가 라벨·도움말·에러를 소유하고, 입력은 `aria-labelledby`·`aria-describedby` 를 그쪽에서 받는다.",
			},
		},
	},
	render: () => {
		const [value, setValue] = useState<ComboboxOption | null>(null);
		return (
			<div style={{ width: 320 }}>
				<Field name="owner" label="담당자" required help="이름으로 검색합니다">
					<Combobox
						fullWidth
						value={value}
						onValueChange={setValue}
						onSearch={(q) => searchPeople(q)}
					/>
				</Field>
			</div>
		);
	},
};

export const WithDefaultOptions: Story = {
	name: "초기 후보 제공",
	parameters: {
		docs: {
			description: {
				story:
					"`defaultOptions` 를 주면 검색어 없이도 최근 항목 등을 먼저 보여준다. 검색어를 지우면 다시 이 목록으로 돌아온다.",
			},
		},
	},
	render: () => {
		const [value, setValue] = useState<ComboboxOption | null>(null);
		return (
			<div style={{ width: 320 }}>
				<Combobox
					fullWidth
					ariaLabel="담당자"
					value={value}
					onValueChange={setValue}
					onSearch={(q) => searchPeople(q)}
					defaultOptions={PEOPLE.slice(0, 3)}
					placeholder="최근 담당자에서 고르거나 검색"
				/>
			</div>
		);
	},
};

export const SlowNetwork: Story = {
	name: "느린 네트워크 (로딩 · 경합)",
	parameters: {
		docs: {
			description: {
				story:
					"짧은 검색어일수록 응답이 느리다. '박' 을 치고 디바운스가 지난 뒤 '상' 을 이어 치면 첫 요청이 두 번째보다 늦게 도착하는데, 그 결과는 버려지고 최신 검색어의 후보만 남는다.",
			},
		},
	},
	render: () => {
		const [value, setValue] = useState<ComboboxOption | null>(null);
		return (
			<div style={{ width: 320 }}>
				<Combobox
					fullWidth
					ariaLabel="담당자"
					value={value}
					onValueChange={setValue}
					onSearch={searchPeopleOutOfOrder}
				/>
			</div>
		);
	},
};

export const Disabled: Story = {
	name: "비활성",
	render: () => (
		<div style={{ width: 320 }}>
			<Combobox fullWidth disabled ariaLabel="담당자" onSearch={async () => []} />
		</div>
	),
};
