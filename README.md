<div align="center">

<img width="1800" height="300" alt="Image" src="https://github.com/user-attachments/assets/420a15cc-5be3-447f-9c64-068e946cb118" /> <br>

# Bigtablet Design System

[![npm version](https://img.shields.io/npm/v/@bigtablet/design-system.svg)](https://www.npmjs.com/package/@bigtablet/design-system)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Test Coverage](https://img.shields.io/badge/coverage-86%25-brightgreen.svg)](https://github.com/Bigtablet/bigtablet-design-system/actions)

Bigtablet의 공식 디자인 시스템으로, Foundation(디자인 토큰)과 Components(UI 컴포넌트)로 구성된 통합 UI 라이브러리입니다.

[GitHub](https://github.com/Bigtablet/bigtablet-design-system) · [NPM](https://www.npmjs.com/package/@bigtablet/design-system) · [Storybook](https://bigtablet.github.io/bigtablet-design-system)

</div>

---

## 주요 특징

- **React 19 지원** - 최신 React 버전 완벽 지원
- **TypeScript** - 완전한 타입 안정성
- **Pure React / Next.js** - 프레임워크별 최적화된 번들 제공
- **Vanilla JS** - Thymeleaf, JSP 등 서버 템플릿 지원
- **디자인 토큰** - 일관된 색상, 타이포그래피, 간격 시스템
- **접근성(a11y)** - 키보드 네비게이션, 스크린 리더 호환
- **86% 테스트 커버리지** - 안정적인 컴포넌트 품질

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

### Peer Dependencies

```bash
npm install react react-dom lucide-react react-toastify
```

---

## 빠른 시작

### Pure React

```tsx
import { Button, TextField } from '@bigtablet/design-system';
import '@bigtablet/design-system/style.css';

function App() {
  return (
    <div>
      <TextField label="이메일" placeholder="email@example.com" />
      <Button variant="primary">제출</Button>
    </div>
  );
}
```

### Next.js

```tsx
import { Sidebar, Button } from '@bigtablet/design-system/next';
import '@bigtablet/design-system/style.css';

export default function Layout({ children }) {
  return (
    <div>
      <Sidebar items={[{ label: '홈', href: '/' }]} />
      <main>{children}</main>
    </div>
  );
}
```

### Vanilla JS (HTML/CSS/JS)

```html
<link rel="stylesheet" href="https://unpkg.com/@bigtablet/design-system/dist/vanilla/bigtablet.min.css">
<script src="https://unpkg.com/@bigtablet/design-system/dist/vanilla/bigtablet.min.js"></script>

<button class="bt-button bt-button--md bt-button--primary">버튼</button>
```

---

## 컴포넌트

| Category | Components |
|----------|------------|
| **General** | Button, Select |
| **Form** | TextField, Checkbox, Radio, Switch, DatePicker, FileInput |
| **Feedback** | Alert, Toast, Spinner, TopLoading |
| **Navigation** | Pagination, Sidebar |
| **Overlay** | Modal |
| **Display** | Card |

👉 **[전체 컴포넌트 문서](./docs/COMPONENTS.md)**

---

## 문서

| 문서 | 설명 |
|------|------|
| [Components](./docs/COMPONENTS.md) | 컴포넌트 API 및 사용법 |
| [Vanilla JS](./docs/VANILLA.md) | HTML/CSS/JS 환경 가이드 |
| [Architecture](./docs/ARCHITECTURE.md) | 프로젝트 구조 및 아키텍처 |
| [Contributing](./docs/CONTRIBUTING.md) | 기여 가이드라인 |
| [Testing](./docs/TESTING.md) | 테스트 작성 가이드 |

---

## 개발

```bash
pnpm install       # 의존성 설치
pnpm storybook     # Storybook 실행 (port 6006)
pnpm build         # 라이브러리 빌드
pnpm test          # 테스트 실행
```

👉 **[개발 환경 설정](./docs/CONTRIBUTING.md#개발-환경-설정)**

---

## 라이센스

[Bigtablet License](https://github.com/Bigtablet/.github/blob/main/BIGTABLET_LICENSE.md)

---

## 링크

- [GitHub](https://github.com/Bigtablet/bigtablet-design-system)
- [NPM](https://www.npmjs.com/package/@bigtablet/design-system)
- [Storybook](https://bigtablet.github.io/bigtablet-design-system)
- [Issues](https://github.com/Bigtablet/bigtablet-design-system/issues)
