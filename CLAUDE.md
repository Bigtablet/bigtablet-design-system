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
pnpm test:storybook # Run a11y tests via Storybook + Playwright
```

## Architecture

```
src/
├── styles/
│   ├── token.scss       # SCSS barrel (@forward all domains)
│   ├── tokens.json      # Designer JSON tokens
│   ├── colors/          # _index.scss + index.ts per domain
│   ├── spacing/
│   ├── typography/
│   ├── radius/
│   ├── elevation/
│   ├── motion/
│   ├── breakpoints/
│   ├── opacity/
│   ├── border-width/
│   ├── z-index/
│   ├── skeleton/
│   ├── a11y/
│   └── layout/          # SCSS only (no TS)
├── ui/                  # Flat component folders (no category subdirs)
├── vanilla/       # Vanilla JS package (HTML/CSS/JS)
│   ├── bigtablet.scss    # All component styles + CSS custom properties
│   ├── bigtablet.js      # JS utilities (Select, Modal, Alert, etc.)
│   └── examples/         # HTML usage examples
├── index.ts       # Pure React entry point
└── next.ts        # Next.js entry point (reserved for future Next.js-specific exports)
```

## Key Conventions

### Component Files
- All components use `"use client"` directive
- Props interfaces extend HTML element attributes
- Standard structure:
  ```
  src/ui/{category}/{ComponentName}/
  ├── index.tsx            # Component implementation
  ├── style.scss           # Global SCSS styles
  └── *.stories.tsx        # Storybook stories (optional)
  ```

### Styling (Global SCSS)
- **Global SCSS**: All styles use `style.scss` files (not CSS Modules)
- Import pattern: `import "./style.scss";`
- Class usage: `className="button"` or `` className={`button_variant_${variant}`} ``
- SCSS tokens: `@use "src/styles/token" as token;`
- Never use hardcoded values - always use tokens

### className Pattern
```tsx
const buttonClassName = [
    "button",
    `button_size_${size}`,
    `button_variant_${variant}`,
    isActive && "button_active",
    className ?? "",
]
    .filter(Boolean)
    .join(" ");

// cn() utility also supported:
const buttonClassName = cn(
    "button",
    `button_size_${size}`,
    `button_variant_${variant}`,
    isActive && "button_active",
    className,
);
```

### Design Tokens
Domain-based structure in `src/styles/` (each folder has `_index.scss` + `index.ts`):
- `colors/` - Brand, background, text, status colors
- `spacing/` - xs(4px) to 5xl(48px)
- `typography/` - Font families, heading/body styles
- `radius/` - Border radius values
- `elevation/` - Elevation shadows (level1-5)
- `motion/` - Animation durations and easings
- `z-index/` - Layer priorities
- `breakpoints/` - Responsive breakpoints
- `a11y/` - Accessibility (focus rings, tap targets)

### Storybook
- Component stories: `Components/{Category}/{ComponentName}`
- Foundation stories: `foundation/{token-name}`
- Include bilingual descriptions (Korean/English)

### Animation (Required for Interactive Components)

**모든 신규 인터랙티브 컴포넌트는 자연스러운 애니메이션을 기본 포함해야 한다.** 정적 스타일만 작성하지 말 것.

#### 1. Motion 토큰 사용 (절대 하드코딩 X)

```scss
@use "src/styles/token" as token;

// Duration only (easing 따로 조합할 때)
token.$duration_fast        // 0.1s
token.$duration_base        // 0.2s
token.$duration_slow        // 0.3s

// Composite shorthand (duration + ease-in-out 기본 easing 포함)
token.$transition_fast      // 0.1s ease-in-out - color/border 작은 변화
token.$transition_base      // 0.2s ease-in-out - bg/transform 일반 인터랙션
token.$transition_slow      // 0.3s ease-in-out - panel 펼침 등

// Enter/Exit pair (asymmetric - 진입은 부드럽고 퇴출은 빠르게)
token.$transition_enter_fast  // 0.15s easing_enter
token.$transition_enter_base  // 0.2s
token.$transition_exit_fast   // 0.12s easing_exit
token.$transition_exit_base   // 0.15s

// Easing
token.$easing_enter  // cubic-bezier(0.16, 1, 0.3, 1)  - out-expo (감속 진입)
token.$easing_exit   // cubic-bezier(0.4, 0, 1, 1)     - ease-in (가속 퇴출)
```

**⚠️ 중요**: composite 토큰(`$transition_*`)은 easing이 이미 포함되어 있음.
- ✅ `transition: bg token.$transition_base;` (composite 단독)
- ✅ `transition: bg token.$duration_base token.$easing_enter;` (duration + easing 조합)
- ❌ `transition: bg token.$transition_base token.$easing_enter;` (easing 두 번 → CSS 파싱 실패)

#### 2. 인터랙션별 표준 패턴

| 인터랙션 | duration | easing | 적용 속성 |
|---------|----------|--------|----------|
| Hover bg | `transition_fast` | linear | `background` |
| Focus ring | `transition_fast` | linear | `box-shadow` |
| Button press | `transition_fast` | `easing_exit` | `transform`, `bg` |
| Chevron 회전 | `transition_base` | `easing_enter` | `transform` |
| Panel 펼침/닫힘 | `transition_base` | `easing_enter` | `grid-template-rows`, `max-height` |
| Modal/Toast 진입 | `transition_enter_base` | `easing_enter` | `opacity`, `transform` |
| Modal/Toast 퇴출 | `transition_exit_fast` | `easing_exit` | `opacity`, `transform` |
| Tooltip/Menu pop | `useSpringPresence` hook | spring | `opacity`, `scale` |

#### 3. Height auto transition

`max-height` 트릭 대신 **`grid-template-rows: 0fr → 1fr`** 사용 (modern CSS, height 정확):

```scss
.panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows token.$transition_base token.$easing_enter;

  &_open { grid-template-rows: 1fr; }
}
.panel_wrap {
  overflow: hidden;  // 닫힌 상태에서 자식 자르기
  min-height: 0;     // grid item 기본 min-content 해제
}
```

(참고: padding이 있는 content를 panel 직접 자식으로 두면 닫힌 상태에서도 padding만큼 공간 남음 - 반드시 `panel > wrap > content` 구조로.)

#### 4. Reduced motion 필수 준수

WCAG 2.1 SC 2.3.3 - `prefers-reduced-motion: reduce` 사용자 위해 모든 컴포넌트 SCSS 끝에:

```scss
@media (prefers-reduced-motion: reduce) {
  .component_animated_part {
    transition: none;
    animation: none;
  }
}
```

#### 5. React 컴포넌트의 진입/퇴출 애니메이션

`unmount` 시점에 exit animation을 위해 `useSpringPresence` hook 사용 (`src/utils/use-spring-presence.ts`). Modal/Toast/Tooltip/Menu 패턴.

```tsx
import { useSpringPresence } from "../../utils";

const { shouldRender, style } = useSpringPresence({ open });
if (!shouldRender) return null;
return <div style={style}>...</div>;
```

#### 6. 금지 사항

- ❌ 하드코딩 `transition: 0.2s ease;` (반드시 token 사용)
- ❌ `transition: all` (특정 속성만 명시 - performance)
- ❌ `animation: ... infinite` (loading spinner 외 금지)
- ❌ `height: auto` 직접 transition (안 됨 - grid trick 사용)
- ❌ 1초 이상 transition (지루함)

## Important Files

- `tsup.config.ts` - Build config (dual bundles for React/Next.js + Vanilla)
- `.github/workflows/release.yml` - 태그 기반 배포 (`v*` 태그 → npm publish + GitHub Release)
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

- **Test Runner**: Vitest (multi-project: `unit` + `storybook`)
- **a11y Testing**: axe-core via `@storybook/addon-a11y` + Playwright (headless Chromium)
- **Coverage**: 86%
- **Commands**:
  ```bash
  pnpm test              # Run unit tests
  pnpm test:watch        # Watch mode
  pnpm test:coverage     # Coverage report
  pnpm test:storybook    # Run a11y tests (Storybook stories in Playwright)
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
| Toggle | `.bt-toggle` | `--sm/md` | `.bt-toggle--on`, `.bt-toggle--disabled` |
| Select | `.bt-select` | | |
| Select Control | `.bt-select__control` | `--outline/filled`, `--sm/md/lg` | `.is-open`, `.is-disabled` |
| Select List | `.bt-select__list` | `--up` (opens upward) | |
| Select Option | `.bt-select__option` | | `.is-selected`, `.is-active`, `.is-disabled` |
| Modal | `.bt-modal` | | `.is-open` |
| Card | `.bt-card` | `--bordered`, `--elevation-1/2/3`, `--p-sm/md/lg` | |
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

#### Toggle
```html
<button class="bt-toggle" data-bt-toggle>
  <span class="bt-toggle__thumb"></span>
</button>

<!-- On state -->
<button class="bt-toggle bt-toggle--on" data-bt-toggle>
  <span class="bt-toggle__thumb"></span>
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
    <button class="bt-modal__close" data-modal-close aria-label="Close">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
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

<div class="bt-card bt-card--elevation-2 bt-card--p-lg">
  Elevation card
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

const sw = Bigtablet.Toggle('#my-toggle', {
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
  --bt-color-success: #047857;
  --bt-color-info: #2563eb;
  --bt-spacing-xs: 0.25rem;
  --bt-spacing-sm: 0.5rem;
  --bt-spacing-md: 0.75rem;
  --bt-spacing-lg: 1rem;
  --bt-radius-sm: 6px;
  --bt-radius-md: 8px;
  --bt-elevation-1: 0 1px 1px -1px rgba(0,0,0,0.20), 0 3px 3px 0 rgba(0,0,0,0.12);
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
| note | 주석 추가 / 제거 |
| style | 코드 스타일/구조 수정 |
| config | 기초 설정 파일 / 의존성 / 라이브러리 관련 버전이나 파일 수정 |
| refactor | 코드 리팩토링 |
| etc | 기타 위에 해당하지 않는 경우 |
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

### Release & Changelog
**태그 기반 배포** — semantic-release / changeset 미사용. 절차:

1. **dev→main 릴리즈 PR(`merge: release`)에 아래 둘을 반드시 함께 포함** (별도 커밋으로 미루지 말 것):
   - `package.json` `version` bump (SemVer). 공개 API 기준은 `package.json` `exports` 의 모든 표면 — React export(`src/index.ts`), Vanilla JS/CSS(`/vanilla`), SCSS 토큰·CSS 변수(`/scss/token`, `style.css`). 하위 호환이 깨지는 변경(export·토큰·CSS 변수 제거, 이름·시그니처 변경, prop 제거 등)은 major, 새 export·prop·토큰 추가는 minor, 버그/문서/내부 전용(미export) 변경은 patch.
   - `CHANGELOG.md` 맨 위에 새 버전 섹션 추가 (아래 양식, semver 내림차순 유지).
2. 리뷰어 approve 후 머지.
3. main 에서 `git tag -a vX.Y.Z -m "vX.Y.Z"` → `git push origin vX.Y.Z`.
4. `release.yml`(GitHub Actions)이 `npm publish --provenance` + GitHub Release 자동 생성.

**CHANGELOG.md 양식** — 릴리즈 노트와 동일한 Key Updates 를 미러링:
```
## [X.Y.Z](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/vX.Y.Z) - YYYY-MM-DD
- 핵심 변경 1
- 핵심 변경 2
```
- Key Updates 불릿만 — 커밋 본문/Co-Authored-By/이슈 링크 덤프 금지.
- 롤백한 버전은 CHANGELOG·Release 양쪽에서 제외.

**GitHub Release 노트는 Bigtablet 양식 필수** (title = 버전명만, 예: `v3.2.2`) — CHANGELOG 의 해당 버전 Key Updates 를 그대로 사용. `--generate-notes` 자동 PR 목록은 양식에 안 맞으니 아래로 교체:
```
## Design System of Bigtablet, Inc.

#### Key Updates
- 핵심 변경 1
- 핵심 변경 2
```

---

## Claude Workflow (AI Assistant Guide)

When a user requests feature development or modifications, follow this workflow:

### 1. Create Issue (if requested)

작업 유형에 맞는 Issue 템플릿을 선택합니다:
- **Task**: `[TASK]` (labels: Fix) - 작업 개요, TO DO, 전달할 추가 이슈
- **Feature Request**: `[FEATURE]` (labels: Feature) - 기능 개요, 세부 기능, 기능 플로우, TO DO
- **Bug Report**: `[BUG]` (labels: Bug) - 버그 개요, 버그 내용, 재현 경로, TO DO
- **Security Report**: `[SECURITY]` (labels: Bug, Hotfix) - 보안 이슈 개요, 관련 CVE, TO DO

### 2. Create Branch
```bash
git checkout -b label/domain
# Example: git checkout -b feat/new-component
```

### 3. Implement Changes
- Follow Global SCSS convention (`style.scss`)
- Use design tokens (`src/styles/token`)

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
## 작업 개요

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

---

## 코드 리뷰 응대 규칙 (AI Assistant)

PR 에 리뷰 봇/리뷰어(`@gemini-code-assist`, `@coderabbitai`, 사람 리뷰어)가 코멘트를 달면 AI 어시스턴트는 **항상** 다음을 수행한다:

1. **재확인** - 지적 사항을 현재 소스로 검증한다. `실재 / 무관 / 이미수정` 판정 후 움직인다. 봇 지적이라고 무조건 따르지 않는다.
2. **수정** - actionable 한 지적은 반영한다. 보류 시 그 이유를 답글에 명시한다.
3. **답글 (멘션 필수)** - 처리한 각 인라인 코멘트(`comment_id` 가 있는 것)마다:
   - 리뷰어를 **반드시 멘션** (`@gemini-code-assist` / `@coderabbitai` 등) - 봇이 학습·추적할 수 있도록.
   - 무엇을 바꿨는지(또는 왜 안 했는지) 한 줄 + 반영 커밋 해시.
   - `gh api repos/{owner}/{repo}/pulls/{pr}/comments/{comment_id}/replies -X POST -f body='...'` 사용.
4. **resolve** - 처리 완료한 thread 는 GraphQL `resolveReviewThread` mutation 으로 닫는다.
   변수 바인딩(`-f`) 사용 - 문자열 보간보다 안전 (injection 방지):
   ```bash
   gh api graphql -f query='mutation($threadId: ID!) { resolveReviewThread(input: {threadId: $threadId}) { thread { isResolved } } }' -f threadId="PRRT_..."
   ```
   `threadId` 는 REST 의 `comment_id` 가 아닌 GraphQL 노드 ID(`PRRT_` 접두사) - `pullRequest.reviewThreads` 쿼리의 thread `id` 필드로 얻는다 (`comment_id` → thread 매핑).
5. **skip 기준** - acknowledgment-only(감사/확인 답신) / status notice(`comment_id` 없는 봇 공지, 예: Chromatic 한도, 빌드 상태) 는 답글·resolve 불필요. 답글 루프 방지.

> CodeRabbit 은 `.coderabbit.yaml` 로 `develop` 대상 PR 도 자동 리뷰된다. Gemini 는 `.yml`/`.json` 등 일부 파일 타입은 리뷰를 skip 한다 (정상).
