# Theming

Bigtablet Design System의 라이트/다크 테마 시스템 가이드입니다.

---

## 목차

- [ThemeProvider](#themeprovider)
- [data-theme 동작 방식](#data-theme-동작-방식)
- [SSR / FOUC](#ssr--fouc)
- [소비 표면별 사용법](#소비-표면별-사용법)
  - [React](#react)
  - [SCSS 소비자](#scss-소비자)
  - [CSS 변수 직접 사용](#css-변수-직접-사용)
- [Storybook](#storybook)

---

## ThemeProvider

앱을 `ThemeProvider` 로 감싸면 `data-theme` attribute 기반으로 light/dark/system 테마를 전환할 수 있습니다.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultMode` | `'light' \| 'dark' \| 'system'` | `'system'` | 초기 테마. 서버와 동일한 값으로 첫 렌더를 시작하기 위한 기준값입니다 |
| `storageKey` | `string \| null` | `'bt-theme'` | 선택한 모드를 저장할 localStorage 키. `null` 이면 저장하지 않고 매 새로고침마다 `defaultMode` 로 초기화됩니다 |
| `targetSelector` | `string` | `-` | `data-theme` 를 적용할 대상 element 의 CSS selector. 미지정 시 `document.documentElement` 에 적용 |

**`useTheme()` 반환값**

| 필드 | Type | Description |
|------|------|-------------|
| `mode` | `'light' \| 'dark' \| 'system'` | 현재 선택된 모드 (`system` 포함, 사용자가 고른 값 그대로) |
| `resolved` | `'light' \| 'dark'` | 실제로 적용된 테마. `mode`가 `system`이면 `prefers-color-scheme` 으로 해석된 값 |
| `setMode` | `(mode: ThemeMode) => void` | 모드 변경. `storageKey` 가 설정되어 있으면 localStorage 에도 함께 저장됩니다 |

**Usage**

```tsx
import { ThemeProvider, useTheme } from "@bigtablet/design-system";

function App() {
  return (
    <ThemeProvider defaultMode="system">
      <YourApp />
    </ThemeProvider>
  );
}

function ThemeToggle() {
  const { mode, resolved, setMode } = useTheme();
  return (
    <button onClick={() => setMode(resolved === "dark" ? "light" : "dark")}>
      현재: {mode} (적용: {resolved})
    </button>
  );
}
```

`useTheme()` 은 `ThemeProvider` 내부에서만 호출할 수 있습니다. Provider 없이 호출하면 사용법을 안내하는 에러를 던집니다.

---

## data-theme 동작 방식

- `mode`가 `light` 또는 `dark`면 root element(기본 `document.documentElement`, `targetSelector` 로 변경 가능)에 `data-theme="light"` 또는 `data-theme="dark"` attribute 를 설정합니다.
- `mode`가 `system`이면 attribute 를 제거합니다. 이 경우 CSS 의 `@media (prefers-color-scheme: dark)` 규칙에 위임되어 OS 설정을 그대로 따릅니다.
- `src/styles/theme.scss` 에는 두 경로가 동일한 `dark-theme` mixin 을 공유합니다.
  - 명시 토글: `[data-theme="dark"] { @include dark-theme; }`
  - OS 자동(`ThemeProvider` 없음 또는 `mode="system"`): `@media (prefers-color-scheme: dark) { :root:not([data-theme]) { @include dark-theme; } }`
  - 즉 `ThemeProvider` 를 아예 쓰지 않아도 OS 다크 모드 설정만으로 자동 전환되고, `ThemeProvider` 를 쓰면 사용자가 OS 설정과 무관하게 강제로 light/dark 를 고정할 수 있습니다.

---

## SSR / FOUC

- 첫 렌더는 `defaultMode` 값으로 deterministic 하게 시작합니다. 서버와 클라이언트가 동일한 값으로 렌더링되므로 hydration mismatch 가 발생하지 않습니다.
- mount 후 `useEffect` 에서 1회 저장된 localStorage 값과 OS `prefers-color-scheme` 설정을 동기화합니다. 즉 사용자가 이전에 dark 를 선택해 뒀다면, 첫 페인트는 `defaultMode`(예: light)로 그려졌다가 mount 직후 dark 로 전환됩니다.
- 이 전환 사이에 짧은 테마 깜빡임(FOUC, Flash of Unstyled Content)이 보일 수 있습니다. 완전히 없애려면 hydration 이전에 inline `<script>` 로 `data-theme` 를 직접 세팅하는 것을 권장합니다 (`next-themes` 와 동일한 패턴). 이 스크립트는 `storageKey`/`defaultMode` 를 실제 앱 설정과 동일하게 맞춰야 합니다.

Next.js App Router 예시 (`app/layout.tsx`):

```tsx
import { ThemeProvider } from "@bigtablet/design-system";
import "@bigtablet/design-system/style.css";

const NO_FLASH_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("bt-theme");
    var mode = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    if (mode === "system") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", mode);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // 인라인 스크립트가 hydration 이전에 <html> 의 data-theme 를 바꾸므로 서버 HTML 과 클라이언트
  // DOM 이 달라진다. 아래 suppressHydrationWarning 으로 이 최상위 노드의 불일치 경고를 무시한다
  // (next-themes 와 동일한 처리, 자식에는 전파되지 않음).
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* next/script 의 beforeInteractive 는 인라인 스크립트(src 없는 스크립트)를 보장하지 않으므로
            hydration 이전 실행을 위해 head 에 일반 <script> 로 주입한다 */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: 정적 no-flash 스니펫(사용자 입력 아님) */}
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider defaultMode="system">{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

일반 HTML(Vanilla)에서도 동일한 원리로 `<head>` 안, CSS 를 로드하기 전에 같은 스크립트를 인라인으로 넣으면 됩니다.

```html
<head>
  <script>
    (function () {
      try {
        var stored = localStorage.getItem("bt-theme");
        var mode = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
        if (mode === "system") {
          document.documentElement.removeAttribute("data-theme");
        } else {
          document.documentElement.setAttribute("data-theme", mode);
        }
      } catch (e) {}
    })();
  </script>
  <link rel="stylesheet" href="bigtablet.min.css" />
</head>
```

`storageKey`/`targetSelector`/`defaultMode` 를 기본값에서 바꿨다면 스크립트의 `"bt-theme"`, `document.documentElement`, 그리고 저장값이 없을 때의 fallback(위 예시의 `"system"`)도 각각 그 값에 맞춰야 합니다. 예: `defaultMode="light"` 면 fallback 도 `"light"`.

---

## 소비 표면별 사용법

### React

CSS 변수는 `style.css` 를 import 해야 제공됩니다. 컴포넌트 JS 만 import 해서는 색/타이포그래피가 적용되지 않습니다.

```tsx
import { ThemeProvider, Button } from "@bigtablet/design-system";
import "@bigtablet/design-system/style.css";
```

`style.css` (빌드 산출물 `dist/index.css`) 는 컴포넌트 스타일과 `src/styles/theme.scss` 의 `:root` / `[data-theme="dark"]` / `@media (prefers-color-scheme)` CSS 변수 정의를 모두 포함합니다.

### SCSS 소비자

SCSS 변수/믹스인(spacing, radius, typography, motion 등)이 필요하면 토큰 배럴을 `@use` 합니다.

```scss
@use "@bigtablet/design-system/scss/token" as token;

.my-component {
  padding: token.$spacing_md;
  border-radius: token.$radius_md;
}
```

주의할 점: `scss/token` 진입점은 `theme.scss` 를 포함하지 않습니다. `theme.scss` 의 `:root` / `[data-theme]` 규칙이 소비자의 `*.module.scss` 로 새어나가면 CSS Modules 의 pure-selector 검사를 깨뜨리기 때문에 의도적으로 분리되어 있습니다. 따라서 SCSS 변수만 `@use` 해서는 `--bt-color-*` 같은 실제 CSS 변수 값이 따라오지 않고, 이 값은 위 React 섹션의 `style.css` 로만 제공됩니다. SCSS 값과 CSS 변수 값을 함께 써야 한다면 `scss/token` 과 `style.css` 를 둘 다 로드해야 합니다.

### CSS 변수 직접 사용

React/SCSS 빌드 파이프라인 없이 `--bt-color-*` CSS 변수만 직접 참조할 수도 있습니다. `style.css` 를 로드한 뒤 아래와 같은 변수들을 사용합니다 (전체 목록은 `src/styles/theme.scss` 참고).

```css
.my-widget {
  background: var(--bt-color-bg-solid);
  color: var(--bt-color-text-body);
  border: 1px solid var(--bt-color-border-default);
}
```

| 변수 | 용도 |
|------|------|
| `--bt-color-brand-primary` | 브랜드 컬러 (light/dark 동일) |
| `--bt-color-text-heading` / `--bt-color-text-body` / `--bt-color-text-caption` | 텍스트 (제목/본문/캡션) |
| `--bt-color-bg-solid` / `--bt-color-bg-solid-dim` | 배경 |
| `--bt-color-border-default` / `--bt-color-border-hover` | 테두리 |
| `--bt-color-status-error` / `-success` / `-warning` / `-info` | 상태 컬러 |
| `--bt-focus-ring` | 포커스 링 box-shadow |
| `--bt-elevation-level1` ~ `-level5` | elevation shadow |

> 참고: Vanilla JS 패키지(`@bigtablet/design-system/vanilla`)는 `src/vanilla/bigtablet.scss` 에서 동일 토큰을 기반으로 하지만 이름이 다른 자체 `--bt-color-*` 변수 세트를 사용하며(예: `--bt-color-primary`, `--bt-color-background`), 현재 `data-theme`/`prefers-color-scheme` 다크 모드 오버라이드가 없습니다. Vanilla 환경과 React 환경의 CSS 변수는 서로 호환되지 않으니 섞어 쓰지 마세요.

---

## Storybook

`.storybook/preview.ts` 는 `src/styles/theme.scss` 를 직접 import 합니다. `scss/token` 진입점에서 `theme.scss` 가 분리되어 있어, Storybook 에서 컴포넌트 색/다크 모드를 보려면 이 import 가 별도로 필요합니다.

Storybook 은 `ThemeProvider` 를 쓰지 않고 자체 `withTheme` 데코레이터로 `document.documentElement` 에 `data-theme` 를 직접 설정합니다. 툴바의 Theme 토글(light/dark/system)로 `ThemeProvider` 없이도 모든 스토리에서 테마를 바로 전환할 수 있습니다.
