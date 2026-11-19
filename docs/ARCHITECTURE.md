# Architecture

Bigtablet Design System 의 프로젝트 구조와 아키텍처 문서입니다.

---

## 프로젝트 구조

```
bigtablet-design-system/
├── src/
│   ├── index.ts             # React/Next.js 공용 진입점 (컴포넌트 소스의 "use client" 를 빌드가 유지)
│   │
│   ├── styles/              # 도메인별 디자인 토큰 (각 폴더에 _index.scss + index.ts)
│   │   ├── token.scss       # SCSS barrel (@forward all domains) - 소비자 @use 진입점
│   │   ├── tokens.json      # 토큰 원본 (pnpm tokens → _tokens.scss · index.ts · _theme-tokens.scss)
│   │   ├── theme.scss       # :root / [data-theme="dark"] / @media CSS 변수 (style.css 에 포함)
│   │   ├── colors/  spacing/  typography/  radius/  elevation/  motion/
│   │   ├── breakpoints/  opacity/  border-width/  z-index/  skeleton/  a11y/
│   │   ├── icon/            # 아이콘 사이즈 (xs-xl)
│   │   └── layout/          # SCSS only
│   │
│   ├── ui/                  # UI 컴포넌트 - 8 카테고리 폴더 하위에 컴포넌트 (폴더 이름 = kebab-case)
│   │   ├── display/         # accordion avatar badge card chip data-view description-list divider hero icon
│   │   │                    # list-item media-card prose stat table timeline
│   │   ├── feedback/        # alert empty-state error-state inline-alert linear-progress skeleton spinner toast top-loading
│   │   ├── forms/           # checkbox combobox date-calendar date-picker date-range-picker dropdown field file
│   │   │                    # filter-bar form image-cropper otp-input radio radio-group segmented-control
│   │   │                    # tag-input textarea textfield time-picker toggle
│   │   ├── general/         # button copy-button icon-button
│   │   ├── layout/          # app-shell container grid page-header section stack
│   │   ├── navigation/      # bottom-nav breadcrumb menu nav-bar pagination sidebar stepper tabs
│   │   ├── overlay/         # drawer modal popover tooltip
│   │   └── system/          # locale-provider theme-provider
│   │
│   ├── utils/               # 공용 함수 · 훅 - 목록은 utils/index.ts 가 정본
│   │   ├── cn.ts                   # className 합치기
│   │   ├── safe-html.ts            # SafeHTMLProps (dangerouslySetInnerHTML 차단)
│   │   ├── polymorphic.ts          # PolymorphicProps (`as` 로 렌더 요소 바꾸기)
│   │   ├── use-presence.ts         # 진입/퇴출 모션이 끝날 때까지 마운트 유지
│   │   ├── use-listbox-popup.ts    # Dropdown · Combobox 공용 팝업 거동 (공개 export)
│   │   ├── overlay-stack.ts        # 공유 오버레이 Escape 스택 (registerOverlay / useOverlayEscape)
│   │   ├── use-focus-trap.ts  ·  scroll-lock.ts  ·  use-anchored-position.ts
│   │   ├── use-clipboard.ts  ·  hangul-search.ts  ·  reveal-inline.ts  ·  …
│   │   └── index.ts
│   │
│   ├── text/                # 한국어 줄바꿈 - `/text` 하위 경로 (BalancedText · Sentences · renderPhrases …)
│   │                        # 바깥(utils · ui)을 쓰지 않습니다 - biome noRestrictedImports 가 막습니다. ui → text 방향만
│   │
│   ├── test/                # setup.ts (Vitest)
│   ├── types/               # scss.d.ts
│   └── vanilla/             # Vanilla JS 패키지
│       ├── bigtablet.scss   # 진입점 - scss/_*.scss partial 을 순서대로 @use
│       ├── bigtablet.js     # 진입점 - js/*.js ES 모듈을 모아 export (빌드가 IIFE 하나로 묶는다)
│       ├── js/              # 컴포넌트별 JS (dropdown · modal · alert · toast · toggle · pagination · …)
│       ├── scss/            # 컴포넌트별 스타일 partial
│       └── examples/
│
├── site/                    # 문서 사이트 (Vite) - pages/ · examples/ · props.json, dist/llms 생성 원본
├── docs/                    # 문서 (COMPONENTS, THEMING, MIGRATION, VANILLA, ARCHITECTURE, CONTRIBUTING, TESTING, AGENT_GUIDE)
├── .github/workflows/       # ci.yml (CI), release.yml (태그 배포), pages.yml (문서 사이트 배포)
├── scripts/                 # 빌드 · 검사 스크립트 (build-modules.mjs, build-tokens.mjs, build-vanilla.sh, check-*.py, ...)
├── tsup.config.ts           # 빌드 설정 (React · Vanilla) - 컴포넌트별 모듈 분리는 scripts/build-modules.mjs
├── vitest.config.ts         # 테스트 설정
└── package.json
```

---

## 컴포넌트 구조

각 컴포넌트는 다음 구조를 따릅니다. **폴더와 파일 이름은 kebab-case** 이고 파일명은 폴더명과 같습니다:

```
src/ui/{category}/{component-name}/
├── index.tsx                       # 컴포넌트 구현
├── style.scss                      # Global SCSS 스타일
└── {component-name}.test.tsx       # 단위 테스트
```

### 컴포넌트 파일 예시

가장 단순한 형태 - `src/ui/display/divider/index.tsx` 그대로:

```tsx
"use client";

import type * as React from "react";
import { cn, type SafeHTMLProps } from "../../../utils";
import "./style.scss";

export interface DividerProps extends SafeHTMLProps<React.HTMLAttributes<HTMLHRElement>> {
	/** 구분선 두께 (기본값: "standard") */
	weight?: "standard" | "heavy";
}

export const Divider = ({ weight = "standard", className, ...props }: DividerProps) => {
	const dividerClassName = cn("divider", `divider_weight_${weight}`, className);

	return <hr className={dividerClassName} {...props} />;
};
```

- HTML 속성은 **`SafeHTMLProps<...>` 로 감싸서** 확장합니다. `React.*HTMLAttributes` 를 직접 확장하면 `dangerouslySetInnerHTML` 이 루트로 새고, `src/utils/safe-html.type-test.tsx` 가 `tsc` 에서 실패시킵니다
- `ref` 는 일반 prop 으로 받습니다 (React 19 ref-as-prop). `forwardRef` 는 쓰지 않습니다

> **여러 요소로 렌더되는 컴포넌트**(`as="a"`, `as={Link}`)는 `PolymorphicProps<T, OwnProps>`(`src/utils/polymorphic.ts`)를 씁니다 - `as` 에 준 요소의 props · ref 타입이 그대로 따라오고 `dangerouslySetInnerHTML` 은 이미 빠져 있습니다. 실제 예는 `src/ui/general/button/index.tsx` 의 `ButtonProps`.

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
cn("button", `button_size_${size}`, className);
```

---

## 진입점 (Entry Points)

### React / Next.js (`.`)

```ts
// src/index.ts - 컴포넌트·타입·토큰을 명시적 named export 로 나열한다.
// `export *` 는 쓰지 않는다 - 공개 API 표면이 파일 구조에 따라 조용히 늘어나는 걸 막기 위해서다.
import "./styles/theme.scss"; // :root / [data-theme="dark"] CSS 변수 (dist/index.css 에 1회 포함)
import "./styles/autofill.scss"; // 자동완성 칸의 UA 배경/글자색 무력화 (전역 요소 규칙)

export { cn, useFocusTrap, useReducedMotion } from "./utils";

export type { ButtonProps } from "./ui/general/button";
export { Button } from "./ui/general/button";
export type { ImeStrategy, TextFieldProps, TextFieldSize } from "./ui/forms/textfield";
export { TextField } from "./ui/forms/textfield";

export { colors, baseColors } from "./styles/colors";
export { spacing } from "./styles/spacing";
// ... 나머지 컴포넌트 / 타입 / 토큰도 동일하게 명시적으로 나열
```

> 새 컴포넌트를 추가하면 `src/index.ts` 에 **직접 export 를 추가해야** 소비자에게 노출됩니다. 반대로 `src/utils/index.ts` 에만 있고 `src/index.ts` 에 없는 항목(`registerOverlay` / `useOverlayEscape` / `useIsMounted` / `useAnchoredPosition`)은 **내부 전용**입니다.

별도 `/next` entry 는 없습니다. 컴포넌트 소스가 `"use client"` 로 시작하고 모듈 단위 빌드(`dist/esm`)가 파일마다 그 지시문을 맨 앞에 유지해서(`scripts/build-modules.mjs`), 동일한 `.` export 로 Next.js App Router 에서 그대로 동작합니다. `next` 는 optional peer dependency 입니다.

### Vanilla JS (`/vanilla`)

CDN 또는 직접 import로 사용:

```html
<link rel="stylesheet" href="https://unpkg.com/@bigtablet/design-system@4/dist/vanilla/bigtablet.min.css">
<script src="https://unpkg.com/@bigtablet/design-system@4/dist/vanilla/bigtablet.min.js"></script>
```

정적 파일로 배포하는 방법(Spring `static/` 등)은 [VANILLA.md 설치](./VANILLA.md#설치).

---

## 디자인 토큰

토큰은 **base(원시값) → semantic(용도별 별칭)** 2계층입니다. 컴포넌트는 **semantic 만** 씁니다 - 다크 모드가 semantic 계층에서 갈리기 때문입니다.

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

// semantic - 컴포넌트가 참조하는 계층 (용도별로 중첩). 생성 파일이라 base 를 참조하지 않고 값이 풀려 들어간다
export const colors = {
    brand:  { primary: "#121212", onPrimary: "#FFFFFF", /* ... */ },
    text:   { heading: "#121212", body: "#666666", /* ... */ },
    bg:     { solid: "#FFFFFF", solidDim: "#F4F4F4", /* ... */ },
    // ...
} as const;

// src/styles/spacing/index.ts - 숫자 스케일 (px 값 문자열)
export const spacing = { "4": "4px", "8": "8px", "16": "16px", "24": "24px", /* ... */ } as const;
```

TS 의 `colors` · `elevation` 은 **light 고정값**입니다. 테마를 따라가야 하는 인라인 스타일은 같은 키의 `cssVars`(`src/styles/css-vars.ts`, 값이 `var(--bt-*)`)를 씁니다.

값의 원본은 `src/styles/tokens.json` 입니다. `pnpm tokens` 가 SCSS(`<폴더>/_tokens.scss`) · TS(`<폴더>/index.ts`) · 테마 변수(`_theme-tokens.scss`)를 생성하고, `src/styles/tokens.test.ts` 가 커밋된 생성 파일이 원본과 같은지 봅니다 - [THEMING.md 토큰 단일 소스](./THEMING.md#토큰-단일-소스). 아래 SCSS 예시의 값은 생성 파일 `_tokens.scss` 에 있습니다.

### SCSS 토큰

semantic 색상은 `var(--bt-*)` 를 가리킵니다. SCSS 변수 자체가 CSS 변수 참조라서 `[data-theme="dark"]` 전환이 재컴파일 없이 그대로 따라옵니다.

```scss
// src/styles/colors/_tokens.scss - semantic 은 CSS 변수 참조
$color_brand_primary:  var(--bt-color-brand-primary);
$color_bg_solid:       var(--bt-color-bg-solid);
$color_bg_solid_dim:   var(--bt-color-bg-solid-dim);
$color_text_heading:   var(--bt-color-text-heading);
$color_text_body:      var(--bt-color-text-body);
$color_border_default: var(--bt-color-border-default);
$color_status_error:   var(--bt-color-status-error);

// src/styles/spacing/_tokens.scss - 숫자 스케일 (t-shirt 사이즈 아님)
// 컴포넌트·소비자용은 `var(--bt-*, 원값)` - :root 에서 덮어쓰면 따라간다
$spacing_4:  var(--bt-spacing-4, 4px);
$spacing_8:  var(--bt-spacing-8, 8px);
$spacing_16: var(--bt-spacing-16, 16px);
$spacing_24: var(--bt-spacing-24, 24px);
// 원값(Sass 산술용)은 `_base_` 접두사
$spacing_base_16: 16px;

// src/styles/typography/_tokens.scss - 숫자 스케일
$font_size_14: 14px;
$font_size_15: 15px;
$font_size_16: 16px;
$font_weight_medium: 500;

// src/styles/radius/_tokens.scss - spacing 과 같은 방식 (원값은 $radius_base_*)
$radius_xs:   var(--bt-radius-xs, 4px);
$radius_sm:   var(--bt-radius-sm, 6px);
$radius_md:   var(--bt-radius-md, 8px);
$radius_full: var(--bt-radius-full, 9999px);
$radius_base_md: 8px;

// src/styles/elevation/_tokens.scss - shadow 도 CSS 변수 참조 (다크 모드 대응)
$elevation_level1: var(--bt-elevation-level1);
$elevation_level2: var(--bt-elevation-level2);

// src/styles/motion/_tokens.scss
$duration_fast:   0.1s;
$duration_base:   0.2s;
$transition_fast: 0.1s ease-in-out;
$transition_base: 0.2s ease-in-out;
$easing_enter:    cubic-bezier(0.16, 1, 0.3, 1);
$easing_exit:     cubic-bezier(0.4, 0, 1, 1);
```

> `$color_primary` / `$color_white` / `$spacing_xs|sm|md|lg` / `$shadow_sm|md` 같은 t-shirt·원시 네이밍 토큰은 **존재하지 않습니다**. semantic 이름과 숫자 스케일만 씁니다.

---

## 빌드 설정

### tsup.config.ts

설정은 [`tsup.config.ts`](../tsup.config.ts) 가 정본입니다 - 여기에 붙여 두면 어긋납니다. 설정은 넷입니다(Vanilla 는 압축본 · 비압축본 두 설정).

| 빌드 | 출력 | 용도 |
|------|------|------|
| 한 덩어리 (`src/index.ts`) | `dist/index.css`(= `style.css`) · `dist/index.d.ts` · `dist/text.d.ts` | 전체 CSS 와 타입(루트 · `/text`). CSS 는 `onSuccess` 가 `@layer bigtablet` 로 감쌉니다. 이 JS(`dist/index.js`)는 쓰지 않아 같은 설정의 `onSuccess` 가 지웁니다 |
| 모듈 단위 (`src/**/*.ts(x)`, `bundle: false`) | `dist/esm/**` | 패키지 진입점. 파일 하나 = 모듈 하나라 소비자 번들러가 안 쓰는 컴포넌트를 JS · CSS 째로 뺍니다. import 경로 보정 · 컴포넌트별 CSS · `"use client"` 유지는 `scripts/build-modules.mjs` |
| Vanilla (`src/vanilla/bigtablet.js`) × 2 | `dist/vanilla/bigtablet.min.js` · `dist/vanilla/bigtablet.js` | IIFE, 전역 `Bigtablet`. 압축본이 배포물이고 비압축본은 examples 용(배포 제외) |

`pnpm build` 가 tsup 다음에 SCSS 복사(`copy-scss.sh`) · Vanilla CSS(`build-vanilla.sh`) · Tailwind v4 토큰 브리지(`build-tailwind.mjs` → `dist/tailwind.css`) · 에이전트 문서(`build:llms` → `dist/llms/`)를 이어서 만듭니다.

### 빌드 출력

```
dist/
├── esm/               # ESM (React/Next.js) 진입점 - 모듈 단위, 컴포넌트마다 style.css
│   └── text/          # /text 진입점 (BalancedText 등)
├── index.d.ts         # TypeScript 타입 (루트)
├── text.d.ts          # TypeScript 타입 (/text)
├── index.css          # 통합 스타일 (= style.css, theme.scss CSS 변수 포함)
├── tailwind.css       # Tailwind v4 토큰 브리지 (/tailwind.css)
├── styles/token.scss  # SCSS 토큰 (/scss/token)
├── llms/              # 에이전트 문서 (build:llms)
│   ├── index.md
│   ├── components/    # 컴포넌트별 .md
│   ├── tokens.md · recipes.md · avoid.md · text.md · vanilla.md
│   └── full.md
└── vanilla/           # Vanilla JS 패키지
    ├── bigtablet.css      # 비압축본 - 로컬(examples) 전용, 배포 제외 (package.json files 의 ! 항목)
    ├── bigtablet.min.css
    ├── bigtablet.js       # 비압축본 - 로컬(examples) 전용, 배포 제외
    └── bigtablet.min.js
```

---

## 테스트 구조

### Vitest 설정

설정은 [`vitest.config.ts`](../vitest.config.ts) 가 정본입니다. 프로젝트가 셋으로 나뉩니다.

| 프로젝트 | 명령 | 파일 | 환경 |
|----------|------|------|------|
| `unit` | `pnpm test` | `*.test.ts(x)` | jsdom, `src/test/setup.ts` |
| `browser` | `pnpm test:browser` | `*.browser.test.ts(x)` (`src/` · `site/`) | 실제 Chromium (레이아웃 · 잘림 · 스크롤 잠금, 문서 예제 axe) |
| `visual` | `pnpm test:visual` | `*.visual.test.tsx` | CI 컨테이너 전용 시각 회귀 |

자세한 작성법은 [TESTING.md](./TESTING.md).

### 테스트 파일 예시

```tsx
// src/ui/general/button/button.test.tsx
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

정본은 [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) 입니다. 아래는 그 구조 요약이므로, 실제 값(액션 버전·Node 버전 등)은 워크플로 파일에서 확인합니다.

**트리거**
- `pull_request` → `develop`, `main`
- `push` → `develop`
- 양쪽 모두 `paths-ignore` 로 `**.md` · `docs/**` · `.github/ISSUE_TEMPLATE/**` · `LICENSE` 는 제외 (docs-only PR 은 CI 를 돌리지 않습니다)
- **릴리즈/싱크 PR(`develop` → `main`)은 `changes` job 의 `if:` 로 제외** - `push: develop` 이 이미 같은 트리를 검사했습니다. main 은 develop 의 과거 상태라 머지 결과 트리가 develop tip 과 같아서, develop 에 푸시하면 `push` 실행과 열린 릴리즈 PR 의 `pull_request(synchronize)` 실행이 같은 SHA 를 두 번 돌게 됩니다. head 가 `develop` 인 경우만 빼므로 hotfix 브랜치 → `main` PR 은 그대로 돕니다

**job 구성**

| Job | 역할 |
|------|------|
| `changes` | `dorny/paths-filter` 로 `code` / `site` / `deps` / `vanilla` 변경 여부를 한 번만 판정해 후속 job 의 조건으로 넘깁니다. 릴리즈/싱크 PR(`develop` → `main`)에서는 skip 되고, 나머지 job 도 모두 `needs: changes` 라 함께 skip 됩니다 |
| `static-checks` | 병합 게이트. `build` 와 같은 조건 - `biome check .` → `tsc --noEmit` → `pnpm audit --prod --audit-level=high`. `tsc` 가 여기서만 돌기 때문에 `src/utils/safe-html.type-test.tsx` 도 이 job 이 지킵니다. audit 은 조회 실패도 실패로 끝납니다 |
| `unit` | `pnpm test:coverage` → (PR 이면) `davelosert/vitest-coverage-report-action`. `code` · `deps` · `vanilla` 중 하나라도 바뀌면 돕니다 - `src/vanilla/*.test.ts` 도 `unit` 프로젝트이기 때문입니다 |
| `a11y` | Playwright 공식 이미지 컨테이너에서 `pnpm test:browser`(레이아웃 · 문서 예제 axe) → `pnpm test:visual`(시각 회귀). `code` · `site` · `vanilla` 가 바뀌면 돕니다. 이미지 태그는 lockfile 의 playwright 버전과 같아야 합니다(어긋나면 첫 step 이 실패) |
| `build` | 소스 검사 + 빌드와 dist 기반 검사. 4개 중 하나라도 바뀌면 돕니다 |

`static-checks` · `unit` · `a11y` · `build` 는 서로 기다리지 않고 병렬로 돕니다 - 대기 시간이 가장 긴 job 하나로 정해집니다.

**`build` job 의 step (실행 조건 포함)**

| Step | 조건 |
|------|------|
| Checkout (`actions/checkout`, `fetch-depth: 0` - commitlint 가 base 부터 읽습니다) | 항상 |
| Setup pnpm (`pnpm/action-setup`) + Node (`actions/setup-node`, `node-version: 22.14.0`, `cache: pnpm`) | 항상 |
| `pnpm install --frozen-lockfile` | 항상 |
| `pnpm exec commitlint` | `develop` 대상 PR 이고 dependabot 이 아닐 때 |
| `pnpm lint:css` · `check:defaults` · `check:deprecated` · `check:filenames` · `check:agent-guide` · `check:props` | 항상 (소스만 읽어 빌드 앞에서 빨리 실패) |
| `pnpm build` | 항상 |
| `pnpm size` · `check:css-vars` · `check:geometry` · `check:dark-text` | 항상 (dist 를 읽어 빌드 뒤) |

**권한과 액션 고정**
- 모든 워크플로 최상단은 `permissions: contents: read` 뿐입니다. 쓰기가 필요한 job 만 자기 블록에서 상향합니다 (`unit` 의 `pull-requests: write` 는 커버리지 코멘트용). job 레벨 `permissions` 는 최상단 값을 합치지 않고 대체합니다
- `uses:` 는 전부 `owner/action@<40자 SHA> # vX.Y.Z` 로 고정합니다. 태그는 옮겨질 수 있어 무결성 보장이 안 됩니다. 갱신은 `dependabot.yml` 의 `github-actions` ecosystem 이 SHA 와 버전 주석을 함께 올립니다

**size-limit 예산**(`package.json` `size-limit`)은 brotli 기준이고, 각 항목의 `message` 가 마지막
조정 근거와 남은 여유를 담습니다 - 올릴 때는 실측값과 함께 그 문장을 갱신합니다. 런타임 의존성은 없습니다. 진입점 `dist/esm` 은 파일 하나가 모듈 하나인 ESM 이고 공백만 줄여 배포합니다 - 이름 압축 · 트리 쉐이킹은 사용처 번들러가 합니다.

배포는 별도 워크플로입니다 - `v*` 태그 push 시 [`.github/workflows/release.yml`](../.github/workflows/release.yml) 이 `npm publish --provenance` + GitHub Release 를 처리합니다.

---

## 관련 문서

- [Contributing](./CONTRIBUTING.md) - 기여 가이드
- [Testing](./TESTING.md) - 테스트 작성 가이드
- [Components](./COMPONENTS.md) - 컴포넌트 사용법 · 구현 계약 (props 는 문서 사이트)
- [Vanilla JS](./VANILLA.md) - Vanilla JS 가이드
