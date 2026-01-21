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
  ├── index.tsx       # Component implementation
  ├── style.scss      # Global SCSS styles (snake_case naming)
  └── *.stories.tsx   # Storybook stories (optional)
  ```

### Styling (Global SCSS with BEM-like snake_case)
- **Global SCSS**: All styles use `style.scss` files (NOT CSS Modules)
- Import pattern: `import "./style.scss";`
- Class naming convention: `component_modifier` (snake_case)
- SCSS tokens: `@use "src/styles/scss/token" as token;`
- Never use hardcoded values - always use tokens

### className Pattern
```tsx
const buttonClassName = [
    "button",
    `button_variant_${variant}`,
    `button_size_${size}`,
    isActive && "button_active",
    className ?? "",
]
    .filter(Boolean)
    .join(" ");
```

### SCSS Structure (BEM-like with &_)
```scss
.component {
  // base styles

  &_variant_primary {
    // variant styles
  }

  &_size_md {
    // size styles
  }

  &_child {
    // child element styles
  }
}
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

## Git Convention

### Commit Message
```
label: message
```

1. Label (category) comes first, followed by message describing the change
2. All lowercase, use camelCase when necessary
3. Message should be in English and describe what/where/how

### Commit Labels

| Label | Description |
| --- | --- |
| feat | New feature / new code |
| fix | Code/feature modification |
| bug | Bug/error fix |
| merge | Branch merge |
| deploy | Deployment / related docs |
| docs | Documentation add/update |
| delete | Code/file/docs deletion |
| note | Comment add/remove |
| style | Code style/structure change |
| config | Config files / dependencies / library version changes |
| etc | Other (doesn't fit above categories) |
| tada | Project creation |

### Branch Naming
```
label/domain
```

Examples:
- `fix/auth` - Fix authentication code
- `feat/sidebar` - Add sidebar feature
- `style/global-scss` - Style structure changes

### Merge Convention
- Merge commit message: `merge: branch-name`
- Release to main: `merge: release [version]`
- Always require code review approval before merge

### Pull Request
1. Always create an issue first and link to PR
2. PR title should match branch name
3. Request code review from team members
4. Don't merge until approved

## Claude Workflow (AI Assistant Instructions)

When user requests feature/fix work:

1. **Create Issue** (if requested)
   - Use `gh issue create` command

2. **Create Branch**
   - Format: `label/domain`
   - Example: `git checkout -b feat/new-component`

3. **Make Changes**
   - Follow styling conventions (global SCSS with snake_case)
   - Use design tokens from `src/styles/scss/token`

4. **Commit**
   - Format: `label: message`
   - Always include Co-Authored-By in commit
   - Example:
     ```
     feat: add new button variant

     Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
     ```

5. **Create PR** (if requested)
   - Use `gh pr create` command
   - Link to related issue
   - Include summary and test plan
