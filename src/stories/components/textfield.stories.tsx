import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { TextField } from "../../ui/form/textfield";
import { Search, Mail, Eye } from "lucide-react";

const meta: Meta<typeof TextField> = {
    title: "Components/Form/TextField",
    component: TextField,
    tags: ["autodocs"],
    argTypes: {
        variant: {
            control: "select",
            options: ["outline", "filled", "ghost"],
            description:
                "입력창의 스타일입니다. outline(기본), filled(배경 강조), ghost(최소 UI) 중 선택합니다.",
        },
        size: {
            control: "select",
            options: ["sm", "md", "lg"],
            description:
                "입력창 크기입니다. 높이/패딩/텍스트 크기가 함께 바뀝니다.",
        },
        label: {
            control: "text",
            description: "입력창 위에 표시되는 제목(라벨)입니다.",
        },
        helperText: {
            control: "text",
            description:
                "입력창 아래에 표시되는 안내 문구입니다. 오류/도움말을 여기로 보여줍니다.",
        },
        error: {
            control: "boolean",
            description:
                "오류 상태입니다. 입력이 잘못됐을 때 사용합니다(보통 helperText로 이유를 같이 안내).",
        },
        success: {
            control: "boolean",
            description:
                "성공 상태입니다. 입력이 유효함을 보여주고 싶을 때 사용합니다.",
        },
        disabled: {
            control: "boolean",
            description: "비활성화 상태입니다. 입력할 수 없습니다.",
        },
        fullWidth: {
            control: "boolean",
            description: "부모 너비에 맞춰 가로폭을 100%로 확장합니다.",
        },
        leftIcon: { table: { disable: true } },
        rightIcon: { table: { disable: true } },
        onChangeAction: { control: false },
    },
    args: {
        label: "Label",
        placeholder: "Type something...",
        variant: "outline",
        size: "md",
        disabled: false,
        fullWidth: false,
    },
    parameters: {
        docs: {
            description: {
                component: `
**TextField**는 사용자가 글자를 입력하는 기본 입력창입니다.

### 언제 사용하나요?
- 이메일/이름/검색어/코드 입력 등 대부분의 텍스트 입력

### variant(스타일) 선택 가이드
- **outline**: 가장 기본. 폼 입력에서 기본값으로 추천
- **filled**: 배경이 있는 입력창. 카드/섹션 안에서 입력창을 더 눈에 띄게 할 때
- **ghost**: 최소한의 UI. 검색/필터처럼 가볍게 쓰는 입력에 적합

### 상태 표시 가이드
- **error**: 입력이 잘못됐을 때(예: 이메일 형식 오류). helperText로 이유를 함께 안내하면 좋습니다.
- **success**: 입력이 유효할 때(예: 인증 코드 확인 완료) 같은 긍정 피드백에 사용합니다.

### 아이콘 사용
- **leftIcon**: 입력의 의미를 보조(검색/메일 등)
- **rightIcon**: 액션/상태(비밀번호 보기/숨기기, 입력 지우기 등)
        `,
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof TextField>;

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

export const Sizes: Story = {
    name: "크기 비교",
    render: (args) => (
        <div style={{ display: "grid", gap: 12, width: 360 }}>
            <TextField {...args} size="sm" placeholder="Small" />
            <TextField {...args} size="md" placeholder="Medium" />
            <TextField {...args} size="lg" placeholder="Large" />
        </div>
    ),
    args: { label: "Size demo", variant: "outline" },
};

export const WithIcons: Story = {
    name: "아이콘 포함",
    args: {
        label: "Search",
        placeholder: "Search…",
        leftIcon: <Search size={16} />,
        rightIcon: <Eye size={16} />,
    },
};

export const WithMailIcon: Story = {
    name: "이메일 입력 예시",
    args: {
        label: "Email",
        placeholder: "you@example.com",
        leftIcon: <Mail size={16} />,
    },
};

export const ErrorAndHelper: Story = {
    name: "오류 상태",
    args: {
        label: "Email",
        placeholder: "name@example.com",
        helperText: "이메일 형식이 올바르지 않습니다.",
        error: true,
    },
};

export const Success: Story = {
    name: "성공 상태",
    args: {
        label: "Code",
        placeholder: "Looks good!",
        helperText: "사용 가능한 값입니다.",
        success: true,
    },
};