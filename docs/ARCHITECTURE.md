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
│   │   ├── token.scss       # SCSS barrel (@forward all domains) - 소비자 @use 진입점
│   │   ├── tokens.json      # 디자이너 JSON 토큰
│   │   ├── theme.scss       # :root / [data-theme="dark"] / @media CSS 변수 (style.css 에 포함)
│   │   ├── global.css
│   │   ├── colors/  spacing/  typography/  radius/  elevation/  motion/
│   │   ├── breakpoints/  opacity/  border-width/  z-index/  skeleton/  a11y/
│   │   ├── icon/            # 아이콘 사이즈 (xs-xl)
│   │   └── layout/          # SCSS only
│   │
│   ├── ui/                  # UI 컴포넌트 - 8 카테고리 폴더 하위에 컴포넌트
│   │   ├── display/         # accordion avatar badge card chip divider hero icon list-item media-card table
│   │   ├── feedback/        # alert empty-state error-state linear-progress skeleton spinner toast top-loading
│   │   ├── forms/           # checkbox date-picker dropdown file image-cropper otp-input radio radio-group textarea textfield toggle
│   │   ├── general/         # button icon-button
│   │   ├── layout/          # container grid section stack
│   │   ├── navigation/      # bottom-nav breadcrumb menu nav-bar pagination sidebar tabs
│   │   ├── overlay/         # drawer modal popover tooltip
│   │   └── system/          # theme-provider
│   │
│   ├── utils/               # cn + 훅
│   │   ├── cn.ts
│   │   ├── overlay-stack.ts        # 공유 오버레이 Escape 스택 (registerOverlay / useOverlayEscape)
│   │   ├── use-anchored-position.ts
│   │   ├── use-focus-trap.ts
│   │   ├── use-is-mounted.ts
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

export type ButtonVariant = "filled" | "tonal" | "outline" | "text";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

/** button/anchor 공통 스타일·콘텐츠 props (export 하지 않는 내부 베이스) */
interface ButtonBaseProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    /** 위험한 액션 - variant 와 조합되는 boolean modifier */
    danger?: boolean;
    disabled?: boolean;
}

export interface ButtonAsButton
    extends ButtonBaseProps,
        Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> {
    as?: "button";
    href?: never;
    ref?: React.Ref<HTMLButtonElement>;
}

export interface ButtonAsAnchor
    extends ButtonBaseProps,
        Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> {
    as?: "a";
    href: string;
    ref?: React.Ref<HTMLAnchorElement>;
}

/** `as`/`href` 로 button ↔ anchor 를 가르는 discriminated union */
export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

export const Button = (props: ButtonProps) => {
    const {
        variant = "filled",
        size = "md",
        fullWidth = false,
        danger = false,
        disabled = false,
        as,
        className,
        children,
        ref,
        ...rest
    } = props;

    const buttonClassName = cn(
        "button",
        `button_variant_${variant}`,
        `button_size_${size}`,
        fullWidth && "button_full_width",
        danger && "button_danger",
        disabled && "button_disabled",
        className
    );

    // as="a" 또는 (as 미지정 + href 존재) 시 anchor 로 렌더링 (생략)
    return (
        <button ref={ref as React.Ref<HTMLButtonElement>} disabled={disabled} className={buttonClassName} {...rest}>
            {children}
        </button>
    );
};
```

> 여러 요소로 렌더될 수 있는 컴포넌트는 이렇게 **discriminated union** 으로 만든다. 대신 소비자가 `interface X extends ButtonProps` 로 확장할 수 없으므로 `React.ComponentProps<typeof Button>` 을 안내한다 ([MIGRATION.md](./MIGRATION.md) 참고).

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
    border-radius: token.$radius_full;
    // `transition: all` 금지 - 바뀌는 속성만 명시한다 (CLAUDE.md 애니메이션 규칙)
    transition:
        background-color token.$transition_fast,
        color token.$transition_fast,
        box-shadow token.$transition_fast;

    &_variant_filled {
        background-color: token.$color_brand_primary;
        color: token.$color_brand_on_primary;
    }

    &_size_md {
        height: 40px;
        padding: 0 token.$spacing_16;
        font-size: token.$font_size_15;
    }

    &_danger {
        background-color: token.$color_status_error;
        color: token.$color_status_error_on_default;
    }
}

@media (prefers-reduced-motion: reduce) {
    .button {
        transition: none;
    }
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
// src/index.ts - 컴포넌트·타입·토큰을 명시적 named export 로 나열한다.
// `export *` 는 쓰지 않는다 - 공개 API 표면이 파일 구조에 따라 조용히 늘어나는 걸 막기 위해서다.
import "./styles/theme.scss"; // :root / [data-theme="dark"] CSS 변수 (dist/index.css 에 1회 포함)

export { cn, useFocusTrap, useReducedMotion, useSpringHover, useSpringPresence } from "./utils";

export type { ButtonProps } from "./ui/general/button";
export { Button } from "./ui/general/button";
export type { ImeStrategy, TextFieldProps, TextFieldSize } from "./ui/forms/textfield";
export { TextField } from "./ui/forms/textfield";

export { colors, baseColors } from "./styles/colors";
export { spacing } from "./styles/spacing";
// ... 나머지 컴포넌트 / 타입 / 토큰도 동일하게 명시적으로 나열
```

> 새 컴포넌트를 추가하면 `src/index.ts` 에 **직접 export 를 추가해야** 소비자에게 노출된다. 반대로 `src/utils/index.ts` 에만 있고 `src/index.ts` 에 없는 항목(`registerOverlay` / `useOverlayEscape` / `useIsMounted` / `useAnchoredPosition`)은 **내부 전용**이다.

별도 `/next` entry 는 없다. 컴포넌트가 `"use client"` 로 마킹되고(빌드 시 tsup 가 `dist/index.js` 선두에 자동 주입) `next` 가 optional peer dependency 라, 동일한 `.` export 로 Next.js App Router 에서 그대로 동작한다.

### Vanilla JS (`/vanilla`)

CDN 또는 직접 import로 사용:

```html
<link rel="stylesheet" href="@bigtablet/design-system/dist/vanilla/bigtablet.min.css">
<script src="@bigtablet/design-system/dist/vanilla/bigtablet.min.js"></script>
```

---

## 디자인 토큰

토큰은 **base(원시값) → semantic(용도별 별칭)** 2계층이다. 컴포넌트는 **semantic 만** 쓴다 - 다크 모드가 semantic 계층에서 갈리기 때문이다.

### TypeScript 토큰

```ts
// src/styles/colors/index.ts
export const baseColors = {
    brandPrimary: "#121212",
    neutral0: "#FFFFFF",
    neutral200: "#E5E5E5",
    statusError: "#B91C1C",
    // ...
} as const;

// semantic - 컴포넌트가 참조하는 계층 (용도별로 중첩)
export const colors = {
    brand:  { primary: baseColors.brandPrimary, onPrimary: baseColors.neutral0 },
    text:   { heading: baseColors.neutral900, body: baseColors.neutral700, /* ... */ },
    bg:     { solid: baseColors.neutral0, solidDim: baseColors.neutral50, /* ... */ },
    border: { default: baseColors.neutral200, focus: baseColors.neutral900, /* ... */ },
    // ...
} as const;

// src/styles/spacing/index.ts - 숫자 스케일 (px 값 문자열)
export const spacing = { "4": "4px", "8": "8px", "16": "16px", "24": "24px", /* ... */ } as const;
```

### SCSS 토큰

semantic 색상은 `var(--bt-*)` 를 가리킨다. SCSS 변수 자체가 CSS 변수 참조라서 `[data-theme="dark"]` 전환이 재컴파일 없이 그대로 따라온다.

```scss
// src/styles/colors/_index.scss - semantic 은 CSS 변수 참조
$color_brand_primary:  var(--bt-color-brand-primary);
$color_bg_solid:       var(--bt-color-bg-solid);
$color_bg_solid_dim:   var(--bt-color-bg-solid-dim);
$color_text_heading:   var(--bt-color-text-heading);
$color_text_body:      var(--bt-color-text-body);
$color_border_default: var(--bt-color-border-default);
$color_status_error:   var(--bt-color-status-error);

// src/styles/spacing/_index.scss - 숫자 스케일 (t-shirt 사이즈 아님)
$spacing_4:  4px;
$spacing_8:  8px;
$spacing_16: 16px;
$spacing_24: 24px;
$spacing_32: 32px;

// src/styles/typography/_index.scss - 숫자 스케일
$font_size_14: 14px;
$font_size_15: 15px;
$font_size_16: 16px;
$font_weight_medium: 500;

// src/styles/radius/_index.scss
$radius_xs:   4px;
$radius_sm:   6px;
$radius_md:   8px;
$radius_full: 9999px;

// src/styles/elevation/_index.scss - shadow 도 CSS 변수 참조 (다크 모드 대응)
$elevation_level1: var(--bt-elevation-level1);
$elevation_level2: var(--bt-elevation-level2);

// src/styles/motion/_index.scss
$duration_base:   0.2s;
$transition_fast: $duration_fast ease-in-out;
$transition_base: $duration_base ease-in-out;
$easing_enter:    cubic-bezier(0.16, 1, 0.3, 1);
$easing_exit:     cubic-bezier(0.4, 0, 1, 1);
```

> `$color_primary` / `$color_white` / `$spacing_xs|sm|md|lg` / `$shadow_sm|md` 같은 t-shirt·원시 네이밍 토큰은 **존재하지 않는다**. semantic 이름과 숫자 스케일만 쓴다.

---

## 빌드 설정

### tsup.config.ts

```ts
import { defineConfig } from "tsup";

export default defineConfig([
    // React 번들 (Next.js 공용) - 빌드 후 dist/index.js 선두에 "use client" 주입
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
        const { container } = render(<Button variant="outline">Delete</Button>);
        expect(container.firstChild).toHaveClass("button_variant_outline");
    });

    it("applies the danger modifier", () => {
        const { container } = render(<Button danger>Delete</Button>);
        expect(container.firstChild).toHaveClass("button_danger");
    });
});
```

---

## CI/CD

### GitHub Actions

정본은 [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) 이다. 아래는 그 구조 요약이므로, 실제 값(액션 버전·Node 버전 등)은 워크플로 파일을 확인할 것.

**트리거**
- `pull_request` → `develop`, `main`
- `push` → `develop`
- 양쪽 모두 `paths-ignore` 로 `**.md` · `docs/**` · `.github/ISSUE_TEMPLATE/**` · `LICENSE` 는 제외 (docs-only PR 은 CI 를 돌리지 않는다)

**job 구성**

| Job | 역할 |
|------|------|
| `changes` | `dorny/paths-filter` 로 `code` / `stories` / `deps` / `vanilla` 변경 여부를 한 번만 판정해 후속 step 의 조건으로 넘긴다 |
| `test` | 위 4개 중 하나라도 변경됐을 때만 실행 |

**`test` job 의 step (실행 조건 포함)**

| Step | 조건 |
|------|------|
| Checkout (`actions/checkout@v6`, `fetch-depth: 0`) | 항상 |
| Setup pnpm (`pnpm/action-setup@v4`) + Node (`actions/setup-node@v6`, `node-version: 22.14.0`, `cache: pnpm`) | 항상 |
| `pnpm install --frozen-lockfile` | 항상 |
| `pnpm exec commitlint` | `develop` 대상 PR 이고 dependabot 이 아닐 때 |
| `pnpm lint:css` (Stylelint - raw hex / named color 금지) | `code` 또는 `stories` 변경 |
| `pnpm test:coverage` | `code` 또는 `deps` 변경 |
| `pnpm exec playwright install --with-deps chromium` → `pnpm test:storybook` | `code` 또는 `stories` 변경 (Chromium ~200MB 라 무겁다) |
| `pnpm build` | 항상 |
| `pnpm size` (size-limit - dist 산출물 기반) | 항상 |
| `davelosert/vitest-coverage-report-action@v2` | PR 이면서 `code` 또는 `deps` 변경 |

배포는 별도 워크플로다 - `v*` 태그 push 시 [`.github/workflows/release.yml`](../.github/workflows/release.yml) 이 `npm publish --provenance` + GitHub Release 를 처리한다.

---

## 관련 문서

- [Contributing](./CONTRIBUTING.md) - 기여 가이드
- [Testing](./TESTING.md) - 테스트 작성 가이드
- [Components](./COMPONENTS.md) - 컴포넌트 API
- [Vanilla JS](./VANILLA.md) - Vanilla JS 가이드
