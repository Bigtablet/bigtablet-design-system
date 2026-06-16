# Bigtablet Design System - Agent Guide

> Prompt-ready reference for AI coding agents building UIs with `@bigtablet/design-system@^3.0.0`. Load this file as context before generating any component code.

**Version:** 3.0.0
**React:** 19+ required
**Bundle:** Pure React (`@bigtablet/design-system`) or Vanilla JS (`@bigtablet/design-system/vanilla`)

---

## Philosophy

- **Token-first.** Never hardcode colors, spacing, radius, or shadows. Always reference tokens.
- **Dark mode is mandatory.** Every UI must work in both themes. Tokens auto-flip via `[data-theme="dark"]` or `prefers-color-scheme`.
- **Components compose.** Build pages from `Container > Section > Stack/Grid > primitives`. Don't reach for raw `<div>` styling.
- **Accessibility is non-negotiable.** Buttons need labels, modals trap focus, interactive elements have `:focus-visible` rings.

---

## Install & Bootstrap

```bash
pnpm add @bigtablet/design-system react@^19 react-dom@^19 lucide-react
```

```tsx
// app entry - providers wrap the tree once
import {
  ThemeProvider,
  AlertProvider,
  ToastProvider,
} from "@bigtablet/design-system";
import "@bigtablet/design-system/style.css";

export default function RootLayout({ children }) {
  return (
    <ThemeProvider defaultMode="system">
      <AlertProvider>
        <ToastProvider>{children}</ToastProvider>
      </AlertProvider>
    </ThemeProvider>
  );
}
```

Providers needed:
- `ThemeProvider` - required for runtime dark mode toggle via `useTheme()`. If you only need OS-preference-based dark mode, you can omit it (CSS handles it).
- `AlertProvider` - required for `useAlert()` confirmation dialogs.
- `ToastProvider` - required for `useToast()` snackbar notifications.

---

## Design Tokens

All tokens are CSS custom properties prefixed with `--bt-color-*`, `--bt-spacing-*`, etc. Always reference them - never inline a hex value.

### Color tokens

| Token | Light | Dark | When to use |
|-------|-------|------|-------------|
| `--bt-color-bg-solid` | white | navy_900 | Page/card background |
| `--bt-color-bg-solid-dim` | neutral_50 | navy_800 | Elevated surface (panels, dimmed sections) |
| `--bt-color-text-heading` | neutral_900 | white | Primary headings, body emphasis |
| `--bt-color-text-body` | neutral_700 | navy_200 | Body text, descriptions |
| `--bt-color-text-caption` | neutral_500 | neutral_400 | Captions, helper text, placeholders |
| `--bt-color-border-default` | neutral_200 | navy_700 | Card borders, dividers |
| `--bt-color-border-hover` | neutral_400 | navy_400 | Hover state borders |
| `--bt-color-brand-primary` | #121212 | #121212 (same) | Button "filled" bg (intentional, both themes) |
| `--bt-color-brand-on-primary` | white | white (same) | Text on `brand-primary` |
| `--bt-color-accent-default` | #121212 | white | Indicators that flip in dark (checked checkboxes, active progress) |
| `--bt-color-accent-on-surface` | white | #121212 | Text/icon on top of `accent-default` |
| `--bt-color-status-success` | green | green (same) | Success states |
| `--bt-color-status-warning` | amber | amber (same) | Warning states |
| `--bt-color-status-error` | red | red (same) | Error states, destructive actions |
| `--bt-color-status-info` | blue | blue (same) | Informational states |
| `--bt-color-state-hover-on-light` | alpha black 5% | alpha white 8% | Hover overlay on light/elevated surface |
| `--bt-color-state-focus-on-light` | alpha black 8% | alpha white 12% | Focus overlay |
| `--bt-color-state-pressed-on-light` | alpha black 12% | alpha white 12% | Pressed overlay |

**Key distinction:** `brand-primary` stays dark in both themes (for Button filled). `accent-default` FLIPS to white in dark mode (for indicators that need contrast against page bg). Pick the right one for the context.

### Spacing

`--bt-spacing-4` (4px) through `--bt-spacing-48` (48px). Standard scale: 4, 8, 12, 16, 20, 24, 32, 40, 48.

### Radius

`--bt-radius-xs` (2px), `-sm` (6px), `-md` (8px), `-lg` (12px), `-xl` (16px), `-full` (9999px).

### Elevation

`--bt-elevation-level1` through `-level5`. Light = subtle dark drops. Dark = stronger blacks with larger spread for visibility on navy.

### Motion

```scss
$transition_fast    // 0.1s ease-in-out - color/border micro-changes
$transition_base    // 0.2s ease-in-out - bg/transform normal interactions
$transition_slow    // 0.3s ease-in-out - panel expansion
```

Easing pair for entrance/exit:
- `$easing_enter` - `cubic-bezier(0.16, 1, 0.3, 1)` (out-expo)
- `$easing_exit` - `cubic-bezier(0.4, 0, 1, 1)` (ease-in)

Composite shorthands `$transition_enter_*` / `$transition_exit_*` already include easing - do NOT add another easing or CSS parse fails.

### Inline style usage

```tsx
// ✓ Correct
<div style={{ background: "var(--bt-color-bg-solid-dim)", padding: "var(--bt-spacing-16)" }} />

// ✗ Never
<div style={{ background: "#F2F5F8", padding: 16 }} />
```

---

## Dark Mode Rules

1. **Trigger:** `[data-theme="dark"]` attribute on `<html>` (via `ThemeProvider`) OR system `prefers-color-scheme: dark`. Both work automatically.

2. **Use adaptive tokens for theme-aware UI.** Most tokens auto-flip. Hardcoded hex breaks dark mode.

3. **Indicator color rule:**
   - If element must be **black in light AND dark** (e.g., filled button bg) → `brand-primary`
   - If element should be **black in light, white in dark** (e.g., checkbox checked bg) → `accent-default`
   - Pair `accent-default` with `accent-on-surface` for the foreground (auto-inverts)

4. **Panel elevation in dark mode:**
   - Page bg: `bg-solid` (navy_900)
   - Elevated panel (dropdown, menu, modal): use the conditional pattern below

   ```scss
   .my-panel {
     background: var(--bt-color-bg-solid);  // white in light

     [data-theme="dark"] & {
       background: var(--bt-color-bg-solid-dim);  // navy_800 (lighter than canvas)
     }
     @media (prefers-color-scheme: dark) {
       :root:not([data-theme]) & {
         background: var(--bt-color-bg-solid-dim);
       }
     }
   }
   ```

5. **Hardcoded whites/darks are allowed for intentional fixed surfaces:**
   - Navy gradient avatars (decorative, brand-colored)
   - Hero `_overlay_navy` (always dark gradient)
   - Tooltip body (`accent-strong` token already handles theme)
   - Destructive red modal buttons

   Everything else: tokens.

6. **`color-scheme: dark`** is already set on `[data-theme="dark"]` root - browser native UI (scrollbars, form controls) adapts automatically.

---

## Component Catalog

Organized by category. **Always** import from the package root (`@bigtablet/design-system`), never deep paths.

### Forms

| Component | Purpose | Key props |
|-----------|---------|-----------|
| `Button` | Primary action button. | `variant` (filled/outline/tonal/text), `size` (sm/md/lg/xl), `danger`, `radius`, `leadingIcon`, `trailingIcon`, `fullWidth` |
| `IconButton` | Icon-only button. | `variant` (standard/filled/tonal/outlined), `size` (sm/md), `icon`, `aria-label` (required) |
| `TextField` | Single-line text input with label. | `label`, `placeholder`, `supportingText`, `error`, `size`, `leadingIcon`, `clearable`, `onChangeAction` (value callback), `imeStrategy` (delayed/immediate - use `immediate` for live search w/ Korean IME) |
| `Textarea` | Multi-line text input. | `label`, `placeholder`, `supportingText`, `error`, `size`, `rows`, `minRows`/`maxRows` (auto-grow), `maxLength` + `showCounter`, `resize` (none/vertical/both), `onChangeAction`, `imeStrategy`. Same tokens/visuals as TextField. |
| `Checkbox` | Boolean selection. | `checked`, `indeterminate`, `disabled`, `error`, `label` |
| `Radio` | Single from group. | Inside a `<fieldset>` for grouping. `value`, `checked`, `name` |
| `Toggle` | On/off switch. | `checked`, `size` (sm/md), `disabled` |
| `Dropdown` | Value-selection menu. | `options`, `value`, `onChange`, `label`, `supportingText`, `placeholder`, `size`. Block-level - fills parent. |
| `DatePicker` | Year/month/day select. | `value`, `onChange`, `mode` (year-month/year-month-day), `min`, `max`, `fullWidth` |
| `FileInput` | File upload. | `variant` (button/preview), `multiple`, `accept`, `onFiles`, `previewSize` (for preview variant), `disabled` |
| `OTPInput` | Single-digit code boxes. | `length`, `value`, `onChange`, `autoFocus`, `error` |

### Display

| Component | Purpose | Key props |
|-----------|---------|-----------|
| `Card` | Generic container. | `bordered`, `shadow` (none/sm/md/lg), `padding` (none/sm/md/lg), `variant` (default/accent) |
| `MediaCard` | Image + content card. | `heading`, `eyebrow`, `description`, `media` (URL), `clickable`, `shadow` |
| `Hero` | Page-top hero section. | `title`, `subtitle`, `eyebrow`, `backgroundImage`, `overlay` (dark/light/navy), `height` (sm/md/lg/full), `align`, `textColor` (auto/inverse/default), `primaryAction`, `secondaryAction` |
| `Avatar` | User profile circle. | `name` (initials fallback), `src`, `size` (sm/md/lg), `shape` (circle/square) |
| `Badge` | Number/status pill. | `shape` (dot/count/label), `variant` (accent/neutral/info/success/warning/error), `appearance` (solid/soft - soft = tint bg + dark text, both WCAG AA), `count` |
| `Chip` | Tag/category pill. | `type` (interactive/static), `tone` (default/accent/info/success/warning/error - static only), `size` (sm/md), `selected`, `removable`, `leadingIcon` |
| `ListItem` | Single row in a list. | `label`, `overline`, `supportingText`, `metadata`, `leadingElement`, `trailingElement`, `alignment` (auto-detects OneLine → middle), `onClick`, `selected` |
| `Table` | Data table. | `columns`, `data`, `keyExtractor`, `size` (sm/md/lg), `isLoading`, `stickyHeader`, `onRowClick`, `emptyMessage`. Clickable rows get keyboard support automatically. |
| `Divider` | Horizontal/vertical line. | `orientation` |
| `Icon` | Lucide icon wrapper. | `icon` (lucide-react component), `size`, `strokeWidth`, `aria-label` |
| `Accordion` | Expandable disclosure. | `items` array with `id`/`trigger`/`content`. Hover bg works in any open state. |

### Feedback

| Component | Purpose | Key props |
|-----------|---------|-----------|
| `Alert` (via `useAlert`) | Confirm/alert dialog. | `showAlert({ title, message, variant, showCancel, destructive, onConfirm, onCancel })` |
| `Toast` (via `useToast`) | Transient notification. | `toast.success("...")` / `.error(...)` / `.warning(...)` / `.info(...)` / `.message(...)`. Second arg = duration ms. |
| `Spinner` | Inline loading indicator. | `size` (px), `ariaLabel`. Vercel-style 12-bar fade. |
| `TopLoading` | Top-of-page progress bar. | `progress` (0-100, or undefined for indeterminate), `height`, `color`, `isLoading`, `ariaLabel` |
| `LinearProgress` | Step progress with dots. | `totalSteps`, `currentStep`, `aria-label`. Renders N+1 checkpoints. |
| `Skeleton` | Loading placeholder. | `variant` (text/title/avatar/rect), `width`, `height`, `radius` |
| `EmptyState` | "Nothing here" block. | `illustration`, `title`, `description`, `action`, `size` (sm/md/lg). Vertically centers when parent is flex column. |
| `ErrorState` | Error block (boundary / load failure). | `title` (default "문제가 발생했습니다"), `description`, `icon` (default warning, `null` to hide), `action` (retry button), `variant` (page = full-area fallback / widget = inline compact). Uses `status-error` token, `role="alert"`. |

### Navigation

| Component | Purpose | Key props |
|-----------|---------|-----------|
| `Tabs` | Compound tab pattern. | Wrap `Tab` items in `TabList`; render content via `TabPanel`. `defaultValue` (uncontrolled), `value`/`onValueChange` (controlled). Variants `line` (default) / `fills`. |
| `Sidebar` | Admin left nav. | `header`, `headerCollapsed` (collapse crossfade), `footer`, `collapsed`, `collapsible`, `collapsedWidth`, `mode` (auto/static - auto transforms to bottom bar <600px). Children = `SidebarSection` + `SidebarItem`. |
| `BottomNav` | Mobile bottom nav bar. | 2–5 `BottomNavItem` (`icon`, `label`, `active`, `badge`, `as`/`href`). `position: fixed; bottom: 0` + iOS safe-area. Use `BottomNavSpacer` at page end to avoid content overlap. mobile-first flat nav. |
| `NavBar` | Top nav. | `brand`, `actions`, `variant` (default/transparent/accent), `layout` (contained/fluid). Children = `NavLink`. Sliding active indicator built in. |
| `Breadcrumb` | Page path nav. | `items` array (`label`, `href`, `current`). |
| `Menu` | Action menu (context/kebab). | `trigger` element, `items` (key/label/icon/onSelect/destructive/disabled), `align` (start/end). Trigger components MUST forward props (`<button {...props}>`). |
| `Pagination` | Page number nav. | `page`, `pageCount`, `onChange`, `siblingCount`. Cursor pointer baked in. |

### Overlay

| Component | Purpose | Key props |
|-----------|---------|-----------|
| `Modal` | Centered dialog. | `open`, `onClose`, `title`, `description`, `footer`, `footerAlign` (end/between/start), `showCloseIcon` (default true), `width`, `closeOnOverlay`. X close icon top-right by default. |
| `Tooltip` | Hover info. | `content`, `placement` (top/bottom/left/right), `delay`, `disabled`. Children = single trigger element. Long text wraps with `text-align: center`, max-width 240px. |

### Layout

| Component | Purpose | Key props |
|-----------|---------|-----------|
| `Container` | Centered max-width wrapper. | `size` (sm/md/lg/xl/full), `padding` |
| `Section` | Page section with vertical rhythm. | `spacing` (xs/sm/md/lg/xl), `bg` (default/dim/accent/navy/transparent) |
| `Stack` | 1D flex layout. | `direction` (horizontal/vertical), `gap`, `align`, `justify`, `wrap` |
| `Grid` | CSS Grid layout. | `cols` (number or "auto"), `gap`, `minColWidth` (when `cols="auto"`) |

### Foundation

- `ThemeProvider` - wraps app for runtime theme control. `defaultMode` (light/dark/system).
- `useTheme()` - returns `{ mode, resolved, setMode }`. (`resolved` is the concrete `"light"`/`"dark"` after resolving `"system"`.)

---

## Animation

**All entrance/exit animations on overlays use `react-spring`.** Don't reach for CSS keyframes.

### Built-in motion (just use the components)
- Modal, Alert: overlay fade + panel scale-translate spring
- Dropdown, Menu, Tooltip: pop-in spring
- Toast: slide-in spring with onExitComplete unmount
- Accordion: grid-template-rows 0fr → 1fr (CSS, height-auto-safe)
- Sidebar logo: crossfade between collapsed/expanded layers
- NavBar/Tabs active: sliding indicator

### Custom motion utility
For your own interactive components:

```tsx
import { useSpringPresence, animated } from "@bigtablet/design-system";

function MyPopover({ open, onClose }) {
  const [shouldRender, setShouldRender] = useState(open);
  useEffect(() => { if (open) setShouldRender(true); }, [open]);

  const style = useSpringPresence({
    visible: open,
    from: "translateY(-4px)",
    onExitComplete: () => setShouldRender(false),  // unmount after exit
  });

  if (!shouldRender) return null;
  return <animated.div style={style}>...</animated.div>;
}
```

**Reduced motion:** every component respects `prefers-reduced-motion: reduce`. Spring respects it automatically; CSS animations have explicit overrides.

---

## Common Patterns

### Form

```tsx
<Stack gap={16}>
  <TextField label="Email" placeholder="you@example.com" supportingText="We'll never share." />
  <Dropdown
    label="Role"
    options={[
      { value: "admin", label: "Admin" },
      { value: "editor", label: "Editor" },
    ]}
    value={role}
    onChange={setRole}
  />
  <Stack direction="horizontal" gap={8} justify="end">
    <Button variant="outline">Cancel</Button>
    <Button variant="filled">Save</Button>
  </Stack>
</Stack>
```

### Confirmation with destructive action

```tsx
const { showAlert } = useAlert();

<Button
  variant="outline"
  danger
  onClick={() =>
    showAlert({
      title: "Delete project?",
      message: "This cannot be undone.",
      showCancel: true,
      destructive: true,
      confirmText: "Delete",
      onConfirm: handleDelete,
    })
  }
>
  Delete
</Button>
```

### Toast feedback

```tsx
const toast = useToast();

toast.success("Saved");
toast.error("Network error", 6000); // custom 6s duration
```

### Dashboard layout

```tsx
<div style={{ display: "flex", minHeight: "100vh", background: "var(--bt-color-bg-solid-dim)" }}>
  <Sidebar
    header={<img src="/logo.png" alt="Brand" height={28} />}
    headerCollapsed={<img src="/favicon.png" alt="" width={28} height={28} />}
    footer={<UserProfile />}
  >
    <SidebarSection label="메인">
      <SidebarItem icon={<Home size={20} />} active>Home</SidebarItem>
      <SidebarItem icon={<Receipt size={20} />}>Orders</SidebarItem>
    </SidebarSection>
  </Sidebar>

  <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>
    <Container size="xl">
      <Stack gap={24}>
        <h1 style={{ color: "var(--bt-color-text-heading)" }}>Dashboard</h1>
        <Grid cols={2} gap={16}>
          <StatCard />
          <StatCard />
        </Grid>
      </Stack>
    </Container>
  </div>
</div>
```

### Marketing landing

```tsx
<Hero
  title="Run smarter stores"
  subtitle="Orders, inventory, staff - one platform."
  backgroundImage="https://..."
  overlay="dark"
  height="lg"
  align="center"
  primaryAction={{ label: "Start free", onClick: ... }}
  secondaryAction={{ label: "See demo", onClick: ... }}
/>

<Section spacing="lg" bg="default">
  <Container size="xl">
    <Stack gap={32}>
      <Stack gap={8} align="center">
        <Chip type="static" tone="accent" label="Features" />
        <h2 style={{ color: "var(--bt-color-text-heading)" }}>Why Bigtablet?</h2>
      </Stack>
      <Grid cols="auto" minColWidth="280px" gap={24}>
        {features.map(f => <MediaCard key={f.id} {...f} />)}
      </Grid>
    </Stack>
  </Container>
</Section>
```

---

## Anti-Patterns

| ❌ Don't | ✅ Do |
|---------|-------|
| `style={{ color: "#888" }}` | `style={{ color: "var(--bt-color-text-caption)" }}` |
| `background: "#fff"` for elevated panels | Conditional `bg-solid` light / `bg-solid-dim` dark |
| `background: brand-primary` for an active toggle/indicator | `accent-default` (auto flips for dark mode visibility) |
| `color: "#fff"` over a token-flipping bg | `accent-on-surface` (flips opposite to `accent-default`) |
| Raw `<button>` for form actions | `<Button>` component |
| Custom modal with CSS keyframes | `<Modal>` (spring built in) |
| Build dropdown from scratch | `<Dropdown>` |
| `transition: all 0.2s ease` | Specific properties + motion tokens |
| `animation: ... infinite` outside loading indicators | Spring (`useSpringPresence`) for entrance/exit |
| Skip `aria-label` on icon-only triggers | `<IconButton icon={...} aria-label="..." />` |
| Hardcode logo color white inside a Sidebar | Sidebar uses light bg by default - use `text-heading` for text |
| Use Tag component | Removed in v3.0 - use `<Chip type="static" tone="..." />` |
| Use Select component | Removed in v3.0 - use `<Dropdown>` |

---

## Storybook Reference

Stories are organized:
- **Getting Started** - Installation, Introduction
- **Cookbook** - Composition recipes (Form / Layout / Feedback / Data patterns)
- **Examples** - Full page patterns (Admin Dashboard, Marketing landing)
- **Foundation** - Token visualization (colors, spacing, typography, etc.). Token stories use the `foundation/{token-name}` title path.
- **Components/{Category}/{Component}** - Each component's variants. Component stories use the `Components/{Category}/{ComponentName}` title path.

Run locally: `pnpm storybook` (port 6006).

**Note on Storybook Docs view:** Interactive states (hover, focus, animations) only show in Canvas view (individual story). Docs view renders static snapshots, so Spinner shows frozen, Tooltip won't appear, etc.

---

## Vanilla JS Bundle

For non-React contexts (Thymeleaf, JSP, PHP, Django):

```html
<link rel="stylesheet" href="https://unpkg.com/@bigtablet/design-system/dist/vanilla/bigtablet.min.css">
<script src="https://unpkg.com/@bigtablet/design-system/dist/vanilla/bigtablet.min.js"></script>

<button class="bt-button bt-button--md bt-button--primary">Primary</button>
```

Class naming: `.bt-{component}` + `--{modifier}` + `.is-{state}` (BEM-like).

Components available: Button, TextField, Checkbox, Radio, Toggle, Select, Modal, Card, Spinner, Pagination, DatePicker, FileInput.

JS API (auto-init on DOMContentLoaded, or manual):
```js
const select = Bigtablet.Select("#my-select", { options, onChange });
const modal = Bigtablet.Modal("#my-modal", { onOpen, onClose });
Bigtablet.Alert({ title, message, showCancel: true, onConfirm });
```

Dark mode: same `[data-theme="dark"]` attribute works. CSS custom properties expose all tokens with `--bt-` prefix.

---

## Constraints for Code Generation

When asked to generate UI:

1. **Always** wrap your output in the appropriate provider chain if the app entry isn't shown.
2. **Always** import components from `@bigtablet/design-system` root.
3. **Always** use tokens (`var(--bt-color-*)`) for any inline style or custom SCSS.
4. **Always** check both light and dark modes in your mental model. If a color choice fails in either theme, swap to a flipping token.
5. **Never** generate a custom Button/Modal/Dropdown/Tooltip when the DS provides one.
6. **Never** use `useLayoutEffect` for non-DOM-measurement work (Next.js SSR warning). Default to `useEffect`.
7. **For interactive content**, ensure: `aria-label`/`aria-labelledby`, keyboard support (Enter/Space for buttons, Arrow keys for menus), and `:focus-visible` styling.
8. **For images**, set `alt` (empty `""` if purely decorative).
9. **Korean / English text**: both supported. Use `word-break: keep-all` if you set custom long-text styles in Korean contexts.

---

## Migration from v2.x

- `Select` → `Dropdown` (`SelectOption` → `DropdownOption`)
- `Tag` → `<Chip type="static" tone="..." />`
- `Chip` import path changed (`general/chip` → `display/chip`) - root import unaffected
- `Dropdown` `fullWidth` prop is now a no-op (always full width)
- `Icon` API: `<Icon name="search" />` → `<Icon icon={Search} />` (pass lucide-react component)
- Vanilla `--bt-color-primary` is now reserved for Button `--primary` only. Use `--bt-color-accent` for indicators.

---

## Quick Decision Tree

**Need a button?** → `<Button>` (variant: filled for primary, outline for secondary, text for tertiary, danger for destructive)

**Need a text input?** → `<TextField>`. For value selection from a list → `<Dropdown>`.

**Need a dialog?** → `<Modal>` for arbitrary content. `useAlert()` for simple confirm/alert.

**Need a notification?** → `useToast()`. For inline alerts within page → `<Alert>` component.

**Need to show loading?** → `<Spinner>` inline, `<TopLoading>` for page-level, `<Skeleton>` for content placeholders, `<LinearProgress>` for step-based progress.

**Need a layout?** → `Container > Section > Stack/Grid`. Don't manually do flexbox/grid CSS unless inside a Stack/Grid child.

**Need a tooltip?** → `<Tooltip content="..." placement="top"><TriggerElement /></Tooltip>`.

**Need a sidebar nav?** → `<Sidebar>` with `<SidebarSection>` + `<SidebarItem>`. Include `headerCollapsed` for collapse animation.

**Need a data table?** → `<Table>`. Pass `onRowClick` for interactive rows (keyboard support included).

**Building a form?** → Stack vertical with gap=16. Group buttons in a horizontal Stack with `justify="end"` at the bottom.

**Building a marketing page?** → Hero + Section(s) with Container + Grid for feature cards.

**Building an admin dashboard?** → Sidebar layout + main content in `<Container size="xl">`. Stats in `<Grid cols={4}>`. Tables, charts, lists below.

---

## Final Reminders

- Read the [Components](./COMPONENTS.md) doc for full props API per component.
- Storybook is the source of truth for visual behavior - `pnpm storybook` and explore.
- When in doubt, **use tokens, use components, use providers**. Don't reinvent.
- Dark mode bugs are the most common failure mode - test both themes mentally before shipping code.
