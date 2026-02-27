<div align="center">

<img width="1800" height="300" alt="Image" src="https://github.com/user-attachments/assets/420a15cc-5be3-447f-9c64-068e946cb118" /> <br>

# Bigtablet Design System

[![npm version](https://img.shields.io/npm/v/@bigtablet/design-system.svg)](https://www.npmjs.com/package/@bigtablet/design-system)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Test Coverage](https://img.shields.io/badge/coverage-86%25-brightgreen.svg)](https://github.com/Bigtablet/bigtablet-design-system/actions)

[🇰🇷 한국어](./README_KR.md) · 🇺🇸 English

The official design system of Bigtablet — a unified UI library composed of Foundation (design tokens) and UI Components.

[GitHub](https://github.com/Bigtablet/bigtablet-design-system) · [NPM](https://www.npmjs.com/package/@bigtablet/design-system) · [Storybook](https://bigtablet.github.io/bigtablet-design-system)

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
| 🎭 **Storybook** | Interactive documentation for all components |

---

## Installation

```bash
# npm
npm install @bigtablet/design-system

# yarn
yarn add @bigtablet/design-system

# pnpm
pnpm add @bigtablet/design-system
```

**Peer Dependencies**

```bash
npm install react react-dom lucide-react
```

> Recommended for use with **React 18+** and **Next.js 13+**.

---

## Quick Start

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
        helperText="Please enter your work email."
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

In a Next.js environment, import from the `/next` path. `Sidebar` uses `next/link`, so always use this path.

```tsx
// app/layout.tsx
import { Sidebar } from '@bigtablet/design-system/next';
import '@bigtablet/design-system/style.css';

const navItems = [
  { label: 'Home', href: '/home', icon: HomeIcon },
  {
    type: 'group' as const,
    id: 'settings',
    label: 'Settings',
    icon: SettingsIcon,
    children: [
      { label: 'Profile', href: '/settings/profile' },
      { label: 'Security', href: '/settings/security' },
    ],
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar items={navItems} activePath="/home" />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
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
| **General** | `Button`, `Select` |
| **Form** | `TextField`, `Checkbox`, `Radio`, `Switch`, `DatePicker`, `FileInput` |
| **Feedback** | `Alert`, `Toast`, `Spinner`, `TopLoading` |
| **Navigation** | `Pagination`, `Sidebar` |
| **Overlay** | `Modal` |
| **Display** | `Card` |

👉 **[Full Component Docs](./docs/COMPONENTS.md)**

---

## Design Tokens

SCSS tokens and CSS custom properties are provided for a consistent design.

```scss
// SCSS
@use "src/styles/scss/token" as token;

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

[GitHub](https://github.com/Bigtablet/bigtablet-design-system) · [NPM](https://www.npmjs.com/package/@bigtablet/design-system) · [Storybook](https://bigtablet.github.io/bigtablet-design-system) · [Issues](https://github.com/Bigtablet/bigtablet-design-system/issues)

</div>
