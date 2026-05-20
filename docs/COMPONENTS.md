# Components

Bigtablet Design System의 모든 React 컴포넌트 문서입니다.

---

## 목차

- [v3.0 주요 변경사항](#v30-주요-변경사항)
- [Foundation](#foundation)
  - [ThemeProvider](#themeprovider)
- [General](#general)
  - [Button](#button)
  - [Dropdown](#dropdown)
  - [Chip](#chip)
  - [FAB](#fab)
  - [IconButton](#iconbutton)
- [Form](#form)
  - [TextField](#textfield)
  - [Checkbox](#checkbox)
  - [Radio](#radio)
  - [Toggle](#toggle)
  - [DatePicker](#datepicker)
  - [FileInput](#fileinput)
- [Feedback](#feedback)
  - [Alert](#alert)
  - [Toast](#toast)
  - [Spinner](#spinner)
  - [TopLoading](#toploading)
  - [LinearProgress](#linearprogress)
- [Navigation](#navigation)
  - [Pagination](#pagination)
  - [Tabs](#tabs)
  - [Sidebar](#sidebar)
  - [NavBar](#navbar)
  - [Breadcrumb](#breadcrumb)
- [Overlay](#overlay)
  - [Modal](#modal)
  - [Tooltip](#tooltip)
  - [Menu](#menu)
- [Display](#display)
  - [Card](#card)
  - [Divider](#divider)
  - [ListItem](#listitem)
  - [Avatar](#avatar)
  - [Badge](#badge)
  - [Hero](#hero)
  - [MediaCard](#mediacard)
  - [EmptyState](#emptystate)
  - [Accordion](#accordion)
- [Layout](#layout)
  - [Container](#container)
  - [Section](#section)
  - [Stack](#stack)
  - [Grid](#grid)

---

## v3.0 주요 변경사항

v3.0에서 다크 모드 지원, B2C 마케팅용 컴포넌트, 레이아웃 프리미티브가 추가되었습니다.

### Dark mode 지원 ([ThemeProvider](#themeprovider))

`ThemeProvider`로 앱을 감싸면 `data-theme` attribute 기반 light/dark/system 테마 전환이 가능합니다.
모든 컴포넌트는 토큰 기반 CSS 변수를 사용하므로 별도 작업 없이 자동으로 반응합니다.

```tsx
import { ThemeProvider } from "@bigtablet/design-system";

<ThemeProvider defaultMode="system">
  <App />
</ThemeProvider>
```

### Chip — `type="static"` + `tone` (구 Tag 흡수)

기존 별도 컴포넌트였던 `Tag`가 `Chip`의 `type="static"`으로 통합되었습니다.
인터랙션 없이 카테고리/상태를 표시할 때 사용하고, `tone` prop으로 색조를 지정합니다.

```tsx
<Chip type="static" tone="success" label="활성" />
<Chip type="static" tone="warning" label="검토 중" />
```

자세한 내용은 [Chip](#chip) 섹션을 참고하세요.

### TextField 라벨 패턴 변경 (fieldset+legend → standalone)

내부 마크업이 `<fieldset>` + `<legend>` 구조에서 standalone `<label htmlFor>` 구조로 단순화되었습니다.
공개 API(props)는 동일하므로 호출부 수정은 필요하지 않지만, 커스텀 SCSS로 내부 셀렉터를 오버라이드한 경우 점검이 필요합니다.

---

## Foundation

### ThemeProvider

Bigtablet DS의 테마 컨텍스트를 제공합니다. `data-theme` attribute를 root element에 적용해서 CSS 변수 레이어를 전환합니다.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultMode` | `'light' \| 'dark' \| 'system'` | `'system'` | 초기 테마 |
| `storageKey` | `string \| null` | `'bt-theme'` | localStorage 키 (null이면 저장 안 함) |
| `targetSelector` | `string` | `document.documentElement` | `data-theme` 적용 대상 selector |

**`useTheme()` 훅**

| 반환 필드 | Type | Description |
|------|------|-------------|
| `mode` | `'light' \| 'dark' \| 'system'` | 현재 선택된 모드 |
| `resolved` | `'light' \| 'dark'` | system은 prefers-color-scheme으로 해석된 실제 적용 테마 |
| `setMode` | `(mode) => void` | 모드 변경 |

**Usage**

```tsx
import { ThemeProvider, useTheme } from "@bigtablet/design-system";

function App() {
  return (
    <ThemeProvider defaultMode="system">
      <YourApp />
    </ThemeProvider>
  );
}

function ThemeToggle() {
  const { mode, resolved, setMode } = useTheme();
  return (
    <button onClick={() => setMode(resolved === "dark" ? "light" : "dark")}>
      현재: {mode} (적용: {resolved})
    </button>
  );
}
```

---

## General

### Button

```tsx
import { Button } from '@bigtablet/design-system';

// 기본 사용
<Button>클릭</Button>

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// 너비 조절
<Button width="200px">고정 너비</Button>
<Button fullWidth>전체 너비</Button>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | 버튼 스타일 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 버튼 크기 |
| `width` | `string` | - | 버튼 너비 |
| `fullWidth` | `boolean` | `false` | 전체 너비 |
| `disabled` | `boolean` | `false` | 비활성화 |

---

### Dropdown

```tsx
import { Dropdown } from '@bigtablet/design-system';

const options = [
  { value: 'apple', label: '사과' },
  { value: 'banana', label: '바나나' },
  { value: 'orange', label: '오렌지', disabled: true },
];

// 기본 사용
<Dropdown
  label="과일 선택"
  options={options}
  placeholder="선택하세요"
  onChange={(value, option) => console.log(value, option)}
/>

// Controlled
const [fruit, setFruit] = useState<string | null>(null);
<Dropdown
  options={options}
  value={fruit}
  onChange={(value) => setFruit(value)}
/>

// 크기
<Dropdown options={options} size="sm" />
<Dropdown options={options} size="md" />

// 보조 텍스트 + 아이콘 옵션
<Dropdown
  label="도시 선택"
  options={[
    { value: 'seoul', label: '서울', supportingText: '대한민국', leadingIcon: <Globe size={20} /> },
    { value: 'tokyo', label: '도쿄', supportingText: '일본', leadingIcon: <Globe size={20} />, showDivider: true },
    { value: 'nyc', label: '뉴욕', supportingText: '미국' },
  ]}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `DropdownOption[]` | required | 옵션 목록 |
| `value` | `string \| null` | - | 선택된 값 (controlled) |
| `defaultValue` | `string \| null` | `null` | 기본 선택값 |
| `onChange` | `(value, option) => void` | - | 변경 핸들러 |
| `label` | `string` | - | 플로팅 라벨 (값 선택 시 또는 열릴 때 표시) |
| `placeholder` | `string` | `'Select…'` | 플레이스홀더 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 크기 |
| `fullWidth` | `boolean` | `false` | 전체 너비 |
| `disabled` | `boolean` | `false` | 비활성화 |

**DropdownOption:**

| 필드 | Type | Description |
|------|------|-------------|
| `value` | `string` | 옵션 값 |
| `label` | `string` | 표시 텍스트 |
| `disabled` | `boolean` | 비활성화 여부 |
| `supportingText` | `string` | 라벨 아래 보조 텍스트 |
| `leadingIcon` | `ReactNode` | 왼쪽 아이콘 |
| `trailingIcon` | `ReactNode` | 오른쪽 아이콘 (미지정 시 선택 상태에 체크 자동 표시) |
| `showDivider` | `boolean` | 아이템 아래 구분선 |

> **마이그레이션**: 기존 `Select`는 `Dropdown`의 deprecated alias로 유지됩니다. `Select` → `Dropdown`, `SelectOption` → `DropdownOption`으로 교체하세요.

---

### Chip

```tsx
import { Chip } from '@bigtablet/design-system';

// 기본 사용
<Chip label="태그" />

// 타입별
<Chip type="basic" label="Basic" onClick={() => {}} />
<Chip type="input" label="Input" removable onRemove={() => {}} />
<Chip type="filter" label="Filter" selected onClick={() => {}} />

// v3.0+ Static (구 Tag 대체) — 비인터랙티브 라벨 + tone
<Chip type="static" tone="success" label="활성" />
<Chip type="static" tone="warning" label="검토 중" leadingIcon={<AlertIcon />} />
<Chip type="static" tone="info" label="베타" removable onRemove={() => {}} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'basic' \| 'input' \| 'filter' \| 'static'` | `'basic'` | 칩 유형. `static`은 v3.0+에서 비인터랙티브 라벨 (구 Tag 대체) |
| `size` | `'sm' \| 'md'` | - | 칩 크기 (미지정 시 32px) |
| `tone` | `'default' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'default'` | 색조 (type=`static`에서만 적용) |
| `label` | `string` | required | 라벨 텍스트 |
| `selected` | `boolean` | - | 선택 상태 |
| `removable` | `boolean` | - | 삭제 가능 여부 (input / static 타입) |
| `leadingIcon` | `ReactNode` | - | 왼쪽 아이콘 (static 타입) |
| `open` | `boolean` | - | 팝업 열림 (filter 타입에서 aria-expanded로 사용) |
| `disabled` | `boolean` | `false` | 비활성화 |
| `onClick` | `(event) => void` | - | 클릭 핸들러 |
| `onRemove` | `() => void` | - | 삭제 핸들러 |

> **v3.0 변경**: 기존 별도 `Tag` 컴포넌트가 `Chip`의 `type="static"`으로 흡수되었습니다. 카테고리/상태 표시는 `<Chip type="static" tone="..." />`로 마이그레이션하세요.

---

### FAB

```tsx
import { FAB } from '@bigtablet/design-system';
import { Plus } from 'lucide-react';

// 기본 사용
<FAB icon={<Plus />} aria-label="추가" />

// Additive variant
<FAB variant="additive" icon={<Plus />} aria-label="새 항목 추가" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'additive'` | `'primary'` | FAB 스타일 |
| `icon` | `ReactNode` | required | 표시할 아이콘 |
| `aria-label` | `string` | required | 접근성 라벨 (필수) |
| `disabled` | `boolean` | `false` | 비활성화 |

---

### IconButton

```tsx
import { IconButton } from '@bigtablet/design-system';
import { Settings } from 'lucide-react';

// Variants
<IconButton variant="standard" icon={<Settings />} aria-label="설정" />
<IconButton variant="filled" icon={<Settings />} aria-label="설정" />
<IconButton variant="tonal" icon={<Settings />} aria-label="설정" />
<IconButton variant="outlined" icon={<Settings />} aria-label="설정" />

// Sizes
<IconButton size="sm" icon={<Settings />} aria-label="설정" />
<IconButton size="md" icon={<Settings />} aria-label="설정" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'standard' \| 'filled' \| 'tonal' \| 'outlined'` | `'standard'` | 스타일 |
| `size` | `'sm' \| 'md'` | `'md'` | 크기 |
| `icon` | `ReactNode` | required | 표시할 아이콘 |
| `disabled` | `boolean` | `false` | 비활성화 |

---

## Form

### TextField

```tsx
import { TextField } from '@bigtablet/design-system';

// 기본 사용
<TextField label="이름" placeholder="이름을 입력하세요" />

// 상태 표시
<TextField label="이메일" error supportingText="유효하지 않은 이메일입니다" />
<TextField label="이메일" success supportingText="사용 가능한 이메일입니다" />

// 아이콘
import { Search, Eye } from 'lucide-react';
<TextField leftIcon={<Search size={16} />} placeholder="검색..." />
<TextField rightIcon={<Eye size={16} />} type="password" />

// Variants
<TextField variant="outline" label="Outline" />
<TextField variant="filled" label="Filled" />
<TextField variant="ghost" label="Ghost" />

// 값 변환 (자동 포맷팅)
<TextField
  label="전화번호"
  transformValue={(v) => v.replace(/\D/g, '').slice(0, 11)}
  onChangeAction={(value) => console.log(value)}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | 라벨 |
| `supportingText` | `string` | - | 도움말 텍스트 |
| `error` | `boolean` | `false` | 에러 상태 |
| `success` | `boolean` | `false` | 성공 상태 |
| `variant` | `'outline' \| 'filled' \| 'ghost'` | `'outline'` | 스타일 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 크기 |
| `leftIcon` | `ReactNode` | - | 왼쪽 아이콘 |
| `rightIcon` | `ReactNode` | - | 오른쪽 아이콘 |
| `fullWidth` | `boolean` | `false` | 전체 너비 |
| `onChangeAction` | `(value: string) => void` | - | 값 변경 콜백 |
| `transformValue` | `(value: string) => string` | - | 값 변환 함수 |

> **v3.0 변경**: 내부 마크업이 `<fieldset>` + `<legend>` 구조에서 standalone `<label htmlFor>` 구조로 변경되었습니다. 공개 props는 동일하지만, 커스텀 SCSS에서 `.text_field_legend` 같은 내부 셀렉터를 오버라이드했다면 점검이 필요합니다.

---

### Checkbox

```tsx
import { Checkbox } from '@bigtablet/design-system';

// 기본 사용
<Checkbox label="동의합니다" />

// Controlled
const [checked, setChecked] = useState(false);
<Checkbox
  label="알림 받기"
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
/>

// Indeterminate (부분 선택)
<Checkbox label="전체 선택" indeterminate />

// Sizes
<Checkbox size="sm" label="Small" />
<Checkbox size="md" label="Medium" />
<Checkbox size="lg" label="Large" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `ReactNode` | - | 라벨 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 크기 |
| `indeterminate` | `boolean` | `false` | 부분 선택 상태 |
| `checked` | `boolean` | - | 체크 상태 |
| `disabled` | `boolean` | `false` | 비활성화 |

---

### Radio

```tsx
import { Radio } from '@bigtablet/design-system';

const [selected, setSelected] = useState('option1');

<Radio
  name="options"
  value="option1"
  label="옵션 1"
  checked={selected === 'option1'}
  onChange={(e) => setSelected(e.target.value)}
/>
<Radio
  name="options"
  value="option2"
  label="옵션 2"
  checked={selected === 'option2'}
  onChange={(e) => setSelected(e.target.value)}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `ReactNode` | - | 라벨 |
| `name` | `string` | - | 그룹 이름 |
| `value` | `string` | - | 값 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 크기 |
| `checked` | `boolean` | - | 선택 상태 |
| `disabled` | `boolean` | `false` | 비활성화 |

---

### Toggle

```tsx
import { Toggle } from '@bigtablet/design-system';

// 기본 사용
<Toggle onChange={(checked) => console.log(checked)} />

// Controlled
const [isOn, setIsOn] = useState(false);
<Toggle checked={isOn} onChange={setIsOn} />

// Sizes
<Toggle size="sm" />
<Toggle size="md" />

// 접근성
<Toggle ariaLabel="알림 설정" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | - | 켜짐 상태 (controlled) |
| `defaultChecked` | `boolean` | `false` | 기본 상태 |
| `onChange` | `(checked: boolean) => void` | - | 변경 핸들러 |
| `size` | `'sm' \| 'md'` | `'sm'` | 크기 |
| `ariaLabel` | `string` | required | 접근성 라벨 (필수) |
| `disabled` | `boolean` | `false` | 비활성화 |

---

### DatePicker

```tsx
import { DatePicker } from '@bigtablet/design-system';

// 기본 사용 (연-월-일)
const [date, setDate] = useState('');
<DatePicker
  label="생년월일"
  value={date}
  onChange={setDate}
/>

// 연-월 모드
<DatePicker
  label="시작 월"
  mode="year-month"
  value={date}
  onChange={setDate}
/>

// 범위 제한
<DatePicker
  label="예약일"
  startYear={2020}
  endYear={2030}
  selectableRange="until-today"
  value={date}
  onChange={setDate}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | 라벨 |
| `value` | `string` | - | 선택된 날짜 (`'YYYY-MM-DD'` 또는 `'YYYY-MM'`) |
| `onChange` | `(value: string) => void` | required | 변경 핸들러 |
| `mode` | `'year-month' \| 'year-month-day'` | `'year-month-day'` | 날짜 선택 모드 |
| `startYear` | `number` | `1950` | 시작 연도 |
| `endYear` | `number` | `현재년도 + 10` | 종료 연도 |
| `selectableRange` | `'all' \| 'until-today'` | `'all'` | 선택 가능 범위 |
| `fullWidth` | `boolean` | `true` | 전체 너비 |
| `disabled` | `boolean` | `false` | 비활성화 |

---

### FileInput

```tsx
import { FileInput } from '@bigtablet/design-system';

<FileInput
  label="파일 선택"
  accept="image/*"
  onFiles={(files) => console.log(files)}
/>

// 여러 파일
<FileInput
  label="이미지 업로드"
  accept="image/*"
  multiple
  onFiles={(files) => console.log(files)}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `'파일 선택'` | 버튼 라벨 |
| `accept` | `string` | - | 허용 파일 타입 |
| `onFiles` | `(files: FileList \| null) => void` | - | 파일 선택 핸들러 |
| `multiple` | `boolean` | `false` | 다중 선택 |
| `disabled` | `boolean` | `false` | 비활성화 |

---

## Feedback

### Alert

```tsx
import { AlertProvider, useAlert } from '@bigtablet/design-system';

// App에 Provider 추가
function App() {
  return (
    <AlertProvider>
      <YourComponent />
    </AlertProvider>
  );
}

// 사용
function YourComponent() {
  const { showAlert } = useAlert();

  const handleDelete = () => {
    showAlert({
      variant: 'warning',
      title: '삭제 확인',
      message: '정말 삭제하시겠습니까?',
      showCancel: true,
      confirmText: '삭제',
      cancelText: '취소',
      onConfirm: () => console.log('삭제됨'),
      onCancel: () => console.log('취소됨'),
    });
  };

  return <button onClick={handleDelete}>삭제</button>;
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `variant` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | 알림 타입 |
| `title` | `ReactNode` | - | 제목 |
| `message` | `ReactNode` | - | 메시지 |
| `confirmText` | `string` | `'확인'` | 확인 버튼 텍스트 |
| `cancelText` | `string` | `'취소'` | 취소 버튼 텍스트 |
| `showCancel` | `boolean` | `false` | 취소 버튼 표시 |
| `actionsAlign` | `'left' \| 'center' \| 'right'` | `'right'` | 버튼 정렬 |
| `onConfirm` | `() => void` | - | 확인 핸들러 |
| `onCancel` | `() => void` | - | 취소 핸들러 |

---

### Toast

```tsx
import { ToastProvider, useToast } from '@bigtablet/design-system';

// App에 Provider 추가
function App() {
  return (
    <>
      <ToastProvider />
      <YourComponent />
    </>
  );
}

// 사용
function YourComponent() {
  const toast = useToast();

  return (
    <div>
      <button onClick={() => toast.success('저장되었습니다')}>성공</button>
      <button onClick={() => toast.error('오류가 발생했습니다')}>에러</button>
      <button onClick={() => toast.warning('주의가 필요합니다')}>경고</button>
      <button onClick={() => toast.info('참고 정보입니다')}>정보</button>
      <button onClick={() => toast.message('일반 메시지')}>메시지</button>
    </div>
  );
}
```

---

### Spinner

```tsx
import { Spinner } from '@bigtablet/design-system';

<Spinner />           // 기본 (24px)
<Spinner size={16} /> // 작은 크기
<Spinner size={48} /> // 큰 크기
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | `24` | 스피너 크기 (px) |

---

### TopLoading

```tsx
import { TopLoading } from '@bigtablet/design-system';

// Indeterminate (무한 로딩)
<TopLoading isLoading />

// Progress (진행률 표시)
<TopLoading isLoading progress={65} />

// 커스텀 스타일
<TopLoading isLoading color="#ff0000" height={5} />

// 숨기기
<TopLoading isLoading={false} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isLoading` | `boolean` | `true` | 표시 여부 |
| `progress` | `number` | - | 진행률 (0-100), 없으면 indeterminate |
| `color` | `string` | primary | 로딩바 색상 |
| `height` | `number` | `3` | 로딩바 높이 (px) |
| `ariaLabel` | `string` | `'Page loading'` | 접근성 라벨 |

---

### LinearProgress

```tsx
import { LinearProgress } from '@bigtablet/design-system';

// 기본 사용
<LinearProgress totalSteps={5} currentStep={3} aria-label="진행률" />

// 완료 상태
<LinearProgress totalSteps={10} currentStep={10} aria-label="업로드 진행률" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `totalSteps` | `number` | required | 전체 단계 수 |
| `currentStep` | `number` | required | 현재 단계 (0~totalSteps) |
| `aria-label` | `string` | required | 접근성 라벨 (필수) |

---

## Navigation

### Pagination

```tsx
import { Pagination } from '@bigtablet/design-system';

const [page, setPage] = useState(1);

<Pagination
  page={page}
  totalPages={20}
  onChange={setPage}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `page` | `number` | required | 현재 페이지 |
| `totalPages` | `number` | required | 전체 페이지 수 |
| `onChange` | `(page: number) => void` | required | 페이지 변경 핸들러 |

---

### Tabs

탭 패널 전환 UI. `Tabs` 컨테이너 + `TabList` + `Tab` + `TabPanel` compound API. 키보드 ArrowLeft/Right/Home/End 지원.

**Tabs Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | 제어형: 현재 활성 tab의 value |
| `defaultValue` | `string` | `''` | 비제어형: 초기 활성 tab의 value |
| `onValueChange` | `(value: string) => void` | - | value 변경 콜백 |
| `variant` | `'line' \| 'pills'` | `'line'` | 시각 스타일. line=하단 underline, pills=둥근 박스 |
| `size` | `'sm' \| 'md'` | `'md'` | 크기 |

**Tab Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | required | 이 tab의 value |
| `disabled` | `boolean` | `false` | 비활성화 |

**TabPanel Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | required | 이 panel을 활성화할 tab의 value |
| `unmountInactive` | `boolean` | `true` | 비활성 panel을 unmount. `false`면 display:none으로 유지 |

**TabList Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ariaLabel` | `string` | - | 스크린리더 라벨 |

**Usage**

```tsx
import { Tabs, TabList, Tab, TabPanel } from "@bigtablet/design-system";

// 비제어형
<Tabs defaultValue="overview" variant="line">
  <TabList ariaLabel="제품 정보">
    <Tab value="overview">개요</Tab>
    <Tab value="specs">스펙</Tab>
    <Tab value="reviews">리뷰</Tab>
  </TabList>
  <TabPanel value="overview">제품 개요 내용</TabPanel>
  <TabPanel value="specs">스펙 표</TabPanel>
  <TabPanel value="reviews">리뷰 목록</TabPanel>
</Tabs>

// 제어형
const [tab, setTab] = useState("overview");
<Tabs value={tab} onValueChange={setTab} variant="pills" size="sm">
  ...
</Tabs>
```

---

### Sidebar

Admin/dashboard 좌측 네비게이션. navy 배경 + 흰 텍스트. `SidebarItem` 자식과 함께 사용. 선택적으로 `SidebarSection`으로 그룹화.

**Sidebar Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `header` | `ReactNode` | - | 상단 brand/로고 영역 |
| `footer` | `ReactNode` | - | 하단 영역 (사용자/설정/로그아웃) |
| `collapsed` | `boolean` | `false` | 너비 축소 + 아이콘만 표시 |
| `width` | `number` | `240` | 펼쳤을 때 너비 (px) |
| `collapsedWidth` | `number` | `64` | 접혔을 때 너비 (px) |

**SidebarItem Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `ReactNode` | - | 왼쪽 아이콘 |
| `active` | `boolean` | `false` | 현재 활성 상태 (`aria-current="page"`) |
| `trailing` | `ReactNode` | - | 오른쪽 trailing (Badge 등) |
| `as` | `'button' \| 'a'` | `'button'` | 렌더 태그 |
| `href` | `string` | - | `as="a"`일 때 링크 URL |

**SidebarSection Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | 섹션 라벨 (collapsed에선 sr-only) |

**Usage**

```tsx
import { Sidebar, SidebarItem, SidebarSection, Badge } from "@bigtablet/design-system";
import { Home, Users, Settings, LogOut } from "lucide-react";

<Sidebar
  header={<Logo />}
  footer={<SidebarItem icon={<LogOut />}>로그아웃</SidebarItem>}
  collapsed={collapsed}
>
  <SidebarItem icon={<Home />} active>대시보드</SidebarItem>

  <SidebarSection label="관리">
    <SidebarItem icon={<Users />} trailing={<Badge shape="count" count={3} />}>
      사용자
    </SidebarItem>
    <SidebarItem icon={<Settings />} as="a" href="/settings">
      설정
    </SidebarItem>
  </SidebarSection>
</Sidebar>
```

---

### NavBar

페이지 상단 네비게이션 바. 마케팅/B2C 페이지의 헤더. `NavLink`를 자식으로 사용.

**NavBar Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `brand` | `ReactNode` | - | 왼쪽 brand/로고 영역 |
| `actions` | `ReactNode` | - | 오른쪽 액션 영역 (Button/Avatar 등) |
| `variant` | `'default' \| 'transparent' \| 'accent'` | `'default'` | 시각 variant. transparent=hero 위에, accent=navy bg |
| `sticky` | `boolean` | `false` | sticky 고정 여부 |

**NavLink Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `active` | `boolean` | `false` | 현재 활성 페이지 (`aria-current="page"`) |
| `href` | `string` | - | 링크 URL (anchor의 표준 속성 모두 지원) |

**Usage**

```tsx
import { NavBar, NavLink, Button } from "@bigtablet/design-system";

<NavBar
  brand={<Logo />}
  actions={<Button variant="primary">로그인</Button>}
  sticky
>
  <NavLink href="/about">소개</NavLink>
  <NavLink href="/blog" active>블로그</NavLink>
  <NavLink href="/contact">문의</NavLink>
</NavBar>

// Hero 위에 투명 NavBar
<NavBar variant="transparent" brand={<Logo />} />
```

---

### Breadcrumb

페이지 위계 네비게이션. 마지막 아이템은 현재 페이지로 표시.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `BreadcrumbItem[]` | required | 경로 아이템 배열. 마지막은 현재 페이지 |
| `separator` | `ReactNode` | `<ChevronRight />` | 아이템 사이 구분자 |

**BreadcrumbItem**

| 필드 | Type | Description |
|------|------|-------------|
| `label` | `ReactNode` | 표시 텍스트 |
| `href` | `string` | 클릭 시 이동할 URL (없으면 button으로 렌더) |
| `onClick` | `(e) => void` | 클릭 콜백 |

**Usage**

```tsx
import { Breadcrumb } from "@bigtablet/design-system";

<Breadcrumb items={[
  { label: "홈", href: "/" },
  { label: "블로그", href: "/blog" },
  { label: "글 제목" },
]} />

// 커스텀 separator
<Breadcrumb
  separator="/"
  items={[
    { label: "Docs", href: "/docs" },
    { label: "Components", href: "/docs/components" },
    { label: "Breadcrumb" },
  ]}
/>
```

---

## Overlay

### Modal

```tsx
import { Modal } from '@bigtablet/design-system';

const [isOpen, setIsOpen] = useState(false);

<button onClick={() => setIsOpen(true)}>모달 열기</button>

<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="모달 제목"
  width={600}
>
  <p>모달 내용입니다.</p>
</Modal>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | required | 열림 상태 |
| `onClose` | `() => void` | - | 닫기 핸들러 |
| `title` | `ReactNode` | - | 제목 |
| `width` | `number \| string` | `520` | 모달 너비 |
| `closeOnOverlay` | `boolean` | `true` | 오버레이 클릭 시 닫기 |

---

### Tooltip

hover/focus 시 추가 정보를 보여주는 툴팁. react-spring fade+slide 진입 애니메이션.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `ReactNode` | required | 툴팁 콘텐츠 |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | 위치 |
| `delay` | `number` | `200` | hover 후 표시 지연 (ms) |
| `disabled` | `boolean` | `false` | 비활성화 — children만 렌더 |
| `children` | `ReactElement` | required | trigger 요소 (단일 자식) |

**Usage**

```tsx
import { Tooltip, IconButton } from "@bigtablet/design-system";
import { Save } from "lucide-react";

<Tooltip content="저장하기">
  <IconButton icon={<Save />} aria-label="저장" />
</Tooltip>

<Tooltip content="비활성 상태입니다" placement="bottom" delay={500}>
  <Button disabled>제출</Button>
</Tooltip>
```

---

### Menu

컨텍스트/액션 메뉴. trigger 클릭 시 아래에 메뉴 표시. 외부 클릭/Esc로 닫힘.
폼의 Dropdown과 다른 용도 — Edit/Delete 같은 액션 모음.

**MenuProps**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `MenuItem[]` | required | 메뉴 아이템들 |
| `trigger` | `ReactElement` | required | 클릭 시 메뉴를 여는 trigger 요소 |
| `align` | `'start' \| 'end'` | `'start'` | trigger 기준 정렬 |

**MenuItem**

| 필드 | Type | Description |
|------|------|-------------|
| `key` | `string` | 고유 key |
| `label` | `ReactNode` | 표시 텍스트 |
| `icon` | `ReactNode` | 왼쪽 아이콘 |
| `onSelect` | `() => void` | 클릭 시 호출 (메뉴 자동 닫힘) |
| `destructive` | `boolean` | 빨간 텍스트로 destructive 액션 표시 |
| `disabled` | `boolean` | 비활성화 |

**Usage**

```tsx
import { Menu, IconButton } from "@bigtablet/design-system";
import { MoreVertical, Edit, Trash } from "lucide-react";

<Menu
  trigger={<IconButton icon={<MoreVertical />} aria-label="더보기" />}
  align="end"
  items={[
    { key: "edit", label: "편집", icon: <Edit size={16} />, onSelect: handleEdit },
    { key: "del", label: "삭제", icon: <Trash size={16} />, onSelect: handleDelete, destructive: true },
  ]}
/>
```

---

## Display

### Card

```tsx
import { Card } from '@bigtablet/design-system';

<Card heading="카드 제목">
  <p>카드 내용입니다.</p>
</Card>

// 스타일 옵션
<Card heading="제목" shadow="lg" padding="lg" bordered>
  내용
</Card>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `heading` | `ReactNode` | - | 카드 제목 |
| `shadow` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'sm'` | 그림자 |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | 내부 여백 |
| `bordered` | `boolean` | `false` | 테두리 표시 |

---

### Divider

```tsx
import { Divider } from '@bigtablet/design-system';

// 기본 사용
<Divider />

// 굵은 구분선
<Divider weight="heavy" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `weight` | `'standard' \| 'heavy'` | `'standard'` | 구분선 두께 |

---

### ListItem

```tsx
import { ListItem } from '@bigtablet/design-system';
import { User, MoreVertical } from 'lucide-react';

// 기본 사용
<ListItem label="항목 이름" />

// 전체 옵션
<ListItem
  overline="카테고리"
  label="항목 이름"
  supportingText="보조 설명 텍스트"
  metadata="2024-01-01"
  leadingElement={<User size={24} />}
  trailingElement={<IconButton icon={<MoreVertical />} aria-label="더보기" />}
  onClick={() => console.log('clicked')}
/>

// 정렬
<ListItem label="중앙 정렬" alignment="middle" leadingElement={<User />} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | required | 주요 텍스트 |
| `overline` | `string` | - | 상단 오버라인 텍스트 |
| `supportingText` | `string` | - | 보조 텍스트 |
| `metadata` | `string` | - | 메타데이터 텍스트 |
| `leadingElement` | `ReactNode` | - | 왼쪽 요소 |
| `trailingElement` | `ReactNode` | - | 오른쪽 요소 |
| `alignment` | `'top' \| 'middle'` | `'top'` | 요소 정렬 |
| `disabled` | `boolean` | `false` | 비활성화 |
| `onClick` | `(event) => void` | - | 클릭 핸들러 |

---

### Avatar

사용자 프로필 아바타. 이미지 없거나 로드 실패 시 이름의 initials로 fallback.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | - | 이미지 URL |
| `name` | `string` | `''` | alt 텍스트 + initials 추출용 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 크기 (xs=24 / sm=32 / md=40 / lg=48 / xl=64) |
| `shape` | `'circle' \| 'square'` | `'circle'` | 모양 |
| `bgColor` | `string` | navy accent | initials fallback 배경색 |

**Usage**

```tsx
import { Avatar } from "@bigtablet/design-system";

<Avatar src="/me.jpg" name="박상민" />
<Avatar name="박상민" /> // initials "박"
<Avatar name="Sangmin Park" size="lg" /> // initials "SP"
<Avatar name="Bigtablet" size="xl" shape="square" bgColor="#0E1F4D" />
```

---

### Badge

작은 상태 표시. dot/count/label 3가지 모양과 6가지 색상 variant.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'accent' \| 'neutral' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'accent'` | 색상 |
| `shape` | `'dot' \| 'count' \| 'label'` | `'label'` | 모양 |
| `count` | `number` | - | shape=`count`일 때 표시 숫자 |
| `max` | `number` | `99` | count 최댓값. 초과 시 `99+` |

**Usage**

```tsx
import { Badge } from "@bigtablet/design-system";

<Badge shape="dot" variant="error" />
<Badge shape="count" count={5} />
<Badge shape="count" count={120} max={99} /> // "99+"
<Badge variant="success">New</Badge>
<Badge variant="warning">Beta</Badge>
```

---

### Hero

페이지 상단 히어로 섹션. 배경 이미지/색상 + 오버레이 + 제목/부제목 + CTA 슬롯.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `height` | `'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` | 높이 (sm=320 / md=480 / lg=640 / full=100vh) |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | 텍스트 정렬 |
| `backgroundImage` | `string` | - | 배경 이미지 URL |
| `backgroundColor` | `string` | - | 배경색 |
| `overlay` | `boolean \| 'dark' \| 'light' \| 'navy'` | - | 텍스트 대비용 오버레이 |
| `title` | `ReactNode` | - | h1 메인 제목 |
| `subtitle` | `ReactNode` | - | 부제목 |
| `eyebrow` | `ReactNode` | - | 제목 위 카테고리/태그 텍스트 |
| `textColor` | `'auto' \| 'inverse' \| 'default'` | `'auto'` | 텍스트 색상 (auto는 overlay 기반 자동 결정) |
| `primaryAction` | `HeroAction` | - | Primary CTA |
| `secondaryAction` | `HeroAction` | - | Secondary CTA |

**HeroAction**

| 필드 | Type | Description |
|------|------|-------------|
| `label` | `ReactNode` | 버튼 라벨 |
| `onClick` | `() => void` | 클릭 핸들러 |
| `href` | `string` | 링크 사용 시 |

**Usage**

```tsx
import { Hero } from "@bigtablet/design-system";

<Hero
  height="lg"
  align="center"
  backgroundImage="/hero.jpg"
  overlay="navy"
  eyebrow="Bigtablet Cloud"
  title="더 똑똑한 클라우드 인프라"
  subtitle="개발자가 집중할 수 있는 환경을 만듭니다."
  primaryAction={{ label: "시작하기", onClick: handleStart }}
  secondaryAction={{ label: "자세히 보기", href: "/about" }}
/>
```

---

### MediaCard

이미지가 포함된 카드. Blog/News/Product 같은 B2C 콘텐츠 리스트에 사용.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `image` | `{ src: string; alt: string }` | required | 이미지 정보 |
| `imagePosition` | `'top' \| 'left' \| 'overlay'` | `'top'` | 이미지 위치. overlay=이미지 위 텍스트 |
| `aspectRatio` | `string` | - | 이미지 aspect-ratio (예: `'16/9'`) |
| `heading` | `ReactNode` | - | 카드 제목 |
| `headingAs` | `'h2'..'h6'` | `'h3'` | 제목 시맨틱 태그 |
| `eyebrow` | `ReactNode` | - | 제목 위 카테고리/라벨 |
| `meta` | `ReactNode` | - | 본문 아래 메타 (날짜/조회수 등) |
| `shadow` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'sm'` | 그림자 |
| `bordered` | `boolean` | `false` | 테두리 표시 |
| `clickable` | `boolean` | `false` | hover 강조 + cursor |

**Usage**

```tsx
import { MediaCard } from "@bigtablet/design-system";

<MediaCard
  image={{ src: "/post.jpg", alt: "포스트 썸네일" }}
  aspectRatio="16/9"
  eyebrow="엔지니어링"
  heading="새로운 빌드 시스템 도입기"
  meta={<span>2026.05.20 · 5분 읽기</span>}
  clickable
  onClick={() => navigate("/posts/1")}
>
  <p>tsup + Vite 기반의 새 파이프라인을 소개합니다.</p>
</MediaCard>

// 오버레이 형태
<MediaCard
  image={{ src: "/cover.jpg", alt: "" }}
  imagePosition="overlay"
  aspectRatio="3/4"
  heading="2026 신제품 라인업"
/>
```

---

### EmptyState

빈 상태 표시 — 데이터 없음, 검색 결과 없음, 시작 가이드 등.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `illustration` | `ReactNode` | - | 일러스트 영역 (아이콘/이미지) |
| `title` | `ReactNode` | - | 제목 |
| `description` | `ReactNode` | - | 보조 설명 |
| `action` | `ReactNode` | - | 액션 영역 (Button 등) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 크기 |

**Usage**

```tsx
import { EmptyState, Button } from "@bigtablet/design-system";
import { Inbox } from "lucide-react";

<EmptyState
  illustration={<Inbox size={64} />}
  title="받은 메일이 없습니다"
  description="새 메일이 오면 여기 표시됩니다."
  action={<Button variant="primary">새 메일 작성</Button>}
/>
```

---

### Accordion

펼침/접힘 영역. FAQ, 설정 그룹, details 패턴.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `AccordionItem[]` | required | 아이템 목록 |
| `multiple` | `boolean` | `false` | 여러 개 동시에 펼침 허용 |
| `defaultOpenKeys` | `string[]` | `[]` | 비제어형 초기 펼침 키 |
| `openKeys` | `string[]` | - | 제어형 펼침 키 |
| `onChange` | `(openKeys: string[]) => void` | - | 펼침/접힘 콜백 |

**AccordionItem**

| 필드 | Type | Description |
|------|------|-------------|
| `key` | `string` | 고유 key |
| `title` | `ReactNode` | 헤더 텍스트 |
| `content` | `ReactNode` | 펼쳤을 때 본문 |
| `disabled` | `boolean` | 비활성화 |

**Usage**

```tsx
import { Accordion } from "@bigtablet/design-system";

<Accordion
  multiple
  defaultOpenKeys={["q1"]}
  items={[
    { key: "q1", title: "환불은 어떻게 받나요?", content: <p>구매 후 7일 이내 ...</p> },
    { key: "q2", title: "결제 수단을 변경할 수 있나요?", content: <p>설정 페이지에서 ...</p> },
    { key: "q3", title: "지원 종료된 항목", content: <p>...</p>, disabled: true },
  ]}
/>
```

---

## Layout

페이지 레이아웃을 구성하는 프리미티브. 모두 토큰 기반의 일관된 spacing/breakpoint를 사용합니다.

### Container

max-width 제한 + 반응형 수평 패딩을 가진 컨테이너. 마케팅/서비스 페이지의 기본 wrapper.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'xl'` | max-width (sm=640 / md=768 / lg=1024 / xl=1200 / full=100%) |
| `center` | `boolean` | `true` | 가운데 정렬 |
| `as` | `ElementType` | `'div'` | 렌더링할 태그 |

**Usage**

```tsx
import { Container } from "@bigtablet/design-system";

<Container size="xl">
  <HeroSection />
  <FeatureGrid />
</Container>

<Container size="md" as="article">
  <BlogPostContent />
</Container>
```

---

### Section

마케팅 페이지의 섹션 단위. 수직 여백 + 배경색 variants.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `spacing` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 수직 패딩 (xs=32 / sm=48 / md=64 / lg=96 / xl=128) |
| `bg` | `'default' \| 'dim' \| 'accent' \| 'navy' \| 'transparent'` | `'default'` | 배경색 변형 |
| `as` | `ElementType` | `'section'` | 렌더링할 태그 |

**Usage**

```tsx
import { Section, Container } from "@bigtablet/design-system";

<Section spacing="lg" bg="dim">
  <Container>
    <h2>Features</h2>
    <FeatureGrid />
  </Container>
</Section>

<Section spacing="xl" bg="navy">
  <Container>
    <CtaBlock />
  </Container>
</Section>
```

---

### Stack

Flex 기반 1D 레이아웃. 수직(column) 또는 수평(row) 스택 + 간격/정렬 제어.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `'vertical' \| 'horizontal'` | `'vertical'` | flex 방향 |
| `gap` | `0 \| 2 \| 4 \| 8 \| 12 \| 16 \| 20 \| 24 \| 32 \| 40 \| 48` | `16` | 아이템 간격 (px) |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch'` | - | 교차축 정렬 (align-items) |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | - | 주축 정렬 (justify-content) |
| `wrap` | `'nowrap' \| 'wrap' \| 'wrap-reverse'` | - | flex-wrap |
| `as` | `ElementType` | `'div'` | 렌더링할 태그 |

**Usage**

```tsx
import { Stack } from "@bigtablet/design-system";

// 수평 스택
<Stack direction="horizontal" gap={16} align="center">
  <Avatar name="박상민" />
  <span>박상민</span>
</Stack>

// 수직 스택
<Stack gap={24}>
  <Card />
  <Card />
  <Card />
</Stack>

// 양 끝 정렬
<Stack direction="horizontal" justify="between" align="center">
  <h2>제목</h2>
  <Button>액션</Button>
</Stack>
```

---

### Grid

CSS Grid 기반 2D 레이아웃. 고정 열 수 또는 auto-fill 반응형 그리드.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cols` | `1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 'auto'` | `3` | 열 수. `'auto'`=auto-fill |
| `minColWidth` | `string` | `'280px'` | `cols="auto"`일 때 최소 열 너비 |
| `gap` | `0 \| 4 \| 8 \| 12 \| 16 \| 20 \| 24 \| 32 \| 40 \| 48` | `24` | 아이템 간격 (px) |
| `rowGap` | 위와 동일 | - | 행 간격 (gap을 override) |
| `colGap` | 위와 동일 | - | 열 간격 (gap을 override) |
| `singleColOnMobile` | `boolean` | `true` | 모바일(< 600px)에서 강제 1열 |
| `as` | `ElementType` | `'div'` | 렌더링할 태그 |

**Usage**

```tsx
import { Grid, MediaCard } from "@bigtablet/design-system";

// 3열 고정 그리드
<Grid cols={3} gap={24}>
  <MediaCard {...post1} />
  <MediaCard {...post2} />
  <MediaCard {...post3} />
</Grid>

// auto-fill 반응형
<Grid cols="auto" minColWidth="280px" gap={16}>
  {products.map(p => <MediaCard key={p.id} {...p} />)}
</Grid>

// 다른 행/열 gap
<Grid cols={4} rowGap={32} colGap={16}>
  ...
</Grid>
```
