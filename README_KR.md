<div align="center">

<img width="1800" height="300" alt="Bigtablet Design System" src="https://github.com/user-attachments/assets/420a15cc-5be3-447f-9c64-068e946cb118" />

# Bigtablet Design System

토큰 기반 React + TypeScript UI 라이브러리. 다크 모드 기본 내장. 약 40 컴포넌트.

<p>
  <a href="https://www.npmjs.com/package/@bigtablet/design-system"><img src="https://img.shields.io/npm/v/@bigtablet/design-system.svg?style=flat&color=121212" alt="npm" /></a>
  <a href="https://github.com/Bigtablet/.github/blob/main/BIGTABLET_LICENSE.md"><img src="https://img.shields.io/badge/license-Bigtablet-blue.svg?style=flat" alt="license" /></a>
  <a href="https://github.com/Bigtablet/bigtablet-design-system/actions/workflows/ci.yml"><img src="https://github.com/Bigtablet/bigtablet-design-system/actions/workflows/ci.yml/badge.svg" alt="ci" /></a>
</p>

[문서](./docs/COMPONENTS.md) · [Storybook](#개발) · [NPM](https://www.npmjs.com/package/@bigtablet/design-system) · [🇺🇸 English](./README.md)

</div>

> Bigtablet 의 인하우스 디자인 시스템. 커뮤니티 참고용으로 오픈소스화. 외부 사용 환영하지만 minor 버전에 breaking change 가 포함될 수 있음.

---

## 설치

```bash
pnpm add @bigtablet/design-system react@^19 react-dom@^19 lucide-react
```

```tsx
import { Button, TextField, Modal } from "@bigtablet/design-system";
import "@bigtablet/design-system/style.css";
```

React 19 + lucide-react ≥ 0.552 필요. Next.js 13+ 호환.

<details>
<summary>한 줄 설치 (auto-detect)</summary>

```bash
curl -fsSL https://raw.githubusercontent.com/Bigtablet/bigtablet-design-system/main/scripts/setup.sh | sh
```

패키지 매니저 (npm / yarn / pnpm / bun) + 프레임워크 (React / Next.js) 자동 감지 → 패키지 + peer deps 설치 → CSS/Provider 설정 안내 출력.

</details>

## Provider 설정

다크 모드 + Alert/Toast 는 provider 필요. 앱 root 에 한 번 감싸기:

```tsx
import {
  ThemeProvider,
  AlertProvider,
  ToastProvider,
} from "@bigtablet/design-system";

export default function RootLayout({ children }) {
  return (
    <ThemeProvider>
      <AlertProvider>
        <ToastProvider>{children}</ToastProvider>
      </AlertProvider>
    </ThemeProvider>
  );
}
```

이후 어디서든 hook 으로 사용:

```tsx
const { showAlert } = useAlert();
const toast = useToast();

toast.success("저장됨!");
showAlert({ title: "삭제할까요?", showCancel: true, onConfirm: ... });
```

## 컴포넌트

**Forms** — Button · IconButton · TextField · Checkbox · Radio · Toggle · Dropdown · DatePicker · FileInput · OTPInput

**Display** — Card · MediaCard · Hero · Avatar · Badge · Chip · ListItem · Table · Divider · Icon · Accordion

**Feedback** — Alert · Toast · Spinner · TopLoading · LinearProgress · Skeleton · EmptyState

**Navigation** — Tabs · Sidebar · NavBar · Breadcrumb · Menu · Pagination

**Overlay** — Modal · Tooltip

**Layout** — Container · Section · Stack · Grid

→ 전체 API: [`docs/COMPONENTS.md`](./docs/COMPONENTS.md)

## 디자인 토큰

SCSS 변수 + CSS custom property — `[data-theme="dark"]` 또는 `prefers-color-scheme` 으로 라이트/다크 자동 전환.

```scss
@use "src/styles/token" as token;

.my-card {
  background: token.$color_bg_solid;
  color: token.$color_text_heading;
  padding: token.$spacing_16;
  border-radius: token.$radius_md;
}
```

```css
.my-card {
  background: var(--bt-color-bg-solid);
  color: var(--bt-color-text-heading);
  padding: var(--bt-spacing-16);
  border-radius: var(--bt-radius-md);
}
```

카테고리: `colors` · `spacing` · `typography` · `radius` · `elevation` · `motion` · `z-index` · `breakpoints` · `border-width` · `opacity` · `a11y`

## Vanilla JS

비 React 환경 (Thymeleaf, JSP, PHP, Django):

```html
<link rel="stylesheet" href="https://unpkg.com/@bigtablet/design-system/dist/vanilla/bigtablet.min.css">
<script src="https://unpkg.com/@bigtablet/design-system/dist/vanilla/bigtablet.min.js"></script>

<button class="bt-button bt-button--md bt-button--primary">Primary</button>
```

→ 자세히: [`docs/VANILLA.md`](./docs/VANILLA.md)

## 개발

```bash
pnpm install
pnpm storybook        # localhost:6006
pnpm test             # Vitest unit
pnpm test:storybook   # a11y + Playwright
pnpm build            # tsup + SCSS copy
```

## 문서

| 문서 | 내용 |
|-----|------|
| [Components](./docs/COMPONENTS.md) | 컴포넌트별 props API + 사용 예 |
| [Architecture](./docs/ARCHITECTURE.md) | 프로젝트 구조 + 디자인 원칙 |
| [Contributing](./docs/CONTRIBUTING.md) | 개발 환경 + workflow |
| [Testing](./docs/TESTING.md) | 테스트 패턴 + a11y 테스트 |
| [Vanilla JS](./docs/VANILLA.md) | HTML/CSS/JS 통합 가이드 |

## 라이센스

[Bigtablet License](https://github.com/Bigtablet/.github/blob/main/BIGTABLET_LICENSE.md)

---

<div align="center">

[GitHub](https://github.com/Bigtablet/bigtablet-design-system) · [Issues](https://github.com/Bigtablet/bigtablet-design-system/issues) · [NPM](https://www.npmjs.com/package/@bigtablet/design-system)

</div>
