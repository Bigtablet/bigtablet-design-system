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
    render(<Select options={options} onChange={onChange} />);

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

| 카테고리 | 커버리지 |
|----------|----------|
| **전체** | 86% |
| Button | 100% |
| Card | 100% |
| Radio | 100% |
| Alert | 100% |
| Spinner | 100% |
| Pagination | 100% |
| TopLoading | 100% |
| FileInput | 100% |
| Chip | 95% |
| Modal | 97% |
| Toggle | 93% |
| Checkbox | 91% |
| DatePicker | 90% |
| Toast | 90% |
| TextField | 74% |
| Select | 69% |

### 커버리지 목표

- 새 컴포넌트: 최소 80% 커버리지
- 전체 목표: 85% 이상 유지

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
        const { container, rerender } = render(<Button variant="primary">Test</Button>);
        expect(container.firstChild).toHaveClass("variant_primary");

        rerender(<Button variant="danger">Test</Button>);
        expect(container.firstChild).toHaveClass("variant_danger");
    });

    it("applies size classes", () => {
        const { container, rerender } = render(<Button size="sm">Test</Button>);
        expect(container.firstChild).toHaveClass("size_sm");

        rerender(<Button size="lg">Test</Button>);
        expect(container.firstChild).toHaveClass("size_lg");
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
