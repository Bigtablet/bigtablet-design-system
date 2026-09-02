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
  - [IconButton](#iconbutton)
- [Form](#form)
  - [TextField](#textfield)
  - [Textarea](#textarea)
  - [Checkbox](#checkbox)
  - [Radio](#radio)
  - [RadioGroup](#radiogroup)
  - [Toggle](#toggle)
  - [DatePicker](#datepicker)
  - [FileInput](#fileinput)
  - [ImageCropper](#imagecropper)
  - [OtpInput](#otpinput)
- [Feedback](#feedback)
  - [Alert](#alert)
  - [Toast](#toast)
  - [Spinner](#spinner)
  - [TopLoading](#toploading)
  - [LinearProgress](#linearprogress)
  - [Skeleton](#skeleton)
- [Navigation](#navigation)
  - [Pagination](#pagination)
  - [Tabs](#tabs)
  - [Sidebar](#sidebar)
  - [BottomNav](#bottomnav)
  - [NavBar](#navbar)
  - [Breadcrumb](#breadcrumb)
- [Overlay](#overlay)
  - [Modal](#modal)
  - [Drawer](#drawer)
  - [Tooltip](#tooltip)
  - [Menu](#menu)
  - [Popover](#popover)
- [Display](#display)
  - [Card](#card)
  - [Divider](#divider)
  - [ListItem](#listitem)
  - [Avatar](#avatar)
  - [Badge](#badge)
  - [Hero](#hero)
  - [MediaCard](#mediacard)
  - [EmptyState](#emptystate)
  - [ErrorState](#errorstate)
  - [Accordion](#accordion)
  - [Table](#table)
  - [Icon](#icon)
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

### Chip - `type="static"` + `tone` (구 Tag 흡수)

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
<Button variant="filled">Filled</Button>
<Button variant="tonal">Tonal</Button>
<Button variant="outline">Outline</Button>
<Button variant="text">Text</Button>

// 위험한 액션 - variant 와 조합하는 boolean prop (variant="danger" 는 존재하지 않음)
<Button danger>삭제</Button>
<Button variant="outline" danger>삭제</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">XLarge</Button>

// 아이콘
import { Plus } from 'lucide-react';
<Button leadingIcon={<Plus size={16} />}>추가</Button>

// 너비 조절
<Button fullWidth>전체 너비</Button>

// anchor 로 렌더링 - href 만 줘도 자동 분기
<Button href="/pricing">요금제 보기</Button>
<Button as="a" href="https://example.com" target="_blank" rel="noreferrer">외부 링크</Button>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'filled' \| 'tonal' \| 'outline' \| 'text'` | `'filled'` | 버튼 스타일 |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 버튼 크기 |
| `danger` | `boolean` | `false` | 위험한 액션(삭제/취소) 빨간 강조. `variant` 와 조합해서 사용 |
| `leadingIcon` | `ReactNode` | - | 버튼 앞에 표시할 아이콘 |
| `trailingIcon` | `ReactNode` | - | 버튼 뒤에 표시할 아이콘 |
| `radius` | `'none' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'full'` | border-radius 토큰 |
| `fullWidth` | `boolean` | `false` | 전체 너비 |
| `as` | `'button' \| 'a'` | `'button'` | 렌더링할 요소. `href` 만 줘도 anchor 로 분기 |
| `href` | `string` | - | 링크 대상 (`as="a"` 일 때 필수) |
| `disabled` | `boolean` | `false` | 비활성화. anchor 는 `aria-disabled` + 클릭 차단으로 처리 |

> `ButtonProps` 는 `ButtonAsButton | ButtonAsAnchor` discriminated union 이라 `interface X extends ButtonProps` 로 확장할 수 없다. 확장이 필요하면 `React.ComponentProps<typeof Button>` 을 쓴다 ([MIGRATION.md](./MIGRATION.md) 참고).

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
  onValueChange={(value, option) => console.log(value, option)}
/>

// Controlled
const [fruit, setFruit] = useState<string | null>(null);
<Dropdown
  options={options}
  value={fruit}
  onValueChange={(value) => setFruit(value)}
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

// 검색 가능 (label 부분 일치 필터)
<Dropdown options={options} searchable searchPlaceholder="과일 검색…" emptyText="일치하는 과일 없음" />

// 다중 선택
const [fruits, setFruits] = useState<string[]>([]);
<Dropdown
  multiple
  options={options}
  value={fruits}
  onValueChange={(values, opts) => setFruits(values)}
  selectedSummary={(count) => `${count}개 담김`}
/>

// 네이티브 폼 제출 참여 - 선택 값이 hidden input 으로 렌더됨
<form action="/submit" method="post">
  <Dropdown name="fruit" options={options} />
</form>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `DropdownOption[]` | required | 옵션 목록 |
| `value` | `string \| null` (single) · `string[]` (multiple) | - | 선택된 값 (controlled) |
| `defaultValue` | `string \| null` (single) · `string[]` (multiple) | - | 기본 선택값 |
| `onValueChange` | `(value, option) => void` (single) · `(values, options) => void` (multiple) | - | 변경 핸들러 (canonical) |
| ~~`onChange`~~ | `onValueChange` 와 동일 시그니처 | - | **deprecated** (v3.3.0, `onValueChange` 의 alias). [MIGRATION.md](./MIGRATION.md) 참고 |
| `multiple` | `boolean` | `false` | 다중 선택 모드. `value`/`onValueChange` 시그니처가 배열로 바뀜 |
| `searchable` | `boolean` | `false` | 열린 패널 상단에 검색 입력 표시 (`label` 부분 일치 필터) |
| `searchPlaceholder` | `string` | `'검색…'` | 검색 입력 플레이스홀더 |
| `emptyText` | `string` | `'결과 없음'` | 필터 결과가 0개일 때 표시할 텍스트 |
| `selectedSummary` | `(count: number) => string` | ``(count) => `${count}개 선택` `` | 다중 선택 요약 텍스트 |
| `label` | `string` | - | 플로팅 라벨 (값 선택 시 또는 열릴 때 표시) |
| `placeholder` | `string` | `'선택…'` | 플레이스홀더 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 크기 |
| `name` | `string` | - | 네이티브 폼 제출용 name. 선택 값이 hidden input 으로 렌더됨 (multiple 은 같은 name 반복) |
| `id` | `string` | 자동 생성 | 드롭다운 요소 id |
| `className` | `string` | - | 루트 요소에 추가할 className |
| ~~`fullWidth`~~ | `boolean` | - | **deprecated** (v3.0.0, no-op - 항상 부모 너비를 채움). [MIGRATION.md](./MIGRATION.md) 참고 |
| `variant` | `'outline' \| 'filled'` | `'outline'` | 컨트롤 시각 변형. `filled` 는 테두리 대신 dim 배경으로 채우고, 열려 있는 동안 테두리가 드러남 |
| ~~`textAlign`~~ | `'left' \| 'center'` | - | **deprecated** (no-op) |
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

// v3.0+ Static (구 Tag 대체) - 비인터랙티브 라벨 + tone
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
| `aria-label` | `string` | **둘 중 하나 필수** | 아이콘 버튼의 접근성 이름 |
| `aria-labelledby` | `string` | **둘 중 하나 필수** | 접근성 이름을 제공하는 외부 요소의 id |
| `disabled` | `boolean` | `false` | 비활성화 |

> ⚠️ **접근성 이름은 타입 레벨에서 필수다.** `icon` 은 항상 `aria-hidden="true"` span 으로 감싸지므로, `aria-label` / `aria-labelledby` 중 하나를 주지 않으면 버튼에 접근성 이름이 전혀 없다 (WCAG 2.1 SC 4.1.2 Name, Role, Value). `IconButtonProps` 는 이를 강제하는 `IconButtonWithAriaLabel | IconButtonWithAriaLabelledBy` union 이라 `<IconButton icon={<X />} />` 는 **컴파일되지 않는다**.
>
> ```tsx
> // ❌ 타입 에러 - 접근성 이름 없음
> <IconButton icon={<X />} />
> // ✅
> <IconButton icon={<X />} aria-label="닫기" />
> <IconButton icon={<X />} aria-labelledby="dialog-title" />
> ```

---

## Form

### Combobox

후보를 **서버에서** 가져오는 선택 입력. `Dropdown` 도 `searchable` 로 타이핑 검색을 지원하지만
이미 받아 둔 옵션 배열 안에서만 거른다 — 담당자·회사·상품처럼 후보가 수백 개인 필드는 그 목록을
통째로 내려받을 수 없다.

```tsx
<Combobox
  value={owner}
  onValueChange={setOwner}
  onSearch={(q) => api.searchUsers(q)}   // Promise<ComboboxOption[]>
  emptyMessage="일치하는 담당자가 없습니다"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSearch` | `(q: string) => Promise<ComboboxOption[]>` | - | 검색어가 바뀌면 디바운스 후 호출. **필수** |
| `value` | `ComboboxOption \| null` | `null` | 선택된 값 (제어형) |
| `onValueChange` | `(o: ComboboxOption \| null) => void` | - | 선택 변경 |
| `defaultOptions` | `ComboboxOption[]` | `[]` | 검색 전 보여줄 초기 후보 |
| `debounceMs` | `number` | `250` | 검색 호출 간격 |
| `placeholder` | `string` | `'검색해서 선택'` | |
| `emptyMessage` | `string` | `'일치하는 항목이 없습니다'` | 결과 없음 |
| `idleMessage` | `string` | `'검색어를 입력하세요'` | 검색 전 |
| `renderOption` | `(o: ComboboxOption) => ReactNode` | - | 목록 항목 커스터마이즈 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | |

비동기에서 갈리는 네 가지를 DS 가 처리한다.

- **디바운스** — 타이핑마다 요청하지 않는다
- **로딩 표시** — 조회 중 스피너
- **응답 경합 차단** — 늦게 도착한 이전 쿼리의 결과가 최신 목록을 덮지 않는다. 타이핑이 빠르면 순서가 뒤집히고, 그러면 방금 친 글자와 무관한 후보가 남는다
- **"검색 전" 과 "결과 없음" 구분** — 같은 문구로 묶으면 검색 전 빈 목록이 실패처럼 읽힌다

`Dropdown` 과 언제 갈리나 — 옵션을 이미 다 갖고 있으면 `Dropdown`(+`searchable`), 서버에서 가져와야
하면 `Combobox`.

> 팝업의 거동(개폐·활성 항목·키보드·바깥 클릭·열림 방향)은 `useListboxPopup` 을 `Dropdown` 과
> 공유한다. 소비자도 이 훅으로 자기 목록 팝업을 만들 수 있다.

### DataView

목록 화면 한 벌 — 검색·필터, 표, 선택 액션, 페이지네이션, 그리고 **네 상태 분기**
(loading / error / empty / data)를 한 곳에 둔다.

`Table` 은 정렬·선택·스켈레톤을 이미 처리한다. `DataView` 가 파는 것은 **그 위아래를 매번
다시 만들지 않는 것**이다 — 특히 에러 상태를 빠뜨린 목록이 생기지 않게.

```tsx
<DataView
  query={usersQuery}                       // {data, isLoading, error, refetch}
  columns={columns}
  rowKey={(u) => u.id}
  toolbar={{ search: true, searchValue: q, onSearchChange: setQ, filters: <Dropdown … /> }}
  selectionActions={[
    { label: "내보내기", onRun: exportRows },
    { label: "삭제", danger: true, onRun: removeRows },
  ]}
  pagination={{ page, totalPages, onPageChange: setPage }}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `query` | `DataViewQuery<T>` | - | `{data, isLoading, error, refetch}`. 필드 이름을 TanStack Query 에 맞췄지만 어떤 라이브러리도 import 하지 않는다 |
| `columns` | `TableColumn<T>[]` | - | `Table` 과 같은 정의 |
| `rowKey` | `(row: T) => string` | - | 행 고유 key |
| `toolbar` | `DataViewToolbar` | - | `search`·`searchValue`·`onSearchChange`·`searchPlaceholder`·`filters` |
| `selectionActions` | `DataViewSelectionAction[]` | - | 지정하면 체크박스 컬럼이 붙는다. 선택 상태는 `DataView` 가 든다 |
| `pagination` | `DataViewPagination` | - | `totalPages` 가 1 이면 렌더하지 않는다 |
| `empty` | `ReactNode` | 기본 `EmptyState` | 데이터가 비었을 때 |
| `sort` / `onSortChange` | `TableSort` / `(s) => void` | - | 정렬 (서버 정렬과 그대로 연결) |
| `selectionSummary` | `(n: number) => string` | `` (n) => `${n}개 선택됨` `` | 선택 액션 줄 문구 |

동작 규칙 세 가지:

- **로딩 중에는 빈 상태를 띄우지 않는다.** `Table` 이 스켈레톤을 그리므로, 빈 배열 + 로딩을 empty 로 처리하면 "없음 → 스켈레톤 → 데이터" 로 두 번 깜빡인다
- **`refetch` 가 없으면 재시도 버튼도 없다.** 누를 수 없는 버튼을 띄우지 않는다
- **선택 개수는 `role="status"` 로 알린다.** 액션 줄이 시각적으로만 나타나면 키보드 사용자는 무엇이 가능해졌는지 모른다

### 문장 속 링크 (`.text_link`)

`Prose` 는 마크다운 렌더 결과에만 조판을 입힌다. 그 밖의 UI 텍스트 — 체크박스 라벨의 약관 링크,
`EmptyState` 설명 안의 도움말 링크 — 안에 링크를 넣을 자리가 없어 화면마다 색·밑줄을 손으로
정하고 있었다. `.text_link` 가 그 규칙을 소유한다.

```tsx
<a href="/terms" className="text_link">이용약관</a>

// 라우터 링크에도 그대로 붙는다
<Link href="/terms" className="text_link">이용약관</Link>
```

| | 값 | 이유 |
|---|-----|------|
| 색 | `--bt-color-accent-default` | `Prose a` 와 같은 값. 본문 링크와 UI 링크가 갈리면 사용자가 어포던스를 두 벌 배운다 |
| 밑줄 | 항상 | WCAG 1.4.1 — 색만으로 구분하려면 주변 본문과 3:1 이 필요한데 accent 는 넘지 못한다 (axe `link-in-text-block`) |
| 포커스 | `--bt-focus-ring` + `radius_xs` | |

컴포넌트가 아니라 클래스인 이유는 라우터 링크(`next/link`, `react-router`)에 그대로 붙이기
위해서다. 컴포넌트로 만들면 `as` 다형성을 먼저 풀어야 한다.

> `style.css` 에 포함된다. SCSS 를 직접 쓰는 곳에서는 `@include token.inline_link` 로 같은 값을 쓴다.

### Field / Form

`Field` 가 라벨·필수 표시·도움말·에러와 그 접근성 연결을 소유한다. 입력 11종은 이 셋을 서로 다르게
갖고 있어(라벨 9종, 에러 5종) 폼 화면이 입력 밖에 문구를 직접 그려 왔다. `Field` 를 쓰면 어떤 입력을
넣어도 라벨 위치·간격·에러 문구·`aria-describedby` 가 같아진다.

입력의 기존 prop 은 그대로 살아 있다. **`Field` 없이 쓰면 지금과 동일하게 동작한다.**

```tsx
<Form onSubmit={save} errors={serverErrors}>
  <Field name="email" label="이메일" required help="로그인 ID 로 사용됩니다">
    <TextField />
  </Field>
  <Field name="role" label="권한">
    <Dropdown options={roles} />
  </Field>
  <Form.Actions>
    <Button type="submit">저장</Button>
  </Form.Actions>
</Form>
```

`Field` 안에서는 입력에 `label` 을 주지 않는다 — 라벨이 두 번 보인다.

#### 언제 `Field` 를 쓰고 언제 입력의 prop 을 쓰나

`TextField` 처럼 자체 `label`·`supportingText` 를 가진 입력이 9종 있다. 둘은 대체재가 아니라 쓰임이 다르다.

| 상황 | 쓸 것 |
|------|-------|
| 폼 화면 — 필드가 여럿, 서버 에러 배분, 필드 간 간격이 균일해야 함 | **`Field`.** 입력에는 `label`·`supportingText`·`error` 를 주지 않는다 |
| 단독 입력 — 검색창, 설정 행, 테이블 필터 | **입력의 자체 prop.** `Field` 로 감싸지 않는다 |

`Field` 가 파는 것은 `TextField` 하나에 대한 이득이 아니라 **11종 간 균일성**이다. `Dropdown`·`DatePicker`·`Toggle` 은 에러를 표시할 수단이 아예 없어, 한 폼에 세로로 놓으면 라벨 위치와 에러 문구 자리가 갈린다.

#### Field

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | - | 필드 이름. `Form` 의 `errors[name]` 을 찾는 키 |
| `label` | `string` | - | 라벨. 단일 컨트롤은 `htmlFor`, `role="group"` 입력은 `aria-labelledby` 로 연결된다 |
| `required` | `boolean` | `false` | `*` 표시 + 입력에 `aria-required` |
| `help` | `ReactNode` | - | 입력 아래 도움말. 에러가 있으면 에러가 대신 보인다 |
| `error` | `ReactNode` | - | 에러 메시지. `Form` 의 `errors[name]` 보다 우선한다 |
| `children` | `ReactNode` | - | 입력 하나 |

#### Form

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `errors` | `Record<string, ReactNode>` | - | 필드 이름 → 에러. 서버 검증(422) 결과를 그대로 넣는다 |
| `onSubmit` | `(e) => void` | - | `preventDefault()` 는 `Form` 이 이미 호출한 뒤 부른다 |

#### Form.Actions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `align` | `'start' \| 'center' \| 'end' \| 'between'` | `'end'` | 버튼 정렬 |

> 폼 라이브러리에 의존하지 않는다. react-hook-form 등은 `errors` 맵을 만들어 넘기는 어댑터 한 겹으로 붙인다.

### TextField

```tsx
import { TextField } from '@bigtablet/design-system';

// 기본 사용
<TextField label="이름" placeholder="이름을 입력하세요" />

// 상태 표시
<TextField label="이메일" error supportingText="유효하지 않은 이메일입니다" />

// 장식 아이콘 - aria-hidden 으로 접근성 트리에서 제외된다
import { Search, X } from 'lucide-react';
<TextField leadingIcon={<Search size={16} />} placeholder="검색..." />

// 조작 요소 - aria-hidden 을 붙이지 않는다. 버튼은 반드시 이 슬롯에
<TextField
  label="검색"
  trailingAction={
    <button type="button" aria-label="검색어 지우기" onClick={reset}>
      <X size={20} aria-hidden="true" />
    </button>
  }
/>

// 비밀번호 표시/숨기기 - 내장 토글 (문구는 i18n 때문에 앱이 주입)
<TextField
  label="비밀번호"
  type="password"
  showPasswordToggle
  passwordToggleLabels={{ show: '비밀번호 보기', hide: '비밀번호 숨기기' }}
/>

// 지우기 버튼
<TextField label="검색어" clearable onValueChange={(v) => setQuery(v)} />

// 값 변환 (자동 포맷팅)
<TextField
  label="전화번호"
  transformValue={(v) => v.replace(/\D/g, '').slice(0, 11)}
  onValueChange={(value) => console.log(value)}
/>

// filled variant - 테두리 대신 dim 배경, 포커스 시 테두리가 드러남
<TextField label="검색" variant="filled" placeholder="검색어를 입력하세요" />

// 성공 상태 - error 와 같은 구조지만 aria-invalid 는 켜지 않음
<TextField label="이메일" success supportingText="사용 가능한 이메일입니다" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | 라벨 |
| `showLabel` | `boolean` | `true` | 라벨 표시 여부 (false 면 SR 전용) |
| `supportingText` | `string` | - | 도움말 텍스트 |
| `error` | `boolean` | `false` | 에러 상태 (`success` 보다 우선) |
| `success` | `boolean` | `false` | 성공(검증 통과) 상태. `error` 가 true 면 무시됨 |
| `identifier` | `boolean` | `false` | 식별자 칸 - `l`/`I`/`1`, `0`/`O` 를 구분되게 렌더 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 크기 |
| `variant` | `'outline' \| 'filled'` | `'outline'` | 시각 변형. `filled` 는 테두리 대신 dim 배경으로 채우고, 포커스 시 테두리가 드러남 |
| `leadingIcon` | `ReactNode` | - | 왼쪽 **장식** 아이콘 (`aria-hidden`) |
| `trailingIcon` | `ReactNode` | - | 오른쪽 **장식** 아이콘 (`aria-hidden`) |
| `leadingAction` | `ReactNode` | - | 왼쪽 조작 요소 (v3.11, `aria-hidden` 없음) |
| `trailingAction` | `ReactNode` | - | 오른쪽 조작 요소 (v3.11, `aria-hidden` 없음) |
| `showPasswordToggle` | `boolean` | `false` | 비밀번호 표시/숨기기 토글 내장 (v3.11) |
| `passwordToggleLabels` | `{ show: string; hide: string }` | `{ show: '비밀번호 표시', hide: '비밀번호 숨기기' }` | 토글 버튼 `aria-label` |
| `clearable` | `boolean` | `false` | 값이 있을 때 오른쪽에 지우기(X) 버튼 표시 |
| `clearLabel` | `string` | `'지우기'` | 지우기 버튼 `aria-label` |
| `fullWidth` | `boolean` | `false` | 전체 너비 |
| `onValueChange` | `(value: string) => void` | - | 값 변경 콜백 (호출 시점은 `imeStrategy` 에 따름) |
| ~~`onChangeAction`~~ | `(value: string) => void` | - | **deprecated** (v3.3.0, `onValueChange` alias). Next 서버 액션 전달용 `Action` 접미사가 필요하면 계속 사용 가능 |
| `imeStrategy` | `'delayed' \| 'immediate'` | `'delayed'` | IME 조합 중 콜백 전략 (v3.1). `immediate` = 조합 중에도 즉시 호출 |
| `transformValue` | `(value: string) => string` | - | 값 변환 함수 |

> **`error` vs `success` 우선순위**: 둘 다 `true` 면 `error` 가 이긴다. 검증 실패를 성공처럼 칠하면 사용자가 잘못된 값을 그대로 제출하게 되기 때문이다. `success` 는 `aria-invalid` 를 켜지 않는다 (`error` 만 `aria-invalid="true"`).
>
> `variant` · `success` 는 Vanilla 의 `.bt-text-field__input--filled` / `--success` 와 1:1 대응한다.
>
> **v3.0 변경**: 내부 마크업이 `<fieldset>` + `<legend>` 구조에서 standalone `<label htmlFor>` 구조로 변경되었습니다. 공개 props는 동일하지만, 커스텀 SCSS에서 `.text_field_legend` 같은 내부 셀렉터를 오버라이드했다면 점검이 필요합니다.
>
> **v3.1 추가**: `imeStrategy` prop - 한글 IME 조합 중 콜백 전략. 기본 `"delayed"` (조합 완료 후 `onValueChange`), 실시간 검색/필터엔 `"immediate"` (조합 중에도 즉시 호출).
>
> **v3.11 추가 - 아이콘 슬롯 vs 조작 슬롯**: `leadingIcon` · `trailingIcon` 은 장식 전용이라 `aria-hidden="true"` 래퍼를 유지한다. 여기에 `<button>` 같은 포커스 가능한 요소를 넣으면 **포커스는 가는데 보조기기에는 존재하지 않는 요소**가 되어 WCAG 4.1.2 (Name/Role/Value) 위반이고, Chrome 은 `Blocked aria-hidden on an element because its descendant retained focus` 를 남기며 `aria-hidden` 적용을 거부한다. 조작 요소는 `leadingAction` · `trailingAction` 에 넣을 것 - 아이콘 칸의 위치·크기 CSS 를 그대로 재사용하고 `aria-hidden` 만 빠지며, 넘긴 요소가 40x40 히트 영역을 채운다 (WCAG 2.5.8).
>
> 오른쪽 칸은 하나뿐이라 우선순위가 있다: `showPasswordToggle` > `clearable`(값 있을 때) > `trailingAction` > `trailingIcon`. 토글을 켜면 값이 차 있어도 계속 보인다 - 비밀번호 칸에서 토글이 사라지면 쓸 수 없기 때문. 왼쪽은 `leadingAction` > `leadingIcon`.

#### `identifier` — 옮겨 적는 값의 오탈자 줄이기

Pretendard 기본 글자꼴은 `l` · `I` · `1` 이 거의 같고 `0` 과 `O` 도 헷갈린다. 아이디·인증코드·시리얼·사업자번호처럼 **사용자가 화면을 보고 한 글자씩 옮겨 적는 값**에는 켠다.

```tsx
<TextField label="사업자등록번호" identifier />
<TextField label="인증코드" identifier inputMode="numeric" />
```

Pretendard 의 `cv05`(l 에 꼬리) · `cv08`(I 에 세리프) 와 `slashed-zero` 를 적용한다. Pretendard 가 아닌 폴백 폰트는 두 feature 를 무시하므로 안전하다.

앱이 `.text_field_input` 을 직접 뚫어 `font-feature-settings` 를 주지 않아도 된다. SCSS 에서 같은 처리가 필요하면 `@include token.legible_identifiers` 를 쓴다 — `tabular_nums` · `slashed_zero` 와 겹쳐 쓰면 안 되는 함정은 [THEMING.md](./THEMING.md#하드코딩-대신-쓸-토큰) 참고.

---

### Textarea

멀티라인 텍스트 입력. `TextField` 와 **동일한 시각/토큰** (border / focus / error / label / helper / disabled) + textarea 특화 기능 (auto-grow, 글자 수 카운터, resize 제어, 한글 IME 정책).

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 한 줄 입력 (이름, 이메일, 검색) | ❌ [TextField](#textfield) |
| 여러 줄 입력 (공지 내용, 문의, 메모, 설명) | ✅ Textarea |
| 고정 높이 다중 입력 | ✅ Textarea `rows={n}` |
| 내용 따라 늘어나는 입력 | ✅ Textarea `minRows`/`maxRows` (auto-grow) |
| 글자 수 제한 표시 필요 | ✅ Textarea `maxLength` + `showCounter` |

#### auto-grow

`minRows` 또는 `maxRows` 중 하나라도 지정하면 auto-grow 모드 - 내용에 따라 높이가 자동으로 늘어나고 `maxRows` 초과 시 스크롤. 이 모드에선 사용자 resize 핸들이 자동 비활성화됩니다. 둘 다 미지정 시 `rows` 고정 높이.

```tsx
// 고정 3행
<Textarea label="메모" rows={3} />

// auto-grow: 2행에서 시작, 최대 6행까지 늘어남
<Textarea label="자기소개" minRows={2} maxRows={6} />
```

#### 한글 IME

`TextField` 와 동일하게 `imeStrategy` 지원. 조합 중 외부 `value` 구독이 즉시 필요하면 `"immediate"`. 조합 중에는 `transformValue` 가 보류되어 한글 조합이 깨지지 않습니다.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | 라벨 |
| `showLabel` | `boolean` | `true` | 라벨 표시 여부 |
| `supportingText` | `string` | - | 도움말 텍스트 (error 시 에러 색) |
| `error` | `boolean` | `false` | 에러 상태 (`aria-invalid` 자동) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 크기 |
| `rows` | `number` | `3` | 고정 행 수 (auto-grow 미사용 시) |
| `minRows` | `number` | - | auto-grow 최소 행 (지정 시 auto-grow 활성) |
| `maxRows` | `number` | - | auto-grow 최대 행 (초과 시 스크롤) |
| `maxLength` | `number` | - | 최대 글자 수 |
| `showCounter` | `boolean` | `false` | 글자 수 카운터 표시 (`maxLength` 와 함께 권장) |
| `resize` | `'none' \| 'vertical' \| 'both'` | `'vertical'` | resize 핸들 (auto-grow 시 무시) |
| `toolbar` | `ReactNode` | - | 입력 위, **테두리 안쪽** 슬롯. 서식 툴바처럼 입력과 한 박스로 보여야 하는 컨트롤용. 포커스 테두리가 툴바까지 감싸고 하단 구분선은 DS 가 긋는다 |
| `fullWidth` | `boolean` | `false` | 전체 너비 |
| `onValueChange` | `(value: string) => void` | - | 값 변경 콜백 |
| `imeStrategy` | `'delayed' \| 'immediate'` | `'delayed'` | IME 조합 중 콜백 전략 |
| `transformValue` | `(value: string) => string` | - | 값 변환 함수 |
| `value` / `defaultValue` | `string` | - | 제어/비제어 값 |
| `...rest` | `TextareaHTMLAttributes` | - | `placeholder`, `disabled`, `aria-*` 등 |

#### 접근성

- `error` 시 `aria-invalid="true"` + `supportingText` 가 `aria-describedby` 로 연결
- `showLabel={false}` 면 `label` 이 `aria-label` 로 적용 (시각 라벨 숨김)
- 카운터는 `aria-hidden` - 스크린 리더용 글자수 안내가 필요하면 `supportingText` 로 별도 제공

**Usage**

```tsx
import { Textarea } from "@bigtablet/design-system";

// 공지 내용 - auto-grow + 카운터
<Textarea
  label="공지 내용"
  placeholder="최대 500자"
  minRows={3}
  maxRows={10}
  maxLength={500}
  showCounter
  fullWidth
  onValueChange={(v) => setContent(v)}
/>

// 실시간 미리보기 (한글 즉시 반영)
<Textarea label="마크다운" imeStrategy="immediate" value={md} onValueChange={setMd} />

// 에러
<Textarea label="문의 내용" error supportingText="내용을 입력해주세요." rows={4} />
```

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

> `RadioGroup` 안에서는 `name` / `checked` / `size` / `disabled` 가 그룹 컨텍스트에서 자동 주입됩니다. 이 경우 `value` 만 지정하면 됩니다. (그룹 밖에서는 위 props 로 standalone 동작)

---

### RadioGroup

`Radio` 들을 묶는 **Context 기반 합성 래퍼**. 그룹 단위 value 제어/비제어 + `name` 자동 공유 + label/error/supportingText 묶음 + 방향키 이동(native radio).

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 여러 옵션 중 하나 선택 (그룹) | ✅ RadioGroup + `Radio value=...` |
| 단일 라디오 (그룹 아님) | △ [Radio](#radio) standalone |
| 켜기/끄기 1개 | ❌ [Toggle](#toggle) |
| 여러 개 동시 선택 | ❌ [Checkbox](#checkbox) |

#### 제어 / 비제어

- **제어형**: `value` + `onValueChange`
- **비제어형**: `defaultValue`

자식 `Radio`는 `value`만 지정 - `name`/`checked`/`size`/`disabled`는 그룹에서 상속.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | 제어형 선택 값 |
| `defaultValue` | `string` | - | 비제어형 초기 값 |
| `onValueChange` | `(value: string) => void` | - | 값 변경 콜백 |
| `name` | `string` | (auto) | 그룹 name (미지정 시 자동 생성) |
| `label` | `ReactNode` | - | 그룹 라벨 (`radiogroup` 접근성 레이블) |
| `supportingText` | `ReactNode` | - | 보조 설명 (error 시 빨간색) |
| `error` | `boolean` | `false` | 에러 상태 (`aria-invalid` 자동) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 그룹 사이즈 (자식 Radio 에 전파) |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | 배치 방향 |
| `disabled` | `boolean` | `false` | 그룹 전체 비활성화 |

#### 접근성

- 옵션 컨테이너에 `role="radiogroup"` + `aria-labelledby`(label) / `aria-describedby`(supportingText) / `aria-invalid`(error)
- native `input[type=radio]` 라 같은 `name` 공유 시 브라우저가 방향키 이동을 기본 제공

**Usage**

```tsx
import { RadioGroup, Radio } from "@bigtablet/design-system";

// 비제어
<RadioGroup label="크기" defaultValue="md">
  <Radio value="sm" label="작게" />
  <Radio value="md" label="보통" />
  <Radio value="lg" label="크게" />
</RadioGroup>

// 제어 + 에러 + 가로 배치
<RadioGroup
  label="결제 수단"
  value={method}
  onValueChange={setMethod}
  orientation="horizontal"
  error={!method}
  supportingText={!method ? "결제 수단을 선택해 주세요." : undefined}
>
  <Radio value="card" label="카드" />
  <Radio value="bank" label="계좌이체" />
</RadioGroup>
```

---

### Toggle

```tsx
import { Toggle } from '@bigtablet/design-system';

// 기본 사용
<Toggle onCheckedChange={(checked) => console.log(checked)} />

// Controlled
const [isOn, setIsOn] = useState(false);
<Toggle checked={isOn} onCheckedChange={setIsOn} />

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
| `onCheckedChange` | `(checked: boolean) => void` | - | 변경 핸들러 |
| `size` | `'sm' \| 'md'` | `'sm'` | 크기 |
| `ariaLabel` | `string` | required | 접근성 라벨 (필수) |
| `disabled` | `boolean` | `false` | 비활성화 |

#### 히트 영역은 트랙보다 넓습니다

트랙은 sm 40×24 · md 48×28 이지만, 스위치는 시각적으로 작은 것이 정상이라 크기를 키우는 대신 **히트 영역만** 넓혔습니다 — 데스크탑 32px, 모바일(<600px) 40px. 절대배치 `::after` 라서 레이아웃 공간은 차지하지 않습니다.

> **세로로 쌓을 때는 16px 이상 띄우세요.** 모바일에서 sm 은 트랙 위아래로 8px 씩 넓어지므로, 간격이 그보다 좁으면 인접 토글의 히트 영역이 겹쳐 잘못된 토글이 눌릴 수 있습니다.

Vanilla 번들의 `.bt-toggle` 도 동일하게 동작합니다.


---

### DatePicker

```tsx
import { DatePicker } from '@bigtablet/design-system';

// 기본 사용 (연-월-일)
const [date, setDate] = useState('');
<DatePicker
  label="생년월일"
  value={date}
  onValueChange={setDate}
/>

// 연-월 모드
<DatePicker
  label="시작 월"
  mode="year-month"
  value={date}
  onValueChange={setDate}
/>

// 범위 제한
<DatePicker
  label="예약일"
  startYear={2020}
  endYear={2030}
  selectableRange="until-today"
  value={date}
  onValueChange={setDate}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | 라벨 |
| `value` | `string` | - | 선택된 날짜 (`'YYYY-MM-DD'` 또는 `'YYYY-MM'`) |
| `onValueChange` | `(value: string) => void` | required | 변경 핸들러 |
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

// 여러 파일 + 도움말
<FileInput
  label="이미지 업로드"
  accept="image/*"
  multiple
  supportingText="PNG, JPG 파일만 업로드 가능합니다"
  onFiles={(files) => console.log(files)}
/>

// 썸네일 미리보기 (variant="button" + preview)
<FileInput label="사진 첨부" accept="image/*" multiple preview />

// 큰 박스 이미지 업로더 (아바타 패턴) - 단일 이미지
<FileInput
  variant="preview"
  previewSize={120}
  label="프로필 사진 선택"
  accept="image/*"
  onFiles={(files) => console.log(files)}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `'파일 선택'` | 파일 선택 버튼 라벨 / `variant="preview"` 의 빈 상태 텍스트 |
| `variant` | `'button' \| 'preview'` | `'button'` | 표시 형태. `preview` 는 큰 박스에 이미지를 채우는 단일 이미지 업로더 |
| `previewSize` | `number` | `160` | `variant="preview"` 박스 한 변 크기 (px) |
| `preview` | `boolean` | `false` | 이미지 선택 시 64×64 썸네일을 버튼 아래 나열 (`variant="button"` 전용) |
| `supportingText` | `string` | - | 입력 아래 도움말 텍스트 |
| `accept` | `string` | - | 허용 파일 타입 |
| `onFiles` | `(files: FileList \| null) => void` | - | 파일 선택 핸들러. 미리보기 제거 시 `null` 로 호출 |
| `multiple` | `boolean` | `false` | 다중 선택 (`variant="preview"` 는 항상 단일 이미지) |
| `disabled` | `boolean` | `false` | 비활성화 |

> 나머지 `input[type=file]` 네이티브 속성(`name`, `required`, `onChange` 등)은 그대로 전달된다. `onChange` 를 함께 넘기면 `onFiles` 뒤에 이어서 호출된다.

---

### ImageCropper

업로드 전에 이미지에서 **보일 정사각 영역**을 정하는 크로퍼 (v3.7.0). 뷰포트 안에서 드래그(또는 방향키)로 위치를, 휠·슬라이더·＋/－ 버튼(또는 <kbd>+</kbd>/<kbd>-</kbd> 키)으로 배율을 맞춘다.

모달을 포함하지 않으므로 소비자가 [`Modal`](#modal) 등으로 감싸고, "적용" 버튼에서 `ref.crop()` 을 호출해 `Blob` 을 받는다.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 프로필/아바타 이미지 업로드 전 원형 크롭 | ✅ ImageCropper (`circular`) |
| 썸네일·커버 이미지의 정사각 영역 지정 | ✅ ImageCropper |
| 자유 비율(16:9 등) 크롭 | ❌ 미지원 - 결과는 항상 정사각 |
| 크롭 없이 단순 파일 선택 + 미리보기 | ❌ [FileInput](#fileinput) `variant="preview"` 권장 |

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `File \| Blob \| string` | required | 크롭할 이미지. 로컬 `File`/`Blob` 또는 이미지 URL |
| `ref` | `Ref<ImageCropperHandle>` | - | `crop()` / `reset()` 을 호출할 imperative 핸들 (React 19 ref-as-prop) |
| `outputSize` | `number` | `512` | 결과물 한 변 길이 (px) |
| `outputType` | `'auto' \| 'image/jpeg' \| 'image/png' \| 'image/webp'` | `'auto'` | 결과 MIME. `auto` 는 PNG 만 PNG 로, 나머지는 JPEG |
| `quality` | `number` | `0.92` | JPEG/WebP 인코딩 품질 (0~1) |
| `circular` | `boolean` | `false` | 원형 가이드 (아바타용). false 면 둥근 사각형 |
| `viewportSize` | `number` | `240` | 뷰포트 한 변 길이 (px) |
| `minZoom` | `number` | `1` | 최소 배율 (1 = 이미지가 뷰포트를 딱 덮음) |
| `maxZoom` | `number` | `3` | 최대 배율 |
| `onReady` | `(size: CropImageSize) => void` | - | 이미지 로드 완료 콜백 |
| `onError` | `() => void` | - | 이미지 디코딩 실패 콜백 (손상 파일 등) |
| `label` | `string` | `'이미지 위치와 배율 조정'` | 뷰포트 접근성 레이블 |
| `hint` | `string` | `'드래그(또는 방향키)로 위치, 휠·슬라이더로 배율을 맞추세요.'` | 뷰포트 아래 조작 안내 문구 |
| `zoomOutLabel` | `string` | `'축소'` | 축소 버튼 접근성 레이블 |
| `zoomLabel` | `string` | `'배율'` | 배율 슬라이더 접근성 레이블 |
| `zoomInLabel` | `string` | `'확대'` | 확대 버튼 접근성 레이블 |
| `noPanHint` | `string` | `'이미지가 뷰포트를 딱 채워 이동 여유가 없습니다.'` | 이동 여유가 없을 때 SR 안내 문구 |
| `className` | `string` | - | 루트 요소에 추가할 className |

> 루트는 표준 `div` 속성(`id` / `data-*` / `aria-*` / `style` 등)을 그대로 전달받는다. 단 `onError` 는 이미지 디코드 실패 콜백으로 재정의되어 있고, `children` / `dangerouslySetInnerHTML` 은 루트가 항상 자체 자식을 렌더하므로 받지 않는다.

**`ImageCropperHandle` (ref)**

| 메서드 | Type | Description |
|------|------|-------------|
| `crop` | `() => Promise<Blob>` | 현재 보이는 정사각 영역을 잘라 `Blob` 반환. 소비자의 "적용" 버튼에서 호출 |
| `reset` | `() => void` | 배율·위치를 초기 상태(zoom=min, 중앙)로 되돌림 |

**Usage**

```tsx
import { useRef, useState } from "react";
import { ImageCropper, Modal, Button, FileInput } from "@bigtablet/design-system";
import type { ImageCropperHandle } from "@bigtablet/design-system";

function AvatarUploader() {
  const cropperRef = useRef<ImageCropperHandle>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleApply = async () => {
    const blob = await cropperRef.current!.crop();
    const form = new FormData();
    form.append("avatar", blob, "avatar.jpg");
    await fetch("/api/avatar", { method: "POST", body: form });
    setFile(null);
  };

  return (
    <>
      <FileInput
        accept="image/*"
        label="프로필 사진 선택"
        onFiles={(files) => setFile(files?.[0] ?? null)}
      />

      <Modal open={!!file} onClose={() => setFile(null)} title="사진 자르기">
        {file && <ImageCropper ref={cropperRef} src={file} circular outputSize={256} />}
        <Button variant="text" onClick={() => cropperRef.current?.reset()}>초기화</Button>
        <Button onClick={handleApply}>적용</Button>
      </Modal>
    </>
  );
}
```

#### 키보드 / 포인터 조작

| 입력 | 동작 |
|------|------|
| 드래그 (pointer) | 이미지 위치 이동 |
| 방향키 | 8px 단위 위치 이동 |
| <kbd>+</kbd> / <kbd>-</kbd> | 0.1 단위 배율 변경 |
| 마우스 휠 | 연속 배율 변경 |
| 슬라이더 / ＋·－ 버튼 | 배율 변경 |

> ⚠️ 원격 URL 을 넘기면 `canvas.drawImage` 결과가 서버의 CORS(`Access-Control-Allow-Origin`) 설정에 의존한다. 확실하게 자르려면 로컬 `File`/`Blob` 을 넘겨라.

---

### OtpInput

인증 코드(OTP) 입력. 각 자리를 개별 `input` 으로 분리하고 자동 포커스 이동·붙여넣기·SMS 자동완성(`autocomplete="one-time-code"`)을 지원한다.

```tsx
import { OtpInput } from '@bigtablet/design-system';

const [code, setCode] = useState('');

// 기본 (6자리)
<OtpInput value={code} onValueChange={setCode} />

// 4자리 + 자동 포커스
<OtpInput length={4} value={code} onValueChange={setCode} autoFocus />

// 에러 상태 + 도움말
<OtpInput
  value={code}
  onValueChange={setCode}
  error
  supportingText="인증번호가 일치하지 않습니다"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `length` | `4 \| 6` | `6` | OTP 자릿수 |
| `value` | `string` | `''` | 제어형 값 (controlled 전용) |
| `onValueChange` | `(value: string) => void` | - | 값 변경 콜백 (canonical) |
| ~~`onChange`~~ | `(value: string) => void` | - | **deprecated** (v3.3.0, `onValueChange` alias). [MIGRATION.md](./MIGRATION.md) 참고 |
| `error` | `boolean` | `false` | 에러 상태 |
| `disabled` | `boolean` | `false` | 비활성화 |
| `supportingText` | `string` | - | 하단 도움말 텍스트 |
| `autoFocus` | `boolean` | `false` | 첫 번째 입력에 자동 포커스 |
| `ariaLabel` | `string` | `'OTP 입력'` | 그룹 접근성 레이블 |
| `className` | `string` | - | 루트 요소에 추가할 className |

> **제어형 전용**: `value` + `onValueChange` 를 항상 함께 넘겨야 한다 (비제어 모드 없음). 전체 코드를 한 번에 붙여넣거나 SMS 자동완성으로 받으면 각 자리에 자동 분배된다.

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

#### `ToastProvider` props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `closeAriaLabel` | `string` | `'닫기'` | 각 토스트의 X 버튼 `aria-label` |
| `regionLabel` | `string` | `'알림'` | 토스트 리전(`role="region"`)의 접근성 이름. 스크린리더 리전 목록에 뜬다 |

> **다국어(ko/en) 앱은 두 값을 주입하세요.** DS 기본값은 한글입니다 — [MIGRATION.md](./MIGRATION.md#v3130-a11y-문자열-기본값-한글화) 참고.

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
| `ariaLabel` | `string` | `'로딩 중'` | `role="status"` 의 접근성 이름 |

> ℹ️ React 는 12개 bar 가 순차 페이드하는 iOS 스타일이고, `prefers-reduced-motion: reduce` 에서는 애니메이션을 완전히 정지시킨다(멈춰 있어도 12개 spoke 형태가 로딩 위젯으로 읽히기 때문). Vanilla `.bt-spinner` 는 서버 템플릿의 마크업 단순성(빈 요소 하나)을 위해 단일 border ring 이고, 정지 대신 회전을 늦춘다(0.8s → 2.4s). **의도된 차이이며 통일 계획은 없다** - 자세한 근거는 [VANILLA.md#spinner](./VANILLA.md#spinner).

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
| `ariaLabel` | `string` | `'페이지 로딩 중'` | 접근성 라벨 |

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

### Skeleton

콘텐츠가 로드되기 전 자리를 잡아 두는 플레이스홀더. 실제 콘텐츠와 **같은 크기·모양**으로 맞춰야 로드 후 레이아웃이 흔들리지 않는다.

```tsx
import { Skeleton } from '@bigtablet/design-system';

// 텍스트 한 줄
<Skeleton />
<Skeleton width="60%" />

// 제목
<Skeleton variant="title" width={240} />

// 아바타 (width 만 주면 height 자동 동일)
<Skeleton variant="avatar" width={40} />

// 임의 블록
<Skeleton variant="rect" width="100%" height={180} radius="md" />

// 카드 스켈레톤 조합
<Stack gap={12}>
  <Skeleton variant="rect" height={160} radius="md" />
  <Skeleton variant="title" width="70%" />
  <Skeleton width="100%" />
  <Skeleton width="85%" />
</Stack>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'text' \| 'title' \| 'avatar' \| 'rect'` | `'text'` | 스켈레톤 모양 |
| `width` | `number \| string` | - | CSS width (`200` → `200px`, `'100%'`, `'16rem'`). `variant="avatar"` 는 height 미지정 시 width 와 동일하게 적용 |
| `height` | `number \| string` | - | CSS height |
| `radius` | `'sm' \| 'md' \| 'lg' \| 'full' \| string` | - | border-radius 토큰 또는 임의 CSS 값 |

> 루트는 `div` 이고 `aria-hidden="true"` 가 자동으로 붙는다 (스크린리더 노이즈 방지). 로딩 상태 자체를 알려야 하면 부모에 `aria-busy` / `role="status"` 를 직접 걸어라. `children` 은 받지 않으며, 그 외 `div` 속성은 그대로 전달된다.

---

## Navigation

### Pagination

```tsx
import { Pagination } from '@bigtablet/design-system';

const [page, setPage] = useState(1);

<Pagination
  page={page}
  totalPages={20}
  onPageChange={setPage}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `page` | `number` | required | 현재 페이지 |
| `totalPages` | `number` | required | 전체 페이지 수 |
| `onPageChange` | `(page: number) => void` | required | 페이지 변경 핸들러 |
| `prevLabel` | `string` | `'이전 페이지'` | 이전 버튼 `aria-label` |
| `nextLabel` | `string` | `'다음 페이지'` | 다음 버튼 `aria-label` |
| `navLabel` | `string` | `'페이지 이동'` | `<nav>` 랜드마크 이름. 스크린리더 리전 목록에 뜬다 |

---

### Tabs

한 영역에서 서로 배타적인 콘텐츠 패널을 전환하는 네비게이션. **`Tabs` + `TabList` + `Tab` + `TabPanel` compound API**로 구성되며, 키보드 ArrowLeft/Right/Home/End를 자동 지원.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 카테고리 간 전환 (서로 배타적, 한 번에 하나만) | ✅ Tabs |
| 같은 페이지 내 카테고리 필터/토글 그룹 | ✅ Tabs (`pills` variant) |
| 점진적 노출, 여러 섹션 동시 펼침 가능 | ❌ **Accordion** |
| 페이지 간 이동 (URL 자체가 바뀜) | ❌ **NavBar / Sidebar** |
| 단순 boolean 토글 1쌍 | ❌ **Toggle** |

#### variant 선택 가이드

- `variant="line"` (기본) - **하단 underline**. 페이지 내 섹션 전환 (admin 페이지 위계, 제품 상세 등). 가장 흔한 케이스
- `variant="pills"` - **둥근 박스 그룹**. 카테고리 필터, 토글성 그룹화 (전체/활성/보관 등). dim bg 위에 segmented control 형태

#### 제어형 vs 비제어형

```tsx
// 비제어형 - 단순한 페이지 내 탭 전환
<Tabs defaultValue="overview"> ... </Tabs>

// 제어형 - URL 쿼리 동기화, 외부 버튼으로 탭 변경 등
const [tab, setTab] = useState("overview");
<Tabs value={tab} onValueChange={setTab}> ... </Tabs>
```

**Tabs Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | 제어형: 현재 활성 tab의 value |
| `defaultValue` | `string` | `''` | 비제어형: 초기 활성 tab의 value |
| `onValueChange` | `(value: string) => void` | - | value 변경 콜백 |
| `variant` | `'line' \| 'pills'` | `'line'` | 시각 스타일. line=하단 underline, pills=둥근 박스 |
| `size` | `'sm' \| 'md'` | `'md'` | 크기 (sm=32px min-height, md=40px) |

**TabList Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ariaLabel` | `string` | - | 스크린리더 라벨. 페이지에 Tabs가 여러 개면 권장 |

**Tab Props** (`<button>` 속성 모두 상속)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | required | 이 tab의 value (matching TabPanel의 value와 일치) |
| `disabled` | `boolean` | `false` | 비활성화 (포커스 / 키보드 네비게이션 모두 스킵) |

**TabPanel Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | required | 이 panel을 활성화할 tab의 value |
| `unmountInactive` | `boolean` | `true` | 비활성 panel을 unmount. `false`면 `hidden` 속성으로 DOM 유지 (스크롤 위치/입력 보존이 필요할 때) |

#### 접근성 (WAI-ARIA Tabs 패턴)

자동 처리되는 a11y 속성:

- TabList: `role="tablist"`, `aria-label`
- Tab: `role="tab"`, `aria-selected`, `aria-controls={panelId}`, `id={tabId}`
- TabPanel: `role="tabpanel"`, `aria-labelledby={tabId}`, `id={panelId}`, `tabIndex={0}`
- **Roving tabIndex**: 활성 tab만 `tabIndex=0`, 나머지는 `-1`. Tab 키로 진입은 1회만 발생
- **키보드 네비게이션** (활성 tab 위에서):
  - <kbd>←</kbd> / <kbd>→</kbd> - 이전/다음 tab으로 이동 + 활성화 (양 끝에서 wrap)
  - <kbd>Home</kbd> / <kbd>End</kbd> - 처음/마지막 tab으로 이동
  - 비활성(`disabled`) tab은 키보드 순회에서 자동 스킵

#### 애니메이션

- Tab 색상/border: **200ms** `color`, `background`, `border-color` (`transition_base`)
- TabPanel: 전환 자체엔 애니메이션 없음 (활성 panel만 즉시 렌더)

#### DOM 구조 (SCSS override 시 참고)

```
.tabs (+ tabs_variant_line | tabs_variant_pills, tabs_size_sm | tabs_size_md)
├── .tabs_list (+ tabs_list_line | tabs_list_pills)
│   └── button.tabs_tab (+ tabs_tab_active)
└── .tabs_panel
```

**Usage**

```tsx
import { Tabs, TabList, Tab, TabPanel } from "@bigtablet/design-system";

// line variant - 제품 상세 페이지의 섹션 전환 (가장 흔한 케이스)
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

// pills variant - 리스트 필터
const [filter, setFilter] = useState("all");
<Tabs value={filter} onValueChange={setFilter} variant="pills" size="sm">
  <TabList ariaLabel="주문 필터">
    <Tab value="all">전체</Tab>
    <Tab value="active">활성</Tab>
    <Tab value="archived">보관</Tab>
  </TabList>
  <TabPanel value="all"><OrderList filter="all" /></TabPanel>
  <TabPanel value="active"><OrderList filter="active" /></TabPanel>
  <TabPanel value="archived"><OrderList filter="archived" /></TabPanel>
</Tabs>

// unmountInactive=false - 무거운 패널에서 state/스크롤 보존
<Tabs defaultValue="editor">
  <TabList>
    <Tab value="editor">에디터</Tab>
    <Tab value="preview">미리보기</Tab>
  </TabList>
  <TabPanel value="editor" unmountInactive={false}><HeavyEditor /></TabPanel>
  <TabPanel value="preview" unmountInactive={false}><Preview /></TabPanel>
</Tabs>
```

---

### Sidebar

Admin/dashboard 좌측 메인 네비게이션. **navy 배경 + 흰 텍스트** 고정. `SidebarItem` 자식과 함께 사용하며, 선택적으로 `SidebarSection`으로 그룹화. `collapsed` 모드로 아이콘만 표시되는 축소 상태 지원.

#### CSS 변수 (layout 계산용)

```css
--bt-sidebar-height        /* 56px */
--bt-sidebar-safe-area     /* env(safe-area-inset-bottom) */
--bt-sidebar-total-height  /* 합산 */
```

> **뷰포트 폭 <600px 에서만 정의됩니다.** `@media (max-width: 599px)` 안의 `:root` 선언이라 **Sidebar 를 렌더하지 않는 페이지나 `mode="static"` Sidebar 에서도 값이 존재**하고, 반대로 데스크탑 폭에서는 Sidebar 가 떠 있어도 정의되지 않습니다. `var(--bt-sidebar-total-height, 0px)` 처럼 폴백을 두세요. 전체 계약은 [THEMING.md](./THEMING.md#레이아웃런타임-계약-변수) 참고.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| Admin/dashboard 좌측 영구 네비게이션 | ✅ Sidebar |
| 마케팅/B2C 페이지의 상단 헤더 | ❌ **NavBar** |
| 페이지 위계 표시 (홈 > 블로그 > 글) | ❌ **Breadcrumb** |
| 페이지 내 섹션 전환 | ❌ **Tabs** |
| 임시 사이드 패널 (열고 닫는 drawer) | ❌ **Modal** (drawer variant) |

#### Sidebar vs NavBar 비교

| | Sidebar | NavBar |
|---|---------|--------|
| **사용처** | Admin/dashboard 내부 | B2C/마케팅 페이지 |
| **위치** | 좌측 (세로) | 상단 (가로) |
| **배경** | navy 고정 | default(흰) / transparent / accent(navy) |
| **collapsed** | 지원 (아이콘만) | 미지원 |
| **링크 형태** | icon + label + trailing | label만 (active 강조) |

#### collapsed 동작

- `collapsed={true}`: 너비가 `width`(기본 240) → `collapsedWidth`(기본 64)로 축소
- label, trailing, section label은 `opacity: 0 + width: 0`으로 숨김 (DOM 유지)
- 아이콘만 가운데 정렬로 표시
- 너비 변화엔 200ms `transition_base` 애니메이션

**Sidebar Props** (`<aside>` 속성 모두 상속)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `header` | `ReactNode` | - | 상단 brand/로고 영역 (border-bottom 자동) |
| `footer` | `ReactNode` | - | 하단 영역 (border-top 자동) - 사용자 프로필/설정/로그아웃 |
| `collapsed` | `boolean` | `false` | 축소 모드. 너비가 줄고 label 숨김 |
| `width` | `number` | `240` | 펼쳤을 때 너비 (px) |
| `collapsedWidth` | `number` | `64` | 접혔을 때 너비 (px) |
| `mode` | `'auto' \| 'static'` | `'auto'` | 반응형 모드 (v3.1). `auto` = `< 600px` 에서 하단 bar 로 변신 / `static` = 항상 좌측 rail |

**SidebarItem Props** (`<button>` 속성 모두 상속)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `ReactNode` | - | 왼쪽 아이콘 (collapsed 모드의 유일한 시각 단서) |
| `active` | `boolean` | `false` | 현재 활성 상태 (`aria-current="page"` 자동) |
| `trailing` | `ReactNode` | - | 오른쪽 trailing - Badge, count, 화살표 등 |
| `as` | `'button' \| 'a'` | `'button'` | 렌더 태그. SPA 라우팅이면 `'a'` + `href` |
| `href` | `string` | - | `as="a"`일 때 링크 URL |

**SidebarSection Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | 섹션 라벨 (uppercase 표시, collapsed에선 자동 숨김) |

#### 접근성

- `<aside>` 시멘틱 + 내부 `<nav>` 자동
- SidebarItem `active={true}` → `aria-current="page"` 자동
- icon은 `aria-hidden="true"` (label이 정보 전달자)
- focus ring: `0 0 0 2px rgba(255,255,255,0.4)` (navy bg에 맞춰 흰색)
- collapsed 모드에서도 label은 DOM 유지 (스크린리더 접근 가능, 시각만 숨김)

#### 애니메이션

- Sidebar 너비: **200ms `width`** transition (`transition_base`)
- Item hover/active 배경: **100ms** (`transition_fast`)
- label opacity: 100ms - collapsed 토글 시 텍스트 자연스럽게 페이드

#### DOM 구조 (SCSS override 시 참고)

```
aside.sidebar (+ sidebar_collapsed)
├── .sidebar_header           ← border-bottom
├── nav.sidebar_nav
│   ├── .sidebar_section
│   │   ├── .sidebar_section_label  ← uppercase, sr 노출 유지
│   │   └── button|a.sidebar_item (+ sidebar_item_active)
│   │       ├── .sidebar_item_icon
│   │       ├── .sidebar_item_label
│   │       └── .sidebar_item_trailing
│   └── ...
└── .sidebar_footer           ← border-top
```

**Usage**

```tsx
import { Sidebar, SidebarItem, SidebarSection, Badge } from "@bigtablet/design-system";
import { Home, Users, Settings, LogOut } from "lucide-react";

// 기본 - header / footer / 섹션 그룹화
<Sidebar
  header={<Logo />}
  footer={<SidebarItem icon={<LogOut />}>로그아웃</SidebarItem>}
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

// collapsed 토글 (외부 state로 제어)
const [collapsed, setCollapsed] = useState(false);
<Sidebar collapsed={collapsed} header={<Logo />}>
  <SidebarItem icon={<Home />} onClick={() => setCollapsed(c => !c)}>홈</SidebarItem>
</Sidebar>

// Next.js Link와 통합 - as="a" + href 사용
<SidebarItem icon={<Home />} as="a" href="/dashboard">대시보드</SidebarItem>
```

> **v3.1 추가**: `mode` prop - `"auto"` (기본) 시 viewport `< 600px` 에서 자동으로 하단 bar 형태로 변신 (CSS-only, SSR 안전). `"static"` 으로 끄기 (admin 등 desktop-only). 모바일 우선 앱이라면 별도 [BottomNav](#bottomnav) 컴포넌트를 직접 쓰는 것도 고려.

---

### BottomNav

모바일 하단 네비게이션 바. `position: fixed; bottom: 0` 하단 고정 + iOS safe-area 대응. 2-5개 `BottomNavItem`으로 구성. mobile-first PWA의 메인 nav 패턴.

#### Sidebar vs BottomNav

| | Sidebar | BottomNav |
|---|---------|-----------|
| 위치 | 좌측 rail | 하단 fixed bar |
| 항목 수 | 다수 + 섹션 그룹 | 2-5개 (flat) |
| 적합 | admin/dashboard (계층적) | owner/support (mobile-first, flat) |
| 반응형 | `mode="auto"` 시 모바일에서 하단 변신 | 항상 하단 (소비처가 viewport 제어) |

> 데스크탑 Sidebar + 모바일 BottomNav 를 한 앱에서 동시에 쓰려면, 각각 CSS media query 로 노출 제어. Sidebar `mode="auto"` 하나로 해결되면 그게 더 간단.

#### 구성

- `<BottomNav>` - `<nav>` 컨테이너 (암묵적 navigation 랜드마크) + `aria-label`. 2-5 `BottomNavItem` 자식.
- `<BottomNavItem>` - icon + label 수직 스택. `active` 시 `aria-current="page"` 자동.
- `<BottomNavSpacer>` - 본문 끝에 두면 fixed bar 가 콘텐츠를 가리지 않게 공간 확보.

#### CSS 변수 (layout 계산용)

```css
--bt-bottom-nav-height        /* 56px */
--bt-bottom-nav-safe-area     /* env(safe-area-inset-bottom) */
--bt-bottom-nav-total-height  /* 합산 - BottomNavSpacer 가 자동 사용 */
--bt-bottom-nav-inset         /* DS 몫 - BottomNav 가 DOM 에 있을 때만 total-height */
--bt-bottom-inset-app         /* 앱 몫 - 앱이 소유한 하단 크롬 높이 (앱이 쓴다) */
--bt-bottom-inset             /* 위 두 몫의 합. 읽기 전용으로 쓴다 */
```

> **하단 고정 요소를 둔다면 `--bt-bottom-inset` 을 쓰세요.** `--bt-bottom-nav-height` · `-safe-area` · `-total-height` 세 변수는 BottomNav 를 쓰지 않는 화면에서도 항상 정의됩니다(`:root` + 단일 CSS 번들). 그대로 더하면 BottomNav 가 없는 페이지에서도 56px 밀립니다. `--bt-bottom-inset` 은 **실제로 가려진 만큼만** 값을 갖습니다 — BottomNav 가 DOM 에 있거나, 앱이 `--bt-bottom-inset-app` 을 설정했거나, 둘 다일 때입니다.
>
> ```css
> .my_floating_bar { bottom: calc(16px + var(--bt-bottom-inset)); }
> ```
>
> **앱이 소유한 하단 크롬(플로팅 바 등)은 `--bt-bottom-inset-app` 에 쓰세요.** `--bt-bottom-inset` 을 직접 쓰면 DS 규칙과 특이도가 같아 로드 순서 싸움이 되고, 둘이 동시에 있을 때 합성되지 않습니다. 자세한 내용은 [THEMING.md](./THEMING.md#앱이-소유한-하단-크롬은---bt-bottom-inset-app-에-씁니다).
>
> ```scss
> body:has(.floating_bar) { --bt-bottom-inset-app: 96px; }
> ```
>
> `Toast` 는 모바일에서 이 값을 이미 반영합니다 - 앱이 `.toast_container` 를 보정하던 CSS 는 지우면 됩니다.

**Props - BottomNav**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ariaLabel` | `string` | `"주요 메뉴"` | `<nav>` 스크린 리더 레이블 |
| `children` | `ReactNode` | - | 2-5 `BottomNavItem` |
| `...rest` | `HTMLAttributes<HTMLElement>` | - | |

**Props - BottomNavItem**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `ReactNode` | - | 아이콘 (필수) |
| `label` | `string` | - | 라벨 (필수, 짧게 2-4자) |
| `active` | `boolean` | `false` | 활성 상태 (`aria-current="page"` 자동) |
| `badge` | `ReactNode` | - | 아이콘 우상단 dot/카운트 (`Badge` 등) |
| `disabled` | `boolean` | `false` | 비활성 (anchor 는 `aria-disabled`+`tabIndex=-1`) |
| `as` | `'button' \| 'a'` | `'button'` | 렌더 요소 |
| `href` | `string` | - | `as="a"` 일 때 |

#### 접근성

- `<nav>` + `aria-label`, active item `aria-current="page"` 자동
- 탭 영역 최소 56px (WCAG)
- `disabled` anchor 는 `aria-disabled="true"` + `tabIndex={-1}` + 클릭 차단 (`<a disabled>` 무효 HTML 회피)

**Usage**

```tsx
import { BottomNav, BottomNavItem, BottomNavSpacer, Badge } from "@bigtablet/design-system";
import { Home, UtensilsCrossed, BarChart3 } from "lucide-react";

function App() {
  const [tab, setTab] = useState("orders");
  return (
    <>
      <main>{/* 페이지 콘텐츠 */}</main>
      <BottomNavSpacer />
      <BottomNav>
        <BottomNavItem icon={<Home />} label="주문" active={tab === "orders"} onClick={() => setTab("orders")} />
        <BottomNavItem icon={<UtensilsCrossed />} label="메뉴" active={tab === "menu"} onClick={() => setTab("menu")}
          badge={<Badge variant="error" shape="dot" size="sm" />} />
        <BottomNavItem icon={<BarChart3 />} label="매출" active={tab === "sales"} onClick={() => setTab("sales")} />
      </BottomNav>
    </>
  );
}

// 라우팅 (Next.js Link)
<BottomNavItem as="a" href="/orders" icon={<Home />} label="주문" active />
```

---

### NavBar

페이지 상단 네비게이션 바. 마케팅/B2C 페이지의 메인 헤더. `NavLink`를 자식으로 사용하며, `brand` / `actions`로 좌우 영역 분리. 3가지 visual variant로 흰 배경 / 투명(hero 위) / navy 배경을 지원.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| B2C/마케팅 페이지의 글로벌 상단 헤더 | ✅ NavBar |
| Admin/dashboard 좌측 네비게이션 | ❌ **Sidebar** |
| 페이지 위계 (현재 위치 표시) | ❌ **Breadcrumb** |
| 컨텐츠 내부의 카테고리 전환 | ❌ **Tabs** |

#### variant 선택 가이드

- `variant="default"` (기본) - **흰 bg + 하단 회색 border**. 가장 일반적인 헤더
- `variant="transparent"` - **투명 bg**. Hero 이미지/그라데이션 위에 올릴 때. 부모가 배경을 정의
- `variant="accent"` - **navy bg + 흰 텍스트**. 강한 brand 톤이 필요한 랜딩, 다크 컨텍스트

#### sticky 동작

- `sticky={true}`: `position: sticky; top: 0` + `z-index: $z_level3`
- 스크롤 시 항상 상단 고정. transparent variant와 함께 쓸 때는 스크롤하면서 배경 색을 바꾸는 패턴이 흔함 (외부에서 조건부 variant 전환)

**NavBar Props** (`<header>` 속성 모두 상속)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `brand` | `ReactNode` | - | 왼쪽 brand/로고 영역 |
| `actions` | `ReactNode` | - | 오른쪽 액션 영역 (Button, Avatar, 언어 셀렉터 등) |
| `variant` | `'default' \| 'transparent' \| 'accent'` | `'default'` | 흰 bg / 투명 / navy bg |
| `sticky` | `boolean` | `false` | 스크롤 시 상단 고정 |

**NavLink Props** (`<a>` 속성 모두 상속)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `active` | `boolean` | `false` | 현재 활성 페이지 (`aria-current="page"` 자동) |
| `href` | `string` | - | 링크 URL |

#### 접근성

- `<header>` 시멘틱 + 내부 `<nav>` (links 영역) 자동
- NavLink `active={true}` → `aria-current="page"` 자동
- 모든 link/button에 `:focus-visible` 시 `focus_ring` 표시
- 모바일/compact breakpoint에서 padding과 gap 자동 축소

#### 애니메이션

- Link hover 배경: **100ms `background`, `color`** (`transition_fast`)
- 활성 표시: variant에 따라 색상/font-weight 변화 (transition 없음, 즉시)

#### 반응형

- 최대 너비 1200px의 inner container, 중앙 정렬
- desktop padding: `12px 24px`, min-height 60px
- compact (≤768px): padding `8px 16px`, link gap 축소

#### DOM 구조 (SCSS override 시 참고)

```
header.nav_bar (+ nav_bar_variant_default | _transparent | _accent, nav_bar_sticky)
└── .nav_bar_inner               ← max-width 1200px, center
    ├── .nav_bar_brand
    ├── nav.nav_bar_links
    │   └── a.nav_bar_link (+ nav_bar_link_active)
    └── .nav_bar_actions
```

**Usage**

```tsx
import { NavBar, NavLink, Button } from "@bigtablet/design-system";

// default - 일반 마케팅 헤더
<NavBar
  brand={<Logo />}
  actions={<Button variant="filled">로그인</Button>}
  sticky
>
  <NavLink href="/about">소개</NavLink>
  <NavLink href="/blog" active>블로그</NavLink>
  <NavLink href="/contact">문의</NavLink>
</NavBar>

// transparent - Hero 이미지 위에 올린 투명 헤더
<div style={{ background: "url(/hero.jpg)" }}>
  <NavBar variant="transparent" brand={<Logo invert />}>
    <NavLink href="/about">소개</NavLink>
  </NavBar>
  <HeroContent />
</div>

// accent - 강한 brand 톤
<NavBar variant="accent" brand={<Logo invert />}>
  <NavLink href="/about">소개</NavLink>
  <NavLink href="/features" active>기능</NavLink>
</NavBar>
```

---

### Breadcrumb

페이지 위계 네비게이션. 사용자에게 **현재 위치 + 상위로 돌아갈 경로**를 보여줌. 마지막 아이템은 현재 페이지로 자동 처리 (`aria-current="page"` + 비링크 텍스트).

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 깊은 위계(3단 이상)의 페이지에서 현재 위치 표시 | ✅ Breadcrumb |
| 글로벌 페이지 네비게이션 | ❌ **NavBar / Sidebar** |
| 같은 페이지 내 섹션 전환 | ❌ **Tabs** |
| 순서가 있는 step indicator (체크아웃 등) | ❌ Stepper (별도 컴포넌트) |
| 평탄한 페이지 구조 (위계 1단) | ❌ 사용 안 함 |

#### items 동작

- 배열의 **마지막 항목은 항상 현재 페이지**로 간주 - `<span aria-current="page">`로 렌더, 링크/버튼 아님
- 그 외 항목:
  - `href`가 있으면 → `<a>`로 렌더 (페이지 이동)
  - `href` 없이 `onClick`만 있으면 → `<button>`로 렌더 (SPA 라우터 등)
  - 둘 다 없으면 → `<button>` (no-op)

**Breadcrumb Props** (`<nav>` 속성 모두 상속)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `BreadcrumbItem[]` | required | 경로 아이템 배열. 마지막은 현재 페이지로 자동 처리 |
| `separator` | `ReactNode` | `<ChevronRight size={14} />` | 아이템 사이 구분자. `/`, `>`, 커스텀 아이콘 등 가능 |
| `navLabel` | `string` | `'현재 위치'` | `<nav>` 랜드마크 이름. 스크린리더 리전 목록에 뜬다 |

**BreadcrumbItem**

| 필드 | Type | Description |
|------|------|-------------|
| `label` | `ReactNode` | 표시 텍스트 (또는 아이콘+텍스트) |
| `href` | `string` | 클릭 시 이동할 URL. 있으면 `<a>` 렌더 |
| `onClick` | `(e) => void` | 클릭 콜백. `href` 없이 사용하면 `<button>` 렌더 (SPA 라우터 호출 등) |

#### 접근성

- 컨테이너: `<nav aria-label="Breadcrumb">`
- 리스트: `<ol>` (순서가 의미를 가짐) - 스크린리더가 위계로 인식
- 마지막 아이템: `<span aria-current="page">` - "현재 페이지"임을 announce
- 구분자: `<span aria-hidden="true">` - 스크린리더에서는 무시
- 링크/버튼: 모두 native 시멘틱 (`<a href>`, `<button>`)

#### 애니메이션

- Link hover color: **100ms `color`** (`transition_fast`) - body → accent 색상
- 그 외 transition 없음 (정적 네비게이션)

#### DOM 구조 (SCSS override 시 참고)

```
nav.breadcrumb (+ aria-label="Breadcrumb")
└── ol.breadcrumb_list
    └── li.breadcrumb_item
        ├── a.breadcrumb_link            ← items[idx].href 있을 때
        ├── button.breadcrumb_link       ← onClick만 있을 때
        ├── span.breadcrumb_current      ← 마지막 아이템 (aria-current)
        └── span.breadcrumb_separator    ← aria-hidden
```

**Usage**

```tsx
import { Breadcrumb } from "@bigtablet/design-system";

// 기본 - href로 페이지 이동
<Breadcrumb items={[
  { label: "홈", href: "/" },
  { label: "블로그", href: "/blog" },
  { label: "디자인 시스템 v3.0" },   // 마지막 = 현재 페이지
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

// SPA 라우터 (Next.js Router 등) - onClick 사용
import { useRouter } from "next/navigation";
const router = useRouter();
<Breadcrumb items={[
  { label: "홈", onClick: () => router.push("/") },
  { label: "설정", onClick: () => router.push("/settings") },
  { label: "프로필" },
]} />
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
| `onExited` | `() => void` | - | 퇴출 애니메이션이 끝나 패널이 언마운트된 뒤 호출 |
| `description` | `ReactNode` | - | 제목 아래 설명 |
| `footer` | `ReactNode` | - | 하단 액션 영역. 미지정 시 영역 자체가 없음 |
| `footerAlign` | `'end' \| 'between' \| 'start'` | `'end'` | footer 정렬. `between` 은 좌우 분리(destructive 패턴) |
| `width` | `number \| string` | `480` | 모달 너비 |
| `closeOnOverlay` | `boolean` | `true` | 오버레이 클릭 시 닫기 |
| `dismissible` | `boolean` | - | Escape + 오버레이를 한 축으로. 주면 `closeOnOverlay` 를 이긴다 |
| `showCloseIcon` | `boolean` | `true` | 우상단 X 버튼 표시 |
| `closeLabel` | `string` | `'닫기'` | X 버튼 `aria-label` |
| `ariaLabel` | `string` | - | `title` 이 없을 때의 접근성 이름 |

#### 접근성 이름은 필수다

`title` 이나 `ariaLabel` 중 **하나는 반드시** 줘야 한다. 폴백이 없으므로 둘 다 비우면 이름 없는 대화상자가 되고, axe 의 `aria-dialog-name`(serious)이 잡는다.

> 이전에는 이름이 없으면 영어 `"Dialog"` 로 조용히 채워졌다. 한국어 제품의 유일한 영어 문자열이었고, 이름을 빼먹은 사실을 감추기만 했다.

#### 스크롤 — 내용이 길 때

패널은 뷰포트 높이(`100dvh` - 여백)를 넘지 않고, **제목·푸터는 고정된 채 `children` 영역만 스크롤**된다. 앱이 따로 `max-height` 를 줄 필요가 없다. 스크롤 영역은 `tabIndex={0}` 을 받아 키보드로도 스크롤된다.

#### 오버레이 클릭 — 폼 모달에서는 끌 것

`closeOnOverlay` 기본값은 `true` 다. 읽기 전용 상세 모달에는 맞지만, **입력 요소를 담은 모달에서는 바깥 클릭 한 번에 작성 중인 내용이 사라진다.** 폼·확인창에는 명시적으로 끈다.

```tsx
<Modal open={open} onClose={close} closeOnOverlay={false} title="변경사항 저장">
```

패널 안에서 드래그를 시작해 오버레이에서 놓는 경우(텍스트 선택 등)는 **닫히지 않는다** — 누른 곳과 놓은 곳이 모두 오버레이여야 닫는다.

사용자 입장에서 Escape 와 오버레이 클릭은 같은 "실수로 닫기" 축이다. 따로 다루면 한쪽만 막는 실수가 나온다 — `closeOnOverlay={false}` 만 주면 Escape 로는 여전히 닫힌다. 둘을 함께 막으려면 `dismissible` 을 쓴다.

```tsx
// 오버레이만 막는다 - Escape 로는 닫힌다
<Modal open={open} onClose={close} closeOnOverlay={false} />

// 두 경로 모두 막는다 - X 버튼과 명시적 액션으로만 닫힌다
<Modal open={open} onClose={close} dismissible={false} />
```

`dismissible` 을 주면 `closeOnOverlay` 를 이긴다. 안 주면 기존 동작 그대로다.

`dismissible={false}` 여도 Escape 스택에는 **등록된다.** 최상단 자리를 차지해 Escape 를 소비하므로, 아래에 열려 있는 다른 오버레이가 대신 닫히지 않는다 — 사용자가 보고 있지 않은 것이 닫히는 게 더 나쁜 결과다.

#### 마운트 수명 — `children` 을 `open` 과 같은 값에 묶지 말 것

패널은 퇴출 스프링이 끝날 때까지 마운트를 유지한다(그래야 페이드아웃이 보인다). **DS 가 닫히는 순간의 `children` 을 붙잡으므로**, 부모가 같은 tick 에 데이터를 비워도 본문이 먼저 사라지지 않는다.

```tsx
// ✅ 이대로 써도 된다 - 퇴출 동안 마지막 본문이 그대로 보인다
<Modal open={!!item} onClose={close} title="상세">
  {item && <Body item={item} />}
</Modal>
```

앱이 마지막 값을 붙잡는 shim(`useState` + `useEffect`)을 두고 있었다면 지울 수 있다.

붙잡는 대상은 `children` 뿐이 아니다 — `title` · `description` · `footer` 도 함께 얼린다. `footer` 는 선택된 항목에 종속된 액션(삭제 등)을 담는 일이 흔해서, 본문만 얼리면 footer 만 먼저 사라져 같은 버그가 그쪽에서 재현된다. (`Drawer` 는 `title` · `footer`.)

다시 열리면 **새** 값이 즉시 이긴다. 붙잡는 값은 열려 있는 동안 계속 갱신되므로, 닫을 때 보이는 것은 처음 열었을 때가 아니라 **닫히는 순간**의 내용이다.

데이터 자체를 정리할 시점이 필요하면 `onExited` 를 쓴다 — 화면 때문이 아니라 메모리·구독 정리 목적이다.

```tsx
<Modal open={open} onClose={() => setOpen(false)} onExited={() => setItem(null)} title="상세">
  {item && <Body item={item} />}
</Modal>
```

`Drawer` 도 같은 수명·freeze 동작을 갖고 `onExited` · `dismissible` 을 제공한다.

#### 포털 — `document.body` 로 렌더된다

Modal 은 `createPortal(…, document.body)` 로 렌더한다. **앱이 다시 감쌀 필요가 없다.** 이 DS 는 `transform` 을 광범위하게 쓰는데(`useSpringHover` 등), `transform` 조상 아래에서는 `position: fixed` 의 containing block 이 뷰포트가 아니게 되어 오버레이가 깨진다. 그걸 피하려고 컴포넌트가 스스로 포털한다.

```tsx
// ❌ 이중 포털 - 사이드바의 스태킹 컨텍스트를 벗어나려고 감쌀 필요가 없다
createPortal(<Modal open={open}>…</Modal>, document.body)

// ✅ 그대로 쓴다
<Modal open={open}>…</Modal>
```

`Drawer` · `Popover` · `Tooltip` · `Alert` · `Toast` 도 같은 계약이다.

---

### Drawer

화면 가장자리(left/right/bottom)에서 미끄러져 들어오는 패널. 필터, 상세 보기, 모바일 내비게이션, 하단 시트에 적합. Modal 과 동일하게 포커스 트랩 + Esc 닫기 + 배경 스크롤 잠금을 자동 처리한다.

```tsx
import { Drawer } from '@bigtablet/design-system';

const [isOpen, setIsOpen] = useState(false);

<button onClick={() => setIsOpen(true)}>드로어 열기</button>

<Drawer
  open={isOpen}
  onClose={() => setIsOpen(false)}
  placement="right"
  size={360}
  title="설정"
  footer={<button onClick={() => setIsOpen(false)}>저장</button>}
>
  <p>드로어 내용입니다.</p>
</Drawer>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | required | 열림 상태 |
| `onClose` | `() => void` | - | 닫기 핸들러 |
| `placement` | `'left' \| 'right' \| 'bottom'` | `'right'` | 슬라이드 방향 |
| `size` | `number \| string` | `360` | 패널 크기 - left/right 는 너비, bottom 은 높이 (number ⇒ px) |
| `title` | `ReactNode` | - | 헤더 제목 (있으면 `aria-labelledby` 자동 연결) |
| `onExited` | `() => void` | - | 퇴출 애니메이션이 끝나 패널이 언마운트된 뒤 호출 |
| `footer` | `ReactNode` | - | 하단 액션 영역. 미지정 시 footer 영역 미표시 |
| `closeOnOverlay` | `boolean` | `true` | 오버레이 클릭 시 닫기 |
| `dismissible` | `boolean` | - | Escape + 오버레이를 한 축으로. 주면 `closeOnOverlay` 를 이긴다 |
| `showCloseIcon` | `boolean` | `true` | 우상단 X 닫기 아이콘 표시 |
| `closeLabel` | `string` | `'닫기'` | X 닫기 버튼 접근성 레이블 |
| `ariaLabel` | `string` | - | `title` 이 없을 때의 접근성 이름 |

> 방향별 슬라이드 진입/퇴출은 `react-spring` 으로 처리하며 `prefers-reduced-motion: reduce` 시 즉시 표시된다. `placement="top"` 과 배경 상호작용(non-modal) 변형은 현재 범위 밖.

**계약은 Modal 과 같다** — 아래 네 가지는 [Modal](#modal) 절의 설명과 동일하게 적용된다.

#### 접근성 이름은 필수다

`title` 이나 `ariaLabel` 중 **하나는 반드시** 줘야 한다. 폴백이 없으므로 둘 다 비우면 이름 없는 대화상자가 되고, axe 의 `aria-dialog-name`(serious)이 잡는다.

> 이전에는 이름이 없으면 영어 `"Dialog"` 로 조용히 채워졌다. Modal 과 같은 이유로 제거했다.

#### 스크롤 — 내용이 길 때

제목·푸터는 고정된 채 `children` 영역만 스크롤된다. 스크롤 영역은 `tabIndex={0}` 을 받아 키보드로도 스크롤되고, 초기 포커스는 그 wrapper 가 아니라 안쪽 첫 컨트롤로 간다.

#### 오버레이 클릭 — 폼 드로어에서는 끌 것

`closeOnOverlay` 기본값은 `true` 다. **입력 요소를 담은 드로어에서는 바깥 클릭 한 번에 작성 중인 내용이 사라진다** — 폼에는 명시적으로 끈다. 패널 안에서 드래그를 시작해 오버레이에서 놓는 경우(텍스트 선택 등)는 닫히지 않는다.

#### 마운트 수명

패널은 퇴출 스프링이 끝날 때까지 마운트를 유지한다. `children` 을 `open` 과 같은 값에 묶으면 본문만 먼저 사라지므로, 데이터는 `onExited` 에서 비운다.

#### 포털

`document.body` 로 포털된다. 앱이 다시 감쌀 필요가 없다.

---

### Tooltip

hover/focus 시 보조 설명을 띄우는 비차단 오버레이. **아이콘 버튼 라벨, 단축키 안내, 잘린 텍스트 전체 보기**에 적합.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 아이콘 버튼의 의미를 짧게 설명 (Save / Delete 등) | ✅ Tooltip |
| 잘린(ellipsis) 텍스트의 전체 내용 노출 | ✅ Tooltip |
| 단축키 안내 (`Cmd+S`) | ✅ Tooltip |
| 클릭/포커스가 필요한 상호작용 요소 (링크, 버튼) 포함 | ❌ Popover 권장 - tooltip은 포커스를 받지 않는 보조 설명 |
| 폼 필드 도움말 (상시 표시) | ❌ helper text 권장 |
| 모바일 주 트리거 | ⚠️ hover가 없으므로 focus/long-press 시나리오 검토 |

**Tooltip vs Popover**
- **Tooltip**: hover/focus로 뜨는 **짧은 텍스트**. `role="tooltip"`, 포커스를 옮기지 않음. 포인터를 툴팁 위로 올려 읽을 수 있고 <kbd>Esc</kbd>로 닫힌다 (WCAG 1.4.13).
- **Popover**: 클릭으로 열고 외부 클릭/Esc로 닫음. `role="dialog"`, 열릴 때 포커스가 패널로 이동. 상호작용 가능한 콘텐츠 (버튼/링크/입력) 포함 가능.

#### 선택 가이드

**placement (4방향)**
- `"top"` (기본) - 가장 자연스러운 배치. 트리거 위 공간이 충분할 때.
- `"bottom"` - 트리거가 화면 상단에 가깝거나, 위에 다른 패널이 있을 때.
- `"left"` / `"right"` - 가로 리스트(아이콘 툴바)에서 항목별 라벨, 또는 위/아래 공간이 부족할 때.

> ℹ️ `placement`는 **선호값**이다. 뷰포트를 벗어나면 반대편으로 **flip**, 교차축으로 **shift**, 그래도 넘치면 `max-width` 축소가 자동 적용되고 `body`로 포탈된다(Radix `side` + `collisionPadding` 계약). 경계 근처라도 직접 조정할 필요가 없다.

**delay 가이드**
- 200ms (기본) - 마우스가 잠깐 머무를 때만 노출, 빠른 휙휙 이동에는 안 뜸
- 0~100ms - 즉시 노출이 필요한 키오스크/접근성 케이스
- 500ms+ - 자주 hover되는 영역 (테이블 row 등)에서 시각 노이즈 줄이기

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `ReactNode` | required | 툴팁 콘텐츠 (짧은 텍스트 권장, 최대폭 240px에서 줄바꿈) |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | 트리거 기준 위치 |
| `delay` | `number` | `200` | hover/focus 후 표시 지연 (ms) |
| `disabled` | `boolean` | `false` | 비활성화 - children만 그대로 렌더, 툴팁/이벤트 핸들러 모두 미장착 |
| `children` | `ReactElement` | required | trigger 요소 (단일 ReactElement) |

> ⚠️ `children`은 **반드시 단일 ReactElement**여야 한다 (`React.cloneElement`로 핸들러 주입). Fragment, 문자열, 배열은 동작하지 않음. trigger가 `<button disabled>`라도 wrapper span에 hover가 잡혀 정상 동작.

#### 접근성 (WAI-ARIA Tooltip pattern)

자동 처리되는 a11y 속성:

- 툴팁 노드: `role="tooltip"`, `id={useId()}`
- 트리거: 열렸을 때 `aria-describedby={tooltipId}` 자동 주입 → 스크린리더가 보조 설명으로 읽음
- **키보드**: <kbd>Tab</kbd>으로 트리거 포커스 → 자동 노출, <kbd>Tab</kbd>으로 벗어나면 닫힘, <kbd>Esc</kbd>로 즉시 닫힘
- focus / blur 모두 핸들링 - 키보드 전용 사용자도 동일하게 접근 가능
- **WCAG 1.4.13 Hoverable**: 툴팁에 `pointer-events` 가 살아 있어 포인터를 툴팁 위로 옮겨도 닫히지 않는다 (`onMouseEnter` 로 지연 닫힘 취소). 다만 툴팁 안에 포커스 가능한 요소를 넣는 것은 여전히 금지 - `role="tooltip"` 은 포커스를 받지 않는다.
- **WCAG 1.4.13 Dismissable**: 공유 오버레이 스택(`useOverlayEscape`)에 등록되어 최상단일 때만 <kbd>Esc</kbd>를 소비한다. 다른 오버레이나 소비자 앱의 Escape 핸들러를 삼키지 않는다.

> 📌 트리거 자체에도 라벨이 필요하다. IconButton에는 `aria-label`을 따로 줘야 SR-only 환경에서도 의미가 전달된다 (tooltip은 보조이므로 시각 비의존 라벨이 우선).

#### 애니메이션

`useSpringPresence` 훅 + react-spring:

- **진입**: opacity `0→1` + transform `translate(4px) → 0` (placement 별로 진입 방향 다름)
  - top → 아래에서 위로, bottom → 위에서 아래로, left → 오른쪽에서 왼쪽으로, right → 그 반대
- **퇴출**: `clamp: true`로 진동 없이 빠르게 사라짐 (비대칭)
- spring config: `tension: 280, friction: 28` (Vercel/Linear 톤)

#### 닫힘 처리

| 트리거 | 동작 |
|------|------|
| blur (트리거가 focus 잃음) | **즉시** 닫힘 |
| <kbd>Esc</kbd> | **즉시** 닫힘 (`useOverlayEscape` - 스택 최상단일 때만) |
| mouseleave (트리거 또는 툴팁) | **120ms 지연** 후 닫힘 (`HIDE_DELAY`) - 포인터가 트리거↔툴팁 사이 6px 갭을 건널 시간 |
| 툴팁 위로 mouseenter | 지연 닫힘 **취소** (열림 유지) |

- 외부 클릭으로 닫는 로직은 없다 (hover/focus 기반이라 불필요).
- unmount 시 timer cleanup 자동 처리.

#### DOM 구조 (SCSS override 시 참고)

```text
span.tooltip_wrapper           ← position: relative; display: inline-block
└── {children}                 ← cloneElement로 핸들러/aria 주입된 trigger

document.body (createPortal)   ← wrapper 밖으로 포탈됨 (DOM 상 트리거의 자식이 아님)
└── span.tooltip_position      ← position: fixed (좌표는 useAnchoredPosition)
        pointer-events 유지 + onMouseEnter/onMouseLeave (WCAG 1.4.13 Hoverable)
    └── span.tooltip           ← role="tooltip", spring transform, max-width 240px
```

`document.body`로 **포탈**되고 `position: fixed` + `useAnchoredPosition`이 계산한 좌표로 배치되므로, 트리거의 `overflow: hidden`/`transform` 조상에 갇히거나 잘리지 않는다. `z-index`는 `z_level5`.

**Usage**

```tsx
import { Tooltip, IconButton, Button } from "@bigtablet/design-system";
import { Save, Trash } from "lucide-react";

// 1) 아이콘 버튼 라벨 - 가장 흔한 케이스
<Tooltip content="저장하기 (Cmd+S)">
  <IconButton icon={<Save />} aria-label="저장" />
</Tooltip>

// 2) placement 명시 - 화면 위쪽에 가까울 때 아래로 펼침
<Tooltip content="아래에서 노출" placement="bottom">
  <Button>아래 방향</Button>
</Tooltip>

// 3) 가로 툴바 - 좌우 placement
<Tooltip content="삭제" placement="right">
  <IconButton icon={<Trash />} aria-label="삭제" />
</Tooltip>

// 4) 긴 텍스트 (max-width 240px에서 자동 줄바꿈)
<Tooltip content="버튼을 누르면 데이터가 영구 삭제됩니다. 되돌릴 수 없습니다.">
  <Button danger>삭제</Button>
</Tooltip>

// 5) 지연 조정 - 빈번하게 hover되는 영역
<Tooltip content="행 상세" delay={500}>
  <TableRow />
</Tooltip>

// 6) 동적 비활성화 - children만 통과
<Tooltip content="제출됨" disabled={!isSubmitted}>
  <Button>다시 제출</Button>
</Tooltip>
```

---

### Menu

trigger 클릭으로 펼쳐지는 **액션 메뉴**. **컨텍스트 메뉴, 케밥/햄버거, 행 단위 액션 (Edit/Duplicate/Delete)**에 적합.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 카드/행 단위 액션 (Edit, Duplicate, Delete) | ✅ Menu |
| `MoreVertical`(케밥) 트리거의 보조 액션 묶음 | ✅ Menu |
| 폼에서 단일 값 선택 (Country, Status) | ❌ Dropdown 권장 |
| 다중 선택 / 검색 가능한 옵션 | ❌ Dropdown(multi) 또는 Combobox |
| 사이트 전역 내비게이션 (Nav 하위) | ❌ NavBar의 dropdown 패턴 사용 |
| destructive 액션 (삭제 등) 포함 | ✅ Menu - `destructive: true`로 시각 구분 |

**Menu vs Dropdown**
- **Menu**: 액션을 실행 (`onSelect` → 사이드 이펙트). `<button role="menuitem">`. 값을 들고 있지 않음.
- **Dropdown**: 값을 선택 (controlled `value`/`onValueChange`). 폼 필드. `role="combobox"` 또는 `listbox`.

#### 선택 가이드

**align - trigger 기준 정렬**
- `"start"` (기본) - trigger의 **왼쪽 가장자리**부터 메뉴 펼침. 페이지 좌측 / 본문 안 트리거에 적합.
- `"end"` - trigger의 **오른쪽 가장자리**까지 정렬. 페이지 우측 (테이블 마지막 칼럼의 케밥, 헤더 우측 액션)에서 화면 밖으로 안 넘어가게.

> ℹ️ 세로 방향은 항상 trigger **아래**로 펼침 (현재 구현은 위로 뒤집기 미지원). 화면 하단에 가까우면 trigger 위치를 조정하거나 페이지 상단에 두라.

**trigger 패턴**
- `IconButton` + `MoreVertical` (케밥) - 행/카드의 잠재 액션 모음
- `Button` + 캐럿 아이콘 - 명시적인 액션 그룹 (`Actions ▾`)
- 일반 텍스트 / 링크는 비권장 (어포던스 부족)

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `MenuItem[]` | required | 메뉴 아이템 배열 |
| `trigger` | `ReactElement` | required | 클릭 시 메뉴를 토글하는 trigger (단일 ReactElement) |
| `align` | `'start' \| 'end'` | `'start'` | trigger 기준 메뉴 정렬 |

**MenuItem**

| 필드 | Type | Description |
|------|------|-------------|
| `key` | `string` | 고유 key (React list key + 내부 식별자) |
| `label` | `ReactNode` | 표시 텍스트 (긴 경우 ellipsis 처리) |
| `icon` | `ReactNode` | 왼쪽 leading icon (선택) |
| `onSelect` | `() => void` | 클릭 시 호출 - 호출 후 자동으로 메뉴 닫힘 |
| `destructive` | `boolean` | 빨간 텍스트로 destructive 액션 강조 (삭제/탈퇴 등) |
| `disabled` | `boolean` | 비활성 - 클릭/포커스 불가, opacity 38% |

> ⚠️ `trigger`는 **반드시 단일 ReactElement**. `cloneElement`로 `onClick`/`aria-*` 주입.

#### 접근성 (WAI-ARIA Menu pattern)

자동 처리되는 a11y 속성:

- 메뉴 컨테이너: `role="menu"`, `id={useId()}`
- 트리거: `aria-haspopup="menu"`, `aria-expanded={open}`, `aria-controls={menuId}` (열렸을 때)
- 각 아이템: native `<button type="button" role="menuitem">` (Enter/Space로 활성화)
- 비활성 아이템은 native `disabled` 속성 → 포커스/클릭 모두 차단
- **키보드**:
  - <kbd>Tab</kbd> - trigger 포커스 → Enter/Space로 토글
  - <kbd>Tab</kbd> - 메뉴 열린 상태에서 아이템 사이 이동 (현재 구현은 native tab 순서 사용, Arrow Up/Down은 미지원)
  - <kbd>Esc</kbd> - 메뉴 닫음
  - <kbd>Enter</kbd> / <kbd>Space</kbd> - 아이템 선택 → `onSelect` 호출 + 자동 close
- focus 관리: 메뉴 닫힐 때 자동 focus 복귀는 없으니 destructive 후 별도 focus 이동이 필요하면 caller가 처리

> 📌 케밥 트리거 IconButton에는 `aria-label="More options"` 같은 식별 라벨을 꼭 줘야 한다.

#### 애니메이션

`useSpringPresence` 훅 + react-spring:

- **진입**: opacity `0→1` + transform `translateY(-4px) → 0` (위에서 살짝 내려옴)
- **퇴출**: `clamp: true`로 진동 없이 빠르게 사라짐 (비대칭, 진입은 부드럽게 / 퇴출은 단호하게)
- spring config: `tension: 280, friction: 28`
- 아이템 hover/focus는 `transition_fast` 배경 트랜지션

#### 외부 클릭/Esc 처리

열린 동안에만 listener 등록:
- **외부 클릭** (`mousedown` 이벤트, wrapper 바깥) → close
- **Esc 키** (`keydown`) → close
- 아이템 선택 시 `onSelect` 호출 후 자동 close
- 비활성 아이템 클릭은 무시 (close 안 됨)
- `open === false`로 바뀌면 listener 모두 cleanup

#### DOM 구조 (SCSS override 시 참고)

```
span.menu_wrapper                  ← position: relative; ref 부착 (외부 클릭 판정)
├── {trigger}                      ← cloneElement로 onClick/aria 주입
└── div.menu                       ← position: absolute, role="menu"
    ├── menu_align_start | menu_align_end
    └── button.menu_item × N       ← role="menuitem"
        ├── menu_item_destructive  ← 빨간 텍스트
        ├── menu_item_disabled     ← 비활성
        ├── span.menu_item_icon    ← aria-hidden
        └── span.menu_item_label   ← ellipsis
```

Menu 는 Tooltip/Popover 와 달리 **포탈하지 않는다** - `.menu_wrapper` 안에서 `position: absolute` 로 배치되고 `z-index`는 `z_level5` 를 쓴다. 따라서 트리거에 `overflow: hidden` 이나 `transform` 조상이 있으면 메뉴가 잘릴 수 있으니, 그런 컨테이너 안에서 쓸 때는 오버플로를 열어두거나 Popover 를 사용한다.

**Usage**

```tsx
import { Menu, IconButton, Button } from "@bigtablet/design-system";
import { MoreVertical, Edit, Copy, Trash, Share, Archive } from "lucide-react";

// 1) 카드/행 케밥 액션 - destructive 포함
<Menu
  trigger={<IconButton icon={<MoreVertical />} aria-label="More options" />}
  items={[
    { key: "edit", label: "편집", icon: <Edit size={14} />, onSelect: handleEdit },
    { key: "copy", label: "복사", icon: <Copy size={14} />, onSelect: handleCopy },
    { key: "del",  label: "삭제", icon: <Trash size={14} />, destructive: true, onSelect: handleDelete },
  ]}
/>

// 2) 테이블 마지막 칼럼 - align="end"로 화면 밖 방지
<Menu
  align="end"
  trigger={<IconButton icon={<MoreVertical />} aria-label="행 액션" />}
  items={[
    { key: "edit",  label: "편집",  onSelect: handleEdit },
    { key: "share", label: "공유",  icon: <Share size={14} />, onSelect: handleShare },
    { key: "del",   label: "삭제",  destructive: true, onSelect: handleDelete },
  ]}
/>

// 3) 비활성 아이템 - 상태에 따라 일부 액션 차단
<Menu
  trigger={<IconButton icon={<MoreVertical />} aria-label="문서 액션" />}
  items={[
    { key: "edit",    label: "편집", onSelect: handleEdit },
    { key: "archive", label: "보관", icon: <Archive size={14} />, disabled: isArchived },
    { key: "del",     label: "삭제", destructive: true, onSelect: handleDelete },
  ]}
/>

// 4) 명시적 액션 그룹 - Button trigger
<Menu
  trigger={<Button variant="outline">Actions ▾</Button>}
  items={[
    { key: "export", label: "내보내기", onSelect: handleExport },
    { key: "import", label: "가져오기", onSelect: handleImport },
  ]}
/>
```

---

### Popover

trigger 클릭으로 펼쳐지는 **범용 non-modal 패널**. **임의의 interactive 콘텐츠 (폼, 설명, 액션 조합)**를 담는다. Menu(액션 리스트) / Tooltip(hover 정보)과 역할이 다르다.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 클릭으로 여는 작은 폼/필터 (체크박스, 입력, 적용 버튼) | ✅ Popover |
| 프로필 카드, 미리보기, 부가 설명 + 액션 버튼 | ✅ Popover |
| 단순 액션 리스트 (Edit / Duplicate / Delete) | ❌ Menu 권장 |
| hover로 뜨는 짧은 텍스트 라벨 | ❌ Tooltip 권장 (포커스를 옮기지 않는 보조 설명) |
| 화면 중앙 차단(modal) 다이얼로그 / 확인창 | ❌ Modal · `useAlert()` 권장 |
| 폼 필드 상시 도움말 | ❌ helper text 권장 |

**Popover vs Menu vs Tooltip**
- **Popover**: 클릭으로 열고 외부 클릭/Esc로 닫음. `role="dialog"` (non-modal). 임의의 상호작용 콘텐츠. 열릴 때 포커스가 패널로 이동.
- **Menu**: 클릭으로 열리는 **액션 리스트**. `role="menu"` + `menuitem`. 선택 시 사이드 이펙트.
- **Tooltip**: hover/focus로 뜨는 **짧은 정보**. `role="tooltip"`, 포커스를 옮기지 않음. Esc 로 닫히고 툴팁 위 hover 도 가능하지만, 안에 상호작용 요소를 넣을 수는 없음.

#### 선택 가이드

**placement (4방향)**
- `"bottom"` (기본) - trigger 아래. 대부분의 케이스.
- `"top"` - trigger가 화면 하단에 가까울 때.
- `"left"` / `"right"` - 가로 공간이 충분하고 위/아래가 막혔을 때.

> ℹ️ `placement`는 **선호값**이다. 뷰포트를 벗어나면 반대편으로 **flip**, 교차축으로 **shift**, 그래도 넘치면 `max-width` 축소가 자동 적용되고 `body`로 포탈된다(Radix `side` + `collisionPadding` 계약). 경계 근처라도 직접 조정할 필요가 없다.

**제어 / 비제어**
- 비제어 (기본) - `defaultOpen`만 주고 내부 state로 토글. 가장 간단.
- 제어 - `open` + `onOpenChange`로 외부 state가 소유. 외부 버튼/로직과 연동하거나 닫힘 시점을 직접 제어할 때.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | `ReactElement` | required | 클릭 시 팝오버를 토글하는 trigger (단일 ReactElement) |
| `content` | `ReactNode` | required | 팝오버 내부 콘텐츠 (임의 interactive 노드) |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | trigger 기준 위치 |
| `open` | `boolean` | - | 제어 모드 열림 상태 (주면 비제어 state 무시) |
| `defaultOpen` | `boolean` | `false` | 비제어 모드 초기 열림 상태 |
| `onOpenChange` | `(open: boolean) => void` | - | 열림 상태 변경 콜백 |
| `aria-label` | `string` | - | dialog 접근성 라벨 (content에 제목 없으면 권장) |
| `aria-labelledby` | `string` | - | dialog 접근성 라벨 요소 id |
| `className` | `string` | - | 팝오버 패널에 추가 |

> ⚠️ `trigger`는 **반드시 단일 ReactElement**. `cloneElement`로 `onClick`/`aria-*` 주입 (trigger의 기존 `onClick`은 보존). trigger 컴포넌트는 props를 forward해야 한다 (`<button {...props}>`).

#### 접근성 (WAI-ARIA non-modal dialog)

자동 처리되는 a11y 속성:

- 패널: `role="dialog"`, `tabIndex={-1}`, `id={useId()}`
- 트리거: `aria-haspopup="dialog"`, `aria-expanded={open}`, `aria-controls={popoverId}` (열렸을 때)
- **포커스**: 열릴 때 패널 내 **첫 focusable**로 이동 (없으면 패널 자체). `Esc`로 닫으면 **trigger로 복귀**
- **키보드**: <kbd>Tab</kbd> trigger 포커스 → Enter/Space로 토글 / <kbd>Esc</kbd> 닫음 (+ trigger 복귀)
- non-modal이므로 Tab을 트랩하지 않음 (Modal과 차이). 페이지 나머지와 상호작용 가능

> 📌 `dialog`는 접근성 이름이 필요하다. content에 제목이 없으면 `aria-label`을, 있으면 그 요소 id로 `aria-labelledby`를 줘라. **폴백이 없다** — 둘 다 비우면 이름 없는 대화상자가 되고 axe `aria-dialog-name` 이 잡는다 (Modal · Drawer 와 같은 계약).

#### 애니메이션

`useSpringPresence` 훅 + react-spring:

- **진입**: opacity `0→1` + transform `translate(4px) → 0` (placement별 진입 방향 다름 - Tooltip과 동일 규칙)
- **퇴출**: `clamp: true`로 진동 없이 빠르게
- spring config: `tension: 280, friction: 28`

#### 외부 클릭/Esc 처리

열린 동안에만 listener 등록:
- **외부 클릭** (`mousedown`, wrapper 바깥) → close (포커스는 자연 이동, trigger 복귀 안 함)
- **Esc 키** (`keydown`) → close + trigger로 포커스 복귀
- 패널 내부 클릭은 닫지 않음 (interactive 콘텐츠 보호)
- `open === false`로 바뀌면 listener 모두 cleanup

#### DOM 구조 (SCSS override 시 참고)

```
div.popover_wrapper                ← position: relative; display: inline-flex; ref 부착 (외부 클릭 판정)
├── {trigger}                      ← cloneElement로 onClick/aria 주입
└── div.popover_position           ← createPortal(body), position: fixed (좌표는 useAnchoredPosition)
    └── div.popover                ← role="dialog", spring transform
```

`document.body`로 **포탈**되고 `position: fixed` + `useAnchoredPosition` 좌표로 배치되므로 trigger의 `overflow: hidden`/`transform` 조상에 갇히거나 잘리지 않는다. `z-index`는 `z_level5` 사용.

**Usage**

```tsx
import { Popover, Button, Checkbox, Stack } from "@bigtablet/design-system";

// 1) 필터 팝오버 - 폼 + 적용 버튼
<Popover
  aria-label="상태 필터"
  trigger={<Button variant="outline">필터</Button>}
  content={
    <Stack gap={12}>
      <Checkbox label="활성" defaultChecked />
      <Checkbox label="대기" />
      <Button size="sm">적용</Button>
    </Stack>
  }
/>

// 2) placement 지정
<Popover
  placement="top"
  aria-label="도움말"
  trigger={<Button variant="text">?</Button>}
  content={<p>이 항목은 월 단위로 집계됩니다.</p>}
/>

// 3) 제어 모드 - 외부 state가 소유
const [open, setOpen] = useState(false);
<Popover
  open={open}
  onOpenChange={setOpen}
  aria-labelledby="pop-title"
  trigger={<Button>프로필</Button>}
  content={
    <Stack gap={8}>
      <strong id="pop-title">박상민</strong>
      <Button size="sm" onClick={() => setOpen(false)}>닫기</Button>
    </Stack>
  }
/>
```

---

## Display

### Card

```tsx
import { Card, Button } from '@bigtablet/design-system';

<Card heading="카드 제목">
  <p>카드 내용입니다.</p>
</Card>

// 스타일 옵션
<Card heading="제목" shadow="lg" padding="lg" bordered>
  내용
</Card>

// variant - glass 는 컬러/이미지 배경 위에서 빛난다, outlined 는 투명 + 테두리
<Card variant="glass" heading="Glass">내용</Card>
<Card variant="outlined" heading="Outlined">내용</Card>

// interactive - hover 시 살짝 떠오름 (클릭 가능한 카드)
<Card interactive onClick={open}>내용</Card>

// footer 슬롯 - header / body / footer 3단 composition
<Card
  heading="제목"
  footer={<><Button variant="text">취소</Button><Button>저장</Button></>}
>
  내용
</Card>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `heading` | `ReactNode` | - | 카드 제목 (header) |
| `headingAs` | `'h2'~'h6'` | `'h3'` | 제목 시맨틱 태그 |
| `variant` | `'default' \| 'accent' \| 'glass' \| 'outlined'` | `'default'` | accent=navy bg+흰 텍스트 / glass=반투명 frosted+blur(컬러·이미지 배경 위 권장, 흰 텍스트) / outlined=투명 bg+테두리(shadow 무시) |
| `interactive` | `boolean` | `false` | hover-lift (클릭 가능한 카드용 시각 효과) |
| `footer` | `ReactNode` | - | 카드 하단 영역 (구분선과 함께 표시) |
| `footerAlign` | `'start' \| 'between' \| 'end'` | `'end'` | footer 정렬 |
| `shadow` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'sm'` | 그림자 (outlined/glass 는 자체 처리) |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | 내부 여백 |
| `bordered` | `boolean` | `false` | 테두리 표시 |

> ℹ️ `interactive` 는 hover-lift **시각 효과만** 제공한다 (MediaCard `clickable` 과 동일 범위). 실제 클릭/키보드 처리는 `onClick` 이나 래핑 요소로 직접 연결하라. `glass` 는 흰 배경 라이트 모드에서는 약하게 보이므로 컬러/이미지 배경 위에 사용한다.

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

// rich content - 텍스트 슬롯에 노드 인라인 (string·ReactNode 모두 허용)
<ListItem
  overline={<Badge variant="success" appearance="soft">활성</Badge>}
  label={<span>릴리스 <strong>v3.2</strong></span>}
  supportingText={<span>자세히는 <a href="/changelog">체인지로그</a></span>}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `ReactNode` | required | 주요 텍스트 (string 또는 노드 - `<strong>`/`<a>`/`Badge` 인라인 가능) |
| `overline` | `ReactNode` | - | 상단 오버라인 (string·노드) |
| `supportingText` | `ReactNode` | - | 보조 텍스트 (string·노드) |
| `metadata` | `ReactNode` | - | 메타데이터 (string·노드) |
| `leadingElement` | `ReactNode` | - | 왼쪽 요소 |
| `trailingElement` | `ReactNode` | - | 오른쪽 요소 |
| `alignment` | `'top' \| 'middle'` | `'top'` | 요소 정렬 |
| `disabled` | `boolean` | `false` | 비활성화 |
| `onClick` | `(event) => void` | - | 클릭 핸들러 |

---

### Avatar

사용자 프로필 표시. 이미지 우선, 실패하거나 없으면 이름에서 추출한 **initials**로 자동 fallback.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 로그인한 사용자/멤버 표시 | ✅ Avatar |
| 이미지 없는 사용자를 깔끔하게 표시 | ✅ Avatar (자동 initials) |
| 단순 아이콘 (사람 아닌 객체) | ❌ `<img>` 또는 IconButton |
| 그룹/팀 아바타 스택 | ✅ Avatar 여러 개를 음수 margin으로 겹치기 |
| 알림 점/카운트 함께 | ✅ Avatar + 절대 위치 `<Badge shape="dot/count" />` |

#### initials 추출 규칙

`name`을 공백으로 split해서:
- **1단어** (한글 "박상민", 영문 "Madonna") → 첫 글자 1자 (`박`, `M`)
- **2단어 이상** (영문 "Sangmin Park") → 첫 단어 + 마지막 단어의 첫 글자 (`SP`)
- 결과는 항상 `toUpperCase()`

> 한글 이름은 보통 1단어이므로 "박상민" → "박"이 됩니다. 성+이름을 분리해서 보여주고 싶다면 `name="박 상민"`처럼 띄어쓰기를 넣어주세요.

#### size 선택 가이드

| size | 픽셀 | 폰트 | 권장 위치 |
|------|------|------|----------|
| `xs` | 24 | 10 | 댓글 작성자, 인라인 멘션 |
| `sm` | 32 | 12 | 리스트 아이템, 사이드바 |
| `md` | 40 | 14 | 헤더, 카드 (기본) |
| `lg` | 48 | 16 | 프로필 카드, 멤버 그리드 |
| `xl` | 64 | 20 | 프로필 페이지 헤더 |

#### shape

- `circle` (기본) - 사람 프로필. 거의 모든 케이스
- `square` - 브랜드 로고, 조직/팀 아바타 (회사처럼 느껴짐)

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | - | 이미지 URL. 로드 실패 시 자동으로 initials fallback |
| `name` | `string` | `''` | 이미지 `alt` + initials 추출 소스. **항상 의미있는 값 권장** |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 크기 |
| `shape` | `'circle' \| 'square'` | `'circle'` | 모양 |
| `bgColor` | `string` | navy accent | initials fallback 배경색 (CSS color string) |
| `...rest` | `HTMLAttributes<HTMLSpanElement>` | - | `onClick`, `style`, `data-*` 등 |

#### 접근성

자동 처리되는 a11y:

- **이미지 모드** (`src`+로드 성공): 내부 `<img alt={name}>`이 스크린리더에 이름을 읽어줌
- **initials 모드** (src 없음/실패): 컨테이너 span에 `role="img"` + `aria-label={name}` 부여. initials 자체는 `aria-hidden="true"`(중복 발음 방지)
- 빈 `name=""`인 경우 `aria-label` 미부여 - 장식용 아바타로 처리됨
- 클릭 가능한 아바타를 만들 땐 **`<button>`이나 `<a>`로 감싸세요**. Avatar 자체는 `<span>`이라 기본 포커스/키보드 동작이 없습니다

#### 이미지 처리

- `<img onError>`로 로드 실패 감지 → React state `imgFailed=true` → initials로 렌더링
- DS는 프레임워크 독립이라 `<img>` 사용. Next.js에선 직접 [`next/image`](https://nextjs.org/docs/app/api-reference/components/image)로 감싸 최적화 권장
- `object-fit: cover` + `overflow: hidden`으로 비율과 무관하게 꽉 채움

#### DOM 구조 (SCSS override 시 참고)

```
span.avatar (+ avatar_size_md + avatar_shape_circle)
└── (이미지 모드)  img.avatar_image
└── (initials 모드) span.avatar_initials   ← aria-hidden
```

**Usage**

```tsx
import { Avatar } from "@bigtablet/design-system";

// 기본
<Avatar src="/me.jpg" name="박상민" />

// 이미지 없음 → "박"으로 표시
<Avatar name="박상민" />

// 영문 → "SP"
<Avatar name="Sangmin Park" size="lg" />

// 사각형 + 브랜드 컬러 (팀/조직 아바타)
<Avatar name="Bigtablet" size="xl" shape="square" bgColor="#0E1F4D" />

// 클릭 가능한 아바타 - button으로 감싸기
<button type="button" onClick={openProfile} aria-label="내 프로필 열기"
        style={{ all: "unset", cursor: "pointer" }}>
  <Avatar src="/me.jpg" name="박상민" />
</button>

// Avatar + Badge (알림 점)
<span style={{ position: "relative", display: "inline-block" }}>
  <Avatar src="/me.jpg" name="박상민" />
  <span style={{ position: "absolute", top: 0, right: 0 }}>
    <Badge shape="dot" variant="error" aria-label="읽지 않은 알림" />
  </span>
</span>

// 그룹 스택
<div style={{ display: "flex" }}>
  <Avatar name="A" size="sm" />
  <Avatar name="B" size="sm" style={{ marginLeft: -8 }} />
  <Avatar name="C" size="sm" style={{ marginLeft: -8 }} />
</div>
```

---

### Badge

작은 상태/카운트 표시. `dot` / `count` / `label` 3가지 shape × 6가지 색상 variant.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 읽지 않은 알림 개수 (5, 99+) | ✅ Badge `shape="count"` |
| 단순 활성/상태 점 (온라인, 새 항목 있음) | ✅ Badge `shape="dot"` |
| "New", "Beta", "Pro" 같은 라벨 | ✅ Badge `shape="label"` |
| 가독성 있는 태그 (`# react`, `# design`) | ❌ [Chip](#chip) `type="static"` 권장 |
| 폼 필드 옆 도움말 토글 | ❌ [Tooltip](#tooltip) 권장 |
| 클릭/삭제 가능한 토큰 | ❌ Chip 권장 (Badge는 정적 표시 전용) |

**Badge vs Chip 비교**

| | Badge | Chip |
|---|-------|------|
| 의도 | 작은 상태/카운트 | 사용자 입력 토큰/필터 |
| 인터랙션 | 없음 (정적) | 클릭/삭제 가능 |
| 크기 | 매우 작음 (8/18px) | 보통 (28+px) |
| 위치 | 다른 요소에 부착 (절대 위치 흔함) | 인라인 흐름 |

#### shape 선택 가이드

| shape | 크기 | 용도 |
|-------|------|------|
| `dot` | 8×8 (텍스트 없음) | "변경사항 있음" 같은 boolean 알림. 가장 시각적 부담 적음 |
| `count` | min-width 18, 6px 패딩, 원형 | 알림 개수. `count > max` 시 `${max}+`로 표시 |
| `label` | 11px 폰트, padding 2×8, uppercase | "NEW", "BETA" 라벨 |

#### variant 의미 매핑

| variant | 토큰 | 의미 |
|---------|------|------|
| `accent` | brand navy | 기본/브랜드 강조 |
| `neutral` | bg.solid.dim | 정보 없는 메타 라벨 |
| `info` | status.info | 정보성 ("Beta") |
| `success` | status.success | 정상/활성 |
| `warning` | status.warning | 경고 |
| `error` | status.error | 에러/긴급 알림 (배지 카운트의 기본 컬러) |

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'accent' \| 'neutral' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'accent'` | 색상 |
| `shape` | `'dot' \| 'count' \| 'label'` | `'label'` | 모양 |
| `count` | `number` | - | shape=`count`일 때 표시 숫자. undefined면 빈 상태 |
| `max` | `number` | `99` | count 최댓값. 초과 시 `${max}+`로 표시 |
| `children` | `ReactNode` | - | shape=`label`일 때 라벨 텍스트 |
| `...rest` | `HTMLAttributes<HTMLSpanElement>` | - | `aria-label`, `role`, `style` 등 |

#### 접근성

- Badge는 시멘틱 없는 `<span>`이라, **스크린리더에게 의미를 전달하려면 직접 `aria-label`을 넣어야 합니다**
- 특히 `shape="dot"`은 텍스트가 없어서 SR이 아예 무시함 → 의미가 있다면 `aria-label`로 보충하세요

```tsx
// 알림 점만 있고 SR은 모름
<Badge shape="dot" variant="error" />

// SR에게 "읽지 않은 알림" 이라고 알려줌
<Badge shape="dot" variant="error" aria-label="읽지 않은 알림" />

// 부모가 의미를 전달하면 Badge는 aria-hidden으로 중복 제거
<button aria-label={`알림 ${count}개`}>
  <BellIcon />
  <Badge shape="count" count={count} variant="error" aria-hidden="true" />
</button>
```

#### DOM 구조 (SCSS override 시 참고)

```
span.badge (+ badge_shape_count + badge_variant_error)
└── (textContent - dot은 빈 텍스트, count는 숫자/${max}+, label은 children)
```

**Usage**

```tsx
import { Badge } from "@bigtablet/design-system";

// dot - 가장 작은 상태 표시
<Badge shape="dot" variant="error" aria-label="읽지 않은 메시지 있음" />

// count - 알림 개수
<Badge shape="count" count={5} variant="error" />
<Badge shape="count" count={120} max={99} /> // "99+"

// label - variant 비교
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="info">Beta</Badge>

// 다른 요소에 부착 - 아이콘 버튼 + 카운트
<button aria-label={`알림 ${unread}개`} style={{ position: "relative" }}>
  <BellIcon />
  <span style={{ position: "absolute", top: -4, right: -4 }}>
    <Badge shape="count" count={unread} variant="error" aria-hidden="true" />
  </span>
</button>
```

---

### Hero

페이지 상단의 큰 영역. 배경(이미지/색상) + 오버레이 + eyebrow/title/subtitle + CTA 슬롯으로 구성. **마케팅 페이지, 카페 메인, 캠페인 랜딩**의 첫 인상 영역.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 홈/랜딩 페이지 상단의 강조 영역 | ✅ Hero |
| 캠페인/프로모션 상단 비주얼 | ✅ Hero |
| 카테고리 페이지 상단 소개 | ✅ Hero `height="sm"` |
| 콘텐츠 리스트 안의 한 카드 | ❌ [MediaCard](#mediacard) 권장 |
| 모달/사이드시트 안 헤더 | ❌ [Modal](#modal) 자체 헤더 사용 |
| 텍스트만 짧게 강조 | ❌ [Section](#section) + 일반 텍스트 |

**Hero vs MediaCard 비교**

| | Hero | MediaCard |
|---|------|-----------|
| 위계 | 페이지당 보통 1개 (h1) | 그리드/리스트에 N개 |
| 크기 | 320-960px+ | ~200-400px |
| 시멘틱 | `<section>` + `<h1>` | `<div>` + `<h3>` (configurable) |
| 배경 | full-width 배경 이미지 | 카드 내부 이미지 |
| 용도 | 페이지 진입 후크 | 콘텐츠 카드 (블로그, 메뉴) |

#### height 선택 가이드

| height | min-height (desktop / compact) | 권장 위치 |
|--------|--------|----------|
| `sm` | 320 / 240 | 서브 페이지 헤더, 카테고리 상단 |
| `md` | 480 / 360 | 일반 마케팅 페이지 (기본) |
| `lg` | 640 / 480 | 메인 랜딩, 강조 캠페인 |
| `full` | 100vh / 100vh | 풀스크린 히어로 (스크롤로 다음 섹션 노출) |

> compact breakpoint (<600px)에서 자동으로 더 짧아지고, title 폰트도 `display.small.medium` → `heading.large.medium`으로 축소됩니다.

#### overlay 선택 가이드

배경 이미지 위에 텍스트 대비 확보용 그라데이션:

| overlay | 그라데이션 | 권장 |
|---------|-----------|------|
| `false`/undefined | 없음 | 배경이 단색이거나 어두운 이미지일 때 |
| `true` / `'dark'` | 위→아래 검정 0.1 → 0.55 | 밝은/혼합 이미지 위 흰 텍스트 |
| `'light'` | 위→아래 흰색 0.1 → 0.7 | 어두운 이미지 위 어두운 텍스트 |
| `'navy'` | 위→아래 navy 0 → 0.85 | Bigtablet 브랜드 강조 (마케팅) |

#### textColor 결정 로직 (`textColor="auto"` 기본)

```
isDarkOverlay = overlay === 'dark' || overlay === 'navy'
auto =
  isDarkOverlay                       → inverse (흰색)
  backgroundImage && !overlay         → inverse (이미지 위는 흰색 안전)
  나머지                              → default (텍스트 토큰)
```

배경/오버레이 조합이 특이하면 `textColor="inverse"` 또는 `"default"`로 명시하세요.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `height` | `'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` | 높이 (위 표 참고) |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | 텍스트 + CTA 정렬 |
| `backgroundImage` | `string` | - | 배경 이미지 URL - `background-image: url(...)` |
| `backgroundColor` | `string` | - | 배경색 (이미지 위에 함께 적용 가능) |
| `overlay` | `boolean \| 'dark' \| 'light' \| 'navy'` | - | 오버레이 그라데이션 |
| `title` | `ReactNode` | - | **h1** 메인 제목 (display.small.medium) |
| `subtitle` | `ReactNode` | - | 부제목 (body.large, max-width 640) |
| `eyebrow` | `ReactNode` | - | 제목 위 카테고리/태그 (uppercase, tight letter-spacing) |
| `textColor` | `'auto' \| 'inverse' \| 'default'` | `'auto'` | auto는 overlay 기반 자동 결정 |
| `primaryAction` | `HeroAction` | - | Primary CTA (Button filled size lg) |
| `secondaryAction` | `HeroAction` | - | Secondary CTA (Button outline size lg) |
| `children` | `ReactNode` | - | 추가 액션 - `primaryAction`/`secondaryAction` 외 자유 슬롯 |
| `...rest` | `HTMLAttributes<HTMLElement>` | - | `<section>`에 전달 |

**HeroAction**

| 필드 | Type | Description |
|------|------|-------------|
| `label` | `ReactNode` | 버튼 라벨 |
| `onClick` | `() => void` | 클릭 핸들러 |
| `href` | `string` | 링크 사용 시 (현재 구현은 `onClick`만 wire-up - 외부 링크는 children으로 `<a>` 직접 전달 권장) |

#### 접근성

- 루트는 `<section>` (랜드마크) - 페이지에 여러 개일 땐 `aria-label`로 구분하세요
- 제목은 `<h1>` 고정 - **페이지에 Hero를 두 개 넣지 마세요**. h1은 페이지당 1개가 정석
- overlay div는 `aria-hidden="true"` 처리되어 SR에 노출되지 않음
- `backgroundImage`는 CSS 배경이라 alt가 없음 - 의미 있는 이미지면 별도 `<img alt="..." />`를 children으로 추가하세요
- `prefers-reduced-motion`은 별도 처리 없음 (자동 애니메이션 없음) - Button 내부 transition만 동작

#### 이미지 처리

- `background-image: url("${backgroundImage}")`로 CSS background 사용 (lazy loading X - fold 위 자산이라 즉시 로드)
- `background-size: cover` + `background-position: center`
- 큰 이미지일수록 LCP에 영향 - **`<link rel="preload" as="image">`로 미리 로드**하거나 Next.js라면 `<Image priority />`로 별도 배치 후 CSS 배경 대신 사용 고려

#### DOM 구조 (SCSS override 시 참고)

```
section.hero (+ hero_height_md + hero_align_left + hero_overlay_dark + hero_text_inverse)
├── div.hero_overlay              ← aria-hidden, z-index 1
└── div.hero_content              ← max-width 1200, z-index 2
    ├── div.hero_eyebrow
    ├── h1.hero_title
    ├── p.hero_subtitle
    └── div.hero_actions
        ├── Button (primaryAction)
        ├── Button (secondaryAction)
        └── {children}
```

**Usage**

```tsx
import { Hero, Button } from "@bigtablet/design-system";

// 마케팅 랜딩 - 이미지 + navy overlay + 중앙 CTA
<Hero
  height="lg"
  align="center"
  backgroundImage="/hero.jpg"
  overlay="navy"
  eyebrow="Bigtablet Cloud"
  title="더 똑똑한 클라우드 인프라"
  subtitle="개발자가 집중할 수 있는 환경을 만듭니다."
  primaryAction={{ label: "시작하기", onClick: handleStart }}
  secondaryAction={{ label: "자세히 보기", onClick: () => router.push("/about") }}
/>

// 서브 페이지 헤더 - sm + 색상만
<Hero
  height="sm"
  eyebrow="블로그"
  title="엔지니어링 노트"
  subtitle="제품 업데이트와 개발 이야기"
  backgroundColor="#F4F4F4"
/>

// 외부 링크 CTA - children으로 직접 anchor
<Hero
  height="md"
  title="문서 보기"
  backgroundColor="#121212"
  textColor="inverse"
>
  <a href="https://docs.bigtablet.com" target="_blank" rel="noreferrer">
    <Button size="lg">문서로 이동</Button>
  </a>
</Hero>
```

---

### MediaCard

이미지 + 텍스트로 구성된 콘텐츠 카드. **블로그, 뉴스, 제품 진열, 카페 메뉴 그리드** 등 B2C 콘텐츠 리스트의 기본 단위.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 이미지 + 제목 + 설명이 있는 콘텐츠 카드 | ✅ MediaCard |
| 이미지 없는 정보 카드 (대시보드 위젯, 폼) | ❌ [Card](#card) 권장 |
| 페이지 상단 단일 강조 영역 | ❌ [Hero](#hero) 권장 |
| 단순 메뉴 항목 (아이콘 + 텍스트 1줄) | ❌ [ListItem](#listitem) 권장 |
| 제품 + 가격 + 옵션 등 인터랙티브 셀 | △ MediaCard 베이스 + 내부에 Button/Form |

#### imagePosition 선택 가이드

| 값 | 시각 | 권장 |
|----|------|------|
| `top` (기본) | 위 이미지 + 아래 텍스트, 16/9 기본 | 블로그/뉴스 그리드 - 가장 흔함 |
| `left` | 좌 이미지(40%) + 우 텍스트, 모바일에서 자동 top | 메일 리스트, 검색 결과, 데스크탑 리스트 뷰 |
| `overlay` | 이미지 위에 텍스트 + navy 그라데이션, 4/3 기본 | 캠페인/히어로 카드 - 강한 시각 강조 |

#### shadow / bordered 선택 가이드

- `shadow="sm"` (기본) + `bordered={false}` - Material스러운 부드러운 카드. 90% 케이스
- `shadow="md/lg"` - 떠 있는 느낌, 강조하고 싶을 때
- `bordered={true}` + `shadow="none"` - 단정한 outline 카드 (관리자 페이지, 폼 안)
- `clickable={true}` - hover 시 `translateY(-2px) + elevation_level3` - 라우팅 가능한 카드에 사용

#### aspectRatio

- `top`/`left`에서는 `image_wrap`에 적용 (이미지만 비율 유지)
- `overlay`에서는 **카드 자체**에 적용 (텍스트가 이미지 위에 얹히기 때문)
- 미지정 시: `top`은 16/9, `overlay`는 4/3, `left`는 비율 없이 width 40% (모바일에서만 16/9)

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `image` | `{ src: string; alt: string }` | **required** | 이미지 정보. `alt=""`는 장식 이미지로 처리됨 |
| `imagePosition` | `'top' \| 'left' \| 'overlay'` | `'top'` | 이미지 위치 |
| `aspectRatio` | `string` | - | CSS aspect-ratio 값 (예: `'16/9'`, `'4/3'`, `'1/1'`) |
| `heading` | `ReactNode` | - | 카드 제목 |
| `headingAs` | `'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6'` | `'h3'` | 제목 시멘틱 태그. 페이지 위계에 맞게 선택 |
| `eyebrow` | `ReactNode` | - | 제목 위 작은 라벨/카테고리 (uppercase) |
| `meta` | `ReactNode` | - | 본문 아래 메타 (날짜/조회수/작성자) |
| `shadow` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'sm'` | 그림자 (token.elevation_level1-3 매핑) |
| `bordered` | `boolean` | `false` | 1px 보더 표시 |
| `clickable` | `boolean` | `false` | hover lift + cursor pointer |
| `children` | `ReactNode` | - | 본문 (요약/설명) |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | - | `onClick`, `role`, `aria-*` 등 |

#### 접근성

- 루트는 `<div>` - **클릭 가능한 카드는 직접 키보드 핸들링 책임**
  - 추천: `<a>` 또는 `<Link>`로 카드 전체를 감싸기 (가장 단순)
  - 대안: `role="button" tabIndex={0}` + `onKeyDown` (Enter/Space)
- 헤딩 위계: `headingAs="h2"|"h3"` 등을 페이지 구조에 맞게 조정. 예: Hero의 h1 아래라면 h2
- 이미지 alt: 의미 있는 이미지면 설명, 장식이면 `alt=""` (SR이 무시)
- `overlay` 모드에서는 텍스트가 이미지 위라 **대비 확인 필수** - 어두운 그라데이션이 자동 적용되지만 밝은 이미지 + 짧은 텍스트에서는 추가 boldness 필요할 수 있음

```tsx
// Next.js - 카드 전체를 Link로 감싸기
<Link href={`/blog/${post.id}`}>
  <MediaCard image={post.cover} heading={post.title} clickable />
</Link>

// 일반 a 태그
<a href={post.url} style={{ textDecoration: "none", color: "inherit" }}>
  <MediaCard image={post.cover} heading={post.title} clickable />
</a>
```

#### 이미지 처리

- 내부 `<img loading="lazy">` 사용 - 뷰포트 외 이미지는 자동 지연 로드
- `object-fit: cover` - 비율 고정 후 잘림 (사람 얼굴 등 중요 영역은 이미지 자체에 적절한 crop 적용 권장)
- DS는 프레임워크 독립이라 `<img>` 사용. Next.js에서 `<Image>`로 최적화하려면 MediaCard 대신 [Card](#card)를 쓰고 이미지를 직접 구성하거나, MediaCard의 image wrap에 `next/image`를 children으로 직접 렌더하는 wrapper를 만드는 방향 권장

#### DOM 구조 (SCSS override 시 참고)

```
div.media_card (+ media_card_image_top + media_card_shadow_sm + ...)
├── div.media_card_image_wrap     ← aspect-ratio 적용 (top/left)
│   ├── img.media_card_image       ← loading="lazy", object-fit: cover
│   └── (overlay 모드만) div.media_card_overlay   ← aria-hidden
└── div.media_card_body
    ├── div.media_card_eyebrow
    ├── h3.media_card_heading       ← headingAs로 변경 가능
    ├── div.media_card_content      ← children
    └── div.media_card_meta
```

> `overlay` 모드에서는 위 구조가 absolute 포지셔닝으로 재배치되어 텍스트가 이미지 위로 올라옵니다.

**Usage**

```tsx
import { MediaCard } from "@bigtablet/design-system";

// 기본 - 블로그 카드
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

// 리스트 뷰 - 좌측 이미지
<MediaCard
  image={{ src: "/menu.jpg", alt: "에티오피아 예가체프" }}
  imagePosition="left"
  aspectRatio="4/3"
  eyebrow="MENU"
  heading="에티오피아 예가체프"
  meta="2026-05-19"
>
  부드러운 산미와 깊은 향이 매력적입니다.
</MediaCard>

// 강조 카드 - 오버레이
<MediaCard
  image={{ src: "/campaign.jpg", alt: "" }}
  imagePosition="overlay"
  aspectRatio="3/4"
  eyebrow="HOT"
  heading="가을 시즌 한정 메뉴"
  meta="10/1 - 11/30"
/>

// 그리드 + 라우팅
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
  {posts.map(post => (
    <Link key={post.id} href={`/posts/${post.id}`}>
      <MediaCard
        image={post.cover}
        heading={post.title}
        eyebrow={post.category}
        meta={post.date}
        clickable
      />
    </Link>
  ))}
</div>
```

---

### EmptyState

데이터가 없는 영역을 채우는 **placeholder 컴포넌트**. illustration + title + description + action 슬롯으로 구성.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 데이터/항목이 아직 없음 (받은 메일 0개, 첫 프로젝트) | ✅ EmptyState |
| 검색 결과 없음 | ✅ EmptyState `size="sm"` |
| 에러로 인한 로드 실패 | △ EmptyState로 가능하지만 [Alert](#alert) `variant="error"`도 고려 |
| 권한 없어서 못 봄 | ✅ EmptyState (illustration: Lock 아이콘) |
| 로딩 중 | ❌ [Spinner](#spinner) 또는 Skeleton 권장 |
| 페이지 전체 404/500 에러 | ❌ 전용 에러 페이지 + Hero 패턴 권장 |

**EmptyState vs Alert(error) 비교**

| | EmptyState | Alert(error) |
|---|------------|--------------|
| 의도 | "지금은 비어있어요" | "문제가 생겼어요" |
| 톤 | 중립적, 안내/온보딩 | 경고, 사용자 행동 필요 |
| 위치 | 콘텐츠 영역 전체 차지 | 상단 배너 또는 인라인 |
| 아이콘 | Inbox, Search, FolderOpen 등 정보성 | AlertCircle, X 등 경고성 |

#### size 선택 가이드

| size | 패딩 | 제목 타이포 | 권장 위치 |
|------|------|----------|----------|
| `sm` | 24/16, gap 8 | title.medium | 모달 안, 사이드바, 좁은 영역, 검색 결과 |
| `md` (기본) | 40/24, gap 12 | title.large | 콘텐츠 영역 전체 |
| `lg` | 48/24, gap 16 | heading.small | 페이지 메인, 온보딩 |

#### 구성 가이드

각 슬롯은 모두 옵셔널 - 필요한 것만 채우면 됩니다:

- **illustration only** - 가장 미니멀, 시각만 강조
- **title only** - 텍스트만으로 ("아직 데이터가 없습니다")
- **illustration + title + description** - 권장 기본 패턴
- **illustration + title + description + action** - 온보딩, 시작 가이드 (CTA 포함)

#### action 슬롯

`Button` 1개 또는 2개를 권장. 너무 많은 액션은 EmptyState의 명확함을 흐립니다.

```tsx
// 1개 CTA
action={<Button>시작하기</Button>}

// 2개 (primary + secondary)
action={
  <div style={{ display: "flex", gap: 8 }}>
    <Button>시작하기</Button>
    <Button variant="outline">가이드 보기</Button>
  </div>
}
```

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `illustration` | `ReactNode` | - | 일러스트 영역 (Lucide 아이콘, SVG, 이미지). **장식 전용** - 내부에 `aria-hidden="true"` 자동 적용 |
| `title` | `ReactNode` | - | 제목 (h3) |
| `description` | `ReactNode` | - | 보조 설명 (p, max-width 480) |
| `action` | `ReactNode` | - | 액션 영역 (Button 등) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 크기 |
| `fillHeight` | `boolean` | `false` | 부모 높이를 채우고 세로 중앙 정렬 (`flex: 1` + `justify-content: center`) |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | - | `role`, `aria-*` 등 |

#### 접근성

- 루트는 `<div>` - 의미 부여가 필요하면 `role="status"` (라이브 영역) 추가 고려
  - 검색 결과가 동적으로 바뀐다면 `role="status"`로 SR이 변경을 announce하도록
- 제목은 `<h3>` 고정 - 페이지 위계와 다르면 wrap해서 시각만 가져가거나, 향후 `titleAs` prop 추가 검토
- `illustration`은 `aria-hidden="true"` 자동 적용 - 일러스트가 의미 전달용이면 title/description에 텍스트로 동일 의미 포함시키세요
- **`illustration` 에 포커스 가능한 요소(버튼/링크 등)를 넣지 마세요.** `aria-hidden` 조상 때문에 포커스는 가는데 보조기기엔 존재하지 않는 요소가 되어 WCAG 4.1.2 (Name/Role/Value) 위반이고, Chrome 은 `Blocked aria-hidden on an element because its descendant retained focus` 를 남기며 `aria-hidden` 적용을 거부합니다. 조작 요소는 `action` 슬롯으로 - 여기엔 `aria-hidden` 이 붙지 않습니다
- 색상은 caption tone - 너무 흐리지 않도록 description 길이는 1-2줄로 유지

#### 화면 가운데 놓기 — `fillHeight`

기본값은 가로 정렬만 하므로, 높이가 큰 영역에 두면 콘텐츠가 상단에 붙고 아래가 비어 보입니다. 404 · 검색 결과 없음 · 빈 목록처럼 영역 한가운데가 필요하면 `fillHeight` 를 켜세요 — 앱마다 `margin: auto` 래퍼를 만들 필요가 없습니다.

```tsx
<div style={{ display: "flex", flexDirection: "column", minHeight: "60vh" }}>
  <EmptyState fillHeight title="검색 결과가 없습니다" />
</div>
```

`flex: 1` 을 쓰므로 **부모가 세로 flex 컨테이너여야** 합니다 — 부모에 `display: flex; flex-direction: column` 과 높이(`min-height` 등)를 주세요. 부모에 높이만 주고 flex 를 안 걸면 `flex: 1` 이 무시되어 아무 변화가 없습니다. 미지정 시 동작은 기존과 동일합니다.

#### DOM 구조 (SCSS override 시 참고)

```
div.empty_state (+ empty_state_size_md)
├── div.empty_state_illustration   ← aria-hidden
├── h3.empty_state_title
├── p.empty_state_description       ← max-width 480
└── div.empty_state_action
```

**Usage**

```tsx
import { EmptyState, Button } from "@bigtablet/design-system";
import { Inbox, Search } from "lucide-react";

// 기본 - 받은 메일
<EmptyState
  illustration={<Inbox size={48} />}
  title="받은 메일이 없습니다"
  description="새 메일이 오면 여기 표시됩니다."
  action={<Button>새 메일 작성</Button>}
/>

// 검색 결과 없음 - sm 사이즈, action 없음
<EmptyState
  illustration={<Search size={40} />}
  title="검색 결과가 없습니다"
  description="다른 키워드로 검색해보세요."
  size="sm"
/>

// 온보딩 - lg + 2개 CTA
<EmptyState
  illustration={<Inbox size={64} />}
  title="첫 프로젝트를 만들어보세요"
  description="프로젝트를 만들면 팀원과 협업하고 진행 상황을 추적할 수 있습니다."
  action={
    <div style={{ display: "flex", gap: 8 }}>
      <Button>프로젝트 만들기</Button>
      <Button variant="outline">가이드 보기</Button>
    </div>
  }
  size="lg"
/>

// 라이브 검색 결과 (동적 변경) - role="status"
<EmptyState
  role="status"
  illustration={<Search size={40} />}
  title={`"${query}"에 대한 결과가 없습니다`}
  size="sm"
/>

// 최소 - title만
<EmptyState title="아직 데이터가 없습니다" size="sm" />
```

---

### ErrorState

에러 상태 표시 - **error boundary fallback, 데이터 로드 실패, 위젯 에러**. [EmptyState](#emptystate) 의 형제. `status-error` 토큰 사용 (하드코딩 없음), `role="alert"` 자동.

#### EmptyState vs ErrorState

| | EmptyState | ErrorState |
|---|------------|------------|
| 의도 | "지금은 비어있어요" (중립) | "문제가 생겼어요" (에러) |
| 아이콘 | Inbox, Search 등 정보성 | 경고 아이콘 (기본 제공) |
| 색 | caption tone | `status-error` |
| 액션 | CTA (시작하기) | 재시도 버튼 |
| role | (옵션) `status` | `alert` 자동 |

#### variant - page vs widget

| variant | 용도 | 시각 |
|---------|------|------|
| `page` (기본) | 전체 화면/영역 fallback (route error boundary) | 큰 아이콘 (48) + `min-height: 320` + 넉넉한 패딩 |
| `widget` | 위젯/카드 내부 인라인 fallback | 작은 아이콘 (28) + 좁은 패딩 |

#### 아이콘

미지정 시 기본 경고 아이콘(`TriangleAlert`). `icon` prop 으로 교체, `icon={null}` 로 숨김.

> **`icon` 은 장식 전용입니다.** 래퍼의 `aria-hidden="true"` 는 필수입니다 - 기본 아이콘이 이름 없는 bare lucide svg 라서 래퍼를 빼면 `role="alert"` 이 이름 없는 그래픽까지 읽습니다. 포커스 가능한 요소는 `action` 슬롯으로 (WCAG 4.1.2). `EmptyState.illustration` 과 같은 계약입니다.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `ReactNode` | `"문제가 발생했습니다"` | 제목 (h3) |
| `description` | `ReactNode` | - | 보조 설명 |
| `icon` | `ReactNode` | 경고 아이콘 | 아이콘/일러스트. **장식 전용** - `aria-hidden="true"` 래퍼 적용. `null` 로 숨김 |
| `action` | `ReactNode` | - | 액션 영역 (재시도 버튼 등) |
| `variant` | `'page' \| 'widget'` | `'page'` | 레이아웃 모드 |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | - | `aria-*` 등 |

#### 접근성

- 루트 `role="alert"` 자동 - 에러 발생 시 스크린 리더가 즉시 announce
- 아이콘은 `aria-hidden` - 의미는 `title`/`description` 텍스트로 전달
- 색은 `status-error-on-surface` (surface 위 텍스트, light/dark 자동 swap)

**Usage**

```tsx
import { ErrorState, Button } from "@bigtablet/design-system";

// 페이지 전체 (error boundary fallback)
<ErrorState
  title="페이지를 불러오지 못했습니다"
  description="잠시 후 다시 시도해 주세요."
  action={<Button onClick={retry}>다시 시도</Button>}
/>

// 위젯 인라인
<ErrorState
  variant="widget"
  title="데이터를 불러오지 못했어요"
  action={<Button variant="outline" size="sm" onClick={retry}>재시도</Button>}
/>

// 커스텀 아이콘
import { ServerCrash } from "lucide-react";
<ErrorState
  icon={<ServerCrash size={48} strokeWidth={1.5} />}
  title="서버에 연결할 수 없습니다"
  action={<Button onClick={refetch}>새로고침</Button>}
/>
```

---

### Accordion

펼침/접힘으로 컨텐츠를 점진적으로 노출하는 영역. **FAQ, 설정 그룹, details 패턴, 사이드바 분류**에 적합.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 컨텐츠 양이 많아 한 번에 다 보이면 부담스러울 때 | ✅ Accordion |
| 카테고리 간 전환 (서로 배타적) | ❌ Tabs 권장 |
| 단순 토글 (1개 항목만) | ❌ Disclosure (`<details>`) 권장 |
| 모달 안에 부가 정보 | ✅ Accordion |

#### multiple 선택 가이드

- `multiple={false}` (기본) - **상호 배타적**: 설정 패널, step-by-step 가이드. 하나가 열리면 나머지 닫힘
- `multiple={true}` - **독립 토글**: FAQ, 분류 트리. 여러 개 동시 펼침 허용

#### 제어형 vs 비제어형

```tsx
// 비제어형 - 90% 케이스. defaultOpenKeys로 초기 상태만 지정
<Accordion items={faq} defaultOpenKeys={["q1"]} />

// 제어형 - 외부 state로 동기화 필요할 때 (URL 쿼리, 다른 컴포넌트와 연동)
const [open, setOpen] = useState<string[]>(["q1"]);
<Accordion items={faq} openKeys={open} onValueChange={setOpen} />
```

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `AccordionItem[]` | required | 아이템 목록 |
| `multiple` | `boolean` | `false` | 여러 개 동시에 펼침 허용 |
| `defaultOpenKeys` | `string[]` | `[]` | 비제어형 초기 펼침 키 |
| `openKeys` | `string[]` | - | 제어형 펼침 키 (`onValueChange`와 함께 사용) |
| `onValueChange` | `(openKeys: string[]) => void` | - | 펼침/접힘 콜백 |

**AccordionItem**

| 필드 | Type | Description |
|------|------|-------------|
| `key` | `string` | 고유 key |
| `title` | `ReactNode` | 헤더 텍스트 |
| `content` | `ReactNode` | 펼쳤을 때 본문 |
| `disabled` | `boolean` | 비활성화 - trigger 클릭 / 키보드 활성화 차단 |

#### 접근성 (WAI-ARIA Disclosure pattern)

자동 처리되는 a11y 속성:

- Trigger button: `aria-expanded`, `aria-controls={panelId}`
- Panel: `role="region"`, `aria-labelledby={headerId}`, `aria-hidden={!isOpen}`
- 헤더는 `<h3>` 시멘틱 사용 (트리거 위계 보존)
- **키보드**: <kbd>Enter</kbd> / <kbd>Space</kbd>로 토글, <kbd>Tab</kbd>으로 trigger 간 이동
- `disabled` 아이템은 native `<button disabled>`라 포커스 받지 않음

#### 애니메이션

- 펼침/접힘: **200ms `grid-template-rows: 0fr → 1fr`** (height auto transition, modern CSS)
- 이징: `easing_enter` (out-expo) - 자연스러운 감속
- Chevron 회전: 200ms
- **`prefers-reduced-motion: reduce` 사용자에겐 transition 자동 비활성**

#### DOM 구조 (SCSS override 시 참고)

```
.accordion
└── .accordion_item (+ accordion_item_open)
    ├── h3.accordion_header
    │   └── button.accordion_trigger (+ chevron)
    └── .accordion_panel (+ accordion_panel_open)
        └── .accordion_panel_wrap   ← overflow:hidden (grid item 자르기)
            └── .accordion_content  ← padding 보유
```

**Usage**

```tsx
import { Accordion } from "@bigtablet/design-system";

// FAQ - 여러 개 동시 펼침
<Accordion
  multiple
  defaultOpenKeys={["q1"]}
  items={[
    { key: "q1", title: "환불은 어떻게 받나요?", content: <p>구매 후 7일 이내 ...</p> },
    { key: "q2", title: "결제 수단을 변경할 수 있나요?", content: <p>설정 페이지에서 ...</p> },
    { key: "q3", title: "지원 종료된 항목", content: <p>...</p>, disabled: true },
  ]}
/>

// 설정 패널 - 한 번에 하나만 열림
<Accordion
  items={[
    { key: "general", title: "일반", content: <GeneralSettings /> },
    { key: "notif",   title: "알림", content: <NotificationSettings /> },
    { key: "danger",  title: "위험 구역", content: <DangerZone /> },
  ]}
/>

// 제어형 - URL 쿼리와 동기화 등
const [open, setOpen] = useState<string[]>(initialFromUrl);
<Accordion items={items} openKeys={open} onValueChange={(keys) => { setOpen(keys); syncToUrl(keys); }} />
```

---

### Prose

마크다운 등으로 렌더된 본문에 조판을 입힌다. **파서를 포함하지 않는다** — 앱이 `react-markdown` 같은 렌더러로 만든 결과를 감싸면 자손 셀렉터로 토큰 기반 타이포·간격·색이 적용된다(다크 모드 자동).

```tsx
import { Prose } from '@bigtablet/design-system';
import ReactMarkdown from 'react-markdown';

<Prose size="lg">
  <ReactMarkdown>{policy}</ReactMarkdown>
</Prose>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'md' \| 'lg'` | `'md'` | 본문 스케일 |
| `ref` | `Ref<HTMLDivElement>` | - | 루트 `div` ref (React 19 ref-as-prop) |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | - | 루트 `div` 로 전달 |

#### `size` 선택

`size` 는 **본문과 제목을 함께** 한 단계 올립니다.

| | 본문 | h1 / h2 / h3 / h4~h6 | 제목 위 여백 | 쓰는 곳 |
|---|---|---|---|---|
| `md` (기본) | 15 / 22.5 (1.5) | 24 / 20 / 18 / 16 | 20px | 공지 · FAQ · 이메일 프리뷰처럼 좁은 폭 |
| `lg` | **16 / 28 (1.75)** | 28 / 24 / 20 / 18 | 32px | 약관 · 정책처럼 페이지를 채우는 긴 본문 |

`lg` 의 행간 1.75 는 한 화면을 채우는 한국어 장문에서 줄을 놓치지 않기 위한 값입니다. 본문 스케일은 루트에 걸리므로 `p` · `li` · `blockquote` · 표 셀처럼 자기 `font-size` 가 없는 요소가 함께 커집니다. `code` 는 자기 고정폭 스케일(13px)을 유지합니다.

##### 제목 굵기와 자간

**제목은 `h1`~`h6` 전부 `700` 입니다.** `lg` 는 `md` 의 한 단계 위 믹스인을 쓰므로 자간도 스케일 램프를 따라옵니다 — bold 변형은 24px 이상에서 광학 보정으로 자간을 조입니다.

| | `md` | `lg` |
|---|---|---|
| `h1` | 24 / 700 / 32 / **-0.01em** | 28 / 700 / 36 / **-0.01em** |
| `h2` | 20 / 700 / 28 / 0 | 24 / 700 / 32 / **-0.01em** |
| `h3` | 18 / 700 / 24 / 0 | 20 / 700 / 28 / 0 |
| `h4`~`h6` | 16 / 700 / 24 / 0 | 18 / 700 / 28 / 0 |
| 본문 | 15 / 400 / 22.5 / 0 | 16 / 400 / 28 / 0 |

(크기 / 굵기 / 행간 / 자간)

자간 램프는 타이포 스케일 전체의 규칙입니다 — bold 변형만, 24px 이상에서만 조입니다 (48·40px `-0.02em` · 32px `-0.015em` · 28·24px `-0.01em` · 20px 이하 `0`). 12~14px 라벨·캡션은 반대로 `0.32px` 벌립니다.

> **v3.14.1 변경**: `h1`·`h2` 가 이전까지 본문과 같은 `400` 이었고 `h3`~`h6` 만 `700` 이라 굵기 계층이 뒤집혀 있었습니다. `h1` 이 `h3` 보다 가늘게 보였습니다. `bold` 변형으로 교체해 `h1` 은 자간도 `-0.01em` 이 됩니다(`lg` 에서는 `h2` 까지).

##### `h1` 의 밑줄

`h1` 에는 `padding-bottom: 8px` + 아래 경계선이 붙습니다. 문서 안에서 최상위 절을 나누는 장식이고, **`h1` 이 문서 제목 자체인 경우(약관·정책 페이지)에는 장식이 하나 더 붙는 셈**입니다. 그 경우 소비처에서 지웁니다.

```scss
/* 전역 SCSS (이 DS 와 같은 방식) */
.policy .prose h1 { padding-bottom: 0; border-bottom: 0; }
```

소비처가 CSS Modules(`*.module.scss`)를 쓴다면 DS 클래스는 지역화 대상이 아니므로 `:global()` 로 감쌉니다 — `.policy :global(.prose h1) { … }`.

> **v3.14 변경**: `lg` 는 이전까지 제목만 키우고 본문은 `md` 와 같은 15px 였습니다. `lg` 로 감싼 본문이 15 → 16px, 행간 1.5 → 1.75 로 커집니다. `md` 는 그대로입니다.

#### 다루는 요소

`h1`~`h6` · `p` · `ul`/`ol`/`li`(중첩 포함) · `a` · `code` · `pre` · `blockquote`(중첩 포함) · `table`/`th`/`td` · `hr` · `img` · `strong` · `em` · `del`.

#### 넓은 표·코드 블록

`table` 과 `pre` 는 페이지를 가로로 밀지 않고 **자기 안에서 스크롤**된다. 스크롤이 실제로 생기는 경우에만 `tabindex="0"` 이 붙어 키보드로도 움직일 수 있다(axe `scrollable-region-focusable`). 폭이 넉넉해져 스크롤이 사라지면 떨어진다 — 불필요한 탭 정지가 남지 않는다.

> 표를 **별도 래퍼로 감싸는 소비자**는 여백 중복을 확인하세요. `.prose table` 은 자기 아래 여백(`margin-bottom: 16px`)을 갖기 때문에, 래퍼에도 세로 여백을 두면 두 값이 더해집니다.

#### 본문 속 링크는 밑줄이 유지된다

WCAG 1.4.1(Use of Color)상 색만으로 구분하는 것도 **링크와 주변 본문의 대비가 3:1 이상이면** 허용되지만, DS 의 accent 색은 그 문턱을 넘지 못해 axe 가 `link-in-text-block` 으로 잡습니다. 밑줄은 색 대비와 무관하게 성립하므로 `text-decoration: none` 으로 덮어쓰지 마세요.

---

### Table

컬럼 정의 기반 데이터 테이블. 로딩 중에는 헤더를 유지한 채 바디만 [Skeleton](#skeleton) 행으로 대체하고, 정렬·행 선택·행 클릭을 지원한다.

> DS 는 데이터를 **직접 정렬하지 않는다**. `sortable` 헤더 클릭 시 `onSortChange` 만 발화하므로, 소비자가 정렬된 `data` 를 다시 내려줘야 한다.

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `TableColumn<T>[]` | required | 컬럼 정의 |
| `data` | `T[]` | required | 표시할 데이터 배열 |
| `keyExtractor` | `(item: T, index: number) => string \| number` | required | 행의 고유 key 추출 함수 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 테이블 크기 |
| `emptyMessage` | `ReactNode` | `'데이터가 없습니다'` | 데이터가 없을 때 표시 |
| `isLoading` | `boolean` | `false` | 로딩 상태 - 헤더 유지, 바디만 스켈레톤 |
| `skeletonRows` | `number` | `5` | 로딩 시 스켈레톤 행 개수 |
| `hoverable` | `boolean` | `true` | 행 hover 강조 |
| `stickyHeader` | `boolean` | `false` | thead sticky 고정 |
| `ariaLabel` | `string` | - | 스크린리더용 테이블 레이블 |
| `onRowClick` | `(item: T, index: number) => void` | - | 행 클릭 콜백 |
| `rowClickHint` | `string` | `'클릭 가능한 행'` | clickable 행에 `aria-describedby` 로 연결되는 동작 설명. `''` 면 힌트 미부착 |
| `sort` | `TableSort` | - | 현재 정렬 상태 (제어형). `undefined` 는 정렬 없음 |
| `onSortChange` | `(sort: TableSort \| undefined) => void` | - | 정렬 헤더 클릭 시 발화 (none→asc→desc→none 순환) |
| `selectable` | `boolean` | `false` | 행 선택(체크박스 컬럼) 활성화. `true` 면 `rowKey` **필수** |
| `rowKey` | `(row: T) => string` | - | 행 고유 key 추출 함수 (`selectable` 시 필수) |
| `selectedKeys` | `string[]` | - | 선택된 행 key 배열 (제어형) |
| `onSelectionChange` | `(keys: string[]) => void` | - | 선택 변경 콜백 |
| `selectAllAriaLabel` | `string` | `'전체 선택'` | 전체 선택 체크박스 aria-label |
| `selectRowAriaLabel` | `(index: number) => string` | ``(i) => `${i + 1}번째 행 선택` `` | 개별 행 체크박스 aria-label |
| `className` | `string` | - | 루트 wrapper 에 추가할 className |

**`TableColumn<T>`**

| 필드 | Type | Default | Description |
|------|------|---------|-------------|
| `key` | `string` | required | 컬럼 식별자. `render` 가 없으면 `item[key]` 를 자동 렌더 |
| `header` | `ReactNode` | required | thead 에 표시할 헤더 |
| `render` | `(item: T, index: number) => ReactNode` | - | 셀 렌더 함수 |
| `width` | `string` | - | CSS width 값 (예: `"120px"`, `"20%"`) |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | 정렬 |
| `sortable` | `boolean` | `false` | 정렬 가능 여부. 클릭 시 `onSortChange` 발화 |

**`TableSort`**

| 필드 | Type | Description |
|------|------|-------------|
| `key` | `string` | 정렬 중인 컬럼의 `TableColumn.key` |
| `direction` | `'asc' \| 'desc'` | 정렬 방향 |

**Usage**

```tsx
import { useMemo, useState } from "react";
import { Table, Chip } from "@bigtablet/design-system";
import type { TableColumn, TableSort } from "@bigtablet/design-system";

type User = { id: string; name: string; email: string; active: boolean };

const columns: TableColumn<User>[] = [
  { key: "name", header: "이름", sortable: true, width: "180px" },
  { key: "email", header: "이메일" },
  {
    key: "active",
    header: "상태",
    align: "center",
    render: (u) => <Chip type="static" tone={u.active ? "success" : "default"} label={u.active ? "활성" : "휴면"} />,
  },
];

function UserTable({ users, isLoading }: { users: User[]; isLoading: boolean }) {
  const [sort, setSort] = useState<TableSort | undefined>();
  const [selected, setSelected] = useState<string[]>([]);

  // 정렬은 소비자 책임 - DS 는 상태만 알려준다
  const rows = useMemo(() => (sort ? sortBy(users, sort) : users), [users, sort]);

  return (
    <Table
      ariaLabel="사용자 목록"
      columns={columns}
      data={rows}
      keyExtractor={(u) => u.id}
      isLoading={isLoading}
      stickyHeader
      sort={sort}
      onSortChange={setSort}
      selectable
      rowKey={(u) => u.id}
      selectedKeys={selected}
      onSelectionChange={setSelected}
      onRowClick={(u) => router.push(`/users/${u.id}`)}
      rowClickHint="선택하면 상세 화면으로 이동"
    />
  );
}
```

#### 접근성

- 정렬 헤더는 `<button>` 이고 현재 상태가 `aria-sort` 로 노출된다.
- `onRowClick` 이 있는 행에는 `rowClickHint` 가 `aria-describedby` 로 연결된다. `<tr>` 에 `aria-label` / `role="button"` 을 쓰면 셀 데이터를 스크린리더가 못 읽으므로 의도적으로 `aria-describedby` 를 쓴다.
- 선택 체크박스는 [Checkbox](#checkbox) 를 사용하며 `selectAllAriaLabel` / `selectRowAriaLabel` 로 레이블을 커스터마이즈한다.

---

### Icon

[lucide-react](https://lucide.dev/icons/) 아이콘 래퍼. `aria-label` 이 없으면 `aria-hidden` + `focusable={false}` 를 자동 적용해 스크린리더 노이즈를 막는다.

```tsx
import { Icon } from '@bigtablet/design-system';
import { Search, X } from 'lucide-react';

// 장식용 - aria-hidden 자동
<Icon icon={Search} size={20} />

// 의미 있는 아이콘 - aria-label 을 주면 aria-hidden 이 붙지 않음
<Icon icon={X} size={16} strokeWidth={2.5} aria-label="닫기" />

// 토큰 사이즈와 함께
import { iconSize } from '@bigtablet/design-system';
<Icon icon={Search} size={iconSize.md} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `LucideIcon` | required | lucide-react 아이콘 컴포넌트 |
| `size` | `number \| string` | `24` (lucide 기본) | 아이콘 크기 (px). `iconSize` 토큰 사용 권장 |
| `strokeWidth` | `number \| string` | `2` (lucide 기본) | 선 두께 |
| `color` | `string` | `currentColor` | 색상 |

> 나머지 `LucideProps`(= SVG 속성)는 그대로 전달된다 (`ref` 제외). `iconSize` 토큰: `xs` 14 · `sm` 16 · `md` 18 · `lg` 20 · `xl` 32.

---

## Layout

페이지 레이아웃을 구성하는 4가지 프리미티브. 모두 토큰 기반의 일관된 spacing/breakpoint(compact 600 · expanded 840 · large 1200)를 사용합니다.

#### 4개 레이아웃 프리미티브의 역할 분담

| 프리미티브 | 책임 | 핵심 prop | 사용 영역 |
|-----------|------|----------|----------|
| **Container** | 수평 정렬 - max-width 제한 + 반응형 좌우 패딩 | `size` | 페이지 가로 폭 제한 (마케팅·블로그·서비스 페이지의 outer wrapper) |
| **Section** | 수직 리듬 - 위아래 padding + 배경색 변경 | `spacing`, `bg` | 페이지를 의미 단위로 분할 (히어로 · 기능 소개 · CTA 등 `<section>` 블록) |
| **Stack** | 1D 흐름 - flex 축 정렬·간격 | `direction`, `gap`, `align`, `justify` | 카드 내부 · 폼 줄 · 헤더 (한 줄 또는 한 열) |
| **Grid** | 2D 격자 - 고정/오토 열 수, 행·열 gap | `cols`, `gap`, `minColWidth` | 카드 리스트 · 통계 패널 · 갤러리 |

규칙: **Section은 절대 Container 없이 단독으로 쓰지 않는다.** Section은 수직 여백과 배경만 담당하고, 가로 폭 제한은 Container의 책임이다. Stack과 Grid는 그 안쪽에서 자식 정렬을 담당한다.

```
Section (수직 패딩 + 배경)
└── Container (max-width + 좌우 패딩)
    └── Stack (한 열 또는 한 줄)
        └── Grid (카드 격자)
            └── Card / MediaCard …
```

### Container

max-width 제한 + 반응형 수평 패딩을 가진 컨테이너. 마케팅/서비스 페이지의 기본 wrapper.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 페이지/섹션의 가로 폭을 제한하고 좌우 정렬 | ✅ Container |
| 수직 spacing이나 배경색 변경 필요 | ❌ Section을 한 단계 위에 |
| Hero 같은 풀-블리드(full-bleed) 배경이 필요 | `Section bg="navy"` + 내부에 `Container` |
| 블로그 본문(읽기 좋은 폭) | `size="md"` (768px) |

#### size 선택 가이드

| size | max-width | 용도 |
|------|-----------|------|
| `sm` | 640px | 좁은 폼·온보딩 카드 |
| `md` | 768px | 블로그 본문·아티클·읽기 최적화 |
| `lg` | 1024px | 일반 서비스 페이지 |
| `xl` | 1200px (기본) | 마케팅 페이지·대시보드 |
| `full` | 100% | 풀-블리드 (좌우 패딩은 유지) |

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'xl'` | max-width (sm=640 / md=768 / lg=1024 / xl=1200 / full=100%) |
| `center` | `boolean` | `true` | 가운데 정렬 (`margin-inline: auto`) |
| `as` | `ElementType` | `'div'` | 렌더링할 태그 |

#### 반응형 동작

좌우 패딩은 뷰포트 폭에 따라 자동 증가합니다 (max-width와 무관, 모든 size에서 동일).

| 브레이크포인트 | padding-inline |
|---------------|----------------|
| `< 600px` (compact) | 16px |
| `≥ 600px` (medium↑) | 24px |
| `≥ 840px` (expanded↑) | 32px |
| `≥ 1200px` (large↑) | 40px |

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

마케팅 페이지의 섹션 단위. 수직 여백 + 배경색 variants. 기본적으로 `<section>` 시멘틱 태그로 렌더링됩니다.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 페이지를 의미 블록으로 분할 (히어로 · 기능 · 후기 · CTA) | ✅ Section |
| 가로 폭 제한만 필요 | ❌ Container 단독 |
| 카드 안의 작은 영역 구분 | ❌ Stack 또는 Divider |
| 풀-블리드 배경색이 필요한 영역 | ✅ Section + 내부 Container |

#### spacing 선택 가이드

| spacing | 데스크탑 padding-block | 용도 |
|---------|----------------------|------|
| `xs` | 32px | 콜아웃·작은 알림 블록 |
| `sm` | 48px | 좁은 정보 섹션 |
| `md` (기본) | 64px | 일반 콘텐츠 섹션 |
| `lg` | 96px | 메인 기능 소개·히어로 |
| `xl` | 128px | 시그니처 CTA·강조 블록 |

#### bg 선택 가이드

| bg | 색상 토큰 | 용도 |
|----|----------|------|
| `default` | `color_bg_solid` | 기본 흰 배경 |
| `dim` | `color_bg_solid_dim` | 인접 섹션과 시각적 대비 (Zebra 패턴) |
| `accent` | `color_accent_subtle` | 부드러운 강조 (테스티모니얼 등) |
| `navy` | `color_accent_default` | 강한 강조 - 자동으로 텍스트 색 흰색 적용 |
| `transparent` | 없음 | 상위 배경 그대로 노출 |

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `spacing` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 수직 패딩 (반응형 - 아래 표 참고) |
| `bg` | `'default' \| 'dim' \| 'accent' \| 'navy' \| 'transparent'` | `'default'` | 배경색 변형 |
| `as` | `ElementType` | `'section'` | 렌더링할 태그 |

#### 반응형 동작

`xs`/`sm`은 고정값, `md`/`lg`/`xl`은 뷰포트가 커질수록 단계적으로 증가합니다 (모바일 답답함 방지).

| spacing | < 600px | ≥ 600px | ≥ 840px | ≥ 1200px |
|---------|---------|---------|---------|----------|
| `xs` | 32px | 32px | 32px | 32px |
| `sm` | 48px | 48px | 48px | 48px |
| `md` | 40px | 48px | 64px | 64px |
| `lg` | 48px | 64px | 96px | 96px |
| `xl` | 64px | 96px | 128px | 128px |

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

Flex 기반 1D 레이아웃. 수직(column) 또는 수평(row) 스택 + 간격/정렬 제어. 한 줄 또는 한 열로 흐를 때 사용합니다.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 한 줄/한 열로 흐르는 아이템 (아바타+이름, 헤더, 폼 줄) | ✅ Stack |
| 2D 격자 (m열 × n행) | ❌ Grid |
| 가로폭 제한 | ❌ Container |
| `<div style={{ display: 'flex' }}>` 직접 작성 | ❌ Stack으로 일관성 유지 |

#### gap 선택 가이드

토큰 spacing 스케일과 동일합니다 (px 단위).

| 영역 | 권장 gap |
|------|---------|
| 인라인 라벨 그룹 (아이콘+텍스트) | `4`-`8` |
| 폼 필드 줄 내부 | `8`-`12` |
| 카드 내부 컨텐츠 | `12`-`16` |
| 카드 간 수직 간격 | `16`-`24` |
| 섹션 내부 큰 블록 | `24`-`32` |
| 페이지 큰 영역 분리 | `40`-`48` |

#### direction / align / justify

- `direction="vertical"` (기본) - `flex-direction: column`. align은 가로 정렬, justify는 세로 정렬을 의미합니다.
- `direction="horizontal"` - `flex-direction: row`. align은 세로 정렬, justify는 가로 정렬.
- `align="stretch"`는 자식이 교차축을 꽉 채우게 합니다 (동일 높이 카드 줄에 유용).
- `justify="between"`은 좌우 끝 정렬 패턴 (헤더의 제목 ↔ 버튼).

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `'vertical' \| 'horizontal'` | `'vertical'` | flex 방향 |
| `gap` | `0 \| 2 \| 4 \| 8 \| 12 \| 16 \| 20 \| 24 \| 32 \| 40 \| 48` | `16` | 아이템 간격 (px) - CSS 변수 `--stack-gap`으로 주입 |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch'` | - | 교차축 정렬 (`align-items`) |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | - | 주축 정렬 (`justify-content`) |
| `wrap` | `'nowrap' \| 'wrap' \| 'wrap-reverse'` | - | `flex-wrap` |
| `as` | `ElementType` | `'div'` | 렌더링할 태그 |

#### 반응형 동작

Stack 자체는 미디어 쿼리를 가지지 않습니다 - flex의 자연스러운 동작에 의존합니다. 모바일에서 한 줄이 좁아지면 `wrap="wrap"`을 함께 지정하거나, 부모에서 `direction` 자체를 바꾸세요 (예: 데스크탑 horizontal → 모바일 vertical은 별도 CSS로 처리).

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

CSS Grid 기반 2D 레이아웃. 고정 열 수 또는 `auto-fill` 반응형 그리드. 카드 리스트나 통계 패널 등 격자 정렬이 필요할 때 사용합니다.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 같은 너비의 카드 격자 (m열 × n행) | ✅ Grid |
| 컨테이너 폭에 따라 열 수가 자동으로 변하는 카드 리스트 | ✅ `Grid cols="auto"` |
| 한 줄/한 열만 흐름 | ❌ Stack |
| 복잡한 다단 (named areas, span 다양) | ❌ 직접 CSS Grid 작성 |

#### cols 선택 가이드

| cols | 용도 |
|------|------|
| `1` | 모바일/좁은 사이드 영역 |
| `2` | 비교 카드·통계 페어 |
| `3` (기본) | 기능 소개·MediaCard 카드 리스트 |
| `4` | 콤팩트 카드·통계 패널 |
| `5`/`6` | 작은 아이콘 그리드·로고 월 |
| `"auto"` | 카드 개수가 가변이거나 컨테이너 폭에 따라 자동 조정이 필요할 때 - `minColWidth`로 최소 열 너비 지정 |

#### gap / rowGap / colGap

- `gap`은 행/열 모두에 적용됩니다.
- `rowGap` 또는 `colGap`을 명시하면 `gap`을 그 축에서만 override합니다 (예: 카드 그리드에서 열 간격은 좁히고 행 간격은 넓힐 때).

**Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cols` | `1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 'auto'` | `3` | 열 수. `'auto'`=`repeat(auto-fill, minmax(minColWidth, 1fr))` |
| `minColWidth` | `string` | `'280px'` | `cols="auto"`일 때 최소 열 너비 |
| `gap` | `0 \| 4 \| 8 \| 12 \| 16 \| 20 \| 24 \| 32 \| 40 \| 48` | `24` | 아이템 간격 (px) |
| `rowGap` | 위와 동일 | - | 행 간격 (gap을 override) |
| `colGap` | 위와 동일 | - | 열 간격 (gap을 override) |
| `singleColOnMobile` | `boolean` | `true` | 모바일(< 600px, compact)에서 강제 1열 |
| `as` | `ElementType` | `'div'` | 렌더링할 태그 |

#### 반응형 동작

- **`singleColOnMobile={true}` (기본)** - 600px 미만에서 `grid-template-columns: 1fr`로 강제 1열. `cols={4}`라도 모바일에선 세로로 한 줄씩 쌓입니다.
- **`singleColOnMobile={false}`** - 모바일에서도 지정한 열 수 유지 (작은 아이콘 그리드 등 좁은 셀이 의도된 경우).
- **`cols="auto"`** - `singleColOnMobile`과 무관하게 `minmax(minColWidth, 1fr)`가 알아서 줄을 바꿉니다. 폭이 `minColWidth × 2 + gap`보다 좁아지면 자동 1열.

값들은 모두 CSS 커스텀 프로퍼티(`--grid-cols`, `--grid-gap`, `--grid-row-gap`, `--grid-col-gap`)로 주입되어 외부 SCSS에서 override할 수 있습니다.

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

---

### Layout 합성 예제 (마케팅 페이지)

4개의 프리미티브를 합쳐 전형적인 마케팅 랜딩 페이지를 구성하는 패턴.

```tsx
import { Section, Container, Stack, Grid, Button, Hero, MediaCard } from "@bigtablet/design-system";

export function LandingPage() {
  return (
    <>
      {/* 1. Hero - 풀-블리드 navy 배경 */}
      <Section spacing="xl" bg="navy">
        <Container size="xl">
          <Stack gap={24} align="center">
            <h1>가장 빠른 결제 솔루션</h1>
            <p>3분 안에 결제 시스템을 구축하세요.</p>
            <Stack direction="horizontal" gap={12}>
              <Button variant="filled">시작하기</Button>
              <Button variant="outline">데모 보기</Button>
            </Stack>
          </Stack>
        </Container>
      </Section>

      {/* 2. Features - 흰 배경 + 3열 카드 그리드 */}
      <Section spacing="lg" bg="default">
        <Container size="xl">
          <Stack gap={48}>
            <Stack gap={8} align="center">
              <h2>주요 기능</h2>
              <p>모든 비즈니스 규모에 맞춰 확장됩니다.</p>
            </Stack>
            <Grid cols={3} gap={24}>
              <MediaCard {...feature1} />
              <MediaCard {...feature2} />
              <MediaCard {...feature3} />
            </Grid>
          </Stack>
        </Container>
      </Section>

      {/* 3. Stats - dim 배경으로 시각적 대비 */}
      <Section spacing="md" bg="dim">
        <Container size="lg">
          <Grid cols={4} gap={16} singleColOnMobile={false}>
            <Stat label="처리 건수" value="1.2B+" />
            <Stat label="가맹점" value="50K+" />
            <Stat label="국가" value="42" />
            <Stat label="가동률" value="99.99%" />
          </Grid>
        </Container>
      </Section>

      {/* 4. CTA - accent 배경 */}
      <Section spacing="xl" bg="accent">
        <Container size="md">
          <Stack gap={24} align="center">
            <h2>지금 시작하세요</h2>
            <Button variant="filled">무료로 시작하기</Button>
          </Stack>
        </Container>
      </Section>
    </>
  );
}
```

**핵심 패턴**
- 모든 Section은 내부에 Container를 둠 (가로 폭 제한 책임 분리).
- Section 간 `bg`를 교차로(`default` ↔ `dim` ↔ `navy` ↔ `accent`) 변경해 페이지 리듬을 만듦.
- 같은 Section 안에서도 Stack을 중첩해 헤더-본문 간 spacing을 조정.
- 카드 격자는 Grid, 그 외 한 줄/한 열 흐름은 Stack.
