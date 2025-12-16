# Bigtablet Design System

Bigtablet의 공통 UI 컴포넌트 및 디자인 시스템입니다.  
Foundation(디자인 토큰)과 Components(UI 컴포넌트)를 분리하여 관리하며,  
Storybook 기반 문서화와 Chromatic을 통한 시각적 테스트를 제공합니다.

---

## Features

- Foundation / Components 구조 분리
- Storybook 8 기반 문서화
- Chromatic 시각적 회귀 테스트
- Pure React / Next.js 분리 번들
- SCSS 기반 Design Token 관리
- pnpm + GitHub Actions 자동 배포

---

## Tech Stack

| Category | Technology |
|--------|-----------|
| Framework | React 19 |
| Styling | SCSS |
| Documentation | Storybook 8 |
| Visual Test | Chromatic |
| Build | tsup |
| Package Manager | pnpm |
| CI / CD | GitHub Actions |

---

## Project Structure

```bash
src/
├── styles/
│   ├── ts/                 # Foundation Tokens (TypeScript)
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   ├── radius.ts
│   │   ├── shadows.ts
│   │   ├── motion.ts
│   │   ├── z-index.ts
│   │   ├── breakpoints.ts
│   │   └── a11y.ts
│   └── scss/               # SCSS Token & Mixins
│
├── ui/
│   ├── form/               # TextField, Checkbox, Radio, Switch, FileInput
│   ├── feedback/           # Alert, Toast, Loading
│   ├── navigation/         # Pagination, Sidebar
│   ├── overlay/            # Modal
│   ├── display/            # Card
│   ├── general/            # Button, Select
│   ├── skeleton/           # SkeletonCard, SkeletonList
│   └── styles/             # Shared component styles
│
├── index.ts                # Pure React exports
└── next.ts                 # Next.js specific exports
```

## Design System Structure

Bigtablet Design System은 **Foundation**과 **Components** 두 레이어로 구성됩니다.  
Foundation은 디자인의 기준과 규칙을 정의하고,  
Components는 이 기준을 사용해 실제 UI를 구성합니다.

---

## Foundation

Storybook 경로:
```bash
src/styles/ts/colors.ts
```
Foundation은 **모든 컴포넌트에서 공통으로 사용하는 디자인 기준**입니다.  
컴포넌트 구현 시, 임의의 값 사용을 금지하고 반드시 Foundation 토큰을 사용해야 합니다.

### Colors
- 브랜드, 배경, 텍스트, 상태(success / error / warning) 색상
- 직접 색상 값 사용 금지

파일:
```bash
src/styles/ts/colors.ts
```
---

### Spacing
- margin, padding, gap 기준 스케일
- 레이아웃 일관성 유지 목적

파일:
```bash
src/styles/ts/spacing.ts
```

---

### Typography
- 폰트 패밀리
- 폰트 크기, 굵기, 줄 간격
- Heading / Body / Caption 기준

파일:
```bash
src/styles/ts/typography.ts
```

---

### Radius
- 컴포넌트 모서리 둥글기 기준
- 카드, 버튼, 입력 필드 등 공통 사용

파일:
```bash
src/styles/ts/radius.ts
```

---

### Shadows
- elevation 레벨 정의
- 카드, 모달, 드롭다운 등 깊이 표현

파일:
```bash
src/styles/ts/shadows.ts
```

---

### Motion
- transition duration
- easing curve 기준

파일:
```bash
src/styles/ts/motion.ts
```

---

### Z-Index
- 레이어 우선순위 정의
- modal, toast, dropdown 등

파일:
```bash
src/styles/ts/z-index.ts
```

---

### Breakpoints
- 반응형 기준 해상도

권장 구분:
- mobile
- tablet
- laptop
- desktop

파일:
```bash
src/styles/ts/breakpoints.ts
```
---

### Accessibility (A11y)
- 포커스 링 스타일
- 최소 터치 영역 크기
- 접근성 기준 토큰

파일:
```bash
src/styles/ts/a11y.ts
```
예시:
```ts
focusRing
focusRingError
tapMinSize
```
---

## Components

Storybook 경로 규칙:
```bash
src/stories/components/name.stoires.tsx
```
Components는 Foundation 토큰을 기반으로 구현된 **실제 UI 컴포넌트 레이어**입니다.  
모든 컴포넌트는 다음 원칙을 따릅니다.

- Foundation 토큰(colors, spacing, typography 등)만 사용
- 상태(hover, active, disabled, error 등) 명확히 정의
- 접근성(a11y) 기본 고려
- Storybook 문서 필수 제공

---

### Form

사용자 입력을 담당하는 컴포넌트들입니다.

#### Button
- 기본 액션 버튼
- variant: primary / secondary / ghost / danger
- size: sm / md / lg

#### TextField
- 텍스트 입력 필드
- label, helperText 지원
- error / success 상태 지원
- leftIcon / rightIcon 지원

#### Checkbox
- 다중 선택 입력
- indeterminate 상태 지원

#### Radio
- 단일 선택 입력
- 동일한 name으로 그룹 구성

#### Switch
- ON / OFF 토글 입력
- controlled / uncontrolled 모두 지원

#### Select
- 드롭다운 선택 컴포넌트
- 키보드 및 마우스 인터랙션 지원
- controlled / uncontrolled 모두 지원

#### FileInput
- 파일 선택 입력
- 커스텀 UI 제공

---

### Feedback

사용자에게 상태 및 피드백을 전달하는 컴포넌트들입니다.

#### Alert
- 모달 형태의 알림
- info / success / warning / error variant
- confirm / cancel 액션 지원
- useAlert 훅 기반

#### Loading
- 인라인 로딩 스피너
- 크기 조절 가능

#### ToastProvider / useToast
- 전역 토스트 메시지
- success / error / warning / info / message 타입 제공
- 내부적으로 react-toastify 사용

---

### Navigation

페이지 이동 및 흐름 제어 컴포넌트입니다.

#### Pagination
- Prev / Next 기반 페이지네이션
- controlled 방식으로 상태 관리

#### Sidebar
- 좌측 네비게이션 메뉴
- 활성 경로 표시
- match 모드 지원 (startsWith / exact)
- Next.js 전용 컴포넌트

---

### Overlay

콘텐츠 위에 표시되는 레이어 컴포넌트입니다.

#### Modal
- 중앙 정렬 오버레이
- ESC / 오버레이 클릭 닫기 지원
- 제목 영역 optional

---

### Display

정보를 시각적으로 표현하는 컴포넌트입니다.

#### Card
- 콘텐츠 그룹화용 컨테이너
- elevation 및 padding 포함

---

### Skeleton

로딩 중 UI를 표현하는 컴포넌트입니다.

#### SkeletonCard
- 카드 형태 스켈레톤

#### SkeletonList
- 리스트 형태 스켈레톤

---

## Storybook Guidelines

### Title 규칙
```bash
foundation/
components/
```

---

### Story 작성 원칙

- 기본 상태(Default) 반드시 포함
- size / variant / state 예제 포함
- 디자이너가 봐도 이해 가능한 설명 작성
- 실제 사용 예제 위주 구성
- 불필요한 control 노출 지양
