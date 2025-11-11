# Design System Architecture

## Overview

이 디자인 시스템은 **React**와 **Next.js** 환경 모두에서 사용할 수 있도록 설계되었습니다.

## 패키지 구조

### 번들 분리 전략

프로젝트는 두 개의 독립적인 번들로 분리되어 있습니다:

#### 1. 메인 번들 (`index.ts` → `dist/index.js`)
- **목적**: 프레임워크에 독립적인 순수 React 컴포넌트
- **사용 환경**: React, Vue (with React wrapper), Angular (with React wrapper), 모든 React 기반 프레임워크
- **의존성**: `react`, `react-dom`, `lucide-react`, `react-toastify`
- **번들 크기**: ~15KB (gzipped)

#### 2. Next.js 번들 (`next.ts` → `dist/next.js`)
- **목적**: Next.js 전용 컴포넌트 (routing, image optimization 활용)
- **사용 환경**: Next.js 14+
- **의존성**: `next/link`, `next/image`, `next`
- **번들 크기**: ~2KB (gzipped)

## 왜 이렇게 분리했나?

### 문제점
Sidebar 컴포넌트가 `next/link`와 `next/image`를 직접 import하고 있어:
- 순수 React 프로젝트에서 사용 불가능
- Next.js가 없는 환경에서 빌드 에러 발생
- 불필요한 의존성 강제

### 해결책
1. **번들 분리**: Next.js 의존 컴포넌트를 별도 엔트리포인트로 분리
2. **Optional Peer Dependency**: Next.js를 선택적 의존성으로 설정
3. **명확한 Import 경로**:
   - `@bigtablet/design-system` - 순수 React
   - `@bigtablet/design-system/next` - Next.js 전용

## Export 구조

### `src/index.ts` (메인)
```typescript
// Pure React components
export { Button } from "./ui/general/button";
export { Card } from "./ui/display/card";
export { Alert } from "./ui/feedback/alert";
export { Loading } from "./ui/feedback/loading";
export { Modal } from "./ui/overlay/modal";
export { TextField } from "./ui/form/textfield";
export { Checkbox } from "./ui/form/checkbox";
export { Radio } from "./ui/form/radio";
export { Switch } from "./ui/form/switch";
export { Select } from "./ui/general/select";
export { FileInput } from "./ui/form/file";
export { Pagination } from "./ui/navigation/pagination";
export { ToastProvider } from "./ui/feedback/toast";
export { useToast } from "./ui/feedback/toast/useToast";
export { default as SkeletonCard } from "./ui/skeleton/card";
export { SkeletonList } from "./ui/skeleton/list";
```

### `src/next.ts` (Next.js)
```typescript
// Next.js-specific components
export { Sidebar } from "./ui/navigation/sidebar";
export type { SidebarProps, SidebarItem } from "./ui/navigation/sidebar";
```

## 빌드 설정

### `tsup.config.ts`
```typescript
export default defineConfig([
  {
    // Pure React bundle
    entry: { index: "src/index.ts" },
    external: ["react", "react-dom", "lucide-react", "react-toastify"],
  },
  {
    // Next.js bundle
    entry: { next: "src/next.ts" },
    external: ["react", "react-dom", "next/link", "next/image", "next"],
  },
]);
```

### `package.json` exports
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./next": {
      "types": "./dist/next.d.ts",
      "import": "./dist/next.js"
    },
    "./styles.css": "./dist/index.css"
  },
  "peerDependenciesMeta": {
    "next": {
      "optional": true
    }
  }
}
```

## 스타일 관리

### SCSS 구조
```
src/styles/
├── token.scss          # Design tokens (colors, spacing, typography)
├── _variables.scss     # SCSS variables
├── _typography.scss    # Typography mixins
└── _flex.scss         # Flexbox utilities
```

### 스타일 Import 패턴
모든 컴포넌트 스타일에서:
```scss
@use "src/styles/token" as *;
```

### CSS 번들링
- 모든 컴포넌트 스타일이 하나의 `index.css`로 번들링됨
- 사용자는 `import "@bigtablet/design-system/styles.css"` 한 번만 하면 됨

## 🧪 Storybook 설정

### Next.js 컴포넌트 Mock
Storybook에서 Next.js 컴포넌트를 테스트하기 위해 mock 구현:

```typescript
// .storybook/mocks/next-link.tsx
const Link = ({ href, children, ...props }) => (
  <a href={href} {...props}>{children}</a>
);

// .storybook/mocks/next-image.tsx
const Image = ({ src, alt, width, height, ...props }) => (
  <img src={src} alt={alt} width={width} height={height} {...props} />
);
```

### Vite alias 설정
```typescript
// .storybook/main.ts
viteFinal: async (cfg) => {
  cfg.resolve.alias = {
    "next/link": path.resolve(__dirname, "./mocks/next-link.tsx"),
    "next/image": path.resolve(__dirname, "./mocks/next-image.tsx"),
  };
}
```

## 번들 분석

### 메인 번들 (index.js)
- Button, Card, Alert, Loading, Modal
- TextField, Checkbox, Radio, Switch, Select
- Pagination, Toast, Skeleton
- **Total**: ~15KB (gzipped with tree-shaking)

### Next.js 번들 (next.js)
- Sidebar (with styles)
- **Total**: ~2KB (gzipped)

## 호환성 매트릭스

| 환경 | 메인 번들 | Next.js 번들 | 비고 |
|------|----------|-------------|------|
| Create React App | ✅ | ❌ | Next.js 없음 |
| Vite + React | ✅ | ❌ | Next.js 없음 |
| Next.js 14+ | ✅ | ✅ | 모든 컴포넌트 사용 가능 |
| Next.js 13 | ✅ | ⚠️ | App Router 필요 |
| Remix | ✅ | ❌ | 별도 adapter 필요 |
| Gatsby | ✅ | ❌ | SSR 고려 필요 |

## 마이그레이션 가이드

### 기존 `client.ts` 사용자
```typescript
// Before
import { Button, Sidebar } from "@bigtablet/design-system/client";

// After - React only
import { Button } from "@bigtablet/design-system";

// After - Next.js
import { Button } from "@bigtablet/design-system";
import { Sidebar } from "@bigtablet/design-system/next";
```