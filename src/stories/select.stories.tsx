import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Select, type SelectOption } from "../ui/general/select";

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
- 카테고리 / 국가 / 언어 / 정렬 방식처럼 “하나만 선택”하는 경우

### 사용 방법(핵심)
- \`options\`: 선택지를 전달합니다.
- 선택 값이 필요하면 **제어형(Controlled)** 으로 \`value\` + \`onChange\`를 사용합니다.
- 간단히 쓰려면 \`defaultValue\`로 시작값만 주고 내부 상태에 맡길 수 있습니다.

### 키보드 사용(참고)
- ↑ / ↓ : 항목 이동
- Enter : 선택
- Esc : 닫기
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