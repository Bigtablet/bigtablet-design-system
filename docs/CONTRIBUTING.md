# Contributing

Bigtablet Design System에 기여해 주셔서 감사합니다!

---

## 목차

- [개발 환경 설정](#개발-환경-설정)
- [개발 워크플로우](#개발-워크플로우)
- [코드 컨벤션](#코드-컨벤션)
- [커밋 컨벤션](#커밋-컨벤션)
- [브랜치 전략](#브랜치-전략)
- [Pull Request](#pull-request)

---

## 개발 환경 설정

### 요구사항

- Node.js 22 (CI 와 같은 22.14.0 권장) - Vite 8 · Vitest 4 가 Node 18 을 지원하지 않습니다
- Python 3 - `pnpm check:*`·`pnpm coverage:docs` 검사 스크립트가 씁니다 (macOS·Linux 기본 포함, Windows 는 별도 설치)
- pnpm 10.x (필수) - `package.json` 의 `packageManager` 버전(현재 10.34.6)으로 자동 전환됩니다

### 설치

```bash
# 저장소 클론
git clone https://github.com/Bigtablet/bigtablet-design-system.git
cd bigtablet-design-system

# 의존성 설치
pnpm install

# Storybook 실행
pnpm storybook

# 테스트 실행
pnpm test

# 빌드
pnpm build
```

### 커밋 훅

`pnpm install` 이 git 훅을 겁니다 (husky).

- **pre-commit** - 커밋마다 `pnpm test`(unit 전체, 10초 안팎)를 돌립니다. 실패하면 커밋되지 않습니다
- **commit-msg** - commitlint 가 제목을 검사합니다. `label: message` 형식, 라벨은 [커밋 컨벤션](#커밋-컨벤션) 표의 것만, 제목 100자 이하, **제목에 한글 금지**(본문은 괜찮습니다)

`--no-verify` 로 건너뛰지 않습니다 - CI 가 같은 검사를 다시 돌려, 푸시된 뒤 걸리면 메시지를 고치려고 브랜치를 새로 만들어야 합니다.

### 사용 가능한 스크립트

| 스크립트 | 설명 |
|----------|------|
| `pnpm storybook` | Storybook 개발 서버 (port 6006) |
| `pnpm build` | 라이브러리 빌드 |
| `pnpm dev` | Watch 모드 개발 |
| `pnpm test` | 테스트 실행 |
| `pnpm test:watch` | 테스트 Watch 모드 |
| `pnpm test:coverage` | 커버리지 리포트 |
| `pnpm test:storybook` | a11y 테스트 (Storybook + Playwright) |
| `pnpm test:browser` | 레이아웃 테스트 (실제 Chromium, `*.browser.test.tsx`) |
| `pnpm exec biome check .` | 린트 · 포맷 · import 정렬 (ESLint/Prettier 대신 Biome) |
| `pnpm exec tsc --noEmit` | TypeScript 타입 체크 |

---

## 개발 워크플로우

### 1. Issue 확인 또는 생성

작업 전에 관련 이슈가 있는지 확인하거나 새로 만듭니다. 이슈는 템플릿(Task · Feature · Bug · Security)을 따르고 라벨과 담당자를 붙입니다.

```bash
gh issue create --title "[FEATURE] Foo 컴포넌트 추가" --label Feature --assignee @me --body "..."
```

### 2. 브랜치 생성

이슈에 연결된 브랜치로 만듭니다 - 이슈의 Development 칸에 브랜치가 뜨고, 그 브랜치로 PR 을 열면 PR 이 그 자리에 뜹니다.

```bash
gh issue develop <이슈번호> --base develop --name feat/new-component --checkout
```

PR 이 develop 에 머지되면 그 이슈를 바로 닫습니다 (`gh issue close <이슈번호> --reason completed --comment "#<PR> 로 머지 완료"`).
develop 대상 PR 의 `Closes #` 는 GitHub 이 해석하지 않아 자동으로 닫히지 않습니다.

### 3. 개발

컴포넌트 개발 시 다음 구조를 따릅니다. **폴더 이름은 kebab-case** 로 짓고, 테스트·스토리 파일은 그 폴더명을 그대로 씁니다:

```
src/ui/{category}/{component-name}/
├── index.tsx                       # 컴포넌트 구현
├── style.scss                      # Global SCSS 스타일
├── {component-name}.test.tsx       # 테스트
└── {component-name}.stories.tsx    # Storybook (선택)
```

#### 새 컴포넌트 체크리스트

- [ ] 폴더 `src/ui/{category}/{component-name}/` (kebab-case), 테스트 · 스토리 파일명은 폴더명과 같게
- [ ] Props 는 `SafeHTMLProps<...>` 로 감싼 HTML 속성을 확장하고 `ref` 는 prop 으로 ([코드 컨벤션](#typescript))
- [ ] 값은 토큰만, 인터랙션에는 모션 토큰과 `prefers-reduced-motion` 처리
- [ ] 사용자에게 보이는 문구는 로케일 카탈로그로 (아래)
- [ ] `src/index.ts` 에 export 추가 - 여기 없으면 소비자에게 보이지 않습니다
- [ ] 단위 테스트, 배치 · 잘림이 중요하면 `*.browser.test.tsx`, 주요 상태는 visual `shoot` ([TESTING](./TESTING.md))
- [ ] 스토리 title `Components/{Category}/{ComponentName}`, 설명은 한국어
- [ ] `docs/COMPONENTS.md` 섹션(언제 쓰는가 · 예제 · Props 표)과 `docs/AGENT_GUIDE.md` 카탈로그 행 - `check:defaults` · `check:agent-guide` 가 표와 소스를 대조합니다

#### 스크롤되는 영역을 만들 때

`overflow-y: auto` 를 쓰는 곳에는 `@include token.scrollable;` 을 함께 넣습니다 — 스크롤바가
얇고 브랜드색이 됩니다. **네이티브 스크롤을 그대로 씁니다**(커스텀 스크롤 컴포넌트는 두지 않습니다).

```scss
.panel_list {
  max-height: token.$overlay_list_max_height;
  overflow-y: auto;
  @include token.scrollable;
}
```

목록에서 방향키로 활성 항목을 옮긴다면 `useListboxPopup` 의 `listRef` 를 스크롤 컨테이너에
붙입니다 — 활성 항목이 화면 밖으로 나갈 때만 따라 스크롤합니다. 포커스가 입력에 남는 APG 패턴에서는
브라우저가 알아서 스크롤해 주지 않습니다.

#### 사용자에게 보이는 문구를 추가할 때

컴포넌트 안에 문구를 박지 말고 **로케일 카탈로그**에 키를 만듭니다
(`src/ui/system/locale-provider/messages.ts` — `ko` 와 `en` 양쪽).

```tsx
// ❌ 이렇게 두면 <LocaleProvider> 로 바꿀 수 없다
const Foo = ({ hint = "드래그해서 옮기세요" }: FooProps) => …

// ✅ prop 은 그대로 두고 기본값만 카탈로그에서 받는다
const Foo = ({ hint: hintProp }: FooProps) => {
  const t = useLocaleText();
  const hint = hintProp ?? t("foo.hint");
```

키는 **섹션 안에서 알파벳순**으로 넣습니다 (`combobox` → `datePicker` → `dateRange` → `dropdown` …).
아무 데나 끼우면 다음 사람이 위치를 예측할 수 없습니다.

`pnpm check:defaults` 가 막는 것:

1. 컴포넌트에 박아 넣은 한글 문구 — prop 기본값이든 JSX 안이든. prop 이름과 상관없이 한글이 든 문자열은 전부 봅니다
2. 카탈로그 문구에 한글이 있는지
3. 카탈로그 키 ↔ `t("...")` 호출 양방향 — 키만 넣고 배선을 잊거나, 없는 키를 부르는 것
4. 카탈로그 키가 섹션 안에서 알파벳순인지
5. `docs/COMPONENTS.md` prop 표의 Default 열이 실제 기본값과 같은지
6. 문서의 union 값(`'line' \| 'fills'`, `<Tabs variant="fills">`)이 소스 타입에 있는지
7. 컴포넌트 Props 의 prop 이 `docs/COMPONENTS.md` 표에 빠짐없이 있는지

개발자 콘솔로만 나가는 메시지(`[Bigtablet DS] …`)는 대상이 아닙니다 — 사용자가 아니라 개발자가 읽습니다.

### 색 토큰: 텍스트에 표면 색을 쓰지 않습니다

`pnpm check:dark-text` 가 막습니다. `--bt-color-status-*`(bare)·`--bt-color-brand-primary` 처럼
**양 테마에서 같은 값**인 색을 테마 표면 위의 텍스트로 쓰면 다크에서 AA(4.5:1) 미달입니다. 텍스트에는 `_on_surface`
(Vanilla `-text`) 쪽을 씁니다. 고정 표면 위 텍스트(`_on_primary`·`_on_dark`·`_on_default`·
`_on_container`)는 이름으로 예외 처리됩니다. 자세한 표는 [THEMING](./THEMING.md#status-색-배경용과-텍스트용을-구분한다).

a11y 스토리 러너는 라이트만 돌아 axe 가 이 결함을 못 잡습니다 - 그래서 정적 검사가 필요합니다.

### 파일명: 테스트·스토리는 폴더명을 따릅니다

컴포넌트 폴더 안의 세 파일이 같은 이름을 공유해야 합니다. `pnpm check:filenames` 가 **테스트·스토리 파일명**을 그 폴더명(또는 같은 폴더의 소스 파일명)과 대조합니다 - 폴더 이름 자체는 검사하지 않으므로 kebab-case 로 짓는 것은 규약으로 지킵니다:

```
src/ui/display/data-view/
├── index.tsx
├── data-view.test.tsx
└── data-view.stories.tsx
```

컴포넌트 이름(`DataView`)이 아니라 **폴더 이름**입니다. 목록에서 짝이 바로 보이고, 폴더를 옮길 때
파일명을 따로 고칠 일이 없습니다.

두 가지만 예외입니다 - 옆에 같은 이름의 소스가 있는 테스트(`crop.util.ts` ↔ `crop.util.test.ts`)와
카테고리 폴더에 바로 놓인 공용 테스트(`src/ui/overlay/overlay-escape.test.tsx`). `src/utils/**` 는
폴더가 아니라 모듈 단위라 대상이 아닙니다.

이름을 바꿀 때는 `git mv` 를 씁니다. **대소문자만 다른 경우**(`Card.test.tsx` → `card.test.tsx`)는
이 저장소가 `core.ignorecase=true` 이고 macOS 파일시스템이 대소문자를 구분하지 않아, 임시 이름을
거친 2단계 `git mv` 가 필요합니다 - 한 번에 옮기면 git 이 같은 파일로 봅니다.

### 스토리: deprecated prop 을 시연하지 않습니다

`pnpm check:deprecated` 가 막습니다. 스토리는 소비자가 **복사해 가는 자리**라, 폐기된 prop 을
쓰면 그대로 퍼집니다. 타입은 아직 살아 있어 `tsc` 가 잡지 못하고, 대체 prop 과 렌더 결과가 같아
a11y 러너도 잡지 못합니다.

검사 방식은 문자열·주석을 지우고 `argTypes` 블록을 떼어낸 뒤 남은 곳에서 `prop=`(JSX 속성)과
`prop:`(`args` 값)을 찾습니다. 그래서 **`argTypes` 에 deprecated 임을 적어 두는 것은 위반이 아닙니다** -
props 표에 이유를 남기는 쪽이 오히려 옳습니다.

일부러 시연해야 하면(구 prop 이 아직 동작함을 보이는 마이그레이션 스토리 등) 그 줄이나 윗줄에
이유를 적습니다:

```tsx
// deprecated-ok: 구 prop 이 아직 동작함을 보이는 스토리
<Toggle onChange={setOn} ariaLabel="알림" />
```

**폐기 표시는 산문이 아니라 선언에 붙입니다.** 주석에 "구 `onChange` 도 허용(@deprecated)" 처럼
적어 두면 IDE 가 취소선을 그리지 못하고 이 검사도 어느 멤버가 폐기됐는지 알 수 없습니다.
union 타입이면 **멤버마다 인라인 JSDoc** 을 둡니다:

```ts
type PaginationCallbacks =
	| {
			onPageChange: (page: number) => void;
			/** @deprecated `onPageChange` 를 사용하세요. */
			onChange?: (page: number) => void;
	  }
	| { … };
```

검사는 `@deprecated` 를 prop 선언에 연결하지 못하면 **실패합니다** - 조용히 넘기면 그 컴포넌트가
검사에서 통째로 빠집니다. 타입 별칭·함수의 폐기(`export type ButtonAsButton = …`)는 prop 이 아니므로
대상이 아닙니다 - `tsc` 가 직접 알려줍니다.

### 4. 테스트 작성

모든 컴포넌트에 테스트가 있어야 합니다:

```tsx
// {component-name}.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComponentName } from "./index";

describe("ComponentName", () => {
    it("renders correctly", () => {
        render(<ComponentName>Content</ComponentName>);
        expect(screen.getByText("Content")).toBeInTheDocument();
    });
});
```

### 5. 커밋

```bash
git add src/ui/display/foo docs/COMPONENTS.md   # 바꾼 경로만 - 다른 작업의 미커밋 파일이 딸려 가지 않게
git commit -m "feat: add Foo component"
```

훅이 unit 테스트와 commitlint 를 돕니다 ([커밋 훅](#커밋-훅)).

### 6. Push 및 PR 생성

```bash
git push origin feat/new-component

# PR 생성 (develop 브랜치로)
gh pr create --base develop --title "feat/new-component" --body "..."
```

---

## 코드 컨벤션

### TypeScript

- 모든 컴포넌트는 `"use client"` 디렉티브 사용
- Props 는 HTML 요소 속성을 **`SafeHTMLProps<...>` 로 감싸서** 확장합니다. `React.*HTMLAttributes` 를 직접 확장하면 `dangerouslySetInnerHTML` 이 루트로 새고, `src/utils/safe-html.type-test.tsx` 가 `tsc` 에서 실패시킵니다
- `ref` 는 일반 prop 으로 받습니다 (React 19). `forwardRef` 는 쓰지 않습니다

```tsx
"use client";

import type * as React from "react";
import { cn, type SafeHTMLProps } from "../../../utils";
import "./style.scss";

export interface TagProps extends SafeHTMLProps<React.HTMLAttributes<HTMLSpanElement>> {
    variant?: "primary" | "secondary";
    size?: "sm" | "md" | "lg";
    ref?: React.Ref<HTMLSpanElement>;
}

export const Tag = ({ variant = "primary", size = "md", className, ref, ...props }: TagProps) => (
    <span
        ref={ref}
        className={cn("tag", `tag_variant_${variant}`, `tag_size_${size}`, className)}
        {...props}
    />
);
```

### 스타일링

- Global SCSS 사용 (`style.scss`)
- 클래스명은 snake_case
- 하드코딩된 값 대신 토큰 사용

```scss
@use "src/styles/token" as token;

.button {
    display: inline-flex;
    align-items: center;
    border-radius: token.$radius_md;
    // `transition: all` 금지 - 바뀌는 속성만 명시한다
    transition: background-color token.$transition_fast, color token.$transition_fast;

    &_variant_filled {
        background-color: token.$color_brand_primary;
        color: token.$color_brand_on_primary;
    }

    &_size_md {
        height: 40px;
        padding: 0 token.$spacing_16;
    }
}

@media (prefers-reduced-motion: reduce) {
    .button {
        transition: none;
    }
}
```

### className 패턴

`cn()` 유틸리티를 씁니다:

```tsx
import { cn } from "../../../utils";

const buttonClassName = cn(
    "button",
    `button_size_${size}`,
    `button_variant_${variant}`,
    isActive && "button_active",
    className
);
```

---

## 커밋 컨벤션

### 형식

```
label: message
```

- 라벨을 앞에, 커밋 내용을 뒤에 작성
- 모두 소문자, 필요시 camelCase 사용
- 메시지는 영문으로 작성 (commitlint 가 제목의 한글을 막습니다)
- 위 표에 없는 라벨(`test`, `chore`, `ci` 등)은 commitlint 가 거부합니다

### 라벨

| Label | Description |
|-------|-------------|
| `feat` | 새로운 기능 추가 |
| `fix` | 기능/코드 수정 |
| `bug` | 버그/에러 수정 |
| `merge` | 브랜치 병합 |
| `deploy` | 프로젝트 배포 / 관련 문서 작업 |
| `docs` | 문서 추가/수정 |
| `delete` | 코드/파일/문서 삭제 |
| `note` | 주석 추가/제거 |
| `style` | 코드 스타일/구조 수정 |
| `refactor` | 동작을 바꾸지 않는 코드 정리 |
| `config` | 설정 파일 / 의존성 / 라이브러리 관련 수정 |
| `etc` | 기타 |
| `tada` | 프로젝트 생성 |

### 예시

```bash
git commit -m "feat: add Toggle component"
git commit -m "fix: resolve Modal focus trap issue"
git commit -m "docs: update README installation guide"
git commit -m "style: refactor Button className pattern"
```

---

## 브랜치 전략

### 브랜치 명명

```
label/domain
```

### 예시

| 브랜치명 | 설명 |
|----------|------|
| `feat/sidebar` | 사이드바 기능 추가 |
| `fix/auth` | 인증 도메인 코드 수정 |
| `style/button` | 버튼 스타일 변경 |
| `docs/readme` | README 문서 수정 |

접두사는 위 [라벨](#라벨) 표에 있는 것만 씁니다 - `ci/` 는 없습니다(워크플로 변경은 `config/`). PR 을 연 뒤 브랜치 이름을 바꾸면 PR 이 닫히니 처음에 정합니다.

### 주요 브랜치

- `main` - 프로덕션 브랜치 (배포용)
- `develop` - 개발 브랜치 (PR 기본 대상)

---

## Pull Request

### PR 대상

- **항상 `develop` 브랜치로 PR 생성**
- `main` 브랜치로의 직접 PR은 금지

### PR 제목

브랜치명과 동일하게 작성:

```
feat/new-component
fix/modal-focus
```

### PR 본문

한국어로 씁니다. 섹션 제목은 아래 네 개를 그대로, 이 순서로 씁니다. 첫 섹션은 `## 작업 개요` 입니다 - 제목은 PR title 이 담당하므로 본문에 따로 넣지 않습니다.

```markdown
## 작업 개요

이슈 #000 - 무엇을 왜 했는지 한두 문단.

## 작업한 내용

- [x] 작업1
- [x] 작업2

## 검증

- 테스트/빌드/실측 결과

## 전달할 추가 이슈

- 이슈1
```

| 섹션 | 필수 | 내용 |
|------|------|------|
| `## 작업 개요` | 필수 | 이슈 번호 + 무엇을 왜. 한두 문단 |
| `## 작업한 내용` | 필수 | `- [x]` 체크박스 목록 - 산문 아님. 렌더 결과가 바뀌면 줄 앞에 `(렌더 변경)` |
| `## 검증` | 권장 | 테스트 수, 빌드, 실측치 |
| `## 전달할 추가 이슈` | 선택 | 이 PR 에서 하지 않은 후속 · 미결 항목 |

`Closes #000` 은 쓰지 않습니다 - develop 대상 PR 에서는 GitHub 이 해석하지 않습니다. 이슈는 머지 뒤 손으로 닫습니다.

### 라벨 · 담당자

브랜치 접두사로 라벨 하나를 붙이고 담당자는 본인입니다. `.github/workflows/pr-labeler.yml` 이 PR 을 열 때 자동으로 붙이고, 아래 명령의 `--label` · `--assignee` 는 워크플로가 늦을 때를 위한 안전장치입니다.

| 브랜치 접두사 | 라벨 |
|--------------|------|
| `feat` | `Feature` |
| `fix`, `style`, `refactor`, `config`, `delete`, `note`, `etc` | `Fix` |
| `bug` | `Bug` |
| `docs` | `Docs` |
| `deploy`, `develop`, `main` | `Deploy` |

### PR 생성 명령어

```bash
gh pr create --base develop --title "feat/foo" --label Feature --assignee @me --body "$(cat <<'BODY'
## 작업 개요

이슈 #000 - Foo 컴포넌트 추가.

## 작업한 내용

- [x] Foo 컴포넌트 구현
- [x] 단위 테스트 · 스토리 추가

## 검증

- unit 통과, storybook a11y 통과

## 전달할 추가 이슈

- 없음
BODY
)"
```

### 리뷰 및 머지

- 리뷰어 approve 뒤 머지합니다. 리뷰 봇(CodeRabbit · Claude)의 지적은 현재 소스로 재확인하고, 반영하거나 이유를 답글로 남긴 뒤 스레드를 resolve 합니다
- **merge commit** 으로 머지합니다 (squash · rebase 금지 - 저장소 설정에서 rebase 가 아직 켜져 있으니 드롭다운을 확인). 커밋 메시지는 `merge: 브랜치명 (#PR)`
- 머지 직전에 PR 의 head 커밋이 마지막으로 푸시한 커밋인지 봅니다 - 푸시와 머지가 겹치면 마지막 커밋이 빠집니다
- 머지되면 브랜치를 지우고, 연관 이슈를 `gh issue close <번호> --reason completed --comment "#<PR> 로 develop 에 머지 완료."` 로 닫습니다

---

## 관련 문서

- [Architecture](./ARCHITECTURE.md) - 프로젝트 구조
- [Testing](./TESTING.md) - 테스트 작성 가이드
- [Components](./COMPONENTS.md) - 컴포넌트 API
