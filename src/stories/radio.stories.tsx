import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Radio } from "../ui/form/radio";

const meta: Meta<typeof Radio> = {
    title: "Components/Form/Radio",
    component: Radio,
    tags: ["autodocs"],
    argTypes: {
        size: {
            control: "select",
            options: ["sm", "md", "lg"],
            description:
                "라디오 버튼의 크기입니다. 텍스트와 선택 원(circle)의 크기가 함께 변경됩니다.",
        },
        disabled: {
            control: "boolean",
            description:
                "비활성화 상태입니다. 선택할 수 없으며 흐리게 표시됩니다.",
        },
    },
    args: {
        size: "md",
        disabled: false,
    },
    parameters: {
        docs: {
            description: {
                component: `
**Radio**는 여러 선택지 중에서 **하나만 선택해야 할 때** 사용하는 입력 요소입니다.

### 언제 사용하나요?
- 배송 방법 선택 (일반 배송 / 빠른 배송)
- 결제 수단 선택 (카드 / 계좌이체 / 간편결제)
- 설문에서 “하나만 고르세요” 형태의 질문

### Checkbox와의 차이점
- **Radio**: 여러 개 중 **하나만 선택**
- **Checkbox**: 여러 개를 **동시에 선택 가능**

### 사용 방법 (중요)
- 같은 그룹으로 묶으려면 **\`name\` 값을 동일하게 설정**해야 합니다.
- 선택 상태는 \`checked\`와 \`onChange\`로 제어합니다.

### 디자이너 체크 포인트
- 선택됨 / 선택 안 됨 상태가 명확히 구분되는지
- 옵션 간 간격이 충분한지
- 비활성화 상태가 “선택 불가”로 인지되는지
        `,
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Group: Story = {
    name: "그룹 선택 예시",
    render: (args) => {
        const groupId = React.useId();
        const groupName = `radio_group_${groupId}`;
        const [value, setValue] = React.useState("b");

        return (
            <div style={{ display: "grid", gap: 8 }}>
                <Radio
                    {...args}
                    name={groupName}
                    value="a"
                    checked={value === "a"}
                    onChange={() => setValue("a")}
                    label="Option A"
                />
                <Radio
                    {...args}
                    name={groupName}
                    value="b"
                    checked={value === "b"}
                    onChange={() => setValue("b")}
                    label="Option B (기본 선택)"
                />
                <Radio
                    {...args}
                    name={groupName}
                    value="c"
                    checked={value === "c"}
                    onChange={() => setValue("c")}
                    label="Option C"
                />
            </div>
        );
    },
};

export const Disabled: Story = {
    name: "비활성화",
    render: (args) => {
        const groupId = React.useId();
        const groupName = `radio_disabled_${groupId}`;

        return (
            <div style={{ display: "grid", gap: 8 }}>
                <Radio
                    {...args}
                    name={groupName}
                    value="a"
                    disabled
                    label="Disabled A"
                />
                <Radio
                    {...args}
                    name={groupName}
                    value="b"
                    disabled
                    label="Disabled B"
                />
            </div>
        );
    },
};