# Testing

Bigtablet Design System 의 테스트 작성 가이드입니다.

---

## 목차

- [테스트 환경](#테스트-환경)
- [테스트 실행](#테스트-실행)
- [테스트 작성 가이드](#테스트-작성-가이드)
- [테스트 패턴](#테스트-패턴)
- [커버리지](#커버리지)

---

## 테스트 환경

### 사용 도구

- **Vitest** - 테스트 러너 (multi-project: `unit` · `browser` · `visual`)
- **React Testing Library** - 컴포넌트 테스트
- **jsdom** - DOM 환경 (unit 테스트)
- **Playwright** - 브라우저 환경 (a11y 테스트, headless Chromium)
- **axe-core** - 문서 사이트 예제 접근성 자동 테스트
- **v8** - 커버리지 프로바이더

### 설정 파일

설정은 [`vitest.config.ts`](../vitest.config.ts) 가 정본입니다 (`globals: true` - `describe` · `it` · `expect` 를 import 없이 써도 됩니다). 프로젝트는 셋입니다.

| 프로젝트 | 명령 | 파일 | 환경 |
|----------|------|------|------|
| `unit` | `pnpm test` | `*.test.ts(x)` | jsdom |
| `browser` | `pnpm test:browser` | `*.browser.test.ts(x)` (`src/` · `site/`) | 실제 Chromium - 배치 · 잘림 · 스크롤 잠금, 문서 예제 axe (a11y) |
| `visual` | `pnpm test:visual` | `*.visual.test.tsx` | CI 컨테이너 전용 시각 회귀 |

### Setup 파일

[`src/test/setup.ts`](../src/test/setup.ts) 가 `unit` 테스트마다 돕니다. 하는 일은 넷입니다.

- `@testing-library/jest-dom` 매처 등록 (`toBeInTheDocument` 등)
- jsdom 에 없는 `Element.prototype.scrollIntoView` 스텁
- Modal · Drawer · Alert 가 공유하는 body 스크롤 잠금 상태를 테스트마다 초기화 - 한 테스트의 잠금이 다음 테스트로 새지 않게
- `stubPendingAnimation` 이 건 `getAnimations` 스텁을 테스트마다(`afterEach`) 걷기 (`restoreAnimationStub`, jsdom 에는 원래 없습니다)

`matchMedia` 는 전역으로 mock 하지 않습니다 - 필요한 테스트가 직접 `vi.stubGlobal` 로 둡니다.

---

## 테스트 실행

```bash
# 전체 테스트 실행
pnpm test

# Watch 모드
pnpm test:watch

# 특정 파일만 테스트
pnpm vitest run src/ui/general/button/button.test.tsx

# 커버리지 리포트
pnpm test:coverage

# 레이아웃 테스트 + 문서 예제 a11y (*.browser.test.tsx, 실제 Chromium)
# Chromium 바이너리가 없으면 먼저 한 번 설치한다
pnpm exec playwright install chromium
pnpm test:browser

# 시각 회귀 (*.visual.test.tsx) - CI 컨테이너(linux) 전용. 맥에서는 비교할 기준이 없어 실패한다
pnpm test:visual
# 의도한 렌더 변경으로 CI 의 시각 회귀가 실패했을 때 - 그 실행의 스크린샷을 기준으로 받는다
pnpm visual:accept <run-id>

# UI 모드 - @vitest/ui 가 devDependencies 에 없어 따로 설치해야 합니다
# pnpm add -D @vitest/ui && pnpm vitest --ui
```

---

## 테스트 작성 가이드

### 파일 위치

테스트 파일은 컴포넌트와 같은 폴더에 둡니다:

```
src/ui/general/button/
├── index.tsx
├── style.scss
└── button.test.tsx    # 테스트 파일 (폴더명과 같게)
```

### 기본 구조

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ComponentName } from "./index";

describe("ComponentName", () => {
    // 기본 렌더링 테스트
    it("renders correctly", () => {
        render(<ComponentName>Content</ComponentName>);
        expect(screen.getByText("Content")).toBeInTheDocument();
    });

    // Props 테스트
    it("applies variant class", () => {
        const { container } = render(<ComponentName variant="primary" />);
        expect(container.firstChild).toHaveClass("variant_primary");
    });

    // 이벤트 테스트
    it("calls onClick when clicked", () => {
        const onClick = vi.fn();
        render(<ComponentName onClick={onClick}>Click</ComponentName>);

        fireEvent.click(screen.getByText("Click"));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    // 접근성 테스트
    it("has correct aria attributes", () => {
        render(<ComponentName aria-label="Test" />);
        expect(screen.getByLabelText("Test")).toBeInTheDocument();
    });
});
```

### 테스트 항목 체크리스트

모든 컴포넌트는 다음 항목을 테스트합니다:

- [ ] 기본 렌더링
- [ ] 모든 Props 동작
- [ ] 이벤트 핸들러
- [ ] 비활성화 상태
- [ ] 접근성 속성
- [ ] 조건부 렌더링
- [ ] 에러 상태

---

### Vanilla 번들 테스트

Vanilla 번들은 컴포넌트별 테스트 파일이 덮습니다 - unit 은 `src/vanilla/bigtablet.{alert,copy-button,date-picker,dropdown,locale,modal,pagination,sidebar,toast,toggle}.test.ts`, 실제 Chromium 이 필요한 것은 `bigtablet.{alert,badge,copy-button,custom-properties,forced-colors,inline-alert,modal,table,toast}.browser.test.ts` 입니다.
공용 헬퍼(스크롤바 폭 · 문서 스크롤 세우기, Dropdown 마크업, 키 이벤트)와 테스트마다 DOM 을 비우는
`resetVanillaDom()` 은 `bigtablet.test-utils.ts` 에 있습니다. 새 파일은 맨 위에서 `resetVanillaDom()` 을 부릅니다.
React 쪽 `unit` 프로젝트에 그대로 포함되므로 `pnpm test` 로 함께 돕니다.

```ts
// 소스가 ES 모듈이라(#926) named export 로 받는다. 소비자는 `<script>` + 전역 `Bigtablet`(빌드된 IIFE)
// 로 쓰지만 부착 경로만 다르고 검사 대상 로직은 같다. 빌드 산출물이 아니라 소스를 import 해서
// 소스 변경이 곧 테스트에 걸리게 한다.
import { Dropdown } from "./bigtablet.js";
```

주의할 점:

- **jsdom 은 레이아웃을 하지 않습니다.** 스크롤바 폭(`innerWidth - documentElement.clientWidth`)은 항상 0
  이므로, 스크롤 잠금 보정을 검사하려면 두 값을 직접 세워야 합니다 (`setScrollbarWidth` 헬퍼 참고).
- **내부 함수는 export 되지 않습니다.** `lockScroll` / `unlockScroll` 는 `Modal` · `Alert` 를 열고
  닫으며 간접 검사합니다 - 통합 경로를 함께 보게 되어 오히려 낫습니다.
- **문서화된 마크업으로 시작합니다.** 서버 템플릿이 렌더하는 형태(평면 `<ul>`, 서버가 심어둔 hidden
  input 등)를 그대로 세워야 실제 회귀를 잡습니다 - 실제로 그 두 경로에서 버그가 나왔습니다.

> 커버리지 집계(`vitest.config.ts` 의 `coverage.include`)는 아직 `src/ui/**` · `src/utils/**` · `src/text/**` 만
> 봅니다. Vanilla 를 넣으면 전체 수치가 크게 떨어지므로 별건으로 다룹니다 - 테스트 자체는 이미 돕니다.

### 앵커 팝업(Dropdown·Combobox·Menu·Popover·Tooltip) 테스트

배치·닫힘이 `getBoundingClientRect()` 에 달려 있어 jsdom 에서 두 가지가 걸립니다.

- **jsdom 의 rect 는 전부 0 입니다.** 그래서 "앵커가 뷰포트 밖" 판정(`bottom <= 0`)이 아무것도 안
  했는데 참이 됩니다. `useAnchoredPosition` 이 **앵커 크기가 0 이면 `anchorHidden` 을 false 로
  두는** 것은 이 때문입니다(#624). 이 가드를 빼면 열자마자 닫혀 기존 테스트 6개가 무너집니다 -
  뮤테이션으로 확인된 수치입니다. 위치·가시성을 검사하려면 rect 를 직접 세웁니다:

  ```ts
  vi.spyOn(wrapper, "getBoundingClientRect").mockReturnValue({
    top: -80, bottom: -40, left: 0, right: 200, width: 200, height: 40,
  } as DOMRect);
  await act(async () => {
    fireEvent.scroll(window);              // 훅은 scroll(capture) 로 재계산하고
    await new Promise((r) => requestAnimationFrame(() => r(null))); // rAF 로 배칭한다
  });
  ```

- **포커스 복귀는 `focus({ preventScroll: true })` 로 단언합니다.** 트리거가 화면 밖이라 닫는
  경로에서 그냥 `focus()` 하면 브라우저가 방금 벗어난 트리거로 화면을 되감습니다. jsdom 은
  스크롤을 하지 않아 증상이 안 보이므로, 인자까지 단언해야 회귀가 잡힙니다:
  `expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true })`.

레이아웃 자체(높이 상한·정렬·flip)는 jsdom 이 계산하지 않습니다 - 아래 브라우저 레이아웃 테스트로 잽니다.

### 브라우저 레이아웃 테스트 (`*.browser.test.tsx`)

배치·잘림·스크롤 잠금처럼 **실제 레이아웃이 있어야 의미 있는 것**은 `{폴더명}.browser.test.tsx` 에
씁니다. `vitest.config.ts` 의 `browser` 프로젝트가 headless Chromium 에서 돌리고(`pnpm test:browser`),
`unit` 프로젝트와 뮤테이션 테스트는 이 파일을 뺍니다. 지금 덮는 것:

| 대상 | 검사 |
|------|------|
| Tooltip · Popover · Menu | flip·shift, 정렬(`align`), Menu 가 `overflow: hidden` 조상에 안 잘림(#586) |
| Dropdown · Combobox | 높이 상한(#621), 트리거 정렬, 375px 넘침 |
| DatePicker (`variant="calendar"`) | 달력 flip, 320px 에서 요일 7칸이 패널 안 |
| Modal · Drawer · Vanilla Modal | 좁은 화면 잘림, 스크롤 잠금 - 콘텐츠 안 밀림·스크롤바 자리 덮음·패널 중심(#574·#635)·스크롤 위치 복원 |
| Table | 클릭 가능한 행의 키보드 포커스 테두리(#802) - 키보드에서만, 마우스 클릭엔 없음, 다크 테마 색 |

- **뷰포트는 `page.viewport(w, h)`** (`vitest/browser`) 로 테스트마다 세웁니다. 앵커는
  `position: fixed` 래퍼로 원하는 좌표에 둡니다.
- **컴포넌트 `style.scss` 를 테스트에서 import 합니다.** 컴포넌트 파일이 이미 import 하지만, 레이아웃
  테스트가 CSS 에 기대고 있다는 걸 드러냅니다. 토큰 CSS 변수(`theme.scss`)는 `src/test/browser-setup.ts` 가 넣습니다.
- **스크롤바가 보입니다.** headless Chromium 은 기본으로 스크롤바를 숨겨(폭 0) 스크롤 잠금 보정이
  공회전합니다 - 프로젝트 설정이 `--hide-scrollbars` 를 빼서 15px 클래식 스크롤바가 생깁니다.
- **소스를 일부러 깨서 테스트가 실패하는지 봅니다.** 처음 쓴 테스트 절반이 그래도 통과했습니다 -
  CSS 기본 상한(`max-width: 240px`)이 인라인 상한을 가리거나, `elementFromPoint` 가 `null` 을
  내는 경우 `?.closest()` 가 `undefined` 가 되어 `not.toBeNull()` 을 통과했습니다.
- Modal 의 `role="dialog"` 는 화면 전체 오버레이(`.modal`)에 있습니다. 패널 크기는 `.modal_panel` 로 잽니다.
- **Vanilla 는 `bigtablet.{컴포넌트}.browser.test.ts`.** 소스가 ES 모듈이라(#926) unit 과 같이
  `import { Modal } from "./bigtablet.js"` 로 받습니다. 전역 `Bigtablet` 은 빌드된 `bigtablet.min.js` 에만 생깁니다.

### 시각 회귀 테스트 (`*.visual.test.tsx`)

컴포넌트의 기본 모양을 **기준 스크린샷과 픽셀 비교**합니다 (#879). 렌더가 바뀌는 변경을 사람 눈 말고도
잡으려는 것입니다 - 의도한 변경이면 기준을 같이 갱신하고, 의도하지 않은 변경이면 테스트가 막습니다.
`src/test/components.visual.test.tsx` 가 Button · IconButton · Badge · Chip · InlineAlert · EmptyState ·
ErrorState · TextField · Checkbox/Radio/Toggle · Card · Tabs · Pagination 을 **라이트·다크** 로 찍습니다.
팝업(Dropdown·Menu·Toast 등)은 포털·타이머가 얽혀 첫 범위에서 뺐습니다.

- **기준 이미지는 CI 와 같은 Playwright 이미지(linux)에서 만든 것만 씁니다.** 폰트·안티앨리어싱이 OS 마다
  달라 맥 렌더는 기준이 될 수 없습니다. 파일 이름에 platform 이 붙고(`-chromium-linux.png`), 맥·윈도 결과는
  gitignore 됩니다. 기준은 `src/test/__visual__/<테스트파일>/` 에 있습니다.
- **CI 에서만 돕니다** - a11y job 의 `Run visual regression tests` 단계. 실패하면 `visual-screenshots`
  artifact 에 실제(`-actual-`)·차이(`-diff-`)·새 기준(`-reference-`) 스크린샷이 남습니다.
- **의도한 렌더 변경이면** 실패한 실행의 run-id 로 `pnpm visual:accept <run-id>` 를 돌립니다. artifact 를
  받아 `-actual-`·`-reference-` 를 기준 이름으로 바꿔 넣습니다. 받은 이미지를 열어 보고 커밋합니다.
  PR 본문에 `(렌더 변경)` 과 함께 바뀐 기준 이미지를 적습니다.
- **움직임은 멈춥니다** - `src/test/visual-setup.ts` 가 transition·animation·커서 깜빡임을 끕니다.
- 새 컴포넌트를 추가할 때는 `shoot(이름, <요소 />)` 한 줄을 더하고, 첫 CI 실패의 `-reference-` 를 받아 넣습니다.

## 테스트 패턴

### 1. 렌더링 테스트

```tsx
it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
});

it("renders with custom className", () => {
    const { container } = render(<Button className="custom">Click</Button>);
    expect(container.firstChild).toHaveClass("custom");
});
```

### 2. Props 테스트

```tsx
it("applies size class", () => {
    const { container } = render(<Button size="lg">Click</Button>);
    expect(container.firstChild).toHaveClass("button_size_lg");
});

it("applies default props", () => {
    const { container } = render(<Button>Click</Button>);
    expect(container.firstChild).toHaveClass("button_variant_filled");
    expect(container.firstChild).toHaveClass("button_size_md");
});
```

### 3. 이벤트 테스트

```tsx
it("calls onClick handler", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);

    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
});

it("does not call onClick when disabled", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Click</Button>);

    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
});
```

### 4. 상태 테스트 (Controlled/Uncontrolled)

```tsx
describe("controlled mode", () => {
    it("uses value prop", () => {
        const { rerender } = render(<Toggle checked={false} onCheckedChange={() => {}} />);
        expect(screen.getByRole("switch")).not.toHaveClass("toggle_on");

        rerender(<Toggle checked={true} onCheckedChange={() => {}} />);
        expect(screen.getByRole("switch")).toHaveClass("toggle_on");
    });
});

describe("uncontrolled mode", () => {
    it("manages internal state", () => {
        render(<Toggle defaultChecked={false} />);

        fireEvent.click(screen.getByRole("switch"));
        expect(screen.getByRole("switch")).toHaveClass("toggle_on");
    });
});
```

### 5. 폼 컴포넌트 테스트

```tsx
it("calls onValueChange with new value", () => {
    const onValueChange = vi.fn();
    render(<TextField aria-label="이름" onValueChange={onValueChange} />);

    fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "test" }
    });

    expect(onValueChange).toHaveBeenCalledWith("test");
});

it("shows error state", () => {
    render(<TextField error supportingText="Error message" />);

    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Error message")).toBeInTheDocument();
});
```

### 6. 접근성 테스트

```tsx
it("has correct ARIA attributes", () => {
    render(<Modal open title="Test Modal" onClose={() => {}}>Content</Modal>);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby");
});

it("is keyboard accessible", () => {
    render(<Button>Click</Button>);

    const button = screen.getByRole("button");
    button.focus();
    expect(document.activeElement).toBe(button);
});
```

### 7. Provider 테스트

```tsx
const renderWithProvider = (ui: React.ReactElement) => {
    return render(<AlertProvider>{ui}</AlertProvider>);
};

it("shows alert when showAlert is called", () => {
    const TestComponent = () => {
        const { showAlert } = useAlert();
        return (
            <button onClick={() => showAlert({ title: "Test" })}>
                Show Alert
            </button>
        );
    };

    renderWithProvider(<TestComponent />);

    fireEvent.click(screen.getByText("Show Alert"));
    expect(screen.getByText("Test")).toBeInTheDocument();
});
```

### 8. Mock 사용

```tsx
// 외부 모듈 Mock
vi.mock("next/link", () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

// localStorage Mock
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// 함수 Mock
it("calls callback with correct arguments", () => {
    const onValueChange = vi.fn();
    render(<Dropdown options={options} onValueChange={onValueChange} />);

    // 트리거를 열고 옵션 선택
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Option 1"));

    expect(onValueChange).toHaveBeenCalledWith("value1", expect.objectContaining({
        value: "value1",
        label: "Option 1",
    }));
});
```

---

## 커버리지

### 현재 커버리지 현황

`pnpm test:coverage` (v8, **`unit` 프로젝트**) 기준 - 98 test files / 1947 passed · 1 skipped.

> 아래 표와 CI 리포트는 모두 `unit` 프로젝트 기준입니다.

| 전체 | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| **All files** | **92.34%** | **90.6%** | **93.56%** | **94.15%** |

아래는 **100% 미만**인 것만 나열한 것입니다 (44개는 전 지표 100% 라 빠져 있습니다).

| 파일 | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| text/balanced.tsx | 70.95% | 61.26% | 67.86% | 75.97% |
| text/core.ts | 100% | 89.86% | 100% | 100% |
| text/dom.ts | 30.23% | 16.13% | 27.78% | 35.82% |
| text/layout.ts | 98.6% | 84.68% | 100% | 100% |
| text/measure.ts | 40.91% | 44.44% | 50% | 44.44% |
| text/prehydrate.ts | 0% | 0% | 0% | 0% |
| text/react.tsx | 100% | 93.1% | 100% | 100% |
| ui/display/accordion | 100% | 94.74% | 100% | 100% |
| ui/display/avatar | 100% | 82.76% | 100% | 100% |
| ui/display/chip | 96.43% | 98.04% | 85.71% | 100% |
| ui/display/data-view | 100% | 98.51% | 100% | 100% |
| ui/display/hero | 92.86% | 88.89% | 100% | 100% |
| ui/display/list-item | 100% | 93.55% | 100% | 100% |
| ui/display/media-card | 93.75% | 88.24% | 100% | 100% |
| ui/display/prose | 75.68% | 53.33% | 100% | 78.79% |
| ui/display/table | 98.32% | 96.86% | 96.97% | 99.02% |
| ui/feedback/alert | 99.06% | 93.75% | 100% | 100% |
| ui/feedback/linear-progress | 100% | 66.67% | 100% | 100% |
| ui/feedback/toast | 97.25% | 91.38% | 100% | 100% |
| ui/forms/checkbox | 95.83% | 91.67% | 100% | 100% |
| ui/forms/combobox | 100% | 99.12% | 95% | 100% |
| ui/forms/date-calendar | 99.4% | 98.64% | 100% | 100% |
| ui/forms/date-picker | 96.71% | 95.18% | 100% | 100% |
| ui/forms/dropdown | 97.83% | 92.99% | 100% | 98.75% |
| ui/forms/file | 89.47% | 89.23% | 100% | 93.06% |
| ui/forms/form | 100% | 92% | 100% | 100% |
| ui/forms/image-cropper | 81.82% | 82.24% | 71.88% | 83.23% |
| ui/forms/segmented-control | 97.22% | 94.34% | 100% | 100% |
| ui/forms/tag-input | 98.85% | 95.35% | 100% | 100% |
| ui/forms/textarea | 80% | 70.64% | 85.71% | 81.94% |
| ui/forms/textfield | 94.03% | 93.4% | 100% | 96.72% |
| ui/forms/time-picker | 94.83% | 96.2% | 100% | 100% |
| ui/navigation/bottom-nav | 95.83% | 91.67% | 100% | 95.83% |
| ui/navigation/menu | 98.92% | 96.92% | 100% | 100% |
| ui/navigation/nav-bar | 80.17% | 69.05% | 79.17% | 85.44% |
| ui/navigation/pagination | 100% | 97.87% | 100% | 100% |
| ui/navigation/sidebar | 85.29% | 91.94% | 80% | 87.88% |
| ui/navigation/stepper | 86.67% | 86.84% | 87.5% | 96.15% |
| ui/navigation/tabs | 96.83% | 89.23% | 100% | 99.07% |
| ui/overlay/popover | 97.73% | 97.3% | 100% | 100% |
| ui/overlay/tooltip | 100% | 91.43% | 100% | 100% |
| ui/system/theme-provider | 96.08% | 89.19% | 100% | 100% |
| utils/cn.ts | 100% | 87.5% | 100% | 100% |
| utils/overlay-stack.ts | 93.94% | 83.33% | 87.5% | 96.3% |
| utils/reveal-inline.ts | 71.43% | 50% | 100% | 100% |
| utils/scroll-lock.ts | 97.7% | 95.83% | 100% | 100% |
| utils/use-anchored-position.ts | 97.73% | 95% | 100% | 100% |
| utils/use-clipboard.ts | 98.68% | 83.33% | 100% | 98.63% |
| utils/use-focus-trap.ts | 100% | 98.04% | 100% | 100% |
| utils/use-form-reset.ts | 100% | 87.5% | 100% | 100% |
| utils/use-listbox-popup.ts | 99.33% | 100% | 100% | 99.18% |
| utils/use-reduced-motion.ts | 95.24% | 100% | 85.71% | 94.74% |
| utils/use-safe-layout-effect.ts | 100% | 50% | 100% | 100% |

> 이 절의 수치와 표는 `pnpm coverage:docs` 가 씁니다 - unit 테스트를 커버리지와 함께 돌리고
> `scripts/update-coverage-docs.py` 가 `coverage/coverage-summary.json` 기준으로 이 표와 `CLAUDE.md` 의 한 줄을 갱신합니다.
> 손으로 고치지 않습니다(예전에 788 tests 시절 수치로 굳어 있었습니다). 릴리즈 PR(develop → main)이 열리면 CI
> (`.github/workflows/coverage-docs.yml`)가 이 명령을 돌려 바뀐 수치를 develop 에 커밋합니다.

## 컴포넌트별 테스트 예시

### Button 테스트

```tsx
// src/ui/general/button/button.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./index";

describe("Button", () => {
    it("renders children", () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText("Click me")).toBeInTheDocument();
    });

    it("applies variant classes", () => {
        const { container, rerender } = render(<Button variant="filled">Test</Button>);
        expect(container.firstChild).toHaveClass("button_variant_filled");

        rerender(<Button variant="outline">Test</Button>);
        expect(container.firstChild).toHaveClass("button_variant_outline");
    });

    it("applies the danger modifier independently of variant", () => {
        const { container } = render(<Button variant="outline" danger>Delete</Button>);
        expect(container.firstChild).toHaveClass("button_variant_outline");
        expect(container.firstChild).toHaveClass("button_danger");
    });

    it("applies size classes", () => {
        const { container, rerender } = render(<Button size="sm">Test</Button>);
        expect(container.firstChild).toHaveClass("button_size_sm");

        rerender(<Button size="xl">Test</Button>);
        expect(container.firstChild).toHaveClass("button_size_xl");
    });

    it("calls onClick when clicked", () => {
        const onClick = vi.fn();
        render(<Button onClick={onClick}>Click</Button>);

        fireEvent.click(screen.getByRole("button"));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("is disabled when disabled prop is true", () => {
        render(<Button disabled>Click</Button>);
        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("applies full width class", () => {
        const { container } = render(<Button fullWidth>Click</Button>);
        expect(container.firstChild).toHaveClass("button_full_width");
    });

    it("forwards ref", () => {
        const ref = { current: null };
        render(<Button ref={ref}>Click</Button>);
        expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
});
```

### Modal 테스트

```tsx
// src/ui/overlay/modal/modal.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "./index";

describe("Modal", () => {
    it("renders when open is true", () => {
        render(<Modal open onClose={() => {}}>Content</Modal>);
        expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("does not render when open is false", () => {
        render(<Modal open={false} onClose={() => {}}>Content</Modal>);
        expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });

    it("renders title", () => {
        render(<Modal open title="Test Title" onClose={() => {}}>Content</Modal>);
        expect(screen.getByText("Test Title")).toBeInTheDocument();
    });

    it("calls onClose when overlay is clicked", () => {
        const onClose = vi.fn();
        render(<Modal open onClose={onClose}>Content</Modal>);

        // role="dialog" 는 오버레이(.modal) 자체에 있다. 누른 곳과 놓은 곳이 모두 오버레이여야 닫힌다
        const overlay = screen.getByRole("dialog");
        fireEvent.pointerDown(overlay);
        fireEvent.click(overlay);
        expect(onClose).toHaveBeenCalled();
    });

    it("does not close when panel is clicked", () => {
        const onClose = vi.fn();
        render(<Modal open onClose={onClose}>Content</Modal>);

        const panel = document.querySelector(".modal_panel")!;
        fireEvent.pointerDown(panel);
        fireEvent.click(panel);
        expect(onClose).not.toHaveBeenCalled();
    });

    it("has correct accessibility attributes", () => {
        render(<Modal open onClose={() => {}}>Content</Modal>);

        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveAttribute("aria-modal", "true");
    });
});
```

---

## 접근성(a11y) 테스트

### 개요

문서 사이트의 모든 예제(`site/examples/**/*.tsx`)가 axe-core 검사를 받습니다 - [`site/examples.browser.test.tsx`](../site/examples.browser.test.tsx).
예제는 문서에 보이는 화면이자 소비자가 복사해 가는 코드라, 실제로 쓰이는 조합이 그대로 검사됩니다.
`browser` 프로젝트(headless Chromium)에서 돌고, CI 는 `a11y` job 의 `pnpm test:browser` 가 돌립니다.

### 동작 방식

1. 예제를 하나씩 실제 DOM 에 렌더 (예제는 패키지 이름으로 import 하지만 `browser` 프로젝트 alias 가 `src/index.ts` 로 돌립니다)
2. `axe.run` 으로 WCAG 위반 검사 - 기본으로 꺼진 `target-size`(WCAG 2.2 SC 2.5.8)도 켭니다
3. 위반이 있으면 규칙 id 와 대상 선택자를 실패 메시지로 보여 줍니다

진입 transition 은 `src/test/browser-setup.ts` 가 끕니다 - 보간 중인 opacity 로 색 대비가 흔들리지 않게.

### 예외

규칙을 끄는 장치는 두지 않았습니다. 위반이 나면 예제나 컴포넌트를 고칩니다
(이 검사를 옮기며 찾은 것: aria-label 을 단 Badge dot 의 역할 없음, 패널 없는 Tabs 예제의 `aria-controls`).

다크 테마는 렌더하지 않습니다 - 다크 대비는 `pnpm check:dark-text` 가 정적으로 봅니다.

---

## 관련 문서

- [Contributing](./CONTRIBUTING.md) - 기여 가이드
- [Architecture](./ARCHITECTURE.md) - 프로젝트 구조
- [Components](./COMPONENTS.md) - 컴포넌트 사용법 · 구현 계약 (props 는 문서 사이트)
