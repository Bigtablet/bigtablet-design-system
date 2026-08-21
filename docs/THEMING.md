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
  - [레이아웃·런타임 계약 변수](#레이아웃런타임-계약-변수)
  - [접근성 토큰 — 하드코딩하지 마세요](#접근성-토큰--하드코딩하지-마세요)
  - [하드코딩 대신 쓸 토큰](#하드코딩-대신-쓸-토큰)
- [컴포넌트 마운트 수명](#컴포넌트-마운트-수명)
- [오버레이 스크롤 잠금과 `--bt-scrollbar-width`](#오버레이-스크롤-잠금과---bt-scrollbar-width)
- [자동완성(autofill) 입력칸](#자동완성autofill-입력칸)
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
  padding: token.$spacing_16;
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

### 레이아웃·런타임 계약 변수

위 표는 **테마 토큰**(색·elevation·focus)입니다. 그 외에 컴포넌트가 **레이아웃 계산용으로 내보내는 변수**가 따로 있습니다. 값이 런타임에 바뀌거나 컴포넌트 존재 여부에 따라 달라지므로, SCSS 토큰이 아니라 CSS 변수로만 제공됩니다.

| 변수 | 정의 주체 | 기본값 | 언제 바뀌나 |
|------|----------|--------|------------|
| `--bt-scrollbar-width` | `theme.scss` + 오버레이 잠금 JS | `0px` | Modal·Drawer·Alert 가 열려 body 스크롤이 잠긴 동안 실측 폭. 닫히면 원복 |
| `--bt-bottom-nav-height` | `BottomNav` 스타일시트 | `56px` | 고정 |
| `--bt-bottom-nav-safe-area` | 〃 | `env(safe-area-inset-bottom, 0px)` | 기기·방향 |
| `--bt-bottom-nav-total-height` | 〃 | 위 둘의 합 | 〃 |
| `--bt-sidebar-height` | `Sidebar` 스타일시트 | `56px` | **뷰포트 폭 <600px 에서만 정의** (아래 주의) |
| `--bt-sidebar-safe-area` | 〃 | `env(safe-area-inset-bottom, 0px)` | 〃 |
| `--bt-sidebar-total-height` | 〃 | 위 둘의 합 | 〃 |

#### 존재 여부와 값을 혼동하지 마세요

`--bt-bottom-nav-*` 세 변수는 `:root` 에 선언돼 있고 라이브러리 CSS 는 한 파일이므로, **BottomNav 를 렌더하지 않는 화면에서도 항상 정의돼 있습니다.** 하단 고정 요소에서 그대로 더하면 BottomNav 가 없는 페이지에서도 그만큼 밀립니다.

실제로 하단이 가려진 높이는 `--bt-bottom-inset` 입니다 — 기본 `0px` 이고, `BottomNav` 가 DOM 에 있을 때만 값이 생깁니다.

```css
/* ✅ BottomNav 유무에 따라 알아서 맞는다 */
.my_floating_bar { bottom: calc(16px + var(--bt-bottom-inset)); }

/* ❌ BottomNav 없는 페이지에서도 56px 밀린다 */
.my_floating_bar { bottom: calc(16px + var(--bt-bottom-nav-total-height)); }
```

#### `--bt-sidebar-*` 는 컴포넌트가 아니라 뷰포트에 달려 있습니다

세 변수는 `@media (max-width: 599px)` 안의 `:root` 에서만 정의됩니다. **Sidebar 를 렌더하지 않는 페이지도, `mode="static"`(하단 bar 로 변신하지 않음) Sidebar 도, 폭이 600px 미만이면 값이 존재합니다.** 반대로 데스크탑 폭에서는 Sidebar 가 떠 있어도 정의되지 않습니다.

`--bt-bottom-inset` 같은 "실제로 가려진 높이" 대응 변수가 Sidebar 쪽에는 없으므로, 데스크탑에서 미정의인 것에 대비해 폴백을 두세요.

```css
padding-bottom: var(--bt-sidebar-total-height, 0px);
```

#### 번들에 따라 변수 집합이 다릅니다

React 진입점의 `style.css` 는 `--bt-color-*` · `--bt-elevation-*` · `--bt-focus-*` · `--bt-scrollbar-width` · `--bt-bottom-nav-*` · `--bt-bottom-inset` · `--bt-sidebar-*` 만 내보냅니다. spacing · radius · typography 계열 CSS 변수는 **Vanilla 번들에만** 있습니다. React 쪽에서는 SCSS 토큰(`token.$spacing_16` 등)을 쓰세요.

#### 문서와 실제가 갈리지 않게 하려면

이 목록은 손으로 관리하면 반드시 낡습니다. 빌드 산출물과 대조하는 절차:

```bash
pnpm build
scripts/check-css-vars.sh
```

문서에 적혔지만 어느 번들에도 없는 변수를 찾아냅니다. 현재는 수동 실행이며 CI 에는 연결돼 있지 않습니다.

### 접근성 토큰 — 하드코딩하지 마세요

포커스 표시와 최소 터치 영역에도 토큰이 있습니다. 존재를 몰라 하드코딩하면 다크 모드에서 포커스 링이 보이지 않는 등의 문제가 실제로 생깁니다.

| 토큰 (SCSS) | CSS 변수 | 값 |
|---|---|---|
| `token.$focus_ring` | `--bt-focus-ring` | 포커스 링 box-shadow (light/dark 각각 대비 확보) |
| `token.$focus_ring_error` | `--bt-focus-ring-error` | 에러 상태 포커스 링 |
| `token.$focus_ring_success` | `--bt-focus-ring-success` | 성공 상태 포커스 링 |
| `token.$tap_target_dense` | — | 32px (데스크탑 인라인 폼) |
| `token.$tap_target_compact` | — | 40px (데스크탑 기본) |
| `token.$tap_target_comfortable` | — | 48px (모바일/터치 기본) |
| `token.$tap_target_spacious` | — | 56px (강조 CTA) |

```scss
// ✅
&:focus-visible { outline: none; box-shadow: token.$focus_ring; }

// ❌ 다크 테마에서 검정 배경 위 검정 아웃라인 - 보이지 않는다
&:focus-visible { outline: 2px solid #000; }
```

Storybook 의 `foundation/a11y` 페이지에서 실제 렌더를 확인할 수 있습니다.

### 하드코딩 대신 쓸 토큰

소비 앱 SCSS 를 실측한 결과, 토큰이 이미 있는데도 값을 직접 쓴 곳이 많았습니다. 대부분 **토큰의 존재를 몰라서**입니다.

| 하드코딩 | 실측 건수 | 대신 쓸 것 |
|---|---|---|
| `1px` 경계선 | 190 | `@include token.hairline;` (아래) |
| `font-size: 13px` | 29 | `@include token.label_medium;` (또는 `_medium` / `_bold` 변형) |
| hex 색상 | 55 | `token.$color_*` — 목업 일러스트를 제외하면 대부분 위반 |
| `2px` / `6px` 간격 | 61 / 28 | `token.$spacing_2` / `token.$spacing_6` |

#### `hairline` — 1px 경계선

`border: token.$border_width_standard solid token.$color_border_default` 는 `border: 1px solid #E5E5E5` 보다 길어서 실제로 쓰이지 않았습니다. 짧게 쓸 수 있어야 토큰이 채택됩니다.

```scss
.card   { @include token.hairline; }                            // 사방
.header { @include token.hairline(bottom); }                    // 한 면
.active { @include token.hairline(left, token.$color_border_hover); }
```

두 번째 인자로 색을 바꿀 수 있고, 기본값은 `$color_border_default` 입니다. 두께가 2px 이어야 하는 자리(포커스·선택 인디케이터)는 `token.$border_width_indicator` 를 직접 쓰세요.

#### 타이포는 크기가 아니라 역할로

`font-size` 를 직접 쓰지 말고 semantic mixin 을 쓰면 굵기·행간·자간이 함께 따라옵니다.

| 크기 | mixin |
|---|---|
| 28px | `heading_large` · `heading_large_bold` |
| 24px | `heading_medium` · `heading_medium_bold` |
| 20px | `heading_small` · `heading_small_bold` |
| 18px | `title_large` · `title_large_bold` |
| 16px | `body_large` · `title_medium_bold` |
| 15px | `body_medium` |
| 14px | `body_small` · `label_large` |
| **13px** | **`label_medium`** · `label_medium_medium` · `label_medium_bold` |
| 12px | `label_small` |

`@include token.code` 는 13px 고정폭 조합입니다.

#### 한글 줄바꿈 — `wrap_keep_all`

`word-break: break-word` 는 한글을 **어절 중간에서** 끊습니다 (`안녕하세` / `요`). 게다가 표준값이 아니라 `overflow-wrap: break-word` 로 매핑되는 레거시 값이어서, 쓰는 사람이 의도한 `word-break` 를 사실상 지정하지 못합니다.

```scss
.notice { @include token.wrap_keep_all; }
```

`overflow-wrap: break-word` + `word-break: keep-all` 을 함께 냅니다 — 어절은 지키고, 끊을 수 없는 긴 영문·URL 만 강제로 끊습니다. **텍스트를 줄바꿈하는 모든 자리에서 이것을 쓰세요.** DS 내부의 `Button` · `Toast` · `Tooltip` 도 같은 믹스인을 씁니다.

#### 식별자 판독 — `legible_identifiers`

Pretendard 기본 글자꼴에서 `l` · `I` · `1` 이 거의 같은 모양이고 `0` 과 `O` 도 헷갈립니다. 사용자가 한 글자씩 옮겨 적는 값(아이디·인증코드·시리얼·사업자번호)에는 켜세요.

```scss
.serial { @include token.legible_identifiers; }
```

`TextField` 는 `identifier` prop 으로 같은 처리를 합니다 — 앱이 `.text_field_input` 을 직접 뚫을 필요가 없습니다.

> ⚠️ `legible_identifiers` · `tabular_nums` · `slashed_zero` 는 **셋 다 `font-variant-numeric` 를 건드립니다.** 같은 선택자에 두 개를 쓰면 뒤에 온 것만 적용됩니다. `legible_identifiers` 에는 `slashed-zero` 가 이미 포함되어 있으니 함께 쓰지 마세요. 자릿수 정렬까지 필요하면 `font-variant-numeric: tabular-nums slashed-zero` 를 직접 쓰고 `font-feature-settings` 만 따로 주세요.

#### 스켈레톤

`Skeleton` 의 높이도 토큰입니다 — `token.$skeleton_height_xs`(4px) · `_sm`(8) · `_md`(12) · `_lg`(16) · `_xl`(20). 반경은 `$skeleton_radius_sm/md/lg`.

> 스케일이 20px 에서 끝나므로 그보다 큰 블록(카드·썸네일 자리)은 스켈레톤 높이 토큰이 아니라 해당 요소의 실제 크기를 쓰세요.

---

## 컴포넌트 마운트 수명

애니메이션이 있는 컴포넌트는 **퇴출 스프링이 끝날 때까지 DOM 에 남습니다.** 그래야 페이드아웃이 보입니다. 이 사실이 앱 코드에 영향을 주는 지점이 있습니다.

해당 컴포넌트: `Modal` · `Drawer` · `Popover` · `Tooltip` · `Alert` · `Toast` · `Menu` · `Dropdown`.

**children 을 열림 상태와 같은 값으로 감싸지 마세요.** 감싸면 본문만 먼저 사라지고 껍데기가 페이드아웃되어, 닫힘이 두 단계로 보입니다.

```tsx
// ❌ item 이 null 되는 순간 본문만 사라진다
<Modal open={!!item} onClose={close} title="상세">
  {item && <Body item={item} />}
</Modal>

// ✅ 언마운트가 끝난 뒤 비운다
<Modal open={open} onClose={() => setOpen(false)} onExited={() => setItem(null)} title="상세">
  {item && <Body item={item} />}
</Modal>
```

`onExited` 는 현재 `Modal` 만 제공합니다. 다른 컴포넌트에서는 열림 상태와 데이터를 분리해 두고, 데이터는 다음 열림 때 덮어쓰는 편이 안전합니다.

---

## 오버레이 스크롤 잠금과 `--bt-scrollbar-width`

Modal · Drawer · Alert 가 열리면 배경 스크롤을 잠근다(`body { overflow: hidden }`). 이때 스크롤바가
사라지면서 콘텐츠가 그 폭만큼 넓어져 배경이 튀므로, DS 가 잠금 직전에 스크롤바 폭을 재서 같은 크기의
`body` `padding-right` 로 되돌린다. 소비자가 이미 준 `padding-right` 에 **더하므로** 기존 여백은 유지된다.

잰 폭은 `:root` 의 `--bt-scrollbar-width` 로 노출된다. 잠금 밖에서는 `0px` 이라 `var()` 가 항상 유효하다.

`right` 기준으로 붙여둔 고정 요소는 잠금 중 컨테이닝 블록이 거터만큼 넓어지면서 그 폭만큼 오른쪽으로
밀린다. 오프셋에 이 변수를 더해 제자리에 두면 된다.

```css
/* 원래 오프셋이 있는 경우 (예: 우상단 고정 컨트롤) - calc 로 더한다 */
.app-top-right-controls {
  position: fixed;
  right: calc(16px + var(--bt-scrollbar-width));
}

/* 화면 끝에 붙여둔 경우 */
.my-fab {
  position: fixed;
  right: var(--bt-scrollbar-width);
}
```

### `scrollbar-gutter: stable` 을 쓰는 앱

라우트 전환 시 가로 시프트를 막으려고 `html { scrollbar-gutter: stable }` 을 쓰면, 잠금 중에도 거터가
예약된 채 남는다. `position: fixed` 의 컨테이닝 블록은 그 거터를 제외한 콘텐츠 영역이라 **오버레이가
거터에 닿지 못하고 dim 옆에 밝은 띠가 남는다** - `100vw` · `100dvw` · `100lvw` 로도 넘을 수 없다.

그래서 잠금 동안에는 DS 가 `html` 의 `scrollbar-gutter` 를 `auto` 로 두어 거터를 놓고, 놓은 만큼을
위의 `padding-right` 가 대신 잡는다. 해제 시 인라인 값을 지워 앱의 `stable` 로 돌아간다.

- 오버레이는 전폭(1280 뷰포트에서 1280)을 덮는다
- 콘텐츠 폭은 유지돼 배경이 튀지 않는다
- dim 뒤의 페이지 콘텐츠(`margin: 0 auto` 블록 등)는 위의 `padding-right` 덕에 **제자리에 있다**.
  잠금 중 실제로 눈에 보이는 이동은 이쪽이라 보정이 필수다 - 보정 없이 거터만 놓으면 콘텐츠가
  튀고 모달을 닫을 때 되돌아온다
- 반면 **오버레이 안에서 중앙 정렬되는 패널**은 스크롤바가 없는 실제 화면 중앙을 기준으로 잡히므로
  잠금 전 좌표 대비 `스크롤바폭 / 2`(위 예에서 7.5px) 이동한다. 이건 의도된 동작이다 - 패널은 방금
  나타난 요소라 사용자에게 "움직였다"고 인지될 기준점이 없고, 잠금 중에는 그 위치가 시각적 중앙이다.
  오버레이에 `padding-right` 를 줘서 좌표를 고정하는 방식은 쓰지 않는다: 아무도 못 느끼는 이동 대신
  모달이 열려 있는 내내 보이는 7.5px 비대칭을 사는 거래가 된다 (Radix · MUI · Bootstrap 도 같은 선택)

> 이 처리는 React(`style.css`)와 Vanilla(`/vanilla` CSS·JS) 양쪽에 동일하게 들어 있다. 중첩 오버레이는
> 카운터로 조율해 첫 잠금만 스타일을 바꾸고 마지막 해제만 원복한다 - 카운터 이름은 번들마다
> 다르다 (React `body.dataset.openModals` / Vanilla `body.dataset.btOpenModals`).

## 자동완성(autofill) 입력칸

크롬/사파리는 자동완성으로 채운 칸에 자체 배경(연한 라벤더)과 글자색을 `!important` 로 강제한다.
그대로 두면 그 칸만 옆 칸과 다른 색이 되고, 다크 테마에서는 밝은 상자로 튄다.

`style.css` 가 이걸 대신 막는다 (`src/styles/autofill.scss`). **소비자가 따로 할 일은 없다** -
`@bigtablet/design-system/style.css` 를 이미 import 하고 있으면 자동 적용된다.

| 상태 | 배경 | 글자 |
|---|---|---|
| 기본 | `--bt-color-bg-solid` | `--bt-color-text-heading` |
| `variant="filled"` | `--bt-color-bg-solid-dim` (포커스 시 `bg-solid`) | 동일 |
| `disabled` | `--bt-color-bg-solid-dim` | `--bt-color-text-disabled` |

전부 테마 CSS 변수라 라이트/다크가 자동으로 따라온다. 규칙이 `input` / `textarea` / `select`
요소 셀렉터라 **DS 컴포넌트로 감싸지 않은 native 입력에도 적용된다**.

> UA 배경은 일반 `background-color` 로 이길 수 없어 큰 inset `box-shadow` 로 덮는다. 그 그림자는
> 네모라서 TextField/Textarea 는 자동완성된 칸에서만 컨테이너에 `overflow: hidden` 을 걸어
> 컨테이너 반경으로 자른다(`:has()`). Vanilla(`@bigtablet/design-system/vanilla/style.min.css`)는 입력 요소가 배경과
> `border-radius` 를 직접 갖고 있어 클리핑이 필요 없고, 색 규칙만 동일하게 적용된다.

## Storybook

`.storybook/preview.ts` 는 `src/styles/theme.scss` 를 직접 import 합니다. `scss/token` 진입점에서 `theme.scss` 가 분리되어 있어, Storybook 에서 컴포넌트 색/다크 모드를 보려면 이 import 가 별도로 필요합니다.

Storybook 은 `ThemeProvider` 를 쓰지 않고 자체 `withTheme` 데코레이터로 `document.documentElement` 에 `data-theme` 를 직접 설정합니다. 툴바의 Theme 토글(light/dark/system)로 `ThemeProvider` 없이도 모든 스토리에서 테마를 바로 전환할 수 있습니다.
