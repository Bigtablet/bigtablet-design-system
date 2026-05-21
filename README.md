<div align="center">

<img width="1800" height="300" alt="Bigtablet Design System" src="https://github.com/user-attachments/assets/420a15cc-5be3-447f-9c64-068e946cb118" />

# Bigtablet Design System

Token-based React + TypeScript UI library. Dark mode out of the box. ~40 components.

<p>
  <a href="https://www.npmjs.com/package/@bigtablet/design-system"><img src="https://img.shields.io/npm/v/@bigtablet/design-system.svg?style=flat&color=121212" alt="npm" /></a>
  <a href="https://github.com/Bigtablet/.github/blob/main/BIGTABLET_LICENSE.md"><img src="https://img.shields.io/badge/license-Bigtablet-blue.svg?style=flat" alt="license" /></a>
  <a href="https://github.com/Bigtablet/bigtablet-design-system/actions/workflows/ci.yml"><img src="https://github.com/Bigtablet/bigtablet-design-system/actions/workflows/ci.yml/badge.svg" alt="ci" /></a>
</p>

[Docs](./docs/COMPONENTS.md) · [Storybook](#development) · [NPM](https://www.npmjs.com/package/@bigtablet/design-system) · [🇰🇷 한국어](./README_KR.md)

</div>

> Bigtablet's in-house DS, open-sourced for reference. External use welcome — minor versions may include breaking changes without notice.

---

## Install

```bash
pnpm add @bigtablet/design-system react@^19 react-dom@^19 lucide-react
```

```tsx
import { Button, TextField, Modal } from "@bigtablet/design-system";
import "@bigtablet/design-system/style.css";
```

Requires React 19 + lucide-react ≥ 0.552. Compatible with Next.js 13+.

<details>
<summary>One-line setup (auto-detect)</summary>

```bash
curl -fsSL https://raw.githubusercontent.com/Bigtablet/bigtablet-design-system/main/scripts/setup.sh | sh
```

Detects your package manager (npm / yarn / pnpm / bun) + framework (React / Next.js), installs deps, and prints CSS / Provider setup steps.

</details>

## Providers

Dark mode + Alert/Toast need providers. Wrap your root once:

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

Then use the hooks anywhere:

```tsx
const { showAlert } = useAlert();
const toast = useToast();

toast.success("Saved!");
showAlert({ title: "Delete?", showCancel: true, onConfirm: ... });
```

## Components

**Forms** — Button · IconButton · TextField · Checkbox · Radio · Toggle · Dropdown · DatePicker · FileInput · OTPInput

**Display** — Card · MediaCard · Hero · Avatar · Badge · Chip · ListItem · Table · Divider · Icon · Accordion

**Feedback** — Alert · Toast · Spinner · TopLoading · LinearProgress · Skeleton · EmptyState

**Navigation** — Tabs · Sidebar · NavBar · Breadcrumb · Menu · Pagination

**Overlay** — Modal · Tooltip

**Layout** — Container · Section · Stack · Grid

→ Full API: [`docs/COMPONENTS.md`](./docs/COMPONENTS.md)

## Design tokens

SCSS variables + CSS custom properties — light/dark auto-switching via `[data-theme="dark"]` or `prefers-color-scheme`.

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

Categories: `colors` · `spacing` · `typography` · `radius` · `elevation` · `motion` · `z-index` · `breakpoints` · `border-width` · `opacity` · `a11y`

## Vanilla JS

For non-React environments (Thymeleaf, JSP, PHP, Django):

```html
<link rel="stylesheet" href="https://unpkg.com/@bigtablet/design-system/dist/vanilla/bigtablet.min.css">
<script src="https://unpkg.com/@bigtablet/design-system/dist/vanilla/bigtablet.min.js"></script>

<button class="bt-button bt-button--md bt-button--primary">Primary</button>
```

→ Full guide: [`docs/VANILLA.md`](./docs/VANILLA.md)

## Development

```bash
pnpm install
pnpm storybook        # localhost:6006
pnpm test             # Vitest unit tests
pnpm test:storybook   # a11y + Playwright
pnpm build            # tsup + SCSS copy
```

## Docs

| Doc | About |
|-----|-------|
| [Components](./docs/COMPONENTS.md) | Props API + usage per component |
| [Architecture](./docs/ARCHITECTURE.md) | Project structure + design principles |
| [Contributing](./docs/CONTRIBUTING.md) | Dev setup + workflow |
| [Testing](./docs/TESTING.md) | Test patterns + a11y testing |
| [Vanilla JS](./docs/VANILLA.md) | HTML/CSS/JS integration |

## License

[Bigtablet License](https://github.com/Bigtablet/.github/blob/main/BIGTABLET_LICENSE.md)

---

<div align="center">

[GitHub](https://github.com/Bigtablet/bigtablet-design-system) · [Issues](https://github.com/Bigtablet/bigtablet-design-system/issues) · [NPM](https://www.npmjs.com/package/@bigtablet/design-system)

</div>
