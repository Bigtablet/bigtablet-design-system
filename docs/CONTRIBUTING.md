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
├── style.module.scss      # 스타일
├── {ComponentName}.test.tsx  # 테스트
└── ComponentName.stories.tsx # Storybook (선택)
```

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

import * as React from "react";
import { cn } from "../../../utils";
import styles from "./style.module.scss";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary";
    size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    styles.button,
                    styles[`variant_${variant}`],
                    styles[`size_${size}`],
                    className
                )}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
```

### 스타일링

- CSS Modules 사용 (`style.module.scss`)
- 클래스명은 snake_case
- 하드코딩된 값 대신 토큰 사용

```scss
@use "src/styles/scss/token" as token;

.button {
    display: inline-flex;
    align-items: center;
    border-radius: token.$radius_md;
    transition: all token.$transition_base;
}

.variant_primary {
    background-color: token.$color_primary;
    color: token.$color_white;
}

.size_md {
    height: 40px;
    padding: 0 token.$spacing_lg;
}
```

### className 패턴

`cn()` 유틸리티를 사용합니다:

```tsx
import { cn } from "../../../utils";

const buttonClassName = cn(
    styles.button,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    { [styles.active]: isActive },
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
git commit -m "feat: add Switch component"
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

```markdown
## PR 제목 (작업 요약)

## 작업한 내용
- [x] 작업1
- [x] 작업2
- [x] 작업3

## 전달할 추가 이슈
- 이슈1
- 이슈2
```

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
