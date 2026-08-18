# Testing

Bigtablet Design System의 테스트 작성 가이드입니다.

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

- **Vitest** - 테스트 러너 (multi-project: `unit` + `storybook`)
- **React Testing Library** - 컴포넌트 테스트
- **jsdom** - DOM 환경 (unit 테스트)
- **Playwright** - 브라우저 환경 (a11y 테스트, headless Chromium)
- **@storybook/addon-a11y** - axe-core 기반 접근성 자동 테스트
- **v8** - 커버리지 프로바이더

### 설정 파일

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        setupFiles: ["./src/test/setup.ts"],
        include: ["src/**/*.test.{ts,tsx}"],
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "json-summary", "html"],
            include: ["src/ui/**/*.{ts,tsx}", "src/utils/**/*.{ts,tsx}"],
            exclude: ["**/*.test.{ts,tsx}", "**/*.stories.{ts,tsx}"],
        },
    },
});
```

### Setup 파일

```ts
// src/test/setup.ts
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});
```

---

## 테스트 실행

```bash
# 전체 테스트 실행
pnpm test

# Watch 모드
pnpm test:watch

# 특정 파일만 테스트
pnpm vitest run src/ui/general/button/Button.test.tsx

# 커버리지 리포트
pnpm test:coverage

# a11y 테스트 (Storybook + Playwright)
pnpm test:storybook

# UI 모드
pnpm vitest --ui
```

---

## 테스트 작성 가이드

### 파일 위치

테스트 파일은 컴포넌트와 같은 디렉토리에 위치합니다:

```
src/ui/general/button/
├── index.tsx
├── style.scss
└── Button.test.tsx    # 테스트 파일
```

### Vanilla 번들 테스트

`src/vanilla/bigtablet.test.ts` 가 Vanilla 번들(`Dropdown` / `Modal` / `Toggle` / `Alert`)을 덮는다.
React 쪽 `unit` 프로젝트에 그대로 포함되므로 `pnpm test` 로 함께 돈다.

```ts
// UMD 번들이지만 Vite 가 named export 로 노출해준다. 소비자는 `<script>` + 전역 `Bigtablet`
// 로 쓰지만 부착 경로만 다르고 검사 대상 로직은 같다. 빌드 산출물이 아니라 소스를 import 해서
// 소스 변경이 곧 테스트에 걸리게 한다.
import { Alert, Dropdown, Modal, Toggle } from "./bigtablet.js";
```

주의할 점:

- **jsdom 은 레이아웃을 하지 않는다.** 스크롤바 폭(`innerWidth - documentElement.clientWidth`)은 항상 0
  이므로, 스크롤 잠금 보정을 검사하려면 두 값을 직접 세워야 한다 (`setScrollbarWidth` 헬퍼 참고).
- **내부 함수는 export 되지 않는다.** `lockScroll` / `unlockScroll` 는 `Modal` · `Alert` 를 열고
  닫으며 간접 검사한다 - 통합 경로를 함께 보게 되어 오히려 낫다.
- **문서화된 마크업으로 시작한다.** 서버 템플릿이 렌더하는 형태(평면 `<ul>`, 서버가 심어둔 hidden
  input 등)를 그대로 세워야 실제 회귀를 잡는다 - 실제로 그 두 경로에서 버그가 나왔다.

> 커버리지 집계(`vitest.config.ts` 의 `coverage.include`)는 아직 `src/ui/**` · `src/utils/**` 만
> 본다. Vanilla 를 넣으면 전체 수치가 크게 떨어지므로 별건으로 다룬다 - 테스트 자체는 이미 돈다.

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

모든 컴포넌트는 다음 항목을 테스트해야 합니다:

- [ ] 기본 렌더링
- [ ] 모든 Props 동작
- [ ] 이벤트 핸들러
- [ ] 비활성화 상태
- [ ] 접근성 속성
- [ ] 조건부 렌더링
- [ ] 에러 상태

---

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
    expect(container.firstChild).toHaveClass("size_lg");
});

it("applies default props", () => {
    const { container } = render(<Button>Click</Button>);
    expect(container.firstChild).toHaveClass("variant_primary");
    expect(container.firstChild).toHaveClass("size_md");
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
        const { rerender } = render(<Toggle checked={false} onChange={() => {}} />);
        expect(screen.getByRole("switch")).not.toHaveClass("toggle_on");

        rerender(<Toggle checked={true} onChange={() => {}} />);
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
it("calls onChange with new value", () => {
    const onChange = vi.fn();
    render(<TextField onChange={onChange} />);

    fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "test" }
    });

    expect(onChange).toHaveBeenCalled();
});

it("shows error state", () => {
    render(<TextField error supportingText="Error message" />);

    expect(screen.getByRole("textbox")).toHaveClass("text_field_input_error");
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
    const onChange = vi.fn();
    render(<Dropdown options={options} onChange={onChange} />);

    // Select option
    fireEvent.click(screen.getByText("Option 1"));

    expect(onChange).toHaveBeenCalledWith("value1", expect.objectContaining({
        value: "value1",
        label: "Option 1",
    }));
});
```

---

## 커버리지

### 현재 커버리지 현황

`pnpm test:coverage` (v8, `unit` 프로젝트) 기준 - 55 test files / 788 passed · 9 skipped.

| 전체 | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| **All files** | **90.02%** | **85.69%** | **90.07%** | **91.97%** |

아래는 **100% 미만**인 파일만 나열한 것이다 (미표기 컴포넌트 = 전 지표 100%: Button · Card · Radio · Spinner · Pagination · TopLoading · Badge · Divider · Skeleton · Toggle · Breadcrumb · EmptyState · ErrorState · IconButton · Container/Section/Stack/Grid 등).

| 파일 | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| ui/display/accordion | 100% | 80% | 100% | 100% |
| ui/display/avatar | 84.61% | 88% | 66.66% | 90.9% |
| ui/display/chip | 86.95% | 80.43% | 66.66% | 95.23% |
| ui/display/hero | 92.85% | 88.88% | 100% | 100% |
| **ui/display/icon** | **0%** | **0%** | **0%** | **0%** |
| ui/display/list-item | 100% | 93.33% | 100% | 100% |
| ui/display/media-card | 100% | 96.29% | 100% | 100% |
| ui/display/table | 98.07% | 92.79% | 95.65% | 97.77% |
| ui/feedback/alert | 96.92% | 93.44% | 100% | 98.27% |
| ui/feedback/linear-progress | 100% | 66.66% | 100% | 100% |
| ui/feedback/toast | 100% | 84.21% | 100% | 100% |
| ui/forms/checkbox | 91.66% | 90% | 100% | 100% |
| ui/forms/date-picker | 91.86% | 80.16% | 100% | 97.1% |
| ui/forms/dropdown | 96.42% | 90.64% | 100% | 96.49% |
| ui/forms/file | 80.43% | 65% | 83.33% | 80% |
| **ui/forms/image-cropper** | **57.04%** | **55.29%** | **50%** | **58.33%** |
| ui/forms/otp-input | 89.28% | 91.66% | 100% | 89.33% |
| ui/forms/radio-group | 100% | 95.45% | 100% | 100% |
| ui/forms/textarea | 88.33% | 74.69% | 100% | 92.85% |
| ui/forms/textfield | 90.47% | 82.75% | 77.77% | 92.68% |
| ui/navigation/bottom-nav | 94.73% | 95% | 100% | 94.73% |
| ui/navigation/menu | 97.29% | 89.13% | 100% | 100% |
| ui/navigation/nav-bar | 80.39% | 71.25% | 81.81% | 85.55% |
| ui/navigation/sidebar | 83.33% | 88.63% | 75% | 86.95% |
| ui/navigation/tabs | 91.42% | 78.18% | 88.88% | 100% |
| ui/overlay/drawer | 97.91% | 95.16% | 100% | 100% |
| ui/overlay/modal | 97.67% | 93.93% | 100% | 100% |
| ui/overlay/popover | 91.3% | 85.71% | 100% | 92.68% |
| ui/overlay/tooltip | 92.98% | 83.33% | 93.33% | 91.66% |
| ui/system/theme-provider | 93.87% | 85.71% | 100% | 100% |
| utils | 90.14% | 83.18% | 78.57% | 91.93% |

> ⚠️ **80% 기준선 미달 (개선 필요)**
> - **`ui/display/icon` — 0%**: 단위 테스트가 아예 없다. `aria-hidden` 자동 적용 / `aria-label` 지정 시 미적용 두 분기만이라도 커버해야 한다.
> - **`ui/forms/image-cropper` — 57.04%**: canvas·pointer 조작 경로(`crop()`, 드래그, 휠 줌)가 jsdom 에서 대부분 미커버. `utils/use-spring-hover.ts` 도 10% 로 낮다.

### 커버리지 목표

- 새 컴포넌트: 최소 80% 커버리지
- 전체 목표: 85% 이상 유지 (현재 90.02%)

### 커버리지 리포트 확인

```bash
# 터미널에서 확인
pnpm test:coverage

# HTML 리포트 생성
pnpm vitest run --coverage

# coverage/index.html 파일 열기
open coverage/index.html
```

---

## 컴포넌트별 테스트 예시

### Button 테스트

```tsx
// src/ui/general/button/Button.test.tsx
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

    it("applies fullWidth class", () => {
        const { container } = render(<Button fullWidth>Click</Button>);
        expect(container.firstChild).toHaveClass("fullWidth");
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
// src/ui/overlay/modal/Modal.test.tsx
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

        fireEvent.click(screen.getByRole("dialog").parentElement!);
        expect(onClose).toHaveBeenCalled();
    });

    it("does not close when panel is clicked", () => {
        const onClose = vi.fn();
        render(<Modal open onClose={onClose}>Content</Modal>);

        fireEvent.click(screen.getByRole("dialog"));
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

모든 Storybook 스토리는 `@storybook/addon-a11y`를 통해 axe-core 기반 접근성 검사를 자동으로 수행합니다.
CI에서는 Playwright(headless Chromium)로 실제 DOM에서 렌더링하여 테스트합니다.

### 동작 방식

1. Storybook 스토리가 Playwright 브라우저에서 렌더링
2. axe-core가 각 스토리에 대해 WCAG 위반 검사
3. `error` 모드로 설정되어 위반 시 테스트 실패

### 설정

```ts
// .storybook/preview.ts
const preview: Preview = {
    parameters: {
        a11y: {
            test: "error",  // 위반 시 에러 발생
        },
    },
};
```

### 특정 스토리 비활성화

의도적으로 접근성 위반을 보여주는 데모 스토리 등에서 사용:

```tsx
// 스토리 단위 비활성화
export const DemoStory: Story = {
    parameters: {
        a11y: { test: "off" },
    },
};

// 스토리 전체를 Vitest에서 제외
const meta: Meta = {
    tags: ["autodocs", "!test"],
};
```

### CI 파이프라인

```yaml
# .github/workflows/ci.yml
- name: Install Playwright browsers
  run: pnpm exec playwright install --with-deps chromium

- name: Run a11y tests (Storybook)
  run: pnpm test:storybook
```

---

## 관련 문서

- [Contributing](./CONTRIBUTING.md) - 기여 가이드
- [Architecture](./ARCHITECTURE.md) - 프로젝트 구조
- [Components](./COMPONENTS.md) - 컴포넌트 API
