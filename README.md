# Bigtablet Design System

[![npm version](https://img.shields.io/npm/v/@bigtablet/design-system.svg)](https://www.npmjs.com/package/@bigtablet/design-system)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Bigtablet의 공식 디자인 시스템으로, Foundation(디자인 토큰)과 Components(UI 컴포넌트)로 구성된 통합 UI 라이브러리입니다.

> **현재 버전**: v1.10.0 | **최근 업데이트**: 2025년 1월 7일

[깃허브 링크](https://github.com/Bigtablet/bigtablet-design-system) | [📦 NPM 패키지](https://www.npmjs.com/package/@bigtablet/design-system)

---

## 목차

- [주요 특징](#주요-특징)
- [설치](#설치)
- [빠른 시작](#빠른-시작)
- [프로젝트 구조](#프로젝트-구조)
- [Foundation (디자인 토큰)](#foundation-디자인-토큰)
- [Components (UI 컴포넌트)](#components-ui-컴포넌트)
- [개발 가이드](#개발-가이드)
- [기여하기](#기여하기)
- [라이센스](#라이센스)

---

## 주요 특징

**체계적인 구조**
- Foundation과 Components의 명확한 분리
- TypeScript 기반 타입 안정성
- SCSS 기반 스타일 토큰 관리

**개발자 경험**
- Storybook 8 기반 인터랙티브 문서화
- Chromatic 시각적 회귀 테스트
- Pure React / Next.js 전용 번들 제공

**최신 기술 스택**
- React 19 지원
- pnpm 워크스페이스
- GitHub Actions 자동 배포
- Changesets 기반 버전 관리

**디자인 시스템**
- 일관된 디자인 토큰 (색상, 타이포그래피, 간격 등)
- 접근성(a11y) 기본 지원
- 다크모드 준비중

---

## 설치

### npm
```bash
npm install @bigtablet/design-system
```

### yarn
```bash
yarn add @bigtablet/design-system
```

### pnpm
```bash
pnpm add @bigtablet/design-system
```

---

## 빠른 시작

### Pure React 프로젝트

```tsx
import { Button, TextField } from '@bigtablet/design-system';
import '@bigtablet/design-system/styles';

function App() {
  return (
    <div>
      <TextField 
        label="이메일" 
        type="email" 
        placeholder="email@example.com"
      />
      <Button variant="primary" size="md">
        제출하기
      </Button>
    </div>
  );
}
```

### Next.js 프로젝트

```tsx
import { Sidebar, Button } from '@bigtablet/design-system/next';
import '@bigtablet/design-system/styles';

export default function Layout({ children }) {
  return (
    <div>
      <Sidebar 
        items={[
          { label: '홈', href: '/' },
          { label: '대시보드', href: '/dashboard' }
        ]}
      />
      <main>{children}</main>
    </div>
  );
}
```

### Foundation 토큰 사용

```tsx
import { colors, spacing, typography } from '@bigtablet/design-system/foundation';

const StyledComponent = styled.div`
  color: ${colors.brand.primary};
  padding: ${spacing.md};
  font-size: ${typography.body.fontSize};
`;
```

---

## 프로젝트 구조

```
bigtablet-design-system/
├── .changeset/              # 버전 관리 설정
├── .github/
│   └── workflows/           # CI/CD 파이프라인
├── .storybook/              # Storybook 설정
├── public/                  # 정적 리소스
├── scripts/                 # 빌드 및 배포 스크립트
├── src/
│   ├── styles/
│   │   ├── ts/             # TypeScript 디자인 토큰
│   │   │   ├── colors.ts
│   │   │   ├── spacing.ts
│   │   │   ├── typography.ts
│   │   │   ├── radius.ts
│   │   │   ├── shadows.ts
│   │   │   ├── motion.ts
│   │   │   ├── z-index.ts
│   │   │   ├── breakpoints.ts
│   │   │   └── a11y.ts
│   │   └── scss/           # SCSS 믹스인 및 변수
│   ├── ui/
│   │   ├── form/           # 입력 컴포넌트
│   │   │   ├── Button/
│   │   │   ├── TextField/
│   │   │   ├── Checkbox/
│   │   │   ├── Radio/
│   │   │   ├── Switch/
│   │   │   ├── Select/
│   │   │   └── FileInput/
│   │   ├── feedback/       # 피드백 컴포넌트
│   │   │   ├── Alert/
│   │   │   ├── Toast/
│   │   │   └── Loading/
│   │   ├── navigation/     # 네비게이션 컴포넌트
│   │   │   ├── Pagination/
│   │   │   └── Sidebar/
│   │   ├── overlay/        # 오버레이 컴포넌트
│   │   │   └── Modal/
│   │   ├── display/        # 표시 컴포넌트
│   │   │   └── Card/
│   │   └── skeleton/       # 스켈레톤 컴포넌트
│   │       ├── SkeletonCard/
│   │       └── SkeletonList/
│   ├── index.ts            # Pure React 진입점
│   └── next.ts             # Next.js 진입점
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

---

## Foundation (디자인 토큰)

Foundation은 **모든 컴포넌트의 기반이 되는 디자인 규칙**입니다. 컴포넌트 구현 시 임의의 값을 사용하지 않고 반드시 Foundation 토큰을 사용해야 합니다.

### 1. Colors (색상)

브랜드 색상, 배경색, 텍스트 색상, 상태 색상을 정의합니다.

```typescript
// src/styles/ts/colors.ts
export const colors = {
  brand: {
    primary: '#0066FF',
    secondary: '#00C896',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
  },
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
  },
  status: {
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  }
};
```

**사용 예시:**
```tsx
<Button style={{ backgroundColor: colors.brand.primary }}>
  클릭
</Button>
```

### 2. Spacing (간격)

일관된 레이아웃을 위한 margin, padding, gap 기준을 정의합니다.

```typescript
// src/styles/ts/spacing.ts
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};
```

### 3. Typography (타이포그래피)

폰트 패밀리, 크기, 굵기, 줄 간격을 정의합니다.

```typescript
// src/styles/ts/typography.ts
export const typography = {
  fontFamily: {
    base: 'Pretendard, -apple-system, sans-serif',
    mono: 'Fira Code, monospace',
  },
  heading: {
    h1: { fontSize: '32px', lineHeight: '40px', fontWeight: 700 },
    h2: { fontSize: '24px', lineHeight: '32px', fontWeight: 700 },
    h3: { fontSize: '20px', lineHeight: '28px', fontWeight: 600 },
  },
  body: {
    large: { fontSize: '16px', lineHeight: '24px', fontWeight: 400 },
    medium: { fontSize: '14px', lineHeight: '20px', fontWeight: 400 },
    small: { fontSize: '12px', lineHeight: '16px', fontWeight: 400 },
  }
};
```

### 4. Radius (둥근 모서리)

컴포넌트의 모서리 둥글기 기준을 정의합니다.

```typescript
// src/styles/ts/radius.ts
export const radius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
};
```

### 5. Shadows (그림자)

elevation 레벨에 따른 그림자를 정의합니다.

```typescript
// src/styles/ts/shadows.ts
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
};
```

### 6. Motion (애니메이션)

transition duration과 easing curve를 정의합니다.

```typescript
// src/styles/ts/motion.ts
export const motion = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  }
};
```

### 7. Z-Index (레이어 우선순위)

컴포넌트 레이어의 우선순위를 정의합니다.

```typescript
// src/styles/ts/z-index.ts
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 1300,
  toast: 1400,
  tooltip: 1500,
};
```

### 8. Breakpoints (반응형 기준)

반응형 디자인을 위한 화면 크기 기준을 정의합니다.

```typescript
// src/styles/ts/breakpoints.ts
export const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  laptop: '1024px',
  desktop: '1440px',
};
```

### 9. Accessibility (접근성)

접근성을 위한 기준을 정의합니다.

```typescript
// src/styles/ts/a11y.ts
export const a11y = {
  focusRing: '0 0 0 3px rgba(0, 102, 255, 0.3)',
  focusRingError: '0 0 0 3px rgba(239, 68, 68, 0.3)',
  tapMinSize: '44px', // 최소 터치 영역
};
```

---

## Components (UI 컴포넌트)

Components는 Foundation 토큰을 기반으로 구현된 실제 UI 요소입니다.

### Form (입력 컴포넌트)

#### Button

```tsx
<Button variant="primary" size="md" onClick={() => alert('클릭!')}>
  기본 버튼
</Button>
```

**Props:**
- `variant`: `primary` | `secondary` | `ghost` | `danger`
- `size`: `sm` | `md` | `lg`
- `disabled`: `boolean`
- `loading`: `boolean`

#### TextField

```tsx
<TextField
  label="이메일"
  type="email"
  placeholder="email@example.com"
  helperText="이메일을 입력해주세요"
  error={false}
  leftIcon={<EmailIcon />}
/>
```

**Props:**
- `label`: `string`
- `type`: `text` | `email` | `password` | `number`
- `error`: `boolean`
- `helperText`: `string`
- `leftIcon` / `rightIcon`: `ReactNode`

#### Checkbox

```tsx
<Checkbox
  checked={isChecked}
  onChange={(e) => setIsChecked(e.target.checked)}
  label="동의합니다"
  indeterminate={false}
/>
```

#### Radio

```tsx
<Radio
  name="option"
  value="1"
  checked={selected === '1'}
  onChange={(e) => setSelected(e.target.value)}
  label="옵션 1"
/>
```

#### Switch

```tsx
<Switch
  checked={isOn}
  onChange={(checked) => setIsOn(checked)}
  label="알림 받기"
/>
```

#### Select

```tsx
<Select
  options={[
    { value: '1', label: '옵션 1' },
    { value: '2', label: '옵션 2' },
  ]}
  value={selected}
  onChange={(value) => setSelected(value)}
  placeholder="선택하세요"
/>
```

#### FileInput

```tsx
<FileInput
  accept="image/*"
  onChange={(file) => console.log(file)}
  label="파일 선택"
/>
```

---

### Feedback (피드백 컴포넌트)

#### Alert

```tsx
import { useAlert } from '@bigtablet/design-system';

function Component() {
  const alert = useAlert();
  
  const handleClick = () => {
    alert.show({
      title: '알림',
      message: '작업이 완료되었습니다.',
      variant: 'success',
      onConfirm: () => console.log('확인'),
      onCancel: () => console.log('취소'),
    });
  };
}
```

**Variants:** `info` | `success` | `warning` | `error`

#### Toast

```tsx
import { ToastProvider, useToast } from '@bigtablet/design-system';

function App() {
  return (
    <ToastProvider>
      <YourComponent />
    </ToastProvider>
  );
}

function YourComponent() {
  const toast = useToast();
  
  return (
    <button onClick={() => toast.success('저장되었습니다')}>
      저장
    </button>
  );
}
```

**메서드:**
- `toast.success(message)`
- `toast.error(message)`
- `toast.warning(message)`
- `toast.info(message)`
- `toast.message(message)`

#### Loading

```tsx
<Loading size="md" />
```

**Props:**
- `size`: `sm` | `md` | `lg`

---

### Navigation (네비게이션 컴포넌트)

#### Pagination

```tsx
<Pagination
  currentPage={page}
  totalPages={10}
  onPageChange={(newPage) => setPage(newPage)}
/>
```

#### Sidebar (Next.js 전용)

```tsx
import { Sidebar } from '@bigtablet/design-system/next';

<Sidebar
  items={[
    { label: '홈', href: '/', icon: <HomeIcon /> },
    { label: '대시보드', href: '/dashboard', icon: <DashboardIcon /> },
  ]}
  matchMode="startsWith" // 'startsWith' | 'exact'
/>
```

---

### Overlay (오버레이 컴포넌트)

#### Modal

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="모달 제목"
>
  <p>모달 내용</p>
</Modal>
```

**Props:**
- `isOpen`: `boolean`
- `onClose`: `() => void`
- `title`: `string` (optional)
- `closeOnOverlayClick`: `boolean` (default: `true`)
- `closeOnEsc`: `boolean` (default: `true`)

---

### Display (표시 컴포넌트)

#### Card

```tsx
<Card elevation="md" padding="lg">
  <h3>카드 제목</h3>
  <p>카드 내용</p>
</Card>
```

**Props:**
- `elevation`: `sm` | `md` | `lg` | `xl`
- `padding`: `sm` | `md` | `lg` | `xl`

---

### Skeleton (로딩 상태 컴포넌트)

#### SkeletonCard

```tsx
<SkeletonCard />
```

#### SkeletonList

```tsx
<SkeletonList count={5} />
```

---

## 개발 가이드

### 로컬 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/Bigtablet/bigtablet-design-system.git
cd bigtablet-design-system

# 의존성 설치
pnpm install

# Storybook 실행
pnpm storybook

# 빌드
pnpm build

# 테스트
pnpm test
```

### Storybook 가이드라인

1. **Title 규칙**
    - Foundation: `foundation/Colors`, `foundation/Typography`
    - Components: `components/Button`, `components/TextField`

2. **Story 작성 원칙**
    - 기본 상태(Default) 필수 포함
    - 모든 variant와 size 예시 제공
    - 실제 사용 사례 중심으로 작성
    - 명확한 설명과 문서화

3. **예시**

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'components/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: '기본 버튼',
    variant: 'primary',
    size: 'md',
  },
};

export const Variants: Story = {
  render: () => (
    <>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </>
  ),
};
```

### 컴포넌트 개발 원칙

1. **Foundation 토큰 사용 필수**
    - 직접적인 색상/크기 값 사용 금지
    - 모든 스타일은 토큰을 통해 정의

2. **접근성(a11y) 고려**
    - 키보드 네비게이션 지원
    - 스크린 리더 호환
    - 적절한 ARIA 속성 사용

3. **상태 관리**
    - hover, active, disabled, error 등 명확히 정의
    - loading 상태 제공

4. **TypeScript 타입**
    - Props 타입 명확히 정의
    - Generic 타입 적절히 활용

---

## 기여하기

기여는 언제나 환영합니다! 다음 절차를 따라주세요:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드 업무, 패키지 매니저 설정 등
```

---

## 버전 관리

이 프로젝트는 [Changesets](https://github.com/changesets/changesets)를 사용하여 버전을 관리합니다.

### 변경사항 추가

```bash
pnpm changeset
```

---

## 기술 스택

| Category | Technology |
|----------|------------|
| **Framework** | React 19 |
| **Language** | TypeScript |
| **Styling** | SCSS |
| **Documentation** | Storybook 8 |
| **Visual Test** | Chromatic |
| **Build** | tsup |
| **Package Manager** | pnpm |
| **CI/CD** | GitHub Actions |
| **Version Management** | Changesets |

---

## 브라우저 지원

- Chrome (최신 2개 버전)
- Firefox (최신 2개 버전)
- Safari (최신 2개 버전)
- Edge (최신 2개 버전)

---

## 라이센스

[Bigtablet License](https://github.com/Bigtablet/.github/blob/main/BIGTABLET_LICENSE.md) 를 참고해주세요

---

## 링크

- [Github Link](https://bigtablet.github.io/bigtablet-design-system)
- [NPM 패키지](https://www.npmjs.com/package/@bigtablet/design-system)
- [이슈 트래커](https://github.com/Bigtablet/bigtablet-design-system/issues)
- [토론](https://github.com/Bigtablet/bigtablet-design-system/discussions)

---

## 팀

이 프로젝트는 5명의 기여자들에 의해 관리되고 있습니다.

---

<div align="center">

Made with by Bigtablet, Icn.

</div>