import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Checkbox } from "../ui/form/checkbox";

const meta: Meta<typeof Checkbox> = {
    title: "Components/Form/Checkbox",
    component: Checkbox,
    tags: ["autodocs"],
    argTypes: {
        label: {
            control: "text",
            description: "체크박스 오른쪽에 표시되는 텍스트(라벨)입니다.",
        },
        size: {
            control: "select",
            options: ["sm", "md", "lg"],
            description: "체크박스 크기입니다. 보통 md를 기본으로 사용합니다.",
        },
        disabled: {
            control: "boolean",
            description: "비활성화 상태입니다. 선택할 수 없고 스타일이 흐려집니다.",
        },
        indeterminate: {
            control: "boolean",
            description:
                "중간 상태(일부 선택됨)를 표시합니다. 예: ‘전체 선택’에서 일부만 체크된 경우.",
        },
        checked: { control: false },
        defaultChecked: { control: false },
        onChange: { control: false },
    },
    args: {
        label: "동의합니다",
        size: "md",
        disabled: false,
        indeterminate: false,
    },
    parameters: {
        docs: {
            description: {
                component: `
**Checkbox**는 사용자가 선택/해제를 할 수 있는 입력 요소입니다.

### 언제 쓰나요?
- 약관 동의, 옵션 선택, 필터 등 “여러 개 중 일부 선택” UI

### indeterminate(중간 상태)는 언제 쓰나요?
- “전체 선택” 체크박스가 있고, 하위 항목이 일부만 선택된 경우
  - 전체 선택: ✅ (모두 선택)
  - 전체 선택: ▬ (일부 선택 = indeterminate)
  - 전체 선택: ⬜ (아무것도 선택 안 함)

### 디자이너 체크 포인트
- 라벨과 체크박스 간격(가독성)
- disabled 대비(읽을 수는 있어야 함)
- 체크 표시가 다양한 해상도에서 깨지지 않는지
        `,
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Basic: Story = {
    name: "기본",
};

export const Disabled: Story = {
    name: "비활성화",
    args: { disabled: true },
};

export const Indeterminate: Story = {
    name: "중간 상태",
    args: { indeterminate: true },
};

export const Sizes: Story = {
    name: "크기 비교",
    render: (args) => (
        <div style={{ display: "grid", gap: 8 }}>
            <Checkbox {...args} size="sm" label="Small" />
            <Checkbox {...args} size="md" label="Medium" />
            <Checkbox {...args} size="lg" label="Large" />
        </div>
    ),
};

export const AllSelectExample: Story = {
    name: "전체 선택 예시",
    render: () => {
        const [items, setItems] = React.useState([true, false, false]);

        const checkedCount = items.filter(Boolean).length;
        const isAllChecked = checkedCount === items.length;
        const isIndeterminate = checkedCount > 0 && !isAllChecked;

        const toggleAll = (next: boolean) => setItems(items.map(() => next));
        const toggleOne = (index: number, next: boolean) =>
            setItems(items.map((v, i) => (i === index ? next : v)));

        return (
            <div style={{ display: "grid", gap: 10 }}>
                <Checkbox
                    label="전체 선택"
                    checked={isAllChecked}
                    indeterminate={isIndeterminate}
                    onChange={(e) => toggleAll(e.target.checked)}
                />

                <div style={{ paddingLeft: 24, display: "grid", gap: 8 }}>
                    {items.map((v, i) => (
                        <Checkbox
                            key={i}
                            label={`항목 ${i + 1}`}
                            checked={v}
                            onChange={(e) => toggleOne(i, e.target.checked)}
                        />
                    ))}
                </div>
            </div>
        );
    },
};