# Migration Guide

Bigtablet Design System 마이그레이션 가이드. 컨슈머 프로젝트(coupon, homepage-web, homepage-admin, insight-monorepo-web, cafe-monorepo-web)별 영향과 작업을 정리.

---

## v3.0 — 컨셉 기반 컴포넌트 재구성

### 한 줄 요약

**검정 brand + navy accent + dark mode + 11개 신규 primitives + 4개 layout 컴포넌트.**  
CSS Custom Properties 기반 dark mode 토큰, `ThemeProvider`, `Container/Section/Stack/Grid` layout layer 추가.

### Breaking changes

#### 0. Tag 컴포넌트 폐기 → Chip `type="static"` 흡수

`Tag`는 Chip / Badge label과 시각적 중복이라 폐기. 대신 **Chip에 `type="static"` + `tone` prop** 추가.

```diff
- import { Tag } from "@bigtablet/design-system";
+ import { Chip } from "@bigtablet/design-system";

- <Tag variant="accent">Featured</Tag>
+ <Chip type="static" tone="accent" label="Featured" />

- <Tag variant="success" onRemove={fn}>Active</Tag>
+ <Chip type="static" tone="success" label="Active" removable onRemove={fn} />
```

`tone`: `default` | `accent` | `info` | `success` | `warning` | `error`  
`size`: `sm` (24px) | (기본) (32px). `static`은 pill 형태, `color-mix`로 dark mode 자동 대응.

#### 1. Dark mode 토큰 시스템 (CSS Custom Properties)

기존 SCSS 변수가 CSS custom properties로 컴파일됨. 기존 코드는 **그대로 작동**하지만:

```scss
// before: 빌드타임 고정값
$color_bg_solid → #FFFFFF (항상)

// after: CSS var — 다크 모드에서 자동 전환
$color_bg_solid → var(--bt-color-bg-solid) → dark에서 #1F2630
```

**주의:** 컨슈머 SCSS에서 `$color_bg_solid`를 `color.mix()`, `color.adjust()` 등 **SCSS 색상 함수에 넣으면 빌드 에러** 발생. CSS var는 SCSS 함수가 처리 불가.

```scss
// ❌ 빌드 에러
background: color.mix($color_bg_solid, black, 50%);

// ✅ CSS native color-mix 사용
background: color-mix(in srgb, var(--bt-color-bg-solid) 50%, black);

// ✅ 또는 base 토큰 직접 사용 (dark mode 반응 안 함)
background: color.mix($color_base_neutral_0, black, 50%);
```

#### 2. select/style.scss `color.mix` → CSS `color-mix`

컨슈머가 DS의 select 스타일을 override하고 있다면 상위 특이도 클래스 체크 필요.

### 신규 컴포넌트

#### Dark Mode

```tsx
import { ThemeProvider, useTheme } from "@bigtablet/design-system";

// 앱 최상단 wrap
<ThemeProvider mode="system">
  <App />
</ThemeProvider>

// 테마 토글
const { mode, resolvedTheme, setMode } = useTheme();
setMode("dark");
```

`mode`: `"light"` | `"dark"` | `"system"` (prefers-color-scheme 자동 감지)

Storybook toolbar에서 ☀️ / 🌙 / 🖥 토글로 라이브 전환 가능.

#### Navigation (P0)

```tsx
import { Tabs, TabList, Tab, TabPanel } from "@bigtablet/design-system";
import { NavBar, NavLink } from "@bigtablet/design-system";
import { Sidebar, SidebarItem, SidebarSection } from "@bigtablet/design-system";

// Tabs — active underline navy
<Tabs defaultValue="overview">
  <TabList>
    <Tab value="overview">개요</Tab>
    <Tab value="orders">주문</Tab>
  </TabList>
  <TabPanel value="overview">...</TabPanel>
  <TabPanel value="orders">...</TabPanel>
</Tabs>

// NavBar — B2C 상단 네비
<NavBar variant="default" logo={<Logo />}>
  <NavLink href="/features">기능</NavLink>
  <NavLink href="/pricing" active>요금제</NavLink>
</NavBar>

// Sidebar — admin navy 사이드바
<Sidebar>
  <SidebarSection label="관리">
    <SidebarItem icon={<HomeIcon />} active>대시보드</SidebarItem>
    <SidebarItem icon={<OrderIcon />}>주문</SidebarItem>
  </SidebarSection>
</Sidebar>
```

**대체 가능한 컨슈머 구현:**
- `homepage-admin` 자체 Sidebar → DS `<Sidebar>` 교체 권장
- `homepage-admin` 자체 Tabs → DS `<Tabs>` 교체 권장

#### Content Primitives (P1)

```tsx
import { Avatar, Badge, Tag, Breadcrumb } from "@bigtablet/design-system";

<Avatar src="/user.jpg" name="박상민" size="md" />
<Avatar name="Sangmin Park" size="lg" /> {/* initials "SP" */}

<Badge shape="count" variant="danger">12</Badge>
<Badge shape="dot" variant="navy" />
<Badge shape="label" variant="navy">New</Badge>

<Tag variant="navy">카테고리</Tag>
<Tag variant="default" removable onRemove={() => {}}>태그</Tag>

<Breadcrumb items={[
  { label: "홈", href: "/" },
  { label: "주문", href: "/orders" },
  { label: "주문 #1234" }, // 마지막 = 현재 페이지
]} />
```

#### Interaction (P2)

```tsx
import { Tooltip, Menu, EmptyState, Accordion } from "@bigtablet/design-system";

<Tooltip content="설명 텍스트" placement="top">
  <button>Hover me</button>
</Tooltip>

<Menu
  trigger={<IconButton icon="more-vertical" />}
  items={[
    { key: "edit", label: "편집" },
    { key: "delete", label: "삭제", variant: "danger" },
  ]}
/>

<EmptyState
  illustration={<InboxIcon size={64} />}
  title="받은 메일 없음"
  description="새 메일이 오면 여기에 표시됩니다."
  action={<Button>새 메일 작성</Button>}
/>

<Accordion items={faqItems} multiple />
```

#### Layout Primitives (Phase 4)

```tsx
import { Container, Section, Stack, Grid } from "@bigtablet/design-system";

// 페이지 레이아웃
<Section spacing="lg" bg="dim">
  <Container size="xl">
    <h2>기능 소개</h2>
    <Grid cols="auto" minColWidth="280px" gap={24}>
      {features.map(f => <FeatureCard key={f.id} {...f} />)}
    </Grid>
  </Container>
</Section>

// 인라인 레이아웃
<Stack direction="horizontal" gap={12} align="center">
  <Avatar name="박상민" size="sm" />
  <span>박상민</span>
  <Badge shape="count" variant="danger">3</Badge>
</Stack>
```

| 컴포넌트 | 설명 | 주요 Props |
|----------|------|-----------|
| `Container` | max-width + 반응형 padding | `size`: sm/md/lg/xl/full |
| `Section` | 마케팅 섹션 단위 | `spacing`: xs~xl, `bg`: default/dim/accent/navy |
| `Stack` | Flex 1D 레이아웃 | `direction`, `gap`, `align`, `justify`, `wrap` |
| `Grid` | CSS Grid 2D 레이아웃 | `cols`: 1~6/"auto", `gap`, `minColWidth` |

### 컨슈머별 권장 작업

#### bigtablet-homepage-web
- `ThemeProvider` 최상단 추가 (system mode 권장)
- 자체 navy `#47555E` 하드코딩 → `var(--bt-color-accent-default)` 교체
- 마케팅 페이지: `Section + Container + Grid` layout으로 통일
- 자체 Hero navy overlay → DS Hero `overlay="navy"` 활용

#### bigtablet-homepage-admin
- Sidebar 자체 구현 → DS `<Sidebar>` 교체
- Tabs 자체 구현 → DS `<Tabs>` 교체
- SCSS `color.mix($color_bg_solid, ...)` 있다면 `color-mix(in srgb, ...)` 로 수정

#### bigtablet-insight-monorepo-web
- `ThemeProvider mode="system"` 추가
- `shared/ui/table` → DS `<Table>` 교체 (이미 v2.5 가이드에서 권장)

#### bigtablet-coupon-web / bigtablet-cafe-monorepo-web
- DS 버전 업그레이드 후 dark mode 지원만으로 즉시 혜택

---

## v2.5 (이전 PR)

### 한 줄 요약

데스크탑 웹에 맞게 폼 컨트롤 사이즈 정렬 + 반응형 자동 bump + 모션/하드코딩/Skeleton/Table 추가.

### Breaking changes

#### 1. 폼 컨트롤 사이즈 정렬 (가장 큰 영향)

모든 폼 컨트롤이 단일 스케일로 정렬됨:

| 컴포넌트 | sm 데스크탑 | md 데스크탑 | lg 데스크탑 |
|----------|------------|------------|------------|
| Button | 32 (was 36) | 40 (변경 없음) | **48 (신규)** |
| TextField | 40 (변경 없음) | **40 (was 52)** | **48 (was 64)** |
| Select | 40 (변경 없음) | **40 (was 52)** | **48 (was 64)** |
| Dropdown | 40 (변경 없음) | **40 (was 56)** | **48 (was 56)** |

모바일(<600px)에선 자동으로 한 단계 키워짐 (compact → comfortable → spacious).

**영향:**
- `<TextField>` (size 미지정 = md) 모든 사용처가 12px 줄어듦
- `<Dropdown size="md">` 16px 줄어듦
- `<Dropdown size="lg">` 8px 줄어듦
- `<TextField size="lg">`, `<Select size="lg">` 16px 줄어듦
- 폼 레이아웃 시각적 라인이 Button과 정렬됨 (이게 목적)

**작업:**
- 폼 페이지 시각 회귀 검토 — 폼이 답답하지 않은지, 라벨 간격이 적절한지
- 64+ "hero" 사이즈가 필요한 경우 후속 PR에서 `size="xl"` 신설 요청

#### 2. Button 사이즈 prop 확장

```diff
- type ButtonSize = "sm" | "md" | "xl";
+ type ButtonSize = "sm" | "md" | "lg" | "xl";
```

`xl(56)` 유지하지만 신규 컴포넌트엔 `lg(48)` 권장.

#### 3. Modal 마운트 동작

`open=false`로 전환 시 즉시 unmount → 0.12s exit 애니메이션 후 unmount. DOM 잠시 남음. 외부에서 ref로 `display: none` 체크하는 코드 영향 받을 수 있음.

#### 4. Toast 진입/퇴출 timing

비대칭 (in 0.3s expo / out 0.26s ease-in) → 모션 토큰으로 정렬 (in `enterBase` 0.2s / out `exitBase` 0.15s).

### 신규 컴포넌트

#### `<Skeleton>`

```tsx
import { Skeleton } from "@bigtablet/design-system";

<Skeleton variant="text" width="60%" />
<Skeleton variant="title" />
<Skeleton variant="avatar" width={48} />
<Skeleton variant="rect" height={120} />
```

variants: `text` / `title` / `avatar` / `rect`. 컨슈머 자체 Skeleton 구현 대체 가능.

#### `<Table>`

```tsx
import { Table, type TableColumn } from "@bigtablet/design-system";

interface User { id: number; name: string; }

const columns: TableColumn<User>[] = [
  { key: "name", header: "이름" },
  { key: "actions", header: "관리", render: (u) => <button>편집</button> },
];

<Table<User>
  columns={columns}
  data={users}
  keyExtractor={(u) => u.id}
  isLoading={isLoading}
  size="md"
  onRowClick={(u) => router.push(`/users/${u.id}`)}
/>
```

기능: 제네릭 타입, `isLoading` 시 헤더 유지 + skeleton 행, `size` (sm/md/lg), `stickyHeader`, `onRowClick`, `emptyMessage`, `aria-label`.

**대체 가능한 컨슈머 구현:**
- `bigtablet-insight-monorepo-web/apps/admin/src/shared/ui/table` → DS Table로 마이그레이션 권장
- `bigtablet-homepage-admin` 의 자체 HTML table → 점진 교체

### 신규 토큰

#### Motion (진입/퇴출 페어)

```scss
@use "src/styles/token" as token;

// 새 토큰
token.$transition_enter_fast  // 0.15s cubic-bezier(0.16, 1, 0.3, 1)
token.$transition_enter_base  // 0.2s
token.$transition_exit_fast   // 0.12s cubic-bezier(0.4, 0, 1, 1)
token.$transition_exit_base   // 0.15s

token.$easing_enter  // expo out (감속 진입)
token.$easing_exit   // ease-in (가속 퇴출)
```

#### Tap target / Density

```scss
token.$tap_target_dense        // 32px
token.$tap_target_compact      // 40px
token.$tap_target_comfortable  // 48px
token.$tap_target_spacious     // 56px

@include token.responsive_height(token.$tap_target_compact);
// → 데스크탑 40, compact breakpoint(<600px)에서 자동 48로
```

#### Typography

```scss
token.$letter_spacing_tight  // 0.32px (폼 라벨)
```

#### Border width

```scss
token.$border_width_thick  // 2px (OTP, 강조 입력)
```

---

## 컨슈머별 권장 작업

### bigtablet-coupon-web (v2.4.2)
- DS 버전 2.5로 업그레이드
- `size="sm"` 사용처는 영향 거의 없음 (sm은 변경 작음)

### bigtablet-homepage-web (v1.22.0)
- **여러 메이저 버전 점프** — 1.22 → 2.5
- 변경 큰 영역: Button/TextField/Select/Dropdown 사이즈, 모션, Modal 마운트
- 시각 회귀 검토 필수 (Chromatic 또는 수동)

### bigtablet-homepage-admin (v2.4.4)
- DS 버전 2.5로 업그레이드
- 자체 HTML table → `<Table>` 컴포넌트로 점진 교체 권장
- 자체 `@media (max-width: 960px)` → `@include token.medium` mixin으로 통일 검토

### bigtablet-insight-monorepo-web (catalog)
- catalog 버전 갱신
- `shared/ui/table` → DS Table로 교체 (API 거의 동일, props 매핑만)
- `shared/ui/table-skeleton` → DS Table의 `isLoading` prop으로 대체

### bigtablet-cafe-monorepo-web (catalog)
- DS Button만 사용 — 영향 작음
- 자체 SCSS의 컬러 하드코딩 정리 시 DS 토큰 사용 권장

### bigtablet-insight-app (Flutter)
- 별도 Flutter 디자인 시스템 운영 (웹 DS와 분리)
- 토큰 동기화는 현 시점 범위 외
