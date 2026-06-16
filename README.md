<div align="center">

<img width="1800" height="300" alt="Bigtablet Design System" src="https://github.com/user-attachments/assets/420a15cc-5be3-447f-9c64-068e946cb118" />

<br />
<br />

### Bigtablet Design System

The unified UI library powering Bigtablet products.<br />
Crafted for clarity. Built on tokens. Ships with dark mode.

<br />

<p>
  <a href="https://www.npmjs.com/package/@bigtablet/design-system"><img src="https://img.shields.io/npm/v/@bigtablet/design-system?style=for-the-badge&color=121212&labelColor=000" alt="npm" /></a>
  <a href="https://github.com/Bigtablet/.github/blob/main/BIGTABLET_LICENSE.md"><img src="https://img.shields.io/badge/license-Bigtablet-303841?style=for-the-badge&labelColor=000" alt="license" /></a>
  <a href="https://github.com/Bigtablet/bigtablet-design-system/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Bigtablet/bigtablet-design-system/ci.yml?style=for-the-badge&color=10b981&labelColor=000" alt="ci" /></a>
</p>

[**Documentation**](./docs/COMPONENTS.md)&nbsp;&nbsp;·&nbsp;&nbsp;[Storybook](#development)&nbsp;&nbsp;·&nbsp;&nbsp;[NPM](https://www.npmjs.com/package/@bigtablet/design-system)&nbsp;&nbsp;·&nbsp;&nbsp;[🇰🇷 한국어](./README_KR.md)

</div>

<br />

```tsx
import { ThemeProvider, Button, Modal, useToast } from "@bigtablet/design-system";
import "@bigtablet/design-system/style.css";

export default function App() {
  const toast = useToast();
  return (
    <ThemeProvider>
      <Button onClick={() => toast.success("Saved")}>Save</Button>
    </ThemeProvider>
  );
}
```

A complete React + TypeScript design system maintained by Bigtablet for internal product work. Open-sourced for reference - external use welcome, but minor versions may include breaking changes.

<br />

## What's inside

- **40+ components** across forms, display, feedback, navigation, overlay, and layout<br />
- **11 token domains** - colors, typography, spacing, motion, radius, elevation, and more - exposed as SCSS variables and CSS custom properties<br />
- **Light + dark mode** out of the box. `[data-theme="dark"]` or `prefers-color-scheme`, no theme provider required (but available via `ThemeProvider` for runtime toggling)<br />
- **Vanilla JS bundle** for non-React backends - Thymeleaf, JSP, PHP, Django<br />
- **Accessibility tested** with axe-core in CI · keyboard nav · ARIA throughout

<br />

## Install

```bash
pnpm add @bigtablet/design-system react@^19 react-dom@^19 lucide-react
```

Requires React 19 + lucide-react ≥ 0.552. Compatible with Next.js 13+.

<details>
<summary><b>One-line setup</b> - auto-detect package manager + framework</summary>

<br />

```bash
curl -fsSL https://raw.githubusercontent.com/Bigtablet/bigtablet-design-system/main/scripts/setup.sh | sh
```

Detects npm / yarn / pnpm / bun and React / Next.js, installs deps, prints CSS + provider setup steps.

</details>

<br />

## Providers

```tsx
import { ThemeProvider, AlertProvider, ToastProvider } from "@bigtablet/design-system";

<ThemeProvider>
  <AlertProvider>
    <ToastProvider>{children}</ToastProvider>
  </AlertProvider>
</ThemeProvider>
```

Use the hooks anywhere:

```tsx
const toast = useToast();
const { showAlert } = useAlert();

toast.success("Saved");
showAlert({ title: "Delete?", showCancel: true, onConfirm: ... });
```

<br />

## Components

<table>
<tr><td><b>Forms</b></td><td>Button · IconButton · TextField · Textarea · Checkbox · Radio · Toggle · Dropdown · DatePicker · FileInput · OTPInput</td></tr>
<tr><td><b>Display</b></td><td>Card · MediaCard · Hero · Avatar · Badge · Chip · ListItem · Table · Divider · Icon · Accordion</td></tr>
<tr><td><b>Feedback</b></td><td>Alert · Toast · Spinner · TopLoading · LinearProgress · Skeleton · EmptyState · ErrorState</td></tr>
<tr><td><b>Navigation</b></td><td>Tabs · Sidebar · BottomNav · NavBar · Breadcrumb · Menu · Pagination</td></tr>
<tr><td><b>Overlay</b></td><td>Modal · Tooltip</td></tr>
<tr><td><b>Layout</b></td><td>Container · Section · Stack · Grid</td></tr>
</table>

→&nbsp;Full API · [`docs/COMPONENTS.md`](./docs/COMPONENTS.md)

<br />

## Design tokens

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

For server-rendered apps (Thymeleaf, JSP, PHP, Django):

```html
<link rel="stylesheet" href="https://unpkg.com/@bigtablet/design-system/dist/vanilla/bigtablet.min.css">
<script src="https://unpkg.com/@bigtablet/design-system/dist/vanilla/bigtablet.min.js"></script>

<button class="bt-button bt-button--md bt-button--primary">Primary</button>
```

→&nbsp;Full guide · [`docs/VANILLA.md`](./docs/VANILLA.md)

<br />

## Development

```bash
pnpm install
pnpm storybook        # localhost:6006
pnpm test             # Vitest unit
pnpm test:storybook   # a11y + Playwright
pnpm build            # tsup + SCSS copy
```

<br />

## Documentation

| | |
|---|---|
| 📚 [Components](./docs/COMPONENTS.md) | Props API + usage per component |
| 🏗️ [Architecture](./docs/ARCHITECTURE.md) | Project structure + design principles |
| 🤝 [Contributing](./docs/CONTRIBUTING.md) | Dev setup + workflow |
| 🧪 [Testing](./docs/TESTING.md) | Test patterns + a11y testing |
| 🌐 [Vanilla JS](./docs/VANILLA.md) | HTML/CSS/JS integration |

<br />

## License

Licensed under the [Bigtablet License](https://github.com/Bigtablet/.github/blob/main/BIGTABLET_LICENSE.md).

<br />

<div align="center">

<sub>Made with care by the Bigtablet team.</sub>

<sub>[GitHub](https://github.com/Bigtablet/bigtablet-design-system) · [Issues](https://github.com/Bigtablet/bigtablet-design-system/issues) · [NPM](https://www.npmjs.com/package/@bigtablet/design-system)</sub>

</div>
