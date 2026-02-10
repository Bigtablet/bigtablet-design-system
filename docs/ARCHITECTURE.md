# Architecture

Bigtablet Design System의 프로젝트 구조 및 아키텍처 문서입니다.

---

## 프로젝트 구조

```
bigtablet-design-system/
├── src/
│   ├── styles/
│   │   ├── ts/              # TypeScript 디자인 토큰
│   │   │   ├── colors.ts
│   │   │   ├── spacing.ts
│   │   │   ├── typography.ts
│   │   │   ├── radius.ts
│   │   │   ├── shadows.ts
│   │   │   ├── motion.ts
│   │   │   ├── z-index.ts
│   │   │   ├── breakpoints.ts
│   │   │   └── a11y.ts
│   │   └── scss/            # SCSS 토큰 및 믹스인
│   │       └── _token.scss
│   │
│   ├── ui/                  # UI 컴포넌트
│   │   ├── general/         # 범용 컴포넌트
│   │   │   ├── button/
│   │   │   └── select/
│   │   ├── form/            # 폼 컴포넌트
│   │   │   ├── textfield/
│   │   │   ├── checkbox/
│   │   │   ├── radio/
│   │   │   ├── switch/
│   │   │   ├── date-picker/
│   │   │   └── file/
│   │   ├── feedback/        # 피드백 컴포넌트
│   │   │   ├── alert/
│   │   │   ├── toast/
│   │   │   ├── spinner/
│   │   │   └── top-loading/
│   │   ├── navigation/      # 네비게이션 컴포넌트
│   │   │   ├── pagination/
│   │   │   └── sidebar/
│   │   ├── overlay/         # 오버레이 컴포넌트
│   │   │   └── modal/
│   │   └── display/         # 디스플레이 컴포넌트
│   │       └── card/
│   │
│   ├── utils/               # 유틸리티 함수
│   │   ├── cn.ts            # className 유틸리티
│   │   ├── useFocusTrap.ts  # Focus trap hook
│   │   └── index.ts
│   │
│   ├── vanilla/             # Vanilla JS 패키지
│   │   ├── bigtablet.scss
│   │   ├── bigtablet.js
│   │   └── examples/
│   │
│   ├── index.ts             # Pure React 진입점
│   └── next.ts              # Next.js 진입점
│
├── docs/                    # 문서
│   ├── COMPONENTS.md
│   ├── VANILLA.md
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   └── TESTING.md
│
├── .github/
│   └── workflows/
│       └── ci.yml           # CI/CD 파이프라인
│
├── .storybook/              # Storybook 설정
├── scripts/                 # 빌드 스크립트
├── tsup.config.ts           # 빌드 설정
├── vitest.config.ts         # 테스트 설정
└── package.json
```

---

## 컴포넌트 구조

각 컴포넌트는 다음 구조를 따릅니다:

```
src/ui/{category}/{ComponentName}/
├── index.tsx              # 컴포넌트 구현
├── style.module.scss      # CSS Module 스타일 (또는 style.scss)
├── {ComponentName}.test.tsx  # 단위 테스트
└── *.stories.tsx          # Storybook 스토리 (선택)
```

### 컴포넌트 파일 예시

```tsx
// src/ui/general/button/index.tsx
"use client";

import * as React from "react";
import { cn } from "../../../utils";
import styles from "./style.module.scss";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = "primary", size = "md", fullWidth, className, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    styles.button,
                    styles[`variant_${variant}`],
                    styles[`size_${size}`],
                    { [styles.fullWidth]: fullWidth },
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

---

## 스타일링 규칙

### CSS Modules

- 모든 스타일은 `style.module.scss` 파일에 작성
- 클래스명은 snake_case 사용
- SCSS 토큰 import: `@use "src/styles/scss/token" as token;`

```scss
// style.module.scss
@use "src/styles/scss/token" as token;

.button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    transition: all token.$transition_base;
}

.variant_primary {
    background-color: token.$color_primary;
    color: token.$color_white;
}

.size_md {
    height: 40px;
    padding: 0 token.$spacing_lg;
    font-size: token.$font_size_base;
}
```

### cn() 유틸리티

`cn()` 함수는 className을 조합하는 유틸리티입니다:

```tsx
import { cn } from "../../../utils";

// 기본 사용
cn("button", "primary");  // "button primary"

// 조건부 클래스
cn("button", { active: isActive });  // isActive가 true면 "button active"

// 배열
cn(["button", isLarge && "large"]);  // "button large" 또는 "button"

// 외부 className 병합
cn(styles.button, styles[`size_${size}`], className);
```

---

## 진입점 (Entry Points)

### Pure React (`/`)

```ts
// src/index.ts
export * from "./ui/general/button";
export * from "./ui/general/select";
export * from "./ui/form/textfield";
// ... 모든 컴포넌트 export
```

### Next.js (`/next`)

```ts
// src/next.ts
export * from "./index";
// Next.js 전용 컴포넌트 (예: Sidebar with next/link)
export * from "./ui/navigation/sidebar";
```

### Vanilla JS (`/vanilla`)

CDN 또는 직접 import로 사용:

```html
<link rel="stylesheet" href="@bigtablet/design-system/dist/vanilla/bigtablet.min.css">
<script src="@bigtablet/design-system/dist/vanilla/bigtablet.min.js"></script>
```

---

## 디자인 토큰

### TypeScript 토큰

```ts
// src/styles/ts/colors.ts
export const colors = {
    primary: "#000000",
    primaryHover: "#333333",
    error: "#ef4444",
    success: "#10b981",
    // ...
};
```

### SCSS 토큰

```scss
// src/styles/scss/_token.scss
$color_primary: #000000;
$color_primary_hover: #333333;
$color_error: #ef4444;
$color_success: #10b981;

$spacing_xs: 0.25rem;
$spacing_sm: 0.5rem;
$spacing_md: 0.75rem;
$spacing_lg: 1rem;

$font_size_sm: 0.875rem;
$font_size_base: 0.9375rem;
$font_size_md: 1rem;

$radius_sm: 6px;
$radius_md: 8px;
$radius_lg: 12px;

$shadow_sm: 0 2px 4px rgba(0, 0, 0, 0.04);
$shadow_md: 0 4px 12px rgba(0, 0, 0, 0.08);

$transition_fast: 0.1s ease-in-out;
$transition_base: 0.2s ease-in-out;
```

---

## 빌드 설정

### tsup.config.ts

```ts
import { defineConfig } from "tsup";

export default defineConfig([
    // React 번들
    {
        entry: ["src/index.ts"],
        format: ["cjs", "esm"],
        dts: true,
        external: ["react", "react-dom"],
    },
    // Next.js 번들
    {
        entry: ["src/next.ts"],
        format: ["cjs", "esm"],
        dts: true,
        external: ["react", "react-dom", "next"],
    },
]);
```

### 빌드 출력

```
dist/
├── index.js           # CJS (React)
├── index.mjs          # ESM (React)
├── index.d.ts         # TypeScript 타입
├── next.js            # CJS (Next.js)
├── next.mjs           # ESM (Next.js)
├── next.d.ts          # TypeScript 타입
├── style.css          # 통합 스타일
├── scss/              # SCSS 토큰
└── vanilla/           # Vanilla JS 패키지
    ├── bigtablet.css
    ├── bigtablet.min.css
    ├── bigtablet.js
    └── bigtablet.min.js
```

---

## 테스트 구조

### Vitest 설정

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        setupFiles: ["./src/test/setup.ts"],
        coverage: {
            provider: "v8",
            include: ["src/ui/**/*.{ts,tsx}", "src/utils/**/*.{ts,tsx}"],
            exclude: ["**/*.test.{ts,tsx}", "**/*.stories.{ts,tsx}"],
        },
    },
});
```

### 테스트 파일 예시

```tsx
// src/ui/general/button/Button.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./index";

describe("Button", () => {
    it("renders children", () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText("Click me")).toBeInTheDocument();
    });

    it("applies variant class", () => {
        const { container } = render(<Button variant="danger">Delete</Button>);
        expect(container.firstChild).toHaveClass("variant_danger");
    });
});
```

---

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build
```

---

## 관련 문서

- [Contributing](./CONTRIBUTING.md) - 기여 가이드
- [Testing](./TESTING.md) - 테스트 작성 가이드
- [Components](./COMPONENTS.md) - 컴포넌트 API
- [Vanilla JS](./VANILLA.md) - Vanilla JS 가이드
