import type {Meta, StoryObj} from "@storybook/react";
import * as React from "react";
import {DatePicker} from "../../ui/form/date-picker";

type DateFieldDemoProps = {
    mode?: "year-month" | "year-month-day";
    startYear?: number;
    endYear?: number;
    disabled?: boolean;
    defaultValue?: string; // YYYY-MM-DD
};

const DateFieldDemo = ({
                           mode = "year-month-day",
                           startYear = 1950,
                           endYear = new Date().getFullYear() + 10,
                           disabled = false,
                           defaultValue = "2026-01-06",
                       }: DateFieldDemoProps) => {
    const [value, setValue] = React.useState<string>(defaultValue);

    React.useEffect(() => {
        setValue(defaultValue);
    }, [defaultValue]);

    return (
        <div style={{padding: 20, display: "grid", gap: 12, maxWidth: 520}}>
            <DatePicker
                value={value}
                onChange={setValue}
                mode={mode}
                startYear={startYear}
                endYear={endYear}
                disabled={disabled}
            />

            <div
                style={{
                    padding: 12,
                    border: "1px solid #e5e5e5",
                    borderRadius: 8,
                    background: "#fafafa",
                    fontSize: 13,
                    display: "grid",
                    gap: 6,
                }}
            >
                <div style={{fontWeight: 700}}>현재 value (항상 YYYY-MM-DD)</div>
                <code style={{fontSize: 13}}>{value}</code>
                <div style={{opacity: 0.8, lineHeight: 1.5}}>
                    <div>
                        - mode가 <b>year-month</b> 인 경우, 선택 결과는 <b>YYYY-MM-01</b> 로
                        정규화됩니다.
                    </div>
                    <div>
                        - mode가 <b>year-month-day</b> 인 경우, 선택 결과는 <b>YYYY-MM-DD</b>{" "}
                        입니다.
                    </div>
                </div>
            </div>
        </div>
    );
};

const meta: Meta<typeof DateFieldDemo> = {
    title: "Components/Form/DatePicker",
    component: DateFieldDemo,
    tags: ["autodocs"],
    argTypes: {
        mode: {
            control: "select",
            options: ["year-month", "year-month-day"],
            description:
                "입력 모드입니다. year-month는 연/월까지만 선택하며 결과는 YYYY-MM-01로 정규화됩니다.",
        },
        startYear: {
            control: "number",
            description:
                "연도 셀렉트의 시작 연도입니다. (예: 1950)",
        },
        endYear: {
            control: "number",
            description:
                "연도 셀렉트의 마지막 연도입니다. (예: 현재연도+10)",
        },
        disabled: {
            control: "boolean",
            description:
                "비활성화 상태입니다. 전체 선택 요소가 disabled 됩니다.",
        },
        defaultValue: {
            control: "text",
            description:
                "초기 값입니다. 항상 YYYY-MM-DD 형식으로 입력합니다. (mode=year-month여도 YYYY-MM-DD로 입력)",
        },
    },
    args: {
        mode: "year-month-day",
        startYear: 1950,
        endYear: new Date().getFullYear() + 10,
        disabled: false,
        defaultValue: "2026-01-06",
    },
    parameters: {
        docs: {
            description: {
                component: `
**DatePicker**는 날짜를 \`select\` 조합으로 입력받는 컴포넌트입니다.  
달력(DatePicker)을 구현하지 않고도 생년월일, 계약일, 만료일처럼 “정확한 날짜 입력”을 안정적으로 처리하기 위해 사용합니다.

### 출력 규칙 (중요)
- \`onChange\`는 항상 **string**을 반환하며 형식은 **YYYY-MM-DD** 입니다.
- \`mode="year-month"\`(연/월)인 경우에도 **YYYY-MM-01**로 **정규화(normalize)** 해서 반환합니다.
  - 예: 2026년 1월 선택 → \`2026-01-01\`

### 언제 쓰나요?
- 생년월일, 입사일, 계약일, 증명서 발급일, 만료일 등
- 달력 UI가 필요 없거나(또는 오히려 불필요한) 폼 중심 화면

### 동작 디테일
- 연도를 선택해야 월 선택이 활성화됩니다.
- (mode=year-month-day) 월을 선택해야 일 선택이 활성화됩니다.
- 연/월 변경 시 “현재 일(day)”이 유효하지 않으면(예: 31일 → 2월) 컴포넌트 내부 로직에 따라 유효 값으로 보정될 수 있습니다.
  - 이 동작은 제품 UX 정책에 따라 추후 조정 가능합니다.

### 디자이너 체크 포인트
- 3개 셀렉트의 간격/정렬(한 줄 유지, 반응형)
- disabled 상태 대비(가독성 유지)
- 긴 연도 범위에서도 스크롤/선택이 부담스럽지 않은지
        `,
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof DateFieldDemo>;

export const YearMonthDay: Story = {
    name: "연/월/일 (기본)",
    args: {
        mode: "year-month-day",
        defaultValue: "2026-01-06",
    },
};

export const YearMonth: Story = {
    name: "연/월 (YYYY-MM-01로 정규화)",
    args: {
        mode: "year-month",
        defaultValue: "2026-01-06",
    },
};

export const Disabled: Story = {
    name: "비활성화",
    args: {
        disabled: true,
        defaultValue: "2026-01-06",
    },
};

export const YearRangeExample: Story = {
    name: "연도 범위 커스텀 (2000~2035)",
    args: {
        startYear: 2000,
        endYear: 2035,
        defaultValue: "2026-01-06",
    },
};

export const InvalidDayAutoAdjustExample: Story = {
    name: "일자 자동 보정 예시 (31일 → 2월)",
    render: () => {
        const [value, setValue] = React.useState<string>("2026-01-31");

        return (
            <div style={{padding: 20, display: "grid", gap: 12, maxWidth: 520}}>
                <DatePicker
                    value={value}
                    onChange={setValue}
                    mode="year-month-day"
                    startYear={1950}
                    endYear={new Date().getFullYear() + 10}
                />

                <div style={{display: "grid", gap: 6, fontSize: 13}}>
                    <div style={{fontWeight: 700}}>시나리오</div>
                    <div style={{lineHeight: 1.6, opacity: 0.85}}>
                        - 시작값이 <code>2026-01-31</code> 입니다.<br/>
                        - 월을 2월로 바꾸면 2월에는 31일이 없기 때문에, 일(day)이 유효한 값으로 보정될 수 있습니다.<br/>
                        - 실제 보정 정책은 제품 UX에 맞춰 조정 가능합니다.
                    </div>

                    <div
                        style={{
                            padding: 12,
                            border: "1px solid #e5e5e5",
                            borderRadius: 8,
                            background: "#fafafa",
                        }}
                    >
                        <div style={{fontWeight: 700, marginBottom: 6}}>현재 value</div>
                        <code>{value}</code>
                    </div>
                </div>
            </div>
        );
    },
};