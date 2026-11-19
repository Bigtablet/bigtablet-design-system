<div align="center">

<img width="1800" height="300" alt="Bigtablet Design System" src="https://github.com/user-attachments/assets/420a15cc-5be3-447f-9c64-068e946cb118" />

<br />
<br />

### Bigtablet Design System

Bigtablet 제품을 만드는 UI 라이브러리입니다.<br />
디자인 토큰 위에 만들었고, 다크 모드가 기본으로 들어 있습니다.

<br />

<p>
  <a href="https://www.npmjs.com/package/@bigtablet/design-system"><img src="https://img.shields.io/npm/v/@bigtablet/design-system?style=for-the-badge&color=121212&labelColor=000" alt="npm" /></a>
  <a href="https://github.com/Bigtablet/.github/blob/main/BIGTABLET_LICENSE.md"><img src="https://img.shields.io/badge/license-Bigtablet-303841?style=for-the-badge&labelColor=000" alt="license" /></a>
  <a href="https://github.com/Bigtablet/bigtablet-design-system/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Bigtablet/bigtablet-design-system/ci.yml?style=for-the-badge&color=10b981&labelColor=000" alt="ci" /></a>
</p>

[**문서**](./docs/COMPONENTS.md)&nbsp;&nbsp;·&nbsp;&nbsp;[문서 사이트](https://bigtablet.github.io/bigtablet-design-system/)&nbsp;&nbsp;·&nbsp;&nbsp;[NPM](https://www.npmjs.com/package/@bigtablet/design-system)&nbsp;&nbsp;·&nbsp;&nbsp;[🇺🇸 English](./README.md)

</div>

<br />

```tsx
import { ThemeProvider, ToastProvider, Button, useToast } from "@bigtablet/design-system";
// CSS import 는 필요 없다 - 컴포넌트가 자기 CSS 와 공통 테마 변수를 불러온다.
// Button 만 쓰는 페이지는 DS CSS 가 약 3KB(gzip)만 실린다(전체 20KB).
// Next.js 를 webpack 으로 빌드하면 `experimental.optimizePackageImports` 에 이 패키지를 넣는다(Turbopack 은 그대로).

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <SaveButton />
      </ToastProvider>
    </ThemeProvider>
  );
}

// useToast() 는 위에 ToastProvider 가 있어야 한다 - Provider 를 렌더하는 컴포넌트가 아니라 그 자식에서 부른다.
function SaveButton() {
  const toast = useToast();
  return <Button onClick={() => toast.success("저장됨")}>저장</Button>;
}
```

Bigtablet 사내 React + TypeScript 디자인 시스템입니다. 참고용으로 공개해 두었습니다. 외부에서 써도 괜찮지만, 사내 패키지라 minor 버전에도 하위 호환이 깨지는 변경이 들어갈 수 있습니다 - 올리기 전에 [MIGRATION](./docs/MIGRATION.md#업그레이드-체크리스트) 을 확인하세요.

<br />

## 구성

- **60개 이상의 컴포넌트** - 입력 · 표시 · 피드백 · 내비게이션 · 오버레이 · 레이아웃<br />
- **토큰 도메인 13개** - colors · typography · spacing · motion · radius · elevation 등. SCSS 변수와 CSS 변수(custom property)를 함께 제공합니다 (SCSS 전용 `layout` 도메인은 별도)<br />
- **라이트 · 다크 모드** 기본 내장 - `[data-theme="dark"]` 나 OS 설정(`prefers-color-scheme`)만으로 동작합니다. 화면에서 전환하려면 `ThemeProvider` 를 씁니다<br />
- **Vanilla JS 번들** - Thymeleaf · JSP · PHP · Django 같은 서버 템플릿 환경에서도 씁니다<br />
- **한국어 줄바꿈** - `@bigtablet/design-system/text` 의 `BalancedText` 가 실제 폭을 재서 문장 끝 · 쉼표 뒤에서 줄을 바꿉니다. SSR 앱은 `BalancedTextScript` 로 하이드레이션 전부터 같은 줄로 보입니다. 런타임 의존성은 없습니다<br />
- **AI 에이전트용 문서** - 패키지(`dist/llms`)와 문서 사이트(`llms.txt` · `llms-full.txt`)에 컴포넌트 · 토큰 전체 · 화면 조합 · 쓰지 말 것을 싣습니다<br />
- **접근성 테스트** - CI 가 문서 사이트의 모든 예제를 axe-core 로 검사합니다. 키보드 조작과 ARIA 속성을 갖췄습니다

<br />

## 설치

```bash
pnpm add @bigtablet/design-system react@^19 react-dom@^19 lucide-react
```

React 19 와 lucide-react 0.552 이상이 필요합니다. Next.js 는 선택 peer dependency 로 15 이상입니다.

<details>
<summary><b>한 줄 설치</b> - 패키지 매니저 + 프레임워크 자동 감지</summary>

<br />

```bash
curl -fsSL https://raw.githubusercontent.com/Bigtablet/bigtablet-design-system/main/scripts/setup.sh | sh
```

npm · yarn · pnpm · bun 과 React · Next.js 를 알아서 감지해 패키지와 peer dependency 를 설치하고, Provider 설정 방법을 출력합니다. CSS 는 따로 import 하지 않아도 됩니다 - 컴포넌트를 import 하면 그 CSS 가 함께 실립니다.

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

그 아래 어디서든 hook 으로 부릅니다.

```tsx
const toast = useToast();
const { showAlert } = useAlert();

toast.success("저장됨");
showAlert({ title: "삭제할까요?", showCancel: true, onConfirm: ... });
```

<br />

## 컴포넌트

<table>
<tr><td><b>General</b></td><td>Button · CopyButton · IconButton</td></tr>
<tr><td><b>Forms</b></td><td>Checkbox · Combobox · DateCalendar · DatePicker · DateRangePicker · Dropdown · Field · FileInput · FilterBar · Form · ImageCropper · OtpInput · Radio · RadioGroup · SegmentedControl · TagInput · Textarea · TextField · TimePicker · Toggle</td></tr>
<tr><td><b>Display</b></td><td>Accordion · Avatar · Badge · Card · Chip · DataView · DescriptionList · Divider · Hero · Icon · ListItem · MediaCard · Prose · Stat · Table · Timeline</td></tr>
<tr><td><b>Feedback</b></td><td>Alert (<code>useAlert</code> · <code>useConfirm</code>) · EmptyState · ErrorState · InlineAlert · LinearProgress · Skeleton · Spinner · Toast (<code>useToast</code>) · TopLoading</td></tr>
<tr><td><b>Navigation</b></td><td>BottomNav · Breadcrumb · Menu · NavBar · Pagination · Sidebar · Stepper · Tabs</td></tr>
<tr><td><b>Overlay</b></td><td>Drawer · Modal · Popover · Tooltip</td></tr>
<tr><td><b>Layout</b></td><td>AppShell · Container · Grid · PageHeader · Section · Stack</td></tr>
<tr><td><b>System</b></td><td>LocaleProvider · ThemeProvider</td></tr>
</table>

→&nbsp;전체 API · [`docs/COMPONENTS.md`](./docs/COMPONENTS.md)

<br />

## 디자인 토큰

```scss
@use "@bigtablet/design-system/scss/token" as token;

.card {
  background: token.$color_bg_solid;
  color: token.$color_text_heading;
  padding: token.$spacing_16;
  border-radius: token.$radius_md;
  box-shadow: token.$elevation_level1;
}
```

```css
/* @bigtablet/design-system/style.css 에서 제공 */
.card {
  background: var(--bt-color-bg-solid);
  color: var(--bt-color-text-heading);
  border: 1px solid var(--bt-color-border-default);
  box-shadow: var(--bt-elevation-level1);
}
```

<!-- css-var-claim: 아래 한 줄이 React entry 의 변수 계열 전부를 주장합니다. scripts/check-css-vars.sh 가 이 줄만 검사합니다. -->
> React entry 의 `style.css` 가 내보내는 CSS 변수는 `--bt-color-*`, `--bt-elevation-*`, `--bt-focus-*`, `--bt-sidebar-*`, `--bt-bottom-nav-*`, `--bt-bottom-inset*`, `--bt-scrollbar-width`, `--bt-z-*`, `--bt-radius-*`, `--bt-spacing-*`, `--bt-font-family` 뿐입니다. 글자 크기·줄 높이는 이 entry 에선 **SCSS 전용**이라 `scss/token` 타이포 믹스인을 써야 합니다 (`--bt-font-size-*` 는 [Vanilla 번들](./docs/VANILLA.md) 에만 존재).

`colors`&nbsp;·&nbsp;`spacing`&nbsp;·&nbsp;`typography`&nbsp;·&nbsp;`radius`&nbsp;·&nbsp;`elevation`&nbsp;·&nbsp;`motion`&nbsp;·&nbsp;`z-index`&nbsp;·&nbsp;`breakpoints`&nbsp;·&nbsp;`border-width`&nbsp;·&nbsp;`opacity`&nbsp;·&nbsp;`skeleton`&nbsp;·&nbsp;`icon`&nbsp;·&nbsp;`a11y`&nbsp;·&nbsp;`layout`<sup>SCSS 전용</sup>

<br />

### Tailwind CSS (v4)

```css
/* app/globals.css - 레이어 순서를 먼저 고정하도록 tailwindcss 보다 앞에 */
@import "@bigtablet/design-system/tailwind.css";
@import "tailwindcss";
```

```tsx
import "@bigtablet/design-system/style.css"; // --bt-* 값 정의
<p className="text-bt-text-heading shadow-bt-level2 dark:bg-bt-bg-solid" />
```

`tailwind.css` 는 `--bt-color-*` 를 `--color-bt-*` 로, `--bt-elevation-*` · `--bt-focus-ring*` 를 `--shadow-bt-*` 로, `--bt-radius-*` 를 `--radius-bt-*`(`rounded-bt-md`)로, `--bt-spacing-*` 를 `--spacing-bt-*`(`p-bt-16`)로, `--bt-font-family` 를 `--font-bt`(`font-bt`)로 매핑합니다(값은 `var()` 그대로라 다크 모드와 소비자 덮어쓰기를 따라갑니다). `dark:` 는 ThemeProvider 규칙(`data-theme="dark"`, 또는 `data-theme` 이 없을 때 OS 다크)과 같습니다. 컴포넌트 CSS 는 `bigtablet` cascade layer(`theme, base, reset, bigtablet, components, utilities`) 안에 있어 유틸리티와 소비자의 레이어 밖 CSS 가 특이도 싸움 없이 덮습니다: `<Button className="bg-bt-text-brand" />`. 소비자의 요소 선택자 리셋(`* { padding: 0 }`, `button { background: none }`)과 전역 포커스 스타일(`:focus-visible { outline: 2px solid ... }`)은 `@layer reset { ... }` 에 넣어야 합니다 - 레이어 밖에 두면 모든 DS 컴포넌트를 이기고, 전역 `:focus-visible` outline 이 DS 포커스 링 위에 겹쳐 그려집니다(이중 링).

<br />

## Vanilla JS

React 없이 서버 템플릿(Thymeleaf · JSP · PHP · Django)에서 씁니다.

```html
<!-- @4 는 4.x 최신을 받습니다. 화면을 고정하려면 @4.9.1 처럼 정확한 버전을 씁니다 -->
<link rel="stylesheet" href="https://unpkg.com/@bigtablet/design-system@4/dist/vanilla/bigtablet.min.css">
<script src="https://unpkg.com/@bigtablet/design-system@4/dist/vanilla/bigtablet.min.js"></script>

<button class="bt-button bt-button--md bt-button--filled">Filled</button>
```

→&nbsp;자세히 · [`docs/VANILLA.md`](./docs/VANILLA.md)

<br />

## 개발

```bash
pnpm install
pnpm site             # 문서 사이트, localhost:6007
pnpm test             # Vitest unit
pnpm test:browser     # a11y (문서 예제 axe) + 레이아웃, Playwright
pnpm build            # tsup + SCSS copy + Vanilla + tailwind.css + dist/llms
```

문서 사이트는 **[bigtablet.github.io/bigtablet-design-system](https://bigtablet.github.io/bigtablet-design-system/)** 에 있고 `main` 기준으로 재배포됩니다.

<br />

## 문서

| | |
|---|---|
| 📚 [Components](./docs/COMPONENTS.md) | 컴포넌트별 고르는 법 · 예제 · props |
| 🔄 [Migration](./docs/MIGRATION.md) | 업그레이드 체크리스트 · 버전별 고칠 것 |
| 🎨 [Theming](./docs/THEMING.md) | 라이트 · 다크 테마, CSS 변수 |
| 🏗️ [Architecture](./docs/ARCHITECTURE.md) | 프로젝트 구조 · 설계 원칙 |
| 🤝 [Contributing](./docs/CONTRIBUTING.md) | 개발 환경 · 작업 순서 |
| 🧪 [Testing](./docs/TESTING.md) | 테스트 작성법 · 접근성 테스트 |
| 🌐 [Vanilla JS](./docs/VANILLA.md) | HTML · CSS · JS 환경 가이드 |
| 🤖 [Agent Guide](./docs/AGENT_GUIDE.md) | AI 에이전트 규칙. 생성 문서는 `node_modules/@bigtablet/design-system/dist/llms/index.md` · [llms.txt](https://bigtablet.github.io/bigtablet-design-system/llms.txt) |

<br />

## 라이센스

[Bigtablet License](https://github.com/Bigtablet/.github/blob/main/BIGTABLET_LICENSE.md) 로 배포합니다.

<br />

<div align="center">

<sub>Made with care by the Bigtablet team.</sub>

<sub>[GitHub](https://github.com/Bigtablet/bigtablet-design-system) · [Issues](https://github.com/Bigtablet/bigtablet-design-system/issues) · [NPM](https://www.npmjs.com/package/@bigtablet/design-system)</sub>

</div>
