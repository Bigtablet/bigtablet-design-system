# CLAUDE.md

This file helps Claude (and other AI assistants) understand the Bigtablet Design System codebase.

## Project Overview

- **Package**: `@bigtablet/design-system` (v1.15.0)
- **Type**: React 19 component library with TypeScript + Vanilla JS
- **Package Manager**: pnpm@10.20.0 (enforced)
- **Exports**:
  - Pure React (`/`)
  - Next.js (`/next`)
  - Vanilla JS (`/vanilla`) - for Thymeleaf, JSP, PHP, etc.

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
├── vanilla/       # Vanilla JS package (HTML/CSS/JS)
│   ├── bigtablet.scss    # All component styles + CSS custom properties
│   ├── bigtablet.js      # JS utilities (Select, Modal, Alert, etc.)
│   └── examples/         # HTML usage examples
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

- `tsup.config.ts` - Build config (dual bundles for React/Next.js + Vanilla)
- `.releaserc.json` - Semantic Release config
- `scripts/copy-scss.mjs` - Copies SCSS to dist
- `scripts/build-vanilla.mjs` - Builds Vanilla CSS/JS
- `.github/workflows/ci.yml` - CI/CD pipeline (test + coverage)

## Documentation

| Document | Description |
|----------|-------------|
| [README.md](./README.md) | 프로젝트 개요 및 빠른 시작 |
| [docs/COMPONENTS.md](./docs/COMPONENTS.md) | 컴포넌트 API 및 사용법 |
| [docs/VANILLA.md](./docs/VANILLA.md) | HTML/CSS/JS 환경 가이드 |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 프로젝트 구조 및 아키텍처 |
| [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) | 기여 가이드라인 |
| [docs/TESTING.md](./docs/TESTING.md) | 테스트 작성 가이드 |

## Testing

- **Test Runner**: Vitest
- **Coverage**: 86%
- **Commands**:
  ```bash
  pnpm test              # Run tests
  pnpm test:watch        # Watch mode
  pnpm test:coverage     # Coverage report
  ```

---

## Vanilla JS Package

For non-React environments (Thymeleaf, JSP, PHP, Django, etc.)

### Build Output
```
dist/vanilla/
├── bigtablet.css       # Full CSS (27KB)
├── bigtablet.min.css   # Minified CSS (21KB)
├── bigtablet.js        # Full JS (20KB)
├── bigtablet.min.js    # Minified JS (9KB)
└── examples/           # HTML examples
```

### Class Naming Convention (BEM-like)
```
.bt-{component}
.bt-{component}__{element}
.bt-{component}--{modifier}
.bt-{component}.is-{state}
```

### Component Classes Reference

| Component | Base Class | Modifiers | States |
|-----------|------------|-----------|--------|
| Button | `.bt-button` | `--sm/md/lg`, `--primary/secondary/ghost/danger` | `:disabled` |
| TextField | `.bt-text-field` | `--full-width` | |
| TextField Input | `.bt-text-field__input` | `--outline/filled`, `--sm/md/lg`, `--error/success` | `:disabled` |
| Checkbox | `.bt-checkbox` | `--sm/md/lg` | `:checked`, `:disabled` |
| Radio | `.bt-radio` | `--sm/md/lg` | `:checked`, `:disabled` |
| Switch | `.bt-switch` | `--sm/md/lg` | `.bt-switch--on`, `.bt-switch--disabled` |
| Select | `.bt-select` | | |
| Select Control | `.bt-select__control` | `--outline/filled`, `--sm/md/lg` | `.is-open`, `.is-disabled` |
| Select List | `.bt-select__list` | `--up` (opens upward) | |
| Select Option | `.bt-select__option` | | `.is-selected`, `.is-active`, `.is-disabled` |
| Modal | `.bt-modal` | | `.is-open` |
| Card | `.bt-card` | `--bordered`, `--shadow-sm/md/lg`, `--p-sm/md/lg` | |
| Spinner | `.bt-spinner` | `--sm/md/lg/xl` | |
| Pagination | `.bt-pagination` | | |
| DatePicker | `.bt-date-picker` | `--full-width` | |
| FileInput | `.bt-file-input` | | `.bt-file-input--disabled` |

### HTML Examples

#### Button
```html
<button class="bt-button bt-button--md bt-button--primary">Primary</button>
<button class="bt-button bt-button--md bt-button--secondary">Secondary</button>
<button class="bt-button bt-button--md bt-button--danger">Danger</button>
```

#### TextField
```html
<div class="bt-text-field">
  <label class="bt-text-field__label">Label</label>
  <div class="bt-text-field__wrap">
    <input type="text" class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--md" placeholder="Enter...">
  </div>
  <span class="bt-text-field__helper">Helper text</span>
</div>

<!-- Error state -->
<input class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--md bt-text-field__input--error">
<span class="bt-text-field__helper bt-text-field__helper--error">Error message</span>
```

#### Checkbox
```html
<label class="bt-checkbox">
  <input type="checkbox" class="bt-checkbox__input">
  <span class="bt-checkbox__box"></span>
  <span class="bt-checkbox__label">Label</span>
</label>
```

#### Radio
```html
<label class="bt-radio">
  <input type="radio" name="group" class="bt-radio__input">
  <span class="bt-radio__dot"></span>
  <span class="bt-radio__label">Option</span>
</label>
```

#### Switch
```html
<button class="bt-switch" data-bt-switch>
  <span class="bt-switch__thumb"></span>
</button>

<!-- On state -->
<button class="bt-switch bt-switch--on" data-bt-switch>
  <span class="bt-switch__thumb"></span>
</button>
```

#### Select
```html
<div class="bt-select" data-bt-select>
  <label class="bt-select__label">Label</label>
  <button type="button" class="bt-select__control bt-select__control--outline bt-select__control--md">
    <span class="bt-select__placeholder">Select...</span>
    <span class="bt-select__icon">▼</span>
  </button>
  <ul class="bt-select__list">
    <li class="bt-select__option" data-value="1">Option 1</li>
    <li class="bt-select__option" data-value="2">Option 2</li>
    <li class="bt-select__option is-disabled" data-value="3">Disabled</li>
  </ul>
</div>
```

#### Modal
```html
<button data-bt-modal-open="my-modal">Open</button>

<div id="my-modal" class="bt-modal" data-bt-modal>
  <div class="bt-modal__panel" style="width: 480px;">
    <div class="bt-modal__header">Title</div>
    <div class="bt-modal__body">Content</div>
    <div class="bt-modal__footer">
      <button class="bt-button bt-button--md bt-button--secondary" data-modal-close>Cancel</button>
      <button class="bt-button bt-button--md bt-button--primary" data-modal-close>Confirm</button>
    </div>
  </div>
</div>
```

#### Card
```html
<div class="bt-card bt-card--bordered bt-card--p-md">
  <div class="bt-card__title">Title</div>
  <p>Content</p>
</div>

<div class="bt-card bt-card--shadow-md bt-card--p-lg">
  Shadow card
</div>
```

#### Spinner
```html
<div class="bt-spinner bt-spinner--md"></div>
```

#### Pagination
```html
<nav class="bt-pagination" data-bt-pagination data-page="1" data-total-pages="10">
  <!-- JS renders automatically -->
</nav>
```

### JavaScript API

```javascript
// Auto-init: elements with data-bt-* are initialized on DOMContentLoaded

// Manual initialization
const select = Bigtablet.Select('#my-select', {
  options: [{ value: '1', label: 'One' }],
  onChange: (value, option) => console.log(value)
});
select.getValue();
select.setValue('1');
select.open();
select.close();

const modal = Bigtablet.Modal('#my-modal', {
  closeOnOverlay: true,
  onOpen: () => {},
  onClose: () => {}
});
modal.open();
modal.close();

const sw = Bigtablet.Switch('#my-switch', {
  onChange: (checked) => console.log(checked)
});
sw.toggle();
sw.setChecked(true);

const pagination = Bigtablet.Pagination('#my-pagination', {
  page: 1,
  totalPages: 10,
  onChange: (page) => console.log(page)
});
pagination.setPage(5);

// Alert (no element needed)
Bigtablet.Alert({
  title: 'Title',
  message: 'Message',
  variant: 'info',  // info, success, warning, error
  showCancel: true,
  onConfirm: () => {},
  onCancel: () => {}
});
```

### CSS Custom Properties

All design tokens available as CSS variables:
```css
:root {
  --bt-color-primary: #000000;
  --bt-color-background: #ffffff;
  --bt-color-text-primary: #1a1a1a;
  --bt-color-border: #e5e5e5;
  --bt-color-error: #ef4444;
  --bt-color-success: #10b981;
  --bt-spacing-xs: 0.25rem;
  --bt-spacing-sm: 0.5rem;
  --bt-spacing-md: 0.75rem;
  --bt-spacing-lg: 1rem;
  --bt-radius-sm: 6px;
  --bt-radius-md: 8px;
  --bt-shadow-sm: 0 2px 4px rgba(0,0,0,0.04);
  --bt-transition-base: 0.2s ease-in-out;
}
```

### Thymeleaf Example
```html
<form th:action="@{/submit}" method="post">
  <div class="bt-text-field">
    <label class="bt-text-field__label">Name</label>
    <input type="text"
           th:field="*{name}"
           class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--md"
           th:classappend="${#fields.hasErrors('name')} ? 'bt-text-field__input--error' : ''">
    <span class="bt-text-field__helper bt-text-field__helper--error"
          th:if="${#fields.hasErrors('name')}"
          th:errors="*{name}"></span>
  </div>

  <button type="submit" class="bt-button bt-button--md bt-button--primary">Submit</button>
</form>
```

---

## Git Convention

### Commit Message
```
label: message
```
- 라벨을 앞에, 커밋 내용을 뒤에 작성
- 모두 소문자, 필요시 camelCase 사용
- 메시지는 영문으로 작성하고, 어디서 무엇을 어떻게 했는지 알 수 있도록 작성

### Commit Labels

| Label | Description |
|-------|-------------|
| feat | 추가 기능 개발 / 새로운 코드 추가 |
| fix | 기능/코드 수정 |
| bug | 버그/에러 수정 |
| merge | 브랜치 병합 |
| deploy | 프로젝트 배포 / 관련 문서 작업 |
| docs | 문서 추가/수정 |
| delete | 코드/파일/문서 삭제 |
| note | 주석 추가/제거 |
| style | 코드 스타일/구조 수정 |
| config | 설정 파일 / 의존성 / 라이브러리 관련 수정 |
| etc | 기타 (위에 해당하지 않는 경우) |
| tada | 프로젝트 생성 |

### Branch Naming
```
label/domain
```
예시:
- `fix/auth` - 인증 도메인 코드 수정
- `feat/sidebar` - 사이드바 기능 추가
- `style/button` - 버튼 스타일 변경

### Merge Convention
- 병합 커밋 메시지: `merge: branch-name`
- main 배포: `merge: release`
- 병합 전 반드시 코드 리뷰어 approve 필요

---

## Claude Workflow (AI Assistant Guide)

When a user requests feature development or modifications, follow this workflow:

### 1. Create Issue (if requested)
```bash
gh issue create --title "Issue title" --body "Issue description"
```

### 2. Create Branch
```bash
git checkout -b label/domain
# Example: git checkout -b feat/new-component
```

### 3. Implement Changes
- Follow CSS Modules convention (`style.module.scss`)
- Use design tokens (`src/styles/scss/token`)

### 4. Commit
```bash
git add -A && git commit -m "$(cat <<'EOF'
label: commit message

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### 5. Create PR (if requested)
- **Base branch**: `develop` (NOT main!)
- **PR title**: Same as branch name
- **PR body**: Write in Korean

```bash
gh pr create --base develop --title "label/domain" --body "$(cat <<'EOF'
## PR 제목 (작업 요약)

## 작업한 내용
- [x] 작업1
- [x] 작업2
- [x] 작업3

## 전달할 추가 이슈
- 이슈1
- 이슈2

EOF
)"
```

### Important Notes
- Always create PRs targeting `develop` branch
- Write PR body in Korean
- Create issues first if needed and link them to PR
- Requires team review before merging
