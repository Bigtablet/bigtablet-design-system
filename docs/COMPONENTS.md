# Components

Bigtablet Design System의 모든 React 컴포넌트 문서입니다.

---

## 목차

- [General](#general)
  - [Button](#button)
  - [Select](#select)
- [Form](#form)
  - [TextField](#textfield)
  - [Checkbox](#checkbox)
  - [Radio](#radio)
  - [Switch](#switch)
  - [DatePicker](#datepicker)
  - [FileInput](#fileinput)
- [Feedback](#feedback)
  - [Alert](#alert)
  - [Toast](#toast)
  - [Spinner](#spinner)
  - [TopLoading](#toploading)
- [Navigation](#navigation)
  - [Pagination](#pagination)
  - [Sidebar](#sidebar)
- [Overlay](#overlay)
  - [Modal](#modal)
- [Display](#display)
  - [Card](#card)

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

### Select

```tsx
import { Select } from '@bigtablet/design-system';

const options = [
  { value: 'apple', label: '사과' },
  { value: 'banana', label: '바나나' },
  { value: 'orange', label: '오렌지', disabled: true },
];

// 기본 사용
<Select
  label="과일 선택"
  options={options}
  placeholder="선택하세요"
  onChange={(value, option) => console.log(value, option)}
/>

// Controlled
const [fruit, setFruit] = useState<string | null>(null);
<Select
  options={options}
  value={fruit}
  onChange={(value) => setFruit(value)}
/>

// Variants & Sizes
<Select options={options} variant="outline" size="md" />
<Select options={options} variant="filled" size="lg" />
<Select options={options} variant="ghost" size="sm" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `SelectOption[]` | required | 옵션 목록 |
| `value` | `string \| null` | - | 선택된 값 (controlled) |
| `defaultValue` | `string \| null` | `null` | 기본 선택값 |
| `onChange` | `(value, option) => void` | - | 변경 핸들러 |
| `placeholder` | `string` | `'Select…'` | 플레이스홀더 |
| `variant` | `'outline' \| 'filled' \| 'ghost'` | `'outline'` | 스타일 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 크기 |
| `fullWidth` | `boolean` | `false` | 전체 너비 |
| `disabled` | `boolean` | `false` | 비활성화 |

---

## Form

### TextField

```tsx
import { TextField } from '@bigtablet/design-system';

// 기본 사용
<TextField label="이름" placeholder="이름을 입력하세요" />

// 상태 표시
<TextField label="이메일" error helperText="유효하지 않은 이메일입니다" />
<TextField label="이메일" success helperText="사용 가능한 이메일입니다" />

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
| `helperText` | `string` | - | 도움말 텍스트 |
| `error` | `boolean` | `false` | 에러 상태 |
| `success` | `boolean` | `false` | 성공 상태 |
| `variant` | `'outline' \| 'filled' \| 'ghost'` | `'outline'` | 스타일 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 크기 |
| `leftIcon` | `ReactNode` | - | 왼쪽 아이콘 |
| `rightIcon` | `ReactNode` | - | 오른쪽 아이콘 |
| `fullWidth` | `boolean` | `false` | 전체 너비 |
| `onChangeAction` | `(value: string) => void` | - | 값 변경 콜백 |
| `transformValue` | `(value: string) => string` | - | 값 변환 함수 |

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

### Switch

```tsx
import { Switch } from '@bigtablet/design-system';

// 기본 사용
<Switch onChange={(checked) => console.log(checked)} />

// Controlled
const [isOn, setIsOn] = useState(false);
<Switch checked={isOn} onChange={setIsOn} />

// Sizes
<Switch size="sm" />
<Switch size="md" />
<Switch size="lg" />

// 접근성
<Switch ariaLabel="알림 설정" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | - | 켜짐 상태 (controlled) |
| `defaultChecked` | `boolean` | `false` | 기본 상태 |
| `onChange` | `(checked: boolean) => void` | - | 변경 핸들러 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 크기 |
| `ariaLabel` | `string` | - | 접근성 라벨 |
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

### Sidebar

> **Note:** Sidebar는 Next.js 전용입니다. `@bigtablet/design-system/next`에서 import 해야 합니다.

```tsx
import { Sidebar } from '@bigtablet/design-system/next';
import { Home, Settings, Users } from 'lucide-react';

const items = [
  { href: '/', label: '홈', icon: Home },
  { href: '/users', label: '사용자', icon: Users },
  {
    type: 'group',
    id: 'settings',
    label: '설정',
    icon: Settings,
    children: [
      { href: '/settings/profile', label: '프로필' },
      { href: '/settings/security', label: '보안' },
    ],
  },
];

<Sidebar
  items={items}
  activePath={pathname}
  match="startsWith"
  brandHref="/main"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `SidebarItem[]` | `[]` | 메뉴 아이템 |
| `activePath` | `string` | - | 현재 활성 경로 |
| `match` | `'startsWith' \| 'exact'` | `'startsWith'` | 경로 매칭 방식 |
| `brandHref` | `string` | `'/main'` | 로고 클릭 시 이동 경로 |
| `onItemSelect` | `(href: string) => void` | - | 아이템 선택 핸들러 |

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
