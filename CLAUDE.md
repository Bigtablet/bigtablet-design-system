# CLAUDE.md

This file helps Claude (and other AI assistants) understand the Bigtablet Design System codebase.

## Project Overview

- **Package**: `@bigtablet/design-system` (v1.12.1)
- **Type**: React 19 component library with TypeScript
- **Package Manager**: pnpm@10.20.0 (enforced)
- **Exports**: Pure React (`/`) and Next.js (`/next`) entry points

## Quick Commands

```bash
pnpm install       # Install dependencies
pnpm storybook     # Start Storybook dev server (port 6006)
pnpm build         # Build library (tsup + copy SCSS)
pnpm dev           # Watch mode development
```

## Architecture

```
src/
├── styles/
│   ├── ts/        # TypeScript design tokens (colors, spacing, typography, etc.)
│   └── scss/      # SCSS tokens and mixins
├── ui/
│   ├── general/   # General components (Button, Select)
│   ├── form/      # Form inputs (TextField, Checkbox, Radio, Switch, DatePicker, FileInput)
│   ├── feedback/  # Feedback (Alert, Toast, Loading)
│   ├── navigation/# Navigation (Pagination, Sidebar)
│   ├── overlay/   # Modal components
│   └── display/   # Card component
├── index.ts       # Pure React entry point
└── next.ts        # Next.js entry point (includes Sidebar with next/link)
```

## Key Conventions

### Component Files
- All components use `"use client"` directive
- Props interfaces extend HTML element attributes
- Standard structure:
  ```
  src/ui/{category}/{ComponentName}/
  ├── index.tsx            # Component implementation
  ├── style.module.scss    # CSS Module styles
  └── *.stories.tsx        # Storybook stories (optional)
  ```

### Styling (CSS Modules)
- **CSS Modules**: All styles use `style.module.scss` files
- Import pattern: `import styles from "./style.module.scss";`
- Class usage: `className={styles.button}` or `className={styles[`variant_${variant}`]}`
- SCSS tokens: `@use "src/styles/scss/token" as token;`
- Never use hardcoded values - always use tokens

### className Pattern
```tsx
const buttonClassName = [
    styles.button,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    isActive && styles.active,
    className ?? "",
]
    .filter(Boolean)
    .join(" ");
```

### Design Tokens
Located in `src/styles/ts/`:
- `colors.ts` - Brand, background, text, status colors
- `spacing.ts` - xs(4px) to 5xl(48px)
- `typography.ts` - Font families, heading/body styles
- `radius.ts` - Border radius values
- `shadows.ts` - Elevation shadows
- `motion.ts` - Animation durations and easings
- `z-index.ts` - Layer priorities
- `breakpoints.ts` - Responsive breakpoints
- `a11y.ts` - Accessibility (focus rings, tap targets)

### Storybook
- Component stories: `Components/{Category}/{ComponentName}`
- Foundation stories: `foundation/{token-name}`
- Include bilingual descriptions (Korean/English)

## Important Files

- `tsup.config.ts` - Build config (dual bundles for React/Next.js)
- `.releaserc.json` - Semantic Release config
- `scripts/copy-scss.mjs` - Copies SCSS to dist
- `.github/workflows/pnpm.yml` - CI/CD pipeline

## Commit Convention

```
feat: New feature
fix: Bug fix
docs: Documentation
style: Formatting
refactor: Code refactoring
test: Tests
chore: Build/tooling
deploy: Deployment
```
