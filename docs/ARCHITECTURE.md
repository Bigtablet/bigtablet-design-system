# Architecture

Bigtablet Design System의 프로젝트 구조 및 아키텍처 문서입니다.

---

## 프로젝트 구조

```
bigtablet-design-system/
├── src/
│   ├── index.ts             # React/Next.js 공용 진입점 (빌드 시 "use client" 자동 주입)
│   │
│   ├── styles/              # 도메인별 디자인 토큰 (각 폴더에 _index.scss + index.ts)
│   │   ├── token.scss       # SCSS barrel (@forward all domains) — 소비자 @use 진입점
│   │   ├── tokens.json      # 디자이너 JSON 토큰
│   │   ├── theme.scss       # :root / [data-theme="dark"] / @media CSS 변수 (style.css 에 포함)
│   │   ├── global.css
│   │   ├── colors/  spacing/  typography/  radius/  elevation/  motion/
│   │   ├── breakpoints/  opacity/  border-width/  z-index/  skeleton/  a11y/
│   │   └── layout/          # SCSS only
│   │
│   ├── ui/                  # UI 컴포넌트 — 8 카테고리 폴더 하위에 컴포넌트
│   │   ├── display/         # accordion avatar badge card chip divider hero icon list-item media-card table
│   │   ├── feedback/        # alert empty-state error-state linear-progress skeleton spinner toast top-loading
│   │   ├── forms/           # checkbox date-picker dropdown file otp-input radio radio-group textarea textfield toggle
│   │   ├── general/         # button icon-button
│   │   ├── layout/          # container grid section stack
│   │   ├── navigation/      # bottom-nav breadcrumb menu nav-bar pagination sidebar tabs
│   │   ├── overlay/         # modal popover tooltip
│   │   └── system/          # theme-provider
│   │
│   ├── utils/               # cn + 훅
│   │   ├── cn.ts
│   │   ├── use-focus-trap.ts
│   │   ├── use-reduced-motion.ts
│   │   ├── use-spring-presence.ts  /  use-spring-hover.ts
│   │   ├── use-safe-layout-effect.ts
│   │   └── index.ts
│   │
│   ├── stories/             # Storybook 문서 (foundation / getting-started / cookbook / examples)
│   ├── test/                # setup.ts (Vitest)
│   ├── types/               # scss.d.ts
│   └── vanilla/             # Vanilla JS 패키지
│       ├── bigtablet.scss
│       ├── bigtablet.js
│       └── examples/
│
├── docs/                    # 문서 (COMPONENTS, VANILLA, ARCHITECTURE, CONTRIBUTING, TESTING, AGENT_GUIDE)
├── .github/workflows/       # ci.yml (CI), release.yml (태그 배포)
├── .storybook/              # Storybook 설정
├── scripts/                 # 빌드 스크립트 (copy-scss.sh, build-vanilla.sh, ...)
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
├── style.scss             # Global SCSS 스타일
├── {ComponentName}.test.tsx  # 단위 테스트
└── *.stories.tsx          # Storybook 스토리 (선택)
```

### 컴포넌트 파일 예시

```tsx
// src/ui/general/button/index.tsx
"use client";

import type * as React from "react";
import { cn } from "../../../utils";
import "./style.scss";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    fullWidth?: boolean;
}

export const Button = ({
    variant = "primary",
    size = "md",
    fullWidth,
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
                fullWidth && "button_full_width",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};
```

---

## 스타일링 규칙

### Global SCSS

- 모든 스타일은 `style.scss` 파일에 작성
- 클래스명은 snake_case 사용
- SCSS 토큰 import: `@use "src/styles/token" as token;`

```scss
// style.scss
@use "src/styles/token" as token;

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

### React / Next.js (`.`)

```ts
// src/index.ts — 모든 컴포넌트·훅·유틸 re-export
export * from "./ui/general/button";
export * from "./ui/forms/textfield";
export { cn, useReducedMotion } from "./utils";
// ... 모든 컴포넌트 export
```

별도 `/next` entry 는 없다. 컴포넌트가 `"use client"` 로 마킹되고(빌드 시 tsup 가 `dist/index.js` 선두에 자동 주입) `next` 가 optional peer dependency 라, 동일한 `.` export 로 Next.js App Router 에서 그대로 동작한다.

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
// src/styles/colors/index.ts
export const colors = {
    primary: "#000000",
    primaryHover: "#333333",
    error: "#ef4444",
    success: "#047857",
    // ...
};
```

### SCSS 토큰

```scss
// src/styles/colors/_index.scss
$color_primary: #000000;
$color_primary_hover: #333333;
$color_error: #ef4444;
$color_success: #047857;

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
    // React 번들 (Next.js 공용) — 빌드 후 dist/index.js 선두에 "use client" 주입
    {
        entry: { index: "src/index.ts" },
        format: ["esm"],
        dts: true,
        external: ["react", "react-dom", "lucide-react"],
    },
    // Vanilla JS 번들 (IIFE, 전역 Bigtablet)
    {
        entry: { "vanilla/bigtablet": "src/vanilla/bigtablet.js" },
        format: ["iife"],
        globalName: "Bigtablet",
    },
]);
```

별도 Next.js 번들은 없다 (React 번들이 `"use client"` 마킹으로 Next 호환). SCSS 복사·Vanilla CSS 빌드는 `pnpm build` 가 `scripts/copy-scss.sh` · `scripts/build-vanilla.sh` 로 처리.

### 빌드 출력

```
dist/
├── index.js           # ESM (React/Next.js)
├── index.d.ts         # TypeScript 타입
├── index.css          # 통합 스타일 (= style.css, theme.scss CSS 변수 포함)
├── styles/token.scss  # SCSS 토큰 (/scss/token)
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
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:storybook
      - run: pnpm build
```

---

## 관련 문서

- [Contributing](./CONTRIBUTING.md) - 기여 가이드
- [Testing](./TESTING.md) - 테스트 작성 가이드
- [Components](./COMPONENTS.md) - 컴포넌트 API
- [Vanilla JS](./VANILLA.md) - Vanilla JS 가이드
