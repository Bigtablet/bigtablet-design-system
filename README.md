<div align="center">

<img width="1800" height="300" alt="Image" src="https://github.com/user-attachments/assets/420a15cc-5be3-447f-9c64-068e946cb118" /> <br>

# Bigtablet Design System

[![npm version](https://img.shields.io/npm/v/@bigtablet/design-system.svg)](https://www.npmjs.com/package/@bigtablet/design-system)
[![https://github.com/Bigtablet/.github/blob/main/BIGTABLET_LICENSE.md](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Test Coverage](https://img.shields.io/badge/coverage-86%25-brightgreen.svg)](https://github.com/Bigtablet/bigtablet-design-system/actions)
[![CI](https://github.com/Bigtablet/bigtablet-design-system/actions/workflows/ci.yml/badge.svg)](https://github.com/Bigtablet/bigtablet-design-system/actions/workflows/ci.yml)

[🇰🇷 한국어](./README_KR.md) · 🇺🇸 English

The official design system of Bigtablet — a unified UI library composed of Foundation (design tokens) and UI Components.

> **Note**: This is Bigtablet's in-house design system, open-sourced for community reference.
> External use is welcome, but minor versions may include breaking changes without prior notice.

[GitHub](https://github.com/Bigtablet/bigtablet-design-system) · [NPM](https://www.npmjs.com/package/@bigtablet/design-system)

</div>

---

## Features

| Feature | Description |
|---------|-------------|
| ⚛️ **React 19** | Full support for the latest React version |
| 🔷 **TypeScript** | Complete type definitions for all components |
| 📦 **Dual Bundle** | Separate bundles optimized for Pure React and Next.js |
| 🌐 **Vanilla JS** | Supports non-React environments (Thymeleaf, JSP, PHP, etc.) |
| 🎨 **Design Tokens** | Consistent token-based system for colors, typography, spacing |
| ♿ **Accessibility** | Keyboard navigation, screen reader support, full ARIA attributes |
| 🧪 **86% Coverage** | Stable test coverage powered by Vitest |
| 🎭 **Storybook** | Interactive component documentation (run locally via `pnpm storybook`) |
| 🎯 **Zero Dependencies** | No bundled runtime dependencies — peer deps only |

---

## Installation

### One-line setup (recommended)

Auto-detects your package manager (npm / yarn / pnpm / bun) and environment (React / Next.js), installs the package + peer deps, and prints CSS/Provider setup instructions.

```bash
curl -fsSL https://raw.githubusercontent.com/Bigtablet/bigtablet-design-system/main/scripts/setup.sh | sh
```

### Manual

```bash
# npm
npm install @bigtablet/design-system react@^19 react-dom@^19 lucide-react

# yarn
yarn add @bigtablet/design-system react@^19 react-dom@^19 lucide-react

# pnpm
pnpm add @bigtablet/design-system react@^19 react-dom@^19 lucide-react
```

> Requires **React 19** and **lucide-react ≥ 0.552.0**. Compatible with **Next.js 13+**.

---

## Quick Start

> ⚠️ **Alert** and **Toast** require Providers at the root of your app — see [Provider Setup](#provider-setup) below.

### Pure React

```tsx
import { Button, TextField, Modal } from '@bigtablet/design-system';
import '@bigtablet/design-system/style.css';

function App() {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <TextField
        label="Email"
        placeholder="email@example.com"
        supportingText="Please enter your work email."
      />
      <Button variant="primary" onClick={() => setOpen(true)}>Confirm</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Notice">
        Hello!
      </Modal>
    </div>
  );
}
```

### Next.js

In a Next.js environment, the `/next` entry point is reserved for future Next.js-specific exports. Currently all components are framework-agnostic:

```tsx
// app/layout.tsx
import { Button, TextField, Modal } from '@bigtablet/design-system';
import '@bigtablet/design-system/style.css';
```

### Provider Setup

`Alert` and `Toast` require Providers to be added at the root of your app.

```tsx
// app/layout.tsx or _app.tsx
import { AlertProvider, ToastProvider } from '@bigtablet/design-system';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AlertProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AlertProvider>
      </body>
    </html>
  );
}
```

**Alert usage**

```tsx
import { useAlert } from '@bigtablet/design-system';

function MyComponent() {
  const { showAlert } = useAlert();

  return (
    <Button
      onClick={() =>
        showAlert({
          title: 'Delete',
          message: 'Are you sure you want to delete this?',
          showCancel: true,
          onConfirm: () => console.log('Deleted'),
        })
      }
    >
      Delete
    </Button>
  );
}
```

**Toast usage**

```tsx
import { useToast } from '@bigtablet/design-system';

function MyComponent() {
  const toast = useToast();

  return (
    <div>
      <Button onClick={() => toast.success('Saved successfully!')}>Save</Button>
      <Button onClick={() => toast.error('An error occurred.')}>Error</Button>
      <Button onClick={() => toast.warning('Session expiring soon.')}>Warning</Button>
      <Button onClick={() => toast.info('New version available.')}>Info</Button>
      {/* Custom duration (ms) as second argument */}
      <Button onClick={() => toast.success('Saved!', 5000)}>Save (5s)</Button>
    </div>
  );
}
```

### Vanilla JS (HTML/CSS/JS)

For non-React environments (Thymeleaf, JSP, PHP, etc.), use directly via CDN.

```html
<link rel="stylesheet" href="https://unpkg.com/@bigtablet/design-system/dist/vanilla/bigtablet.min.css">
<script src="https://unpkg.com/@bigtablet/design-system/dist/vanilla/bigtablet.min.js"></script>

<!-- Button -->
<button class="bt-button bt-button--md bt-button--primary">Primary</button>
<button class="bt-button bt-button--md bt-button--secondary">Secondary</button>

<!-- TextField -->
<div class="bt-text-field">
  <label class="bt-text-field__label">Name</label>
  <div class="bt-text-field__wrap">
    <input type="text" class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--md" placeholder="Enter text...">
  </div>
</div>

<!-- Alert (JS API) -->
<script>
  Bigtablet.Alert({
    title: 'Confirm',
    message: 'Do you want to continue?',
    showCancel: true,
    onConfirm: () => console.log('Confirmed'),
  });
</script>
```

---

## Components

| Category | Components |
|----------|------------|
| **General** | `Button`, `Select`, `Chip`, `FAB`, `IconButton` |
| **Form** | `TextField`, `Checkbox`, `Radio`, `Toggle`, `DatePicker`, `FileInput` |
| **Feedback** | `Alert`, `Toast`, `Spinner`, `TopLoading`, `LinearProgress` |
| **Navigation** | `Pagination` |
| **Overlay** | `Modal` |
| **Display** | `Card`, `Divider`, `ListItem` |

👉 **[Full Component Docs](./docs/COMPONENTS.md)**

---

## Design Tokens

SCSS tokens and CSS custom properties are provided for a consistent design.

```scss
// SCSS
@use "src/styles/token" as token;

.my-component {
  color: token.$color_text_primary;
  padding: token.$spacing_md;
  border-radius: token.$radius_md;
}
```

```css
/* CSS Custom Properties */
.my-component {
  color: var(--bt-color-text-primary);
  padding: var(--bt-spacing-md);
  border-radius: var(--bt-radius-md);
}
```

Main token categories: `colors`, `spacing`, `typography`, `radius`, `shadows`, `motion`, `z-index`, `breakpoints`

---

## Documentation

| Document | Description |
|----------|-------------|
| [Components](./docs/COMPONENTS.md) | Component Props API & usage examples |
| [Vanilla JS](./docs/VANILLA.md) | Integration guide for non-React environments |
| [Architecture](./docs/ARCHITECTURE.md) | Project structure & design principles |
| [Contributing](./docs/CONTRIBUTING.md) | Dev setup & contribution guide |
| [Testing](./docs/TESTING.md) | Test writing patterns & guide |

---

## Development

```bash
pnpm install       # Install dependencies
pnpm storybook     # Start Storybook (port 6006)
pnpm build         # Build library
pnpm dev           # Watch mode
pnpm test          # Run tests
pnpm test:storybook # Run a11y tests (Storybook + Playwright)
pnpm test:coverage # Coverage report
```

> Detailed dev setup guide → **[Contributing](./docs/CONTRIBUTING.md)**

---

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 13+ |
| Edge | 80+ |

---

## License

[Bigtablet License](https://github.com/Bigtablet/.github/blob/main/BIGTABLET_LICENSE.md)

---

<div align="center">

[GitHub](https://github.com/Bigtablet/bigtablet-design-system) · [NPM](https://www.npmjs.com/package/@bigtablet/design-system) · [Issues](https://github.com/Bigtablet/bigtablet-design-system/issues)

</div>
