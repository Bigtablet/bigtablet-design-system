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

[**Documentation**](./docs/COMPONENTS.md)&nbsp;&nbsp;·&nbsp;&nbsp;[Storybook](https://bigtablet.github.io/bigtablet-design-system)&nbsp;&nbsp;·&nbsp;&nbsp;[NPM](https://www.npmjs.com/package/@bigtablet/design-system)&nbsp;&nbsp;·&nbsp;&nbsp;[🇰🇷 한국어](./README_KR.md)

</div>

<br />

```tsx
import { ThemeProvider, ToastProvider, Button, useToast } from "@bigtablet/design-system";
// No CSS import needed - each component brings its own CSS plus the shared theme variables,
// so a page that uses only Button ships about 3 kB of DS CSS (gzip) instead of 20 kB.
// Next.js with webpack: add the package to `experimental.optimizePackageImports` (Turbopack needs nothing).

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <SaveButton />
      </ToastProvider>
    </ThemeProvider>
  );
}

// useToast() needs a ToastProvider above it - call it in a child, not where the provider is rendered.
function SaveButton() {
  const toast = useToast();
  return <Button onClick={() => toast.success("Saved")}>Save</Button>;
}
```

A complete React + TypeScript design system maintained by Bigtablet for internal product work. Open-sourced for reference - external use welcome, but minor versions may include breaking changes.

<br />

## What's inside

- **60+ components** across forms, display, feedback, navigation, overlay, and layout<br />
- **13 token domains** - colors, typography, spacing, motion, radius, elevation, and more - exposed as SCSS variables and CSS custom properties (plus a SCSS-only `layout` domain)<br />
- **Light + dark mode** out of the box. `[data-theme="dark"]` or `prefers-color-scheme`, no theme provider required (but available via `ThemeProvider` for runtime toggling)<br />
- **Vanilla JS bundle** for non-React backends - Thymeleaf, JSP, PHP, Django<br />
- **Accessibility tested** with axe-core in CI · keyboard nav · ARIA throughout

<br />

## Install

```bash
pnpm add @bigtablet/design-system react@^19 react-dom@^19 lucide-react
```

Requires React 19 + lucide-react ≥ 0.552. Next.js is an optional peer dependency at `>=15`.

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
<tr><td><b>General</b></td><td>Button · CopyButton · IconButton</td></tr>
<tr><td><b>Forms</b></td><td>Checkbox · Combobox · DateCalendar · DatePicker · DateRangePicker · Dropdown · Field · FileInput · FilterBar · Form · ImageCropper · OtpInput · Radio · RadioGroup · SegmentedControl · TagInput · Textarea · TextField · TimePicker · Toggle</td></tr>
<tr><td><b>Display</b></td><td>Accordion · Avatar · Badge · Card · Chip · DataView · DescriptionList · Divider · Hero · Icon · ListItem · MediaCard · Prose · Stat · Table · Timeline</td></tr>
<tr><td><b>Feedback</b></td><td>Alert (<code>useAlert</code> · <code>useConfirm</code>) · EmptyState · ErrorState · InlineAlert · LinearProgress · Skeleton · Spinner · Toast (<code>useToast</code>) · TopLoading</td></tr>
<tr><td><b>Navigation</b></td><td>BottomNav · Breadcrumb · Menu · NavBar · Pagination · Sidebar · Stepper · Tabs</td></tr>
<tr><td><b>Overlay</b></td><td>Drawer · Modal · Popover · Tooltip</td></tr>
<tr><td><b>Layout</b></td><td>AppShell · Container · Grid · PageHeader · Section · Stack</td></tr>
<tr><td><b>System</b></td><td>LocaleProvider · ThemeProvider</td></tr>
</table>

→&nbsp;Full API · [`docs/COMPONENTS.md`](./docs/COMPONENTS.md)

<br />

## Design tokens

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
/* from @bigtablet/design-system/style.css */
.card {
  background: var(--bt-color-bg-solid);
  color: var(--bt-color-text-heading);
  border: 1px solid var(--bt-color-border-default);
  box-shadow: var(--bt-elevation-level1);
}
```

<!-- css-var-claim: 아래 한 줄이 React entry 의 변수 계열 전부를 주장한다. scripts/check-css-vars.sh 가 이 줄만 검사한다. -->
> The React entry's `style.css` only emits `--bt-color-*`, `--bt-elevation-*`, `--bt-focus-*`, `--bt-sidebar-*`, `--bt-bottom-nav-*`, `--bt-bottom-inset*`, `--bt-scrollbar-width`, `--bt-z-*`, `--bt-radius-*`, `--bt-spacing-*`, `--bt-font-family`. Font size and line height are **SCSS-only** on this entry - use the `scss/token` typography mixins (`--bt-font-size-*` exists only in the [Vanilla bundle](./docs/VANILLA.md)).

`colors`&nbsp;·&nbsp;`spacing`&nbsp;·&nbsp;`typography`&nbsp;·&nbsp;`radius`&nbsp;·&nbsp;`elevation`&nbsp;·&nbsp;`motion`&nbsp;·&nbsp;`z-index`&nbsp;·&nbsp;`breakpoints`&nbsp;·&nbsp;`border-width`&nbsp;·&nbsp;`opacity`&nbsp;·&nbsp;`skeleton`&nbsp;·&nbsp;`icon`&nbsp;·&nbsp;`a11y`&nbsp;·&nbsp;`layout`<sup>SCSS only</sup>

<br />

### Tailwind CSS (v4)

```css
/* app/globals.css - import before tailwindcss so the layer order is fixed first */
@import "@bigtablet/design-system/tailwind.css";
@import "tailwindcss";
```

```tsx
import "@bigtablet/design-system/style.css"; // defines the --bt-* values
<p className="text-bt-text-heading shadow-bt-level2 dark:bg-bt-bg-solid" />
```

`tailwind.css` maps every `--bt-color-*` to `--color-bt-*`, `--bt-elevation-*` / `--bt-focus-ring*` to `--shadow-bt-*`, `--bt-radius-*` to `--radius-bt-*` (`rounded-bt-md`), `--bt-spacing-*` to `--spacing-bt-*` (`p-bt-16`) and `--bt-font-family` to `--font-bt` (`font-bt`) (values stay `var()`, so dark mode and your overrides follow), and makes `dark:` match ThemeProvider (`data-theme="dark"`, or OS dark when `data-theme` is unset). Component CSS lives in the `bigtablet` cascade layer (`theme, base, reset, bigtablet, components, utilities`), so utilities and your own unlayered CSS override it without specificity fights: `<Button className="bg-bt-text-brand" />`. Element-selector resets of your own (`* { padding: 0 }`, `button { background: none }`) and global focus styles (`:focus-visible { outline: 2px solid ... }`) must go in `@layer reset { ... }` - unlayered, they beat every DS component, and a global `:focus-visible` outline is drawn on top of the DS focus ring (a double ring).

<br />

## Vanilla JS

For server-rendered apps (Thymeleaf, JSP, PHP, Django):

```html
<link rel="stylesheet" href="https://unpkg.com/@bigtablet/design-system/dist/vanilla/bigtablet.min.css">
<script src="https://unpkg.com/@bigtablet/design-system/dist/vanilla/bigtablet.min.js"></script>

<button class="bt-button bt-button--md bt-button--filled">Filled</button>
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

The published Storybook lives at **[bigtablet.github.io/bigtablet-design-system](https://bigtablet.github.io/bigtablet-design-system)** and redeploys from `main`.

<br />

## Documentation

| | |
|---|---|
| 📚 [Components](./docs/COMPONENTS.md) | When to use, examples, and props per component |
| 🔄 [Migration](./docs/MIGRATION.md) | Upgrade checklist + what to change per version |
| 🎨 [Theming](./docs/THEMING.md) | Light/dark theme system guide |
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
