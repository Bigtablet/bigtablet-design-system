<div align="center">

<img width="1800" height="300" alt="Image" src="https://github.com/user-attachments/assets/420a15cc-5be3-447f-9c64-068e946cb118" /> <br>

# Bigtablet Design System

[![npm version](https://img.shields.io/npm/v/@bigtablet/design-system.svg)](https://www.npmjs.com/package/@bigtablet/design-system)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Test Coverage](https://img.shields.io/badge/coverage-86%25-brightgreen.svg)](https://github.com/Bigtablet/bigtablet-design-system/actions)

🇰🇷 한국어 · [🇺🇸 English](./README.md)

Bigtablet의 공식 디자인 시스템으로, Foundation(디자인 토큰)과 Components(UI 컴포넌트)로 구성된 통합 UI 라이브러리입니다.

[GitHub](https://github.com/Bigtablet/bigtablet-design-system) · [NPM](https://www.npmjs.com/package/@bigtablet/design-system) · [Storybook](https://bigtablet.github.io/bigtablet-design-system)

</div>

---

## 주요 특징

| 특징 | 설명 |
|------|------|
| ⚛️ **React 19** | 최신 React 버전 완벽 지원 |
| 🔷 **TypeScript** | 모든 컴포넌트에 완전한 타입 정의 제공 |
| 📦 **Dual Bundle** | Pure React / Next.js 프레임워크별 번들 분리 |
| 🌐 **Vanilla JS** | Thymeleaf, JSP, PHP 등 서버 템플릿 환경 지원 |
| 🎨 **Design Tokens** | 색상, 타이포그래피, 간격 등 일관된 디자인 토큰 시스템 |
| ♿ **Accessibility** | 키보드 네비게이션, 스크린 리더 호환, ARIA 속성 완비 |
| 🧪 **86% Coverage** | Vitest 기반 안정적인 테스트 커버리지 |
| 🎭 **Storybook** | 모든 컴포넌트 인터랙티브 문서 제공 |

---

## 설치

```bash
# npm
npm install @bigtablet/design-system

# yarn
yarn add @bigtablet/design-system

# pnpm
pnpm add @bigtablet/design-system
```

**Peer Dependencies**

```bash
npm install react react-dom lucide-react
```

> React 18+ 및 Next.js 13+ 이상에서 사용하는 것을 권장합니다.

---

## 빠른 시작

### Pure React

```tsx
import { Button, TextField, Modal } from '@bigtablet/design-system';
import '@bigtablet/design-system/style.css';

function App() {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <TextField
        label="이메일"
        placeholder="email@example.com"
        helperText="업무용 이메일을 입력해 주세요."
      />
      <Button variant="primary" onClick={() => setOpen(true)}>확인</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="알림">
        안녕하세요!
      </Modal>
    </div>
  );
}
```

### Next.js

Next.js 환경에서는 `/next` 경로에서 import합니다. `Sidebar`는 `next/link`를 사용하므로 반드시 이 경로를 사용하세요.

```tsx
// app/layout.tsx
import { Sidebar } from '@bigtablet/design-system/next';
import '@bigtablet/design-system/style.css';

const navItems = [
  { label: '홈', href: '/home', icon: HomeIcon },
  {
    type: 'group' as const,
    id: 'settings',
    label: '설정',
    icon: SettingsIcon,
    children: [
      { label: '프로필', href: '/settings/profile' },
      { label: '보안', href: '/settings/security' },
    ],
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar items={navItems} activePath="/home" />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
```

### Provider 설정

`Alert`와 `Toast`는 앱 최상단에 Provider를 추가해야 합니다.

```tsx
// app/layout.tsx 또는 _app.tsx
import { AlertProvider, ToastProvider } from '@bigtablet/design-system';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AlertProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AlertProvider>
      </body>
    </html>
  );
}
```

**Alert 사용 예시**

```tsx
import { useAlert } from '@bigtablet/design-system';

function MyComponent() {
  const { showAlert } = useAlert();

  return (
    <Button
      onClick={() =>
        showAlert({
          title: '삭제',
          message: '정말 삭제하시겠습니까?',
          showCancel: true,
          onConfirm: () => console.log('삭제 완료'),
        })
      }
    >
      삭제
    </Button>
  );
}
```

**Toast 사용 예시**

```tsx
import { useToast } from '@bigtablet/design-system';

function MyComponent() {
  const toast = useToast();

  return (
    <div>
      <Button onClick={() => toast.success('저장되었습니다!')}>저장</Button>
      <Button onClick={() => toast.error('오류가 발생했습니다.')}>오류</Button>
      <Button onClick={() => toast.warning('세션이 곧 만료됩니다.')}>경고</Button>
      <Button onClick={() => toast.info('새 버전이 있습니다.')}>정보</Button>
      {/* 두 번째 인수로 표시 시간(ms) 지정 */}
      <Button onClick={() => toast.success('저장 완료!', 5000)}>저장 (5초)</Button>
    </div>
  );
}
```

### Vanilla JS (HTML/CSS/JS)

React를 사용하지 않는 환경(Thymeleaf, JSP, PHP 등)에서는 CDN으로 바로 사용할 수 있습니다.

```html
<link rel="stylesheet" href="https://unpkg.com/@bigtablet/design-system/dist/vanilla/bigtablet.min.css">
<script src="https://unpkg.com/@bigtablet/design-system/dist/vanilla/bigtablet.min.js"></script>

<!-- 버튼 -->
<button class="bt-button bt-button--md bt-button--primary">Primary</button>
<button class="bt-button bt-button--md bt-button--secondary">Secondary</button>

<!-- 텍스트 필드 -->
<div class="bt-text-field">
  <label class="bt-text-field__label">이름</label>
  <div class="bt-text-field__wrap">
    <input type="text" class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--md" placeholder="입력해 주세요">
  </div>
</div>

<!-- Alert (JS API) -->
<script>
  Bigtablet.Alert({
    title: '확인',
    message: '계속 진행하시겠습니까?',
    showCancel: true,
    onConfirm: () => console.log('확인'),
  });
</script>
```

---

## 컴포넌트

| 카테고리 | 컴포넌트 |
|----------|----------|
| **General** | `Button`, `Select` |
| **Form** | `TextField`, `Checkbox`, `Radio`, `Switch`, `DatePicker`, `FileInput` |
| **Feedback** | `Alert`, `Toast`, `Spinner`, `TopLoading` |
| **Navigation** | `Pagination`, `Sidebar` |
| **Overlay** | `Modal` |
| **Display** | `Card` |

👉 **[전체 컴포넌트 문서](./docs/COMPONENTS.md)**

---

## 디자인 토큰

일관된 디자인을 위해 SCSS 토큰과 CSS 커스텀 프로퍼티를 함께 제공합니다.

```scss
// SCSS
@use "src/styles/scss/token" as token;

.my-component {
  color: token.$color_text_primary;
  padding: token.$spacing_md;
  border-radius: token.$radius_md;
}
```

```css
/* CSS Custom Properties */
.my-component {
  color: var(--bt-color-text-primary);
  padding: var(--bt-spacing-md);
  border-radius: var(--bt-radius-md);
}
```

주요 토큰 카테고리: `colors`, `spacing`, `typography`, `radius`, `shadows`, `motion`, `z-index`, `breakpoints`

---

## 문서

| 문서 | 설명 |
|------|------|
| [Components](./docs/COMPONENTS.md) | 컴포넌트 Props API 및 사용 예시 |
| [Vanilla JS](./docs/VANILLA.md) | HTML/CSS/JS 환경 통합 가이드 |
| [Architecture](./docs/ARCHITECTURE.md) | 프로젝트 구조 및 설계 원칙 |
| [Contributing](./docs/CONTRIBUTING.md) | 개발 환경 설정 및 기여 방법 |
| [Testing](./docs/TESTING.md) | 테스트 작성 패턴 및 가이드 |

---

## 개발

```bash
pnpm install       # 의존성 설치
pnpm storybook     # Storybook 실행 (port 6006)
pnpm build         # 라이브러리 빌드
pnpm dev           # 와치 모드
pnpm test          # 테스트 실행
pnpm test:coverage # 커버리지 리포트
```

> 개발 환경 설정 상세 가이드 → **[Contributing](./docs/CONTRIBUTING.md)**

---

## 브라우저 지원

| Browser | Version |
|---------|---------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 13+ |
| Edge | 80+ |

---

## 라이센스

[Bigtablet License](https://github.com/Bigtablet/.github/blob/main/BIGTABLET_LICENSE.md)

---

<div align="center">

[GitHub](https://github.com/Bigtablet/bigtablet-design-system) · [NPM](https://www.npmjs.com/package/@bigtablet/design-system) · [Storybook](https://bigtablet.github.io/bigtablet-design-system) · [Issues](https://github.com/Bigtablet/bigtablet-design-system/issues)

</div>
