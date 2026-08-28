# CLAUDE.md

This file helps Claude (and other AI assistants) understand the Bigtablet Design System codebase.

## Project Overview

- **Package**: `@bigtablet/design-system` (버전은 `package.json` 참조)
- **Type**: React 19 component library with TypeScript + Vanilla JS
- **Package Manager**: pnpm@10.20.0 (enforced)
- **Exports** (`package.json` `exports`):
  - React / Next.js (`.`) - 컴포넌트가 빌드 시 `"use client"` 자동 주입되어 Next App Router 와 호환 (별도 `/next` entry 없음)
  - Vanilla JS (`./vanilla`) - for Thymeleaf, JSP, PHP, etc.
  - SCSS 토큰 (`./scss/token`), CSS (`./style.css`)

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
├── index.ts             # 진입점 (React/Next.js 공용 - 빌드 시 "use client" 자동 주입)
├── styles/              # 도메인별 디자인 토큰 (각 폴더 _index.scss + index.ts)
│   ├── token.scss       # SCSS barrel (@forward all domains) - 소비자 @use 진입점
│   ├── tokens.json      # Designer JSON tokens
│   ├── theme.scss       # :root / [data-theme="dark"] / @media CSS 변수 (style.css 에 포함)
│   ├── global.css
│   ├── colors/  spacing/  typography/  radius/  elevation/  motion/
│   ├── breakpoints/  opacity/  border-width/  z-index/  skeleton/  a11y/
│   └── layout/          # SCSS only (no TS)
├── ui/                  # 8 카테고리 폴더 하위에 컴포넌트 폴더
│   ├── display/  feedback/  forms/  general/
│   └── layout/  navigation/  overlay/  system/
├── utils/               # cn + 훅 (use-focus-trap, use-reduced-motion, use-spring-presence/hover, use-safe-layout-effect)
├── stories/             # Storybook 문서 (foundation / getting-started / cookbook / examples)
├── test/                # setup.ts (Vitest)
├── types/               # scss.d.ts
└── vanilla/             # Vanilla JS 패키지 (HTML/CSS/JS)
    ├── bigtablet.scss   # 컴포넌트 스타일 + CSS custom properties
    ├── bigtablet.js     # JS 유틸 (Select, Modal, Alert, etc.)
    └── examples/        # HTML 사용 예시
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
- `icon/` - Icon sizes (xs 14px - xl 32px, lucide-react `size` prop)

### Storybook
- Component stories: `Components/{Category}/{ComponentName}`
- Foundation stories: `foundation/{token-name}`
- Write descriptions in Korean. 컴포넌트/prop 이름, 코드, `variant` 값 같은 식별자는 원문 그대로 둔다

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
import { animated } from "@react-spring/web";
import { useSpringPresence } from "../../utils";

// visible=false 가 되면 exit 애니메이션 후 onExitComplete 발화 → 부모에서 unmount.
const style = useSpringPresence({ visible: open, onExitComplete: () => setMounted(false) });
return <animated.div style={style}>...</animated.div>;
```

#### 6. 금지 사항

- ❌ 하드코딩 `transition: 0.2s ease;` (반드시 token 사용)
- ❌ `transition: all` (특정 속성만 명시 - performance)
- ❌ `animation: ... infinite` (loading spinner 외 금지)
- ❌ `height: auto` 직접 transition (안 됨 - grid trick 사용)
- ❌ 1초 이상 transition (지루함)

## Important Files

- `tsup.config.ts` - Build config (2 bundles: React `index.ts` + Vanilla `bigtablet.js`)
- `.github/workflows/release.yml` - 태그 기반 배포 (`v*` 태그 → npm publish + GitHub Release)
- `scripts/copy-scss.sh` - Copies SCSS to dist
- `scripts/build-vanilla.sh` - Builds Vanilla CSS/JS
- `.github/workflows/ci.yml` - CI/CD pipeline (test + coverage)

## Documentation

| Document | Description |
|----------|-------------|
| [README.md](./README.md) | 프로젝트 개요 및 빠른 시작 |
| [docs/COMPONENTS.md](./docs/COMPONENTS.md) | 컴포넌트 API 및 사용법 |
| [docs/MIGRATION.md](./docs/MIGRATION.md) | deprecated prop 마이그레이션 가이드 |
| [docs/THEMING.md](./docs/THEMING.md) | 라이트/다크 테마 시스템 가이드 |
| [docs/VANILLA.md](./docs/VANILLA.md) | HTML/CSS/JS 환경 가이드 |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 프로젝트 구조 및 아키텍처 |
| [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) | 기여 가이드라인 |
| [docs/TESTING.md](./docs/TESTING.md) | 테스트 작성 가이드 |

## Testing

- **Test Runner**: Vitest (multi-project: `unit` + `storybook`)
- **a11y Testing**: axe-core via `@storybook/addon-a11y` + Playwright (headless Chromium)
- **Coverage**: 90% (stmts 90.02 / branch 85.69 / funcs 90.07 / lines 91.97 - 자세한 표는 [docs/TESTING.md](./docs/TESTING.md#커버리지))
- **Commands**:
  ```bash
  pnpm test              # Run unit tests
  pnpm test:watch        # Watch mode
  pnpm test:coverage     # Coverage report
  pnpm test:storybook    # Run a11y tests (Storybook stories in Playwright)
  ```

---

> **Vanilla JS 패키지 (`src/vanilla/`)** 상세 규약(클래스 레퍼런스·HTML 예시·JS API·CSS 변수)은 [src/vanilla/CLAUDE.md](./src/vanilla/CLAUDE.md) 로 이전 — 해당 디렉터리 작업 시 자동 로드.

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
**태그 기반 배포** - semantic-release / changeset 미사용. 절차:

1. **dev→main 릴리즈 PR(`merge: release`)에 아래 셋을 반드시 함께 포함** (별도 커밋으로 미루지 말 것):
   - `package.json` `version` bump (SemVer). 공개 API 기준은 `package.json` `exports`의 모든 표면 - React export(`src/index.ts`), Vanilla JS/CSS(`/vanilla`), SCSS 토큰·CSS 변수(`/scss/token`, `style.css`). 하위 호환이 깨지는 변경(export·토큰·CSS 변수 제거, 이름·시그니처 변경, prop 제거 등)은 major, 새 export·prop·토큰 추가는 minor, 버그/문서/내부 전용(미export) 변경은 patch.
     - **렌더 결과가 바뀌는 변경은 의도로 가른다.** API 가 그대로여도 소비자 화면은 바뀌므로 CHANGELOG 항목 앞에 **`(렌더 변경)` 을 반드시 붙인다** - 버전과 무관하게.
       - **결함 수정**(지금 렌더가 틀렸다) → **patch**. `~3.16.0` 처럼 patch 만 받는 앱에도 수정이 닿아야 한다. minor 로 올리면 가장 보수적으로 고정한 소비자가 그 수정을 못 받는다.
         예 - Prose `h1` 이 `h3` 보다 가늘던 것(3.14.1), close 버튼이 내용 열 밖 20px(3.15.0), Vanilla 모달이 375px 에서 잘림(3.15.2).
       - **의도적 디자인 변경**(지금도 틀리지 않았는데 다르게 바꾼다) → **minor**. 기본 size·간격 스케일·컴포넌트 재디자인 등. 받을지를 소비자가 고르게 한다.
   - `CHANGELOG.md` 맨 위에 새 버전 섹션 추가 (아래 양식, semver 내림차순 유지).
   - **이번 릴리즈에 담긴 모든 이슈의 `Closes #NNN`** 을 `## 작업 개요` 에 나열. `Closes #` 는 기본 브랜치(main) 머지에서만 발동하는데 feature PR 은 전부 `develop` 대상이라, feature PR 본문에 써 둔 것은 이슈를 닫지 못한다. 배포 후 `gh issue list --state open` 으로 실제로 닫혔는지 확인한다.
2. 리뷰어 approve 후 머지.
3. main 에서 `git tag -a vX.Y.Z -m "vX.Y.Z"` → `git push origin vX.Y.Z`.
4. `release.yml`(GitHub Actions)이 `npm publish --provenance` + GitHub Release 자동 생성.

**CHANGELOG.md 양식** - 릴리즈 노트와 동일한 주요 업데이트를 미러링:
```text
## [X.Y.Z](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/vX.Y.Z) - YYYY-MM-DD
- 핵심 변경 1
- 핵심 변경 2
```
- 주요 업데이트 불릿만 - 커밋 본문/Co-Authored-By/이슈 링크 덤프 금지.
- 렌더 결과가 바뀐 항목은 `- (렌더 변경) ...` 로 시작한다 - 결함 수정이든 의도적 변경이든, 소비자가 화면 확인이 필요한 줄을 한눈에 찾게.
- 롤백한 버전은 CHANGELOG·Release 양쪽에서 제외.

**GitHub Release 노트는 조직 공통 양식 필수** - 모든 릴리즈 노트는 한글 작성, title = 버전명만(예: `v3.3.0`). CHANGELOG의 해당 버전 주요 업데이트를 그대로 사용. `--generate-notes` 자동 PR 목록은 양식에 안 맞으니 아래로 교체 (제목 = `Design System of Bigtablet, Inc.`, `##` 제목과 `####` 사이 빈 줄 없음):
```text
## Design System of Bigtablet, Inc.
#### 주요 업데이트
- 핵심 변경 1
- 핵심 변경 2
```
> 태그/버전 규칙은 조직 [버저닝 원칙](https://app.notion.com/p/Version-Convention-25eef4b5605c805aa8a6fc929b5ec848?pvs=21)을 따른다.

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
- **Label**: 브랜치 접두사에 대응하는 라벨 1개 (아래 표)
- **Assignee**: PR 작성자 본인 (`@me`)

#### 브랜치 접두사 → PR 라벨 매핑

| 브랜치 접두사 | 라벨 |
|--------------|------|
| `feat` | `Feature` |
| `fix`, `style`, `refactor`, `config`, `delete`, `note`, `ci`, `etc` | `Fix` |
| `bug` | `Bug` |
| `docs` | `Docs` |
| `release`, `deploy`, `develop`, `sync` | `Deploy` |

> `.github/workflows/pr-labeler.yml` 이 PR open/reopen/edit 시 위 매핑을 **자동 적용**하고,
> 담당자가 비어 있으면 작성자를 자동 지정한다. 아래 `--label` / `--assignee @me` 는
> 워크플로가 안 돌거나(예: 워크플로 자체를 바꾸는 PR) 늦게 붙는 경우를 위한 이중 안전장치다.
> 이미 붙은 라벨은 워크플로가 제거하지 않으니 수동 지정과 충돌하지 않는다.
> 봇(dependabot 등) PR 은 assignee 가 될 수 없어 담당자 지정 대상에서 제외된다.

```bash
gh pr create --base develop --title "label/domain" \
  --label "Feature" --assignee @me --body "$(cat <<'EOF'
## 작업 개요

이슈 #000 - 무엇을 왜 했는지 한두 문단.

## 작업한 내용

- [x] 작업1
- [x] 작업2

## 검증

- 테스트/빌드/실측 결과

## 전달할 추가 이슈

- 이슈1

EOF
)"
```

#### PR 본문 섹션 규칙

**섹션 제목은 위 네 개를 그대로 쓴다.** 순서도 고정.

| 섹션 | 필수 | 내용 |
|------|------|------|
| `## 작업 개요` | 필수 | 이슈 번호 + 무엇을 왜. 한두 문단 |
| `## 작업한 내용` | 필수 | `- [x]` 체크박스 목록 |
| `## 검증` | 권장 | 테스트 수, 빌드, 실측치 |
| `## 전달할 추가 이슈` | 선택 | 후속/미결 항목 |

자주 하는 실수:

- ❌ `## 제목` 자리에 임의의 제목을 넣기 (`## Modal 이슈 6건 + 문서`). 제목은 PR title 이 이미 담당한다 - 본문 첫 섹션은 **`## 작업 개요`** 다
- ❌ 섹션 제목을 바꾸거나(`## 변경 사항`) 새로 만들기
- ❌ `## 작업한 내용` 을 산문으로 쓰기 - 체크박스 목록이다. 배경 설명은 `## 작업 개요` 로
- 이슈를 닫으려면 `## 작업 개요` 안에 `Closes #000` 을 둔다

### Important Notes
- Always create PRs targeting `develop` branch
- Write PR body in Korean
- 라벨/담당자를 항상 확인 - 워크플로가 자동으로 붙이지만 누락 시 수동 보정
- Create issues first if needed and link them to PR
- Requires team review before merging

---

## 코드 리뷰 응대 규칙 (AI Assistant)

PR 에 리뷰 봇/리뷰어(`@coderabbitai`, Claude 리뷰, 사람 리뷰어)가 코멘트를 달면 AI 어시스턴트는 **항상** 다음을 수행한다:

1. **재확인** - 지적 사항을 현재 소스로 검증한다. `실재 / 무관 / 이미수정` 판정 후 움직인다. 봇 지적이라고 무조건 따르지 않는다.
2. **수정** - actionable 한 지적은 반영한다. 보류 시 그 이유를 답글에 명시한다.
3. **답글 (멘션 필수)** - 처리한 각 인라인 코멘트(`comment_id` 가 있는 것)마다:
   - 리뷰어를 **반드시 멘션** (`@coderabbitai` 등) - 봇이 학습·추적할 수 있도록.
   - 무엇을 바꿨는지(또는 왜 안 했는지) 한 줄 + 반영 커밋 해시.
   - `gh api repos/{owner}/{repo}/pulls/{pr}/comments/{comment_id}/replies -X POST -f body='...'` 사용.
4. **resolve** - 처리 완료한 thread 는 GraphQL `resolveReviewThread` mutation 으로 닫는다.
   변수 바인딩(`-f`) 사용 - 문자열 보간보다 안전 (injection 방지):
   ```bash
   gh api graphql -f query='mutation($threadId: ID!) { resolveReviewThread(input: {threadId: $threadId}) { thread { isResolved } } }' -f threadId="PRRT_..."
   ```
   `threadId` 는 REST 의 `comment_id` 가 아닌 GraphQL 노드 ID(`PRRT_` 접두사) - `pullRequest.reviewThreads` 쿼리의 thread `id` 필드로 얻는다 (`comment_id` → thread 매핑).
5. **skip 기준** - acknowledgment-only(감사/확인 답신) / status notice(`comment_id` 없는 봇 공지, 예: Chromatic 한도, 빌드 상태) 는 답글·resolve 불필요. 답글 루프 방지.

> CodeRabbit 은 `.coderabbit.yaml` 로 `develop` 대상 PR 도 자동 리뷰된다.
