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
- main 배포: `merge: release [version]`
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
