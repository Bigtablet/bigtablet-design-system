<div align="center">

<img width="1800" height="300" alt="Bigtablet Design System" src="https://github.com/user-attachments/assets/420a15cc-5be3-447f-9c64-068e946cb118" />

<br />
<br />

### Bigtablet Design System

Bigtablet 제품을 떠받치는 UI 라이브러리.<br />
명확함을 위해 설계되고, 토큰 위에 세워졌고, 다크 모드를 기본 탑재합니다.

<br />

<p>
  <a href="https://www.npmjs.com/package/@bigtablet/design-system"><img src="https://img.shields.io/npm/v/@bigtablet/design-system?style=for-the-badge&color=121212&labelColor=000" alt="npm" /></a>
  <a href="https://github.com/Bigtablet/.github/blob/main/BIGTABLET_LICENSE.md"><img src="https://img.shields.io/badge/license-Bigtablet-303841?style=for-the-badge&labelColor=000" alt="license" /></a>
  <a href="https://github.com/Bigtablet/bigtablet-design-system/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Bigtablet/bigtablet-design-system/ci.yml?style=for-the-badge&color=10b981&labelColor=000" alt="ci" /></a>
</p>

[**문서**](./docs/COMPONENTS.md)&nbsp;&nbsp;·&nbsp;&nbsp;[Storybook](#개발)&nbsp;&nbsp;·&nbsp;&nbsp;[NPM](https://www.npmjs.com/package/@bigtablet/design-system)&nbsp;&nbsp;·&nbsp;&nbsp;[🇺🇸 English](./README.md)

</div>

<br />

```tsx
import { ThemeProvider, Button, Modal, useToast } from "@bigtablet/design-system";
import "@bigtablet/design-system/style.css";

export default function App() {
  const toast = useToast();
  return (
    <ThemeProvider>
      <Button onClick={() => toast.success("저장됨")}>저장</Button>
    </ThemeProvider>
  );
}
```

Bigtablet 인하우스 React + TypeScript 디자인 시스템. 커뮤니티 참고용으로 오픈소스화. 외부 사용 환영하지만 minor 버전에 breaking change 가 포함될 수 있음.

<br />

## 구성

— **40+ 컴포넌트** — forms, display, feedback, navigation, overlay, layout<br />
— **11 개 토큰 도메인** — colors, typography, spacing, motion, radius, elevation 등. SCSS 변수 + CSS custom property 양쪽 제공<br />
— **라이트 + 다크 모드** 기본 내장. `[data-theme="dark"]` 또는 `prefers-color-scheme` 만으로 동작. 런타임 토글이 필요하면 `ThemeProvider`<br />
— **Vanilla JS 번들** — Thymeleaf, JSP, PHP, Django 등 서버 템플릿 환경 지원<br />
— **접근성 테스트** — CI 에서 axe-core 자동 검증. 키보드 네비 + ARIA 속성 완비

<br />

## 설치

```bash
pnpm add @bigtablet/design-system react@^19 react-dom@^19 lucide-react
```

React 19 + lucide-react ≥ 0.552 필요. Next.js 13+ 호환.

<details>
<summary><b>한 줄 설치</b> — 패키지 매니저 + 프레임워크 자동 감지</summary>

<br />

```bash
curl -fsSL https://raw.githubusercontent.com/Bigtablet/bigtablet-design-system/main/scripts/setup.sh | sh
```

npm / yarn / pnpm / bun + React / Next.js 자동 감지 → 패키지 + peer deps 설치 → CSS / provider 설정 안내 출력.

</details>

<br />

## Provider

```tsx
import { ThemeProvider, AlertProvider, ToastProvider } from "@bigtablet/design-system";

<ThemeProvider>
  <AlertProvider>
    <ToastProvider>{children}</ToastProvider>
  </AlertProvider>
</ThemeProvider>
```

이후 어디서든 hook 으로:

```tsx
const toast = useToast();
const { showAlert } = useAlert();

toast.success("저장됨");
showAlert({ title: "삭제할까요?", showCancel: true, onConfirm: ... });
```

<br />

## 컴포넌트

<table>
<tr><td><b>Forms</b></td><td>Button · IconButton · TextField · Checkbox · Radio · Toggle · Dropdown · DatePicker · FileInput · OTPInput</td></tr>
<tr><td><b>Display</b></td><td>Card · MediaCard · Hero · Avatar · Badge · Chip · ListItem · Table · Divider · Icon · Accordion</td></tr>
<tr><td><b>Feedback</b></td><td>Alert · Toast · Spinner · TopLoading · LinearProgress · Skeleton · EmptyState</td></tr>
<tr><td><b>Navigation</b></td><td>Tabs · Sidebar · NavBar · Breadcrumb · Menu · Pagination</td></tr>
<tr><td><b>Overlay</b></td><td>Modal · Tooltip</td></tr>
<tr><td><b>Layout</b></td><td>Container · Section · Stack · Grid</td></tr>
</table>

→&nbsp;전체 API · [`docs/COMPONENTS.md`](./docs/COMPONENTS.md)

<br />

## 디자인 토큰

```scss
@use "src/styles/token" as token;

.card {
  background: token.$color_bg_solid;
  color: token.$color_text_heading;
  padding: token.$spacing_16;
  border-radius: token.$radius_md;
  box-shadow: token.$elevation_level1;
}
```

```css
.card {
  background: var(--bt-color-bg-solid);
  color: var(--bt-color-text-heading);
  padding: var(--bt-spacing-16);
  border-radius: var(--bt-radius-md);
  box-shadow: var(--bt-elevation-level1);
}
```

`colors`&nbsp;·&nbsp;`spacing`&nbsp;·&nbsp;`typography`&nbsp;·&nbsp;`radius`&nbsp;·&nbsp;`elevation`&nbsp;·&nbsp;`motion`&nbsp;·&nbsp;`z-index`&nbsp;·&nbsp;`breakpoints`&nbsp;·&nbsp;`border-width`&nbsp;·&nbsp;`opacity`&nbsp;·&nbsp;`a11y`

<br />

## Vanilla JS

서버 렌더링 환경 (Thymeleaf, JSP, PHP, Django) :

```html
<link rel="stylesheet" href="https://unpkg.com/@bigtablet/design-system/dist/vanilla/bigtablet.min.css">
<script src="https://unpkg.com/@bigtablet/design-system/dist/vanilla/bigtablet.min.js"></script>

<button class="bt-button bt-button--md bt-button--primary">Primary</button>
```

→&nbsp;자세히 · [`docs/VANILLA.md`](./docs/VANILLA.md)

<br />

## 개발

```bash
pnpm install
pnpm storybook        # localhost:6006
pnpm test             # Vitest unit
pnpm test:storybook   # a11y + Playwright
pnpm build            # tsup + SCSS copy
```

<br />

## 문서

| | |
|---|---|
| 📚 [Components](./docs/COMPONENTS.md) | 컴포넌트별 props API + 사용 예 |
| 🏗️ [Architecture](./docs/ARCHITECTURE.md) | 프로젝트 구조 + 디자인 원칙 |
| 🤝 [Contributing](./docs/CONTRIBUTING.md) | 개발 환경 + workflow |
| 🧪 [Testing](./docs/TESTING.md) | 테스트 패턴 + a11y 테스트 |
| 🌐 [Vanilla JS](./docs/VANILLA.md) | HTML/CSS/JS 통합 가이드 |

<br />

## 라이센스

[Bigtablet License](https://github.com/Bigtablet/.github/blob/main/BIGTABLET_LICENSE.md) 하에 배포.

<br />

<div align="center">

<sub>Made with care by the Bigtablet team.</sub>

<sub>[GitHub](https://github.com/Bigtablet/bigtablet-design-system) · [Issues](https://github.com/Bigtablet/bigtablet-design-system/issues) · [NPM](https://www.npmjs.com/package/@bigtablet/design-system)</sub>

</div>
