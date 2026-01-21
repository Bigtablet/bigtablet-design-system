import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Select, type SelectOption } from "../../ui/general/select";

const options: SelectOption[] = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "cherry", label: "Cherry" },
    { value: "disabled", label: "Disabled option", disabled: true },
];

const meta: Meta<typeof Select> = {
    title: "Components/General/Select",
    component: Select,
    tags: ["autodocs"],
    argTypes: {
        variant: {
            control: "select",
            options: ["outline", "filled", "ghost"],
            description: "겉모양 스타일입니다. 화면 톤에 맞춰 선택합니다.",
        },
        size: {
            control: "select",
            options: ["sm", "md", "lg"],
            description: "크기입니다. 높이/패딩/텍스트 크기가 함께 바뀝니다.",
        },
        disabled: {
            control: "boolean",
            description: "비활성화 상태입니다. 열거나 선택할 수 없습니다.",
        },
        fullWidth: {
            control: "boolean",
            description: "부모 너비에 맞춰 100%로 확장합니다.",
        },
        options: { table: { disable: true } },
        onChange: { control: false },
        value: { control: false },
        defaultValue: { control: false },
    },
    args: {
        label: "Fruit",
        options,
        placeholder: "Choose a fruit",
        variant: "outline",
        size: "md",
        disabled: false,
        fullWidth: false,
    },
    parameters: {
        docs: {
            description: {
                component: `
**Select**는 여러 항목 중 **하나를 고르는 드롭다운**입니다.

### 언제 사용하나요?
- 카테고리 / 국가 / 언어 / 정렬 방식처럼 "하나만 선택"하는 경우
- 선택지가 3개 이상일 때 (2개 이하면 Radio 고려)

### Radio와의 차이
| Select | Radio |
|--------|-------|
| 선택지가 많을 때 | 선택지가 2–4개일 때 |
| 공간을 절약해야 할 때 | 모든 옵션을 한눈에 보여줘야 할 때 |
| 드롭다운으로 숨겨도 괜찮을 때 | 옵션 비교가 중요할 때 |

### 사용 방법
- \`options\`: 선택지를 전달합니다.
- **제어형**: \`value\` + \`onChange\`로 상태 관리
- **비제어형**: \`defaultValue\`로 초기값만 설정

### 키보드 접근성
| 키 | 동작 |
|----|------|
| ↑ / ↓ | 항목 이동 |
| Enter / Space | 선택 / 열기 |
| Esc | 닫기 |
| Home / End | 첫/마지막 항목 |

### 디자이너 체크 포인트
- placeholder가 "선택해주세요" 같은 안내 문구인지
- disabled 옵션이 시각적으로 구분되는지
- 드롭다운 최대 높이(max-height)가 적절한지
- 긴 텍스트 옵션이 말줄임(...)으로 처리되는지
- 선택된 항목에 체크 아이콘 등 시각적 표시가 있는지
        `,
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Outline: Story = {
    name: "기본",
};

export const Filled: Story = {
    name: "filled",
    args: { variant: "filled" },
};

export const Ghost: Story = {
    name: "ghost",
    args: { variant: "ghost" },
};

export const Disabled: Story = {
    name: "비활성화",
    args: { disabled: true },
};

export const Sizes: Story = {
    name: "크기 비교",
    render: (args) => (
        <div style={{ display: "grid", gap: 12, width: 320 }}>
            <Select {...args} size="sm" />
            <Select {...args} size="md" />
            <Select {...args} size="lg" />
        </div>
    ),
};

export const Controlled: Story = {
    name: "제어형",
    render: (args) => {
        const [value, setValue] = React.useState<string | null>("banana");

        return (
            <div style={{ width: 320 }}>
                <Select {...args} value={value} onChange={setValue} />
                <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                    현재 선택 값: {String(value)}
                </div>
            </div>
        );
    },
};