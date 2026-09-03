# Contributing

Bigtablet Design System에 기여해 주셔서 감사합니다!

---

## 목차

- [개발 환경 설정](#개발-환경-설정)
- [개발 워크플로우](#개발-워크플로우)
- [코드 컨벤션](#코드-컨벤션)
- [커밋 컨벤션](#커밋-컨벤션)
- [브랜치 전략](#브랜치-전략)
- [Pull Request](#pull-request)

---

## 개발 환경 설정

### 요구사항

- Node.js 18+
- pnpm 10.20.0+ (필수)

### 설치

```bash
# 저장소 클론
git clone https://github.com/Bigtablet/bigtablet-design-system.git
cd bigtablet-design-system

# 의존성 설치
pnpm install

# Storybook 실행
pnpm storybook

# 테스트 실행
pnpm test

# 빌드
pnpm build
```

### 사용 가능한 스크립트

| 스크립트 | 설명 |
|----------|------|
| `pnpm storybook` | Storybook 개발 서버 (port 6006) |
| `pnpm build` | 라이브러리 빌드 |
| `pnpm dev` | Watch 모드 개발 |
| `pnpm test` | 테스트 실행 |
| `pnpm test:watch` | 테스트 Watch 모드 |
| `pnpm test:coverage` | 커버리지 리포트 |
| `pnpm test:storybook` | a11y 테스트 (Storybook + Playwright) |
| `pnpm lint` | ESLint 실행 |
| `pnpm typecheck` | TypeScript 타입 체크 |

---

## 개발 워크플로우

### 1. Issue 확인 또는 생성

작업 전에 관련 Issue가 있는지 확인하거나 새로 생성합니다.

```bash
# Issue 생성
gh issue create --title "feat: Add new component" --body "Description..."
```

### 2. 브랜치 생성

```bash
git checkout develop
git pull origin develop
git checkout -b feat/new-component
```

### 3. 개발

컴포넌트 개발 시 다음 구조를 따릅니다:

```
src/ui/{category}/{ComponentName}/
├── index.tsx              # 컴포넌트 구현
├── style.scss             # Global SCSS 스타일
├── {ComponentName}.test.tsx  # 테스트
└── ComponentName.stories.tsx # Storybook (선택)
```

#### 스크롤되는 영역을 만들 때

`overflow-y: auto` 를 쓰는 곳에는 `@include token.scrollable;` 을 함께 넣는다 — 스크롤바가
얇고 브랜드색이 된다. **네이티브 스크롤을 그대로 쓴다**(커스텀 스크롤 컴포넌트는 두지 않는다).

```scss
.panel_list {
  max-height: token.$overlay_list_max_height;
  overflow-y: auto;
  @include token.scrollable;
}
```

목록에서 방향키로 활성 항목을 옮긴다면 `useListboxPopup` 의 `listRef` 를 스크롤 컨테이너에
붙인다 — 활성 항목이 화면 밖으로 나갈 때만 따라 스크롤한다. 포커스가 입력에 남는 APG 패턴에서는
브라우저가 알아서 스크롤해 주지 않는다.

#### 사용자에게 보이는 문구를 추가할 때

컴포넌트 안에 문구를 박지 말고 **로케일 카탈로그**에 키를 만든다
(`src/ui/system/locale-provider/messages.ts` — `ko` 와 `en` 양쪽).

```tsx
// ❌ 이렇게 두면 <LocaleProvider> 로 바꿀 수 없다
const Foo = ({ hint = "드래그해서 옮기세요" }: FooProps) => …

// ✅ prop 은 그대로 두고 기본값만 카탈로그에서 받는다
const Foo = ({ hint: hintProp }: FooProps) => {
  const t = useLocaleText();
  const hint = hintProp ?? t("foo.hint");
```

키는 **섹션 안에서 알파벳순**으로 넣는다 (`combobox` → `datePicker` → `dateRange` → `dropdown` …).
아무 데나 끼우면 다음 사람이 위치를 예측할 수 없다.

`pnpm check:defaults` 가 다섯 가지를 막는다.

1. 컴포넌트에 박아 넣은 한글 문구 — prop 기본값이든 JSX 안이든. **prop 이름으로 고르지 않는다**
   (`*Label`/`*Text` 패턴만 보던 시절 `rowClickHint`·`hint`·`label` 여섯 개가 그대로 새어 나갔다)
2. 카탈로그 문구에 한글이 있는지
3. 카탈로그 키 ↔ `t("...")` 호출 양방향 — 키만 넣고 배선을 잊거나, 없는 키를 부르는 것
4. 카탈로그 키가 섹션 안에서 알파벳순인지
5. `docs/COMPONENTS.md` prop 표의 Default 열이 실제 기본값과 같은지

개발자 콘솔로만 나가는 메시지(`[Bigtablet DS] …`)는 대상이 아니다 — 사용자가 아니라 개발자가 읽는다.

### 색 토큰: 텍스트에 표면 색을 쓰지 않는다

`pnpm check:dark-text` 가 막는다. `--bt-color-status-*`(bare)·`--bt-color-brand-primary` 처럼
**양 테마에서 같은 값**인 색을 테마 표면 위의 텍스트로 쓰면 다크에서 AA 미달이다 - 실측으로
`danger` Button 이 다크에서 3.06:1(페이지)·2.85:1(패널) 이었다. 텍스트에는 `_on_surface`
(Vanilla `-text`) 쪽을 쓴다. 고정 표면 위 텍스트(`_on_primary`·`_on_dark`·`_on_default`·
`_on_container`)는 이름으로 예외 처리된다. 자세한 표는 [THEMING](./THEMING.md#status-색-배경용과-텍스트용을-구분한다).

a11y 스토리 러너는 라이트만 돌아 axe 가 이 결함을 못 잡는다 - 그래서 정적 검사가 필요하다.

### 4. 테스트 작성

모든 컴포넌트는 테스트가 필요합니다:

```tsx
// ComponentName.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComponentName } from "./index";

describe("ComponentName", () => {
    it("renders correctly", () => {
        render(<ComponentName>Content</ComponentName>);
        expect(screen.getByText("Content")).toBeInTheDocument();
    });
});
```

### 5. 커밋

```bash
git add .
git commit -m "feat: add ComponentName component"
```

### 6. Push 및 PR 생성

```bash
git push origin feat/new-component

# PR 생성 (develop 브랜치로)
gh pr create --base develop --title "feat/new-component" --body "..."
```

---

## 코드 컨벤션

### TypeScript

- 모든 컴포넌트는 `"use client"` 디렉티브 사용
- Props 인터페이스는 HTML 요소 속성을 확장
- `forwardRef` 사용 권장

```tsx
"use client";

import type * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary";
    size?: "sm" | "md" | "lg";
}

export const Button = ({
    variant = "primary",
    size = "md",
    className,
    children,
    ...props
}: ButtonProps) => {
    return (
        <button
            className={cn(
                "button",
                `button_variant_${variant}`,
                `button_size_${size}`,
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};
```

### 스타일링

- Global SCSS 사용 (`style.scss`)
- 클래스명은 snake_case
- 하드코딩된 값 대신 토큰 사용

```scss
@use "src/styles/token" as token;

.button {
    display: inline-flex;
    align-items: center;
    border-radius: token.$radius_md;
    // `transition: all` 금지 - 바뀌는 속성만 명시한다
    transition: background-color token.$transition_fast, color token.$transition_fast;

    &_variant_filled {
        background-color: token.$color_brand_primary;
        color: token.$color_brand_on_primary;
    }

    &_size_md {
        height: 40px;
        padding: 0 token.$spacing_16;
    }
}

@media (prefers-reduced-motion: reduce) {
    .button {
        transition: none;
    }
}
```

### className 패턴

`cn()` 유틸리티를 사용합니다:

```tsx
import { cn } from "../../../utils";

const buttonClassName = cn(
    "button",
    `button_size_${size}`,
    `button_variant_${variant}`,
    isActive && "button_active",
    className
);
```

---

## 커밋 컨벤션

### 형식

```
label: message
```

- 라벨을 앞에, 커밋 내용을 뒤에 작성
- 모두 소문자, 필요시 camelCase 사용
- 메시지는 영문으로 작성

### 라벨

| Label | Description |
|-------|-------------|
| `feat` | 새로운 기능 추가 |
| `fix` | 기능/코드 수정 |
| `bug` | 버그/에러 수정 |
| `merge` | 브랜치 병합 |
| `deploy` | 프로젝트 배포 / 관련 문서 작업 |
| `docs` | 문서 추가/수정 |
| `delete` | 코드/파일/문서 삭제 |
| `note` | 주석 추가/제거 |
| `style` | 코드 스타일/구조 수정 |
| `config` | 설정 파일 / 의존성 / 라이브러리 관련 수정 |
| `etc` | 기타 |
| `tada` | 프로젝트 생성 |

### 예시

```bash
git commit -m "feat: add Toggle component"
git commit -m "fix: resolve Modal focus trap issue"
git commit -m "docs: update README installation guide"
git commit -m "style: refactor Button className pattern"
```

---

## 브랜치 전략

### 브랜치 명명

```
label/domain
```

### 예시

| 브랜치명 | 설명 |
|----------|------|
| `feat/sidebar` | 사이드바 기능 추가 |
| `fix/auth` | 인증 도메인 코드 수정 |
| `style/button` | 버튼 스타일 변경 |
| `docs/readme` | README 문서 수정 |

### 주요 브랜치

- `main` - 프로덕션 브랜치 (배포용)
- `develop` - 개발 브랜치 (PR 기본 대상)

---

## Pull Request

### PR 대상

- **항상 `develop` 브랜치로 PR 생성**
- `main` 브랜치로의 직접 PR은 금지

### PR 제목

브랜치명과 동일하게 작성:

```
feat/new-component
fix/modal-focus
```

### PR 본문

한글로 작성합니다:

섹션 제목은 아래 네 개를 그대로 씁니다. 첫 섹션은 리터럴 `## 작업 개요` 입니다 — 제목은 PR title 이 담당하므로 본문에 따로 넣지 않습니다.

```markdown
## 작업 개요

이슈 #000 - 무엇을 왜 했는지 한두 문단.

## 작업한 내용

- [x] 작업1
- [x] 작업2

## 검증

- 테스트/빌드/실측 결과

## 전달할 추가 이슈

- 이슈1
```

> 섹션별 필수 여부와 자주 하는 실수는 [CLAUDE.md](../CLAUDE.md#pr-본문-섹션-규칙) 를 참고하세요.

### PR 생성 명령어

```bash
gh pr create --base develop --title "feat/new-component" --body "$(cat <<'EOF'
## 새 컴포넌트 추가

## 작업한 내용
- [x] ComponentName 컴포넌트 구현
- [x] 단위 테스트 작성
- [x] Storybook 스토리 추가

## 전달할 추가 이슈
- 없음

EOF
)"
```

### 리뷰 및 머지

- 병합 전 반드시 코드 리뷰어 approve 필요
- 병합 커밋 메시지: `merge: branch-name`
- main 배포: `merge: release`

---

## 관련 문서

- [Architecture](./ARCHITECTURE.md) - 프로젝트 구조
- [Testing](./TESTING.md) - 테스트 작성 가이드
- [Components](./COMPONENTS.md) - 컴포넌트 API
