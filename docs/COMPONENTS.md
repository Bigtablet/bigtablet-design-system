# Components

React 컴포넌트별로 언제 쓰는지, 예제, 알아 둘 것, 구현 계약을 적은 문서입니다.

> **props 표는 여기 없습니다.** 소스 타입에서 생성하는 [문서 사이트](https://bigtablet.github.io/bigtablet-design-system/#/components)의 각 컴포넌트 페이지(원본 `site/props.json`)와 패키지 안 `dist/llms` 에서 봅니다. 손으로 쓴 표는 prop 을 추가할 때마다 한 벌 더 고쳐야 해서 걷어 냈습니다 (#1118).

---

## 목차

- [비슷한 컴포넌트 고르기](#비슷한-컴포넌트-고르기)
- [prop 이름 기준](#prop-이름-기준)
- [v3.0 주요 변경사항](#v30-주요-변경사항)
- [Foundation](#foundation)
  - [LocaleProvider](#localeprovider)
  - [ThemeProvider](#themeprovider)
- [General](#general)
  - [Button](#button)
  - [IconButton](#iconbutton)
  - [CopyButton](#copybutton)
  - [useClipboard / copyText](#useclipboard--copytext)
- [Form](#form)
  - [Dropdown](#dropdown)
  - [Combobox](#combobox)
  - [문장 속 링크](#문장-속-링크-text_link)
  - [Field / Form](#field--form)
  - [FilterBar](#filterbar)
  - [TextField](#textfield)
  - [TagInput](#taginput)
  - [Textarea](#textarea)
  - [Checkbox](#checkbox)
  - [Radio](#radio)
  - [RadioGroup](#radiogroup)
  - [SegmentedControl](#segmentedcontrol)
  - [Switch](#switch)
  - [DatePicker](#datepicker)
  - [DateCalendar](#datecalendar)
  - [DateRangePicker](#daterangepicker)
  - [TimePicker](#timepicker)
  - [FileInput](#fileinput)
  - [ImageCropper](#imagecropper)
  - [OtpInput](#otpinput)
- [Feedback](#feedback)
  - [Alert](#alert)
  - [Toast](#toast)
  - [InlineAlert](#inlinealert)
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
  - [Stepper](#stepper)
- [Overlay](#overlay)
  - [Modal](#modal)
  - [Drawer](#drawer)
  - [Tooltip](#tooltip)
  - [Menu](#menu)
  - [Popover](#popover)
- [Display](#display)
  - [Card](#card)
  - [Stat](#stat)
  - [DescriptionList](#descriptionlist)
  - [Timeline](#timeline)
  - [Divider](#divider)
  - [ListItem](#listitem)
  - [Avatar](#avatar)
  - [Badge](#badge)
  - [Chip](#chip)
  - [Hero](#hero)
  - [MediaCard](#mediacard)
  - [EmptyState](#emptystate)
  - [ErrorState](#errorstate)
  - [Accordion](#accordion)
  - [Prose](#prose)
  - [Table](#table)
  - [DataView](#dataview)
  - [Icon](#icon)
- [Layout](#layout)
  - [AppShell](#appshell)
  - [PageHeader](#pageheader)
  - [Container](#container)
  - [Section](#section)
  - [Stack](#stack)
  - [Grid](#grid)
  - [Layout 합성 예제 (마케팅 페이지)](#layout-합성-예제-마케팅-페이지)
- [Hooks · 유틸](#hooks--유틸)

---

> **모든 컴포넌트는 `dangerouslySetInnerHTML` 을 받지 않습니다** (v3.25.0~). 마크업은 `children` 으로 넘깁니다. 새 컴포넌트는 props 를 `SafeHTMLProps<React.*HTMLAttributes<…>>` 로 선언하고, `src/utils/safe-html.type-test.tsx` 가 공개 export 전체를 `tsc` 로 검사합니다.

---

## 비슷한 컴포넌트 고르기

자주 헷갈리는 묶음은 문서 사이트의 각 컴포넌트 페이지 "언제 쓰는가" 표에서 비교합니다.

| 고민 | 비교표 |
|------|------|
| Badge · Chip · TagInput | [문서 사이트](https://bigtablet.github.io/bigtablet-design-system/#/badge) |
| Spinner · Skeleton · LinearProgress · TopLoading | [문서 사이트](https://bigtablet.github.io/bigtablet-design-system/#/spinner) |
| Alert · InlineAlert · Toast | [문서 사이트](https://bigtablet.github.io/bigtablet-design-system/#/alert) |
| DatePicker · DateRangePicker · TimePicker | [문서 사이트](https://bigtablet.github.io/bigtablet-design-system/#/date-picker) |
| Checkbox · Radio · RadioGroup · Switch · SegmentedControl | [문서 사이트](https://bigtablet.github.io/bigtablet-design-system/#/radio-group) |
| FileInput · ImageCropper | [문서 사이트](https://bigtablet.github.io/bigtablet-design-system/#/file-input) |
| Sidebar · NavBar · BottomNav | [문서 사이트](https://bigtablet.github.io/bigtablet-design-system/#/sidebar) |
| Menu · Popover · Tooltip | [문서 사이트](https://bigtablet.github.io/bigtablet-design-system/#/popover) |

Modal · Button · TextField · Table · Dropdown 은 이 문서 각 섹션의 "언제 쓰는가" 표를 봅니다.

---

## prop 이름 기준

| 고르는 것 | prop | 예 |
|------|------|------|
| 모양 | `variant` | Button·IconButton `text`/`outline`, Card `glass`/`outline` - 같은 모양은 같은 값 이름 |
| 의미 색 (info·success·warning·error 등) | `tone` | Alert · Badge · Toast · Chip · InlineAlert - 회색 기본은 `neutral` |
| 변경 콜백 | `on*Change` | `onValueChange` · `onCheckedChange` · `onPageChange` |

Alert · Badge · Toast 는 4.1.0 에서 의미 색 prop 이 `variant` → `tone` 으로 바뀌었습니다. 렌더되는 클래스명(`.badge_variant_*`, `.alert_variant_*`)은 그대로입니다.

**문구 줄바꿈** — Toast `message`, Alert `message`, Modal `description`, InlineAlert · MediaCard `children`, EmptyState · ErrorState · PageHeader `description`, Hero `subtitle`, TextField · Textarea · FileInput · OtpInput `supportingText` 는 (문자열일 때) 두 문장 이상이면 문장마다 `.sentences_item`(`inline-block`)으로 묶어 줄이 문장 사이에서 먼저 끊깁니다. 마침표 · 물음표 · 느낌표로 끝나는 어절에서 나누고, 숫자 바로 뒤 마침표(`2026. 5. 21.`)는 날짜라 넘깁니다. 한 문장짜리는 마크업이 그대로이고, 문장 사이 공백이 남아 낭독 내용도 같습니다. 글을 담는 컴포넌트는 루트에 `wrap_keep_all` 이 걸려 어절 중간에서 끊기지 않습니다. 두 문장 이상이면 문장 안에서 `~의` 꾸밈말 · 관형사(이 · 그 · 모든 · 첫 …)와 다음 어절(최대 3어절)을 `.sentences_phrase` 로 묶어 "이 아래의 / 컴포넌트에서" 처럼 꾸밈 관계 사이에서 줄이 갈리지 않습니다.

앱이 직접 그리는 문단도 같은 규칙으로 나누려면 `Sentences` 를 씁니다. 규칙을 앱에 따로 두면 한쪽만 고쳐 화면마다 줄바꿈이 갈립니다. 띄어쓰기 없는 언어(ja · zh)는 나누지 않고 원문 그대로 둡니다.

```tsx
import { Sentences, sentenceText } from "@bigtablet/design-system";

<p><Sentences text="결제 수단이 비활성화되었습니다. 새 결제 수단을 등록하세요." /></p>

// 테스트 - 문장이 span 으로 나뉘면 getByText("전체 문장") 은 못 찾는다
screen.getByText(sentenceText("결제 수단이 비활성화되었습니다. 새 결제 수단을 등록하세요."));
```

줄바꿈 규칙만 따로 쓰려면 하위 경로 `@bigtablet/design-system/text` 에서 가져옵니다. 루트의 `Sentences` · `sentenceText` 와 같은 것이고, React 없이 쓰는 순수 함수도 있습니다.

| export | 하는 일 |
|------|------|
| `splitSentences(text)` | 문장마다 원문 범위(`text` · `start` · `end`). React 없음 |
| `phraseRanges(text)` | 붙여 둘 어절 묶음의 원문 범위(`start` · `end`). React 없음 |
| `renderSentences(text)` · `renderPhrases(text)` | 위 규칙으로 span 을 넣은 React 노드 |
| `Sentences` · `sentenceText` | 루트 export 와 같음 |
| `BalancedText` | 실제 폭을 재서 가장 자연스러운 자리에서 줄을 바꾸는 글 - 제목 · 히어로 · 짧은 소개 문구용 (아래) |
| `BalancedTextScript` · `balancedTextScript` | SSR 앱에서 하이드레이션 전에 서버 HTML 의 줄을 고르는 인라인 스크립트(컴포넌트 · 문자열) (아래) |
| `chooseBreaks(text, measure, maxWidth)` · `createCanvasMeasurer(font)` | `BalancedText` 의 엔진. React 없음 - 글자만 있으면 canvas 로 재서 다른 렌더러에서도 씁니다. 고르는 기준(아래 벌점 값)은 minor 에서 바뀔 수 있습니다 |

```ts
import { phraseRanges } from "@bigtablet/design-system/text";

phraseRanges("이 아래의 컴포넌트에서 부릅니다"); // [{ start: 0, end: 12 }]
```

`BalancedText` 는 브라우저가 그린 줄과 어절 폭을 화면에서 읽고, 같은 줄 수 안에서 끊는 자리가 더 자연스러운 배치가 있으면 그것으로 바꿉니다. 화면에서 재므로 코드 · 굵게 · 링크가 섞여도 폭이 맞습니다. 끊는 자리 벌점은 다음과 같습니다.

| 자리 | 벌점 |
|------|------|
| 문장 끝 | 0 |
| 쉼표 · 쌍점 뒤 | 1 |
| 보통 | 4 |
| 꾸미는 말 + 명사("붙이는 순서") · 복합명사("서버 템플릿") | 6 |
| 나열(`·`) 항목 사이 | 8 |
| 나열 항목 안("Esc 닫기") | 10 |
| 문장 마지막 어절만 다음 줄로("패키지에 / 싣습니다.") | 12 |
| 공백 없이 붙은 괄호 앞뒤 | 50 |
| 괄호 안 | 60 |
| 붙여 둘 자리(`~의` · 관형사 · 서술어 · 의존명사), `·` 로 시작하는 줄, 영문 · 따옴표 · 괄호 뒤 띄어 쓴 조사("prop 을", `"복사" 로`) | 100 |

- 첫 렌더(SSR 포함)는 원문 그대로입니다(`text-wrap: pretty` - 마지막 줄에 짧은 어절이 혼자 남지 않게). SSR 앱은 아래 `BalancedTextScript` 를 두면 하이드레이션 전에도 같은 줄로 보입니다. 폭이 바뀌는 동안은 브라우저 줄바꿈으로 돌아갔다가 멈추면(100ms) 다시 고릅니다
- 고른 줄은 `<br>` 이 아니라 줄마다 `white-space: nowrap` 묶음으로 그립니다 - 복사한 글 · `textContent` · 페이지 검색(Ctrl+F)이 원문과 같습니다. 계산할 때 1px 여유를 둬 넘치지 않습니다
- 폭이 내용으로 정해지는 상자(`table-layout: auto` 표의 칸 등)에서는 nowrap 줄이 열을 넓혀 버려, 그런 상자임을 알아채면 줄을 `inline-block` 으로 바꿔 그립니다 - 이때는 그 문단 안에서 줄 경계를 건너는 페이지 검색이 되지 않습니다. 열 폭을 정해 두면(`table-layout: fixed`) nowrap 으로 그립니다
- 첫 렌더 뒤 그리기 전(`useLayoutEffect`)에 계산하고, 웹폰트를 받는 중이면 기다렸다 한 번만 고릅니다
- 요소(`<code>` · `<a>` · `<strong>`) 하나는 쪼개지 않는 한 조각입니다. 여러 어절을 굵게 하려면 어절마다 `<strong>` 으로 나눠야 그 사이에서 줄을 바꿀 수 있습니다
- 수십 어절까지를 위한 계산이라 긴 본문에는 쓰지 않습니다. 긴 본문은 `Sentences` · `renderSentences` 를 씁니다
- 꾸미는 말 · 복합명사는 사전 없이 끝 글자로 짐작합니다 - "사이" · "화면" 처럼 조사로 흔히 쓰이는 글자로 끝나는 명사는 놓칩니다

```tsx
import { BalancedText } from "@bigtablet/design-system/text";

<BalancedText as="h1" className="hero_title">
  고객의 신뢰를 먼저 얻은 다음에 더 많은 데이터를 요청하세요
</BalancedText>

<BalancedText as="p">
  마크업 없이 <code>useConfirm</code> 훅으로 띄웁니다.
</BalancedText>
```

#### SSR - `BalancedTextScript`

서버는 화면 폭을 몰라 서버 HTML 은 브라우저 줄바꿈입니다. `BalancedTextScript` 를 `<body>` 끝(BalancedText 들 뒤)에 한 번 두면, JS 를 받기 전에 서버 HTML 에서 같은 함수로 줄을 고르고 하이드레이션 뒤 `BalancedText` 가 그 줄을 그대로 넘겨받습니다. 클라이언트에서만 그리는 앱(CSR)에는 필요 없습니다.

```tsx
// app/layout.tsx (Next App Router)
import { BalancedTextScript } from "@bigtablet/design-system/text";

<body>
  {children}
  <BalancedTextScript nonce={nonce} />
</body>
```

- React 가 그린 DOM 은 건드리지 않고 `<style>` 규칙만 넣습니다 - 하이드레이션이 어긋나지 않습니다
- 칠하기 전에만 고릅니다. 글꼴을 아직 받는 중이면(첫 방문) 손대지 않고 하이드레이션이 고릅니다 - 이미 칠한 어절을 옮기면 레이아웃 이동(CLS)으로 잡히기 때문입니다. 본문 웹폰트를 `<link rel="preload">` 로 받아 두면 첫 방문에도 맞을 때가 많습니다
- 스크립트 뒤에 오는 글(스트리밍으로 늦게 오는 부분) · `:nth-child(n of S)` 를 모르는 브라우저(Chrome 111 · Firefox 113 미만)는 하이드레이션 때 한 번 바뀝니다
- 하이드레이션 전에 창 폭이 바뀌면 규칙을 걷어 브라우저 줄바꿈으로 둡니다
- CSP 를 쓰면 `nonce` 를 넘깁니다. React 없이 HTML 에 넣을 때는 `balancedTextScript` 문자열을 `<script>` 안에 그대로 씁니다

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
import { Chip } from '@bigtablet/design-system';

<Chip type="static" tone="success" label="활성" />
<Chip type="static" tone="warning" label="검토 중" />
```

자세한 내용은 [Chip](#chip) 섹션을 참고하세요.

### TextField 라벨 패턴 변경 (fieldset+legend → standalone)

내부 마크업이 `<fieldset>` + `<legend>` 구조에서 standalone `<label htmlFor>` 구조로 단순화되었습니다.
공개 API(props)는 동일하므로 호출부 수정은 필요하지 않지만, 커스텀 SCSS로 내부 셀렉터를 오버라이드한 경우 점검이 필요합니다.

---

## Foundation

### LocaleProvider

DS 가 **스스로 렌더하는 문구**를 한곳에서 정합니다. 소비자가 넘기지 않은 문구가 82개 있습니다 —
`Modal` 의 닫기 버튼, `Table` 의 빈 목록, `Pagination` 의 이전/다음, `TagInput` 의 라이브 영역
안내 등. 지금까지는 인스턴스마다 prop 을 넘겨야 했고, `Modal` 을 40번 쓰는 앱이면 `closeLabel`
을 40번 적어야 했습니다 — 하나 빠지면 그 화면만 한국어로 남습니다.

```tsx
import { LocaleProvider } from '@bigtablet/design-system';

// 영어 화면
<LocaleProvider locale="en">
  <App />
</LocaleProvider>

// 한 줄만 바꾸기 (기준 카탈로그 위에 병합)
<LocaleProvider messages={{ "table.empty": "등록된 담당자가 없습니다" }}>
  <App />
</LocaleProvider>
```

**우선순위** — 인스턴스 prop > `messages` > `locale` 카탈로그 > 한국어 기본. Provider 를 감싸지
않으면 한국어라 기존 화면은 바뀌지 않습니다.

```tsx
<LocaleProvider locale="en">
  <Modal closeLabel="Dismiss" … />   {/* prop 이 이긴다 */}
</LocaleProvider>
```

**훅**

| 훅 | 반환 | 용도 |
|----|------|------|
| `useLocaleText()` | `(key, vars?) => string` | 문구 조회. `{name}` 자리표시자를 `vars` 로 채웁니다 |
| `useLocaleName()` | `'ko' \| 'en'` | 소비자가 날짜·숫자 포맷을 맞출 때 |

`ko` · `en` 카탈로그와 `LocaleMessages` 타입도 export 합니다 — 소비자가 자기 언어 카탈로그를 만들 때
키 목록을 타입으로 받습니다.

```tsx
import { ko, type LocaleMessages } from "@bigtablet/design-system";

const ja: LocaleMessages = { ...ko, "modal.close": "閉じる" /* … */ };
```

> 채우지 못한 자리표시자는 `{index}` 처럼 **그대로 남습니다**. 조용히 빈 칸이 되면 화면에서 무엇이
> 빠졌는지 알 수 없습니다.

### ThemeProvider

Bigtablet DS의 테마 컨텍스트를 제공합니다. `data-theme` attribute를 root element에 적용해서 CSS 변수 레이어를 전환합니다.

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

글자가 있는 버튼입니다. `href` 를 주거나 `as="a"` · `as={Link}` 로 링크로도 렌더합니다.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 저장 · 제출 · 다음 같은 동작 (글자가 보임) | ✅ Button |
| 다른 화면으로 이동하는 버튼 모양 링크 | ✅ Button `href` / `as={Link}` |
| 아이콘만 있는 동작 (닫기, 더보기, 툴바) | ❌ [IconButton](#iconbutton) |
| 값을 클립보드에 복사 | ❌ [CopyButton](#copybutton) |
| 문장 안의 링크 | ❌ [문장 속 링크](#문장-속-링크-text_link) |

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

**`as` 는 어떤 요소·컴포넌트든 받습니다.** 리터럴 유니온(`'button' | 'a'`)이었을 때는 Next.js
`Link` 를 넘길 수 없어, 소비자가 DS 를 우회해 자기 버튼을 만들었습니다.

```tsx
import Link from "next/link";

<Button as={Link} href="/orders">주문 보기</Button>
```

`as` 에 준 요소의 props 가 타입에 그대로 따라옵니다 — `as="a"` 면 `target`·`rel`, `as={Link}` 면
`Link` 의 props.

**`disabled` 는 `<button>` 에만 native 로 줍니다.** anchor 와 커스텀 컴포넌트에는 native `disabled`
가 없어 그냥 넘기면 조용히 무시되고 비활성 버튼이 눌립니다 — 그쪽은 `aria-disabled` +
`tabIndex={-1}` + 클릭 차단으로 막습니다. `as="button"` 과 `href` 를 함께 주면 href 는 버려집니다
(`<button href>` 는 유효하지 않습니다).

> `ButtonProps` 는 `ButtonProps<T>` 제네릭입니다. `ButtonProps` 그대로 쓰면 `T = "button"` 입니다.

---

### IconButton

```tsx
import { IconButton } from '@bigtablet/design-system';
import { Settings } from 'lucide-react';

// Variants
<IconButton variant="text" icon={<Settings />} aria-label="설정" />
<IconButton variant="filled" icon={<Settings />} aria-label="설정" />
<IconButton variant="tonal" icon={<Settings />} aria-label="설정" />
<IconButton variant="outline" icon={<Settings />} aria-label="설정" />

// Sizes
<IconButton size="sm" icon={<Settings />} aria-label="설정" />
<IconButton size="md" icon={<Settings />} aria-label="설정" />
```

> ⚠️ **접근성 이름은 타입 레벨에서 필수입니다.** `icon` 은 항상 `aria-hidden="true"` span 으로 감싸지므로, `aria-label` / `aria-labelledby` 중 하나를 주지 않으면 버튼에 접근성 이름이 전혀 없습니다 (WCAG 2.1 SC 4.1.2 Name, Role, Value). `IconButtonProps` 는 이를 강제하는 `IconButtonWithAriaLabel | IconButtonWithAriaLabelledBy` union 이라 `<IconButton icon={<X />} />` 는 **컴파일되지 않습니다**.
>
> ```tsx
> // ❌ 타입 에러 - 접근성 이름 없음
> <IconButton icon={<X />} />
> // ✅
> <IconButton icon={<X />} aria-label="닫기" />
> <IconButton icon={<X />} aria-labelledby="dialog-title" />
> ```

---

### CopyButton

텍스트 복사 버튼. 복사되면 2초간 체크 아이콘 · 성공 색 · "복사됨" 으로 바뀌고, 실패하면 X 아이콘 · 오류 색으로 바뀝니다. 결과는 숨긴 `role="status"` 로 스크린리더에도 알립니다. 단추 폭은 "복사" · "복사됨" 중 긴 쪽으로 고정돼 문구가 바뀌어도 흔들리지 않습니다. 버튼 없이 복사만 필요하면 [`useClipboard`](#useclipboard--copytext) 를 씁니다.

#### 접근성 - 복사됨 알림

- 결과는 버튼 옆 **숨긴 `role="status"`** 가 알립니다 ("복사됨" / "복사하지 못했습니다"). 화면에는 아이콘 · 문구 변화로 충분합니다
- 버튼 이름(`label`)은 **바꾸지 않습니다** - 문구 버튼도 보이는 문구만 "복사됨" 으로 바뀝니다. 포커스 중인 버튼의 이름이 바뀌면 status 와 함께 두 번 읽힙니다. 보이는 문구가 이름을 포함하므로(복사 → 복사됨) WCAG 2.5.3 Label in Name 도 지킵니다
- **한 화면에 여러 개**(표의 줄마다 등)면 모두 "복사" 로 들려 구분되지 않습니다 - `aria-label` 로 무엇을 복사하는지 담습니다. 보이는 문구를 이름 안에 넣어 Label in Name 을 지킵니다 (`aria-label="192.168.10.1 주소 복사"` + 보이는 "복사")
- 함수 `text` 가 throw 하면 실패로 처리합니다 - "복사하지 못했습니다" 알림 + `onError`
- `id` · `title` · `data-*` · `aria-describedby` · `ref` 등 `<button>` 속성은 그대로 전달됩니다
- Toast 를 함께 띄우면 같은 문구를 두 번 듣게 됩니다 - 다른 문구("초대 링크를 복사했습니다")로 맥락을 더하거나 하나만 씁니다

### useClipboard / copyText

```tsx
import { useClipboard, copyText } from "@bigtablet/design-system";

const { copy, status, error, reset } = useClipboard({
  resetAfter: 2000,
  onCopy: (text) => toast.success("복사했습니다"),   // 시도마다 - 선택
  onError: (e) => toast.error("복사하지 못했습니다"),
});
// status: "idle" | "copying" | "copied" | "error"
const ok = await copy(orderNo);   // throw 하지 않는다 - 성공 여부만 돌려준다

await copyText(orderNo);          // 상태 없이 한 번 - 실패하면 reject
```

- Clipboard API(보안 컨텍스트)를 먼저 쓰고, 없거나 거부되면 `execCommand("copy")` 로 폴백합니다 - 인앱 브라우저 · HTTP 사내망. 폴백은 임시 textarea 를 쓰고 **사용자의 선택 영역과 포커스를 되돌립니다**
- 둘 다 실패하면 원래 오류(`NotAllowedError` 등)를 `error` 로 줍니다
- 성공 · 실패 반응은 `onCopy` · `onError` 옵션으로 - **시도마다** 불립니다. `status`·`error` 를 effect 로 지켜보면 같은 오류가 연달아 날 때 값이 같아 두 번째를 놓칩니다
- 연속 클릭하면 마지막 복사만 상태에 반영하고 되돌림 타이머를 새로 시작합니다. 언마운트하면 타이머를 지우고 이후 결과를 무시합니다
- SSR 에서 `navigator` · `document` 가 없어도 import 만으로는 아무것도 하지 않습니다

**Usage**

```tsx
// 문구 버튼 + Toast
<CopyButton text={inviteUrl} label="초대 링크 복사" onCopy={() => toast.success("초대 링크를 복사했습니다")} />

// 아이콘만
<code>{maskedKey}</code>
<CopyButton text={apiKey} iconOnly label="API 키 복사" />

// 표의 줄마다 - 보이는 글자는 "복사", 이름은 줄마다 다르게
<CopyButton text={row.ip} variant="text" aria-label={`${row.ip} 주소 복사`} />
```

---

## Form

### Dropdown

정해진 목록에서 하나(또는 `multiple` 로 여럿)를 고르는 선택 입력입니다. `searchable` 로 목록 안을 검색할 수 있습니다.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 이미 가진 옵션 목록에서 고르기 (수십 개까지, 많으면 `searchable`) | ✅ Dropdown |
| 후보가 서버에 있어 검색해야 나옴 (담당자 · 회사 · 상품) | ❌ [Combobox](#combobox) |
| 2~5개를 한눈에 보이게 두고 전환 (보기 방식, 기간) | ❌ [SegmentedControl](#segmentedcontrol) |
| 옵션마다 설명이 길어 펼쳐 보여야 함 | ❌ [RadioGroup](#radiogroup) |

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

#### 알아 둘 것

- **목록은 `body` 에 포탈로 렌더됩니다.** 카드 · 표처럼 `overflow: hidden` 인 부모 안에서도 잘리지 않습니다. 대신 `.my-card .dropdown_list` 처럼 트리거 기준 선택자로는 스타일이 걸리지 않으니 `.dropdown_list` 클래스만으로 선택합니다. `Combobox` · `Menu` · `Popover` · `Tooltip` 도 같습니다
- 목록 폭은 트리거 폭 이상, 내용 폭까지 넓어집니다. 높이는 최대 300px 이고 화면에 남은 공간에 맞춰 줄며, 아래가 모자라면 위로 엽니다
- 트리거가 스크롤로 화면 밖에 나가면 목록이 닫힙니다 (`Popover` 만 예외 - 안의 폼 입력이 사라지지 않게 열린 채 남습니다)
- Modal 안에서도 Tab 으로 포커스가 모달을 벗어나지 않습니다 - Tab 을 누르면 목록이 닫히고 트리거로 돌아갑니다
- 테스트에서 `searchable` 을 열면 트리거와 검색 입력 둘 다 `role="combobox"` 라, `getByRole("combobox", { name: … })` 로 이름을 주어 가릅니다

<details>
<summary>구현 계약 (포탈 · 폭 · 높이 · 접근성 이름)</summary>

> **목록은 포탈로 `body` 에 렌더됩니다.** 트리거 옆에 `position: absolute` 로 두면
> `overflow: hidden` 인 조상(카드·표 래퍼)이 잘라내고 `z-index` 로는 넘지 못합니다 - 실측으로
> 카드 안에서 170px 목록 중 46px 만 보였습니다(#586). 좌표는 트리거를 재서 인라인으로 주고,
> 스크롤·리사이즈에 따라갑니다. 뷰포트 아래가 모자라면 위로 뒤집습니다.
>
> **폭은 `clamp(트리거 폭, 내용 폭, 뷰포트 가용 폭)`.** 트리거 폭은 하한이라 목록이 트리거보다
> 좁아지지 않고, 그보다 넓은 라벨이 있으면 내용만큼 넓어집니다 - 폭을 트리거로 못박았을 때
> 48px 컨트롤에서 `02` 가 `0.` 로 접혔습니다(#596). 포탈이라 넓어져도 주변 레이아웃을 밀지 않습니다.
> 검색 행(`searchable`)은 폭 계산에서 빠집니다 - `<input>` 의 기본 내재 폭이 목록을 필요 이상으로
> 벌립니다. `Combobox` 도 같은 계약입니다.
>
> **트리거는 `role="combobox"`.** WAI-ARIA 작성 가이드(APG)의 select-only combobox 패턴입니다 - `aria-haspopup="listbox"` +
> `aria-expanded` + 열렸을 때의 `aria-controls`·`aria-activedescendant`. `button` role 로는
> `aria-required` 를 붙일 수 없어 `Field` 의 필수 여부가 보조기술에 닿지 않았습니다(#632).
>
> **이름은 `라벨 + 현재 값`.** `combobox` 는 `button` 과 달리 내용으로 이름이 붙지 않아, 값을
> `aria-labelledby` 로 직접 가리킵니다 - 안 그러면 "2024" 를 골라도 계속 "년" 으로만 읽힙니다.
> 라벨이 없으면 값만 이름이 됩니다(`button` 이던 때와 같습니다).
>
> `searchable` 을 열면 패널의 검색 입력도 `combobox` 라 둘이 됩니다 - 테스트에서는 이름으로
> 가릅니다. 활성 옵션 추적(`aria-activedescendant`)은 그때 입력 쪽이 갖습니다.
>
> **높이는 `min(300px, 배치 방향에 남은 공간)`.** 낮은 뷰포트에서는 목록이 남은 공간까지만
> 자라고 그 안에서 스크롤합니다 - 상한이 없던 3.19.1 까지는 뷰포트 461px 에서 목록이 130px
> 넘쳤습니다(#621). 위아래 어느 쪽도 목록이 다 들어가지 않으면 **공간이 더 넓은 쪽**으로 열립니다.
> 검색 행은 줄지 않고 옵션 목록만 줄어듭니다. `Combobox`·`Menu`·`Popover`·`Tooltip` 도 같은
> 높이 계약입니다.
>
> **트리거가 화면 밖으로 스크롤되면 닫습니다.** 가리킬 대상 없이 떠 있는 목록은 어느 컨트롤의
> 것인지 읽히지 않습니다(#624). 트리거가 조금이라도 보이는 동안에는 열려 있습니다. 포커스가 패널
> 안(검색 입력)에 있었으면 트리거로 되돌리되 화면을 되감지는 않습니다(`preventScroll`).
> `Combobox`·`Menu`·`Tooltip` 도 같습니다. **`Popover` 만 예외로 열린 채 남습니다** - 안에 폼을 담을
> 수 있어 스크롤로 닫으면 입력이 사라집니다.
>
> 소비자 영향: `.dropdown_list` 를 트리거 기준 선택자(`.my-card .dropdown_list`)로 스타일링하면
> 더 이상 걸리지 않습니다 - 클래스만으로 선택해야 합니다. `Combobox`·`Menu` 도 같은 처리입니다.
>
> **Modal 안에서**: 포탈된 팝업은 모달 패널 서브트리 밖이라 `useFocusTrap` 의 Tab 경계에
> 들어가지 않습니다. 대신 세 팝업 모두 **Tab 에서 트리거로 포커스를 되돌리고 닫습니다** - 이어지는
> 기본 Tab 이동이 모달 안에서 시작하므로 포커스가 모달을 벗어나지 않습니다. `Popover`·`Tooltip`
> 도 같은 포탈 패턴입니다.

</details>

---

### Combobox

후보를 **서버에서** 가져오는 선택 입력. `Dropdown` 도 `searchable` 로 타이핑 검색을 지원하지만
이미 받아 둔 옵션 배열 안에서만 거릅니다 — 담당자·회사·상품처럼 후보가 수백 개인 필드는 그 목록을
통째로 내려받을 수 없습니다.

```tsx
import { Combobox } from '@bigtablet/design-system';

<Combobox
  value={owner}
  onValueChange={setOwner}
  onSearch={(q) => api.searchUsers(q)}   // Promise<ComboboxOption[]>
  emptyMessage="일치하는 담당자가 없습니다"
/>
```

비동기에서 갈리는 네 가지를 DS 가 처리합니다.

- **디바운스** — 타이핑마다 요청하지 않습니다
- **로딩 표시** — 조회 중 스피너
- **응답 경합 차단** — 늦게 도착한 이전 쿼리의 결과가 최신 목록을 덮지 않습니다. 타이핑이 빠르면 순서가 뒤집히고, 그러면 방금 친 글자와 무관한 후보가 남습니다
- **"검색 전" 과 "결과 없음" 구분** — 같은 문구로 묶으면 검색 전 빈 목록이 실패처럼 읽힙니다
- **고르지 않고 닫으면 검색어를 버립니다** — 남기면 닫힌 동안은 선택 라벨이 가려 주다가 다시 여는 순간 예전 검색어가 되살아나고, 같은 조회가 또 나갑니다. 다시 열면 빈 검색어에 `defaultOptions`

`Dropdown` 과 언제 갈리나 — 옵션을 이미 다 갖고 있으면 `Dropdown`(+`searchable`), 서버에서 가져와야
하면 `Combobox`.

> 팝업의 거동(개폐·활성 항목·키보드·바깥 클릭·열림 방향)은 `useListboxPopup` 을 `Dropdown` 과
> 공유합니다. 소비자도 이 훅으로 자기 목록 팝업을 만들 수 있습니다.

> **스크롤은 네이티브입니다.** DS 는 커스텀 스크롤 컴포넌트(ScrollArea 류)를 두지 않습니다 — 네이티브
> 스크롤바를 감추면 키보드 스크롤·iOS 관성·오버스크롤·`scrollIntoView`·가상 키보드 대응을 전부
> JS 로 다시 만들어야 하고, 얻는 것은 스크롤바 모양 하나입니다. 모양은 `scrollbar-width`/
> `scrollbar-color`(표준 CSS)로 얇게·브랜드색으로 맞춥니다. 스크롤 컨테이너를 직접 만드는
> 소비자는 `@include token.scrollable;` 을 쓰면 같은 모양이 됩니다.
>
> 방향키로 옮긴 활성 항목은 `Dropdown`·`Combobox` 가 따라 스크롤합니다(`block: "nearest"` — 필요한
> 만큼만 움직이고 페이지는 건드리지 않습니다). 포커스는 트리거·입력에 남으므로(APG 권장 패턴) 브라우저가
> 알아서 해 주지 않습니다.

### 문장 속 링크 (`.text_link`)

`Prose` 는 마크다운 렌더 결과에만 조판을 입힙니다. 그 밖의 UI 텍스트 — 체크박스 라벨의 약관 링크,
`EmptyState` 설명 안의 도움말 링크 — 안에 링크를 넣을 자리가 없어 화면마다 색·밑줄을 손으로
정하고 있었습니다. `.text_link` 가 그 규칙을 소유합니다.

```tsx
<a href="/terms" className="text_link">이용약관</a>

// 라우터 링크에도 그대로 붙는다
<Link href="/terms" className="text_link">이용약관</Link>
```

| | 값 | 이유 |
|---|-----|------|
| 색 | `--bt-color-accent-default` | `Prose a` 와 같은 값. 본문 링크와 UI 링크가 갈리면 사용자가 어포던스를 두 벌 배웁니다 |
| 밑줄 | 항상 | WCAG 1.4.1 — 색만으로 구분하려면 주변 본문과 3:1 이 필요한데 accent 는 넘지 못합니다 (axe `link-in-text-block`) |
| 포커스 | `--bt-focus-ring` + `radius_xs` | |

컴포넌트가 아니라 클래스인 이유는 라우터 링크(`next/link`, `react-router`)에 그대로 붙이기
위해서입니다. 컴포넌트로 만들면 `as` 다형성을 먼저 풀어야 합니다.

> `style.css` 에 포함됩니다. SCSS 를 직접 쓰는 곳에서는 `@include token.inline_link` 로 같은 값을 씁니다.

### Field / Form

`Field` 가 라벨·필수 표시·도움말·에러와 그 접근성 연결을 소유합니다. 입력 11종은 이 셋을 서로 다르게
갖고 있어(라벨 9종, 에러 5종) 폼 화면이 입력 밖에 문구를 직접 그려 왔습니다. `Field` 를 쓰면 어떤 입력을
넣어도 라벨 위치·간격·에러 문구·`aria-describedby` 가 같아집니다.

입력의 기존 prop 은 그대로 살아 있습니다. **`Field` 없이 쓰면 지금과 동일하게 동작합니다.**

#### 언제 `Field` 를 쓰고 언제 입력의 prop 을 쓰나

`Field` 가 감싸는 입력 11종 중 9종은 `TextField` 처럼 자체 `label`·`supportingText` 를 가집니다. 둘은 대체재가 아니라 쓰임이 다릅니다.

| 상황 | 쓸 것 |
|------|-------|
| 폼 화면 — 필드가 여럿, 서버 에러 배분, 필드 간 간격이 균일해야 함 | **`Field`.** 입력에는 `label`·`supportingText`·`error` 를 주지 않습니다 |
| 단독 입력 — 검색창, 설정 행, 테이블 필터 | **입력의 자체 prop.** `Field` 로 감싸지 않습니다 |

`Field` 가 파는 것은 `TextField` 하나에 대한 이득이 아니라 **입력 11종 사이의 균일성**입니다. `Dropdown`·`DatePicker`·`Switch` 는 에러를 표시할 수단이 아예 없어, 한 폼에 세로로 놓으면 라벨 위치와 에러 문구 자리가 갈립니다.

```tsx
import { Button, Dropdown, Field, Form, TextField } from '@bigtablet/design-system';

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

`Field` 안에서는 입력에 `label` 을 주지 않습니다 — 라벨이 두 번 보입니다.

**입력하면서 검증할 때** - `Field` 의 `error` 에 메시지를 넘깁니다. `Form` 의 `errors[name]` 보다 우선하므로 서버 에러와 함께 써도 됩니다. 에러가 있으면 `help` 대신 보이고 입력에 `aria-invalid` 가 붙습니다. 입력(`TextField`)의 `error` 는 `boolean` 이라 `Field` 안에서는 주지 않습니다.

```tsx
import { useState } from "react";
import { Field, TextField } from "@bigtablet/design-system";

const [email, setEmail] = useState("");
const [touched, setTouched] = useState(false);
const emailError = touched && !email.includes("@") ? "이메일 형식이 아닙니다" : undefined;

<Field name="email" label="이메일" required error={emailError}>
  <TextField value={email} onValueChange={setEmail} onBlur={() => setTouched(true)} />
</Field>
```

`DatePicker` · `TimePicker` · `DateRangePicker` · `RadioGroup` 처럼 안에 컨트롤이 여럿인 입력도 그대로 `Field` 로 감싸면 됩니다 - 라벨 · 설명 · 필수 연결은 컴포넌트가 알아서 나눕니다.

<details>
<summary>복합 컨트롤이 라벨을 어떻게 나누는지 (구현 메모)</summary>

복합 컨트롤은 `Field` 의 id 와 라벨 · 설명 연결을 자기 묶음 요소(`role="group"` · `role="radiogroup"`)에서만 받고 안쪽 컨트롤에는 물려주지 않습니다. 물려주면 id 하나를 여럿이 나눠 써서 `<label for>` 가 전부 첫 번째 컨트롤을 가리킵니다 (#629 · #757). 안쪽 컨트롤은 각자의 id 와 라벨을 씁니다.

필수 여부만 예외로 안쪽 `Dropdown` 마다 `required` 로 내려갑니다 - `role="group"` 은 `aria-required` 를 허용하지 않기 때문입니다. `radiogroup` 은 허용하므로 그룹에 붙습니다.

</details>

라벨과 같은 줄에 토글·링크 버튼이 필요하면 `labelAction` 슬롯에 넣습니다. `<label>` **밖**에 렌더되므로
라벨 클릭(입력 포커스)과 조작 요소 클릭이 겹치지 않고, `Field` 의 context 밖이라 그 요소는 자기
`aria-label` 을 그대로 유지합니다.

슬롯 높이는 **라벨 한 줄**로 고정돼 있습니다. 조작 요소가 그보다 높으면(Switch `sm` 24px vs 라벨 18px)
위아래로 넘치게 두고 라벨 줄은 자라지 않습니다 — 자라게 두면 아래 입력이 내려가 같은 그리드 행의
`labelAction` 없는 칸과 어긋납니다.

```tsx
const [noAffiliation, setNoAffiliation] = useState(false);

<Field
  name="companyName"
  label="소속"
  required
  labelAction={
    <Switch ariaLabel="소속 없음" size="sm" checked={noAffiliation} onCheckedChange={setNoAffiliation} />
  }
>
  <TextField disabled={noAffiliation} />
</Field>
```

#### Field

#### Form

#### Form.Actions

> 폼 라이브러리에 의존하지 않습니다. react-hook-form 등은 `errors` 맵을 만들어 넘기는 어댑터 한 겹으로 붙입니다.

> **`required` 가 닿는 자리는 컨트롤이지 묶음이 아닙니다.** 화면의 `*` 는 `aria-hidden` 이라
> 보조기술에는 `aria-required` 만 들립니다. 그런데 `role="group"` 은 그 속성을 허용하지 않아
> (axe `aria-allowed-attr`) 묶음 입력 — `DatePicker`·`DateRangePicker`·`TimePicker`·`OtpInput` —
> 은 **안쪽 컨트롤마다** 필수 여부를 붙입니다. 연·월·일 세 목록, 여섯 자리 입력 모두가 필수이므로
> 읽히는 내용도 사실과 맞습니다. `FileInput` 은 네이티브 `<input type="file">` 이라 `aria-required`
> 대신 `required` 를 씁니다(폼 제출 검증까지 함께 붙습니다). `Switch` 는 `role="switch"` 가
> `checkbox` 의 하위 role 이라 `aria-required` 를 그대로 받습니다.
>
> 개별 `Radio` 는 대상이 아닙니다 — 필수는 `RadioGroup`(`role="radiogroup"`)이 담당합니다.
> `ImageCropper` 는 값에 해당하는 컨트롤이 없어(뷰포트는 조작 표면, 슬라이더는 확대율) 붙일
> 자리가 없습니다.

---

### FilterBar

목록 화면 상단의 필터 묶음. 필드는 반응형 grid 로 배치됩니다. 기본 `submitMode="submit"` 에서는 `<form role="search">` 의 <kbd>Enter</kbd> 와 검색 버튼으로 적용하고, `submitMode="instant"` 에서는 각 필드 변경 핸들러가 즉시 적용하며 검색 버튼을 렌더링하지 않습니다. **필터 상태를 갖지 않습니다** - 입력 중인 값(draft)과 적용된 값(query), URL 동기화는 소비자가 가집니다.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 필드 여러 개 + 검색/초기화 버튼 (관리자 목록) | ✅ FilterBar |
| 드롭다운 여러 개 + 선택 즉시 적용 (검색 버튼 없음) | ✅ FilterBar `submitMode="instant"` |
| 검색창 하나뿐 (입력 즉시 거름) | ❌ [DataView](#dataview) `toolbar.search` |
| 짧은 옵션 하나만 바로 바꿈 (상태 탭 같은 필터) | ❌ [SegmentedControl](#segmentedcontrol) 단독 |

#### 레이아웃

- 필드: `repeat(auto-fill, minmax(fieldMinWidth, 1fr))` grid. 버튼은 마지막 줄 오른쪽 끝, 입력 칸 아랫변에 맞춥니다
- 좁은 화면(< 600px): 버튼이 필드 아래 전폭 한 줄로 내려갑니다
- 앱에서 바꾸려면 `fieldMinWidth` 또는 `className` 으로 `.filter_bar_fields` 의 `grid-template-columns` 를 덮습니다

**Usage**

```tsx
import { FilterBar, TextField, Dropdown } from "@bigtablet/design-system";

const EMPTY = { name: "", status: null as string | null };
const [draft, setDraft] = useState(EMPTY);   // 입력 중
const [query, setQuery] = useState(EMPTY);   // 적용됨 - 목록 요청에 쓴다

<FilterBar
  aria-label="회원 필터"
  onSubmit={() => setQuery(draft)}
  onReset={() => { setDraft(EMPTY); setQuery(EMPTY); }}
  canReset={draft.name !== "" || draft.status !== null}
  isLoading={isFetching}
>
  <TextField label="이름" value={draft.name} onValueChange={(name) => setDraft({ ...draft, name })} />
  <Dropdown label="상태" placeholder="전체" options={STATUS} value={draft.status}
    onValueChange={(status) => setDraft({ ...draft, status })} />
</FilterBar>

// DataView 와 함께 - toolbar.filters 에 그대로 넣는다
<DataView query={query} columns={columns} rowKey={rowKey} toolbar={{ filters: <FilterBar onSubmit={search}>...</FilterBar> }} />

// 드롭다운 변경 즉시 적용 - 검색 버튼 없음
<FilterBar submitMode="instant" onReset={() => setStatus(null)} canReset={status !== null}>
  <Dropdown label="상태" options={STATUS} value={status} onValueChange={setStatus} />
</FilterBar>
```

---

### TextField

한 줄 텍스트 입력입니다.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 이름 · 이메일 · 검색어 같은 한 줄 입력 | ✅ TextField |
| 여러 줄 (메모, 설명) | ❌ [Textarea](#textarea) |
| 정해진 목록에서 고르기 | ❌ [Dropdown](#dropdown) · 목록이 서버에 있으면 [Combobox](#combobox) |
| 여러 개를 칩으로 입력 (태그, 이메일 여러 개) | ❌ [TagInput](#taginput) |
| 인증 코드처럼 칸이 나뉜 입력 | ❌ [OtpInput](#otpinput) |
| 폼 화면 (라벨 · 에러 · 간격을 한 규칙으로) | TextField 를 [Field](#field--form) 로 감쌉니다 |

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

// 비밀번호 표시/숨기기 - 내장 토글 (문구는 LocaleProvider 카탈로그, prop 으로 덮어씀)
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

> **`error` vs `success` 우선순위**: 둘 다 `true` 면 `error` 가 이깁니다. 검증 실패를 성공처럼 칠하면 사용자가 잘못된 값을 그대로 제출하게 되기 때문입니다. `success` 는 `aria-invalid` 를 켜지 않습니다 (`error` 만 `aria-invalid="true"`).
>
> `variant` · `success` 는 Vanilla 의 `.bt-text-field__input--filled` / `--success` 와 1:1 대응합니다.
>
> **v3.0 변경**: 내부 마크업이 `<fieldset>` + `<legend>` 구조에서 standalone `<label htmlFor>` 구조로 변경되었습니다. 공개 props는 동일하지만, 커스텀 SCSS에서 `.text_field_legend` 같은 내부 셀렉터를 오버라이드했다면 점검이 필요합니다.
>
> **`imeStrategy`** - 한글 IME 조합 중 콜백 전략. 기본 `"delayed"` (조합 완료 후 `onValueChange`), 실시간 검색/필터엔 `"immediate"` (조합 중에도 즉시 호출).
>
> **아이콘 칸 vs 조작 칸** - `leadingIcon` · `trailingIcon` 은 장식 전용입니다. 버튼처럼 누를 수 있는 요소는 `leadingAction` · `trailingAction` 에 넣습니다 - 아이콘 칸에 넣으면 포커스는 가지만 스크린리더에는 보이지 않습니다(`aria-hidden` 안이라서). 조작 칸은 아이콘 칸과 같은 자리 · 크기를 쓰고, 넘긴 요소가 40×40 누름 영역을 채웁니다.
>
> 오른쪽 칸은 하나뿐이라 우선순위가 있습니다: `showPasswordToggle` > `clearable`(값 있을 때) > `trailingAction` > `trailingIcon`. 토글을 켜면 값이 차 있어도 계속 보입니다 - 비밀번호 칸에서 토글이 사라지면 쓸 수 없기 때문. 왼쪽은 `leadingAction` > `leadingIcon`.

#### `identifier` — 옮겨 적는 값의 오탈자 줄이기

Pretendard 기본 글자꼴은 `l` · `I` · `1` 이 거의 같고 `0` 과 `O` 도 헷갈립니다. 아이디·인증코드·시리얼·사업자번호처럼 **사용자가 화면을 보고 한 글자씩 옮겨 적는 값**에는 켭니다.

```tsx
<TextField label="사업자등록번호" identifier />
<TextField label="인증코드" identifier inputMode="numeric" />
```

Pretendard 의 `cv05`(l 에 꼬리) · `cv08`(I 에 세리프) 와 `slashed-zero` 를 적용합니다. Pretendard 가 아닌 폴백 폰트는 두 feature 를 무시하므로 안전합니다.

앱이 `.text_field_input` 을 직접 뚫어 `font-feature-settings` 를 주지 않아도 됩니다. SCSS 에서 같은 처리가 필요하면 `@include token.legible_identifiers` 를 씁니다. `tabular_nums` 와 겹쳐 쓰면 안 되는 함정은 [THEMING.md](./THEMING.md#하드코딩-대신-쓸-토큰) 참고.

---

### TagInput

후보 목록에 **없는** 값을 사용자가 직접 만들어 넣는 다중 입력. 후보가 정해져 있으면 `Dropdown`
의 `multiple`, 후보를 서버에서 가져와야 하면 `Combobox` 를 씁니다. `TagInput` 이 맡는 것은 목록
자체가 없는 경우입니다 — 자유 키워드, 사내 라벨, 검색 필터.

```tsx
import { Field, TagInput } from '@bigtablet/design-system';

<Field name="keywords" label="키워드" help="Enter 또는 쉼표로 구분합니다">
  <TagInput value={tags} onValueChange={setTags} maxTags={10} />
</Field>
```

키보드·붙여넣기 규약:

- **Enter / 쉼표** — 태그 확정. Enter 는 `preventDefault` 하므로 폼이 제출되지 않습니다
- **Backspace (빈 입력)** — 마지막 태그 제거. 마우스 없이 되돌리는 유일한 경로
- **붙여넣기** — 쉼표·줄바꿈·탭이 섞인 목록을 여러 태그로 나눕니다
- **blur** — 남은 입력을 확정합니다. Enter 를 잊고 넘어가도 값이 사라지지 않습니다
- IME 조합 중 Enter 는 조합 확정용이라 태그를 만들지 않습니다

태그 칩은 `Chip` 의 `static` + `removable` 입니다. 칩을 지우면 포커스가 입력으로 돌아옵니다.

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
import { Textarea } from '@bigtablet/design-system';

// 고정 3행
<Textarea label="메모" rows={3} />

// auto-grow: 2행에서 시작, 최대 6행까지 늘어남
<Textarea label="자기소개" minRows={2} maxRows={6} />
```

#### 한글 IME

`TextField` 와 동일하게 `imeStrategy` 지원. 조합 중 외부 `value` 구독이 즉시 필요하면 `"immediate"`. 조합 중에는 `transformValue` 가 보류되어 한글 조합이 깨지지 않습니다.

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
```

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

> `RadioGroup` 안에서는 `name` / `checked` / `size` / `disabled` 가 그룹 컨텍스트에서 자동 주입됩니다. 이 경우 `value` 만 지정하면 됩니다. (그룹 밖에서는 위 props 로 standalone 동작)

---

### RadioGroup

`Radio` 들을 묶는 **Context 기반 합성 래퍼**. 그룹 단위 value 제어/비제어 + `name` 자동 공유 + label/error/supportingText 묶음 + 방향키 이동(native radio).

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 여러 옵션 중 하나 선택 (그룹) | ✅ RadioGroup + `Radio value=...` |
| 단일 라디오 (그룹 아님) | △ [Radio](#radio) standalone |
| 켜기/끄기 1개 | ❌ [Switch](#switch) |
| 여러 개 동시 선택 | ❌ [Checkbox](#checkbox) |
| 짧은 라벨 2~5개를 한 줄로 | ❌ [SegmentedControl](#segmentedcontrol) |

#### 제어 / 비제어

- **제어형**: `value` + `onValueChange`
- **비제어형**: `defaultValue`

자식 `Radio`는 `value`만 지정 - `name`/`checked`/`size`/`disabled`는 그룹에서 상속.

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

### SegmentedControl

짧은 옵션 2~5개 중 **값 하나를 고르는** 컨트롤 (통화 USD/KRW, 로케일 KO/EN, 운영/개발, 만료 기간). 트랙 위에서 선택된 칸만 떠오른 표면으로 채웁니다. native `input[type=radio]` 기반이라 방향키 이동·선택과 폼 제출은 브라우저가 처리하고, Home/End 를 더했습니다.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 짧은 라벨 2~5개 중 하나, 한 줄에 다 보임 | ✅ SegmentedControl |
| 라벨이 길거나 설명이 붙거나 6개 이상 | ❌ [RadioGroup](#radiogroup) |
| 고른 값에 따라 **콘텐츠 패널**이 바뀜 | ❌ [Tabs](#tabs) (밑줄 모양) |
| 입력 토큰 · 여러 개를 켜고 끄는 필터 칩 | ❌ [Chip](#chip) |
| 켜기/끄기 1개 | ❌ [Switch](#switch) |

`T` 는 `string` 을 좁힌 리터럴 유니온을 받습니다 - `SegmentedControl<"ko" | "en">` 이면 `onValueChange` 가 그 타입으로 옵니다.

#### 접근성

- 루트가 `role="radiogroup"`, 각 칸이 `radio`. 이름은 `aria-label` 또는 `Field` 라벨(`aria-labelledby`)
- 키보드: <kbd>←</kbd>/<kbd>→</kbd>(<kbd>↑</kbd>/<kbd>↓</kbd>) 이동 + 선택(끝에서 wrap, 비활성 칸 건너뜀), <kbd>Home</kbd>/<kbd>End</kbd> 처음/마지막 칸
- 선택 상태를 색만으로 전달하지 않습니다 - 선택된 칸은 떠오른 표면(그림자)입니다
- 아이콘만 둔 칸은 `ariaLabel` 로 이름을 줍니다. 아이콘은 `aria-hidden`
- 포커스 링은 키보드 포커스에만(`:focus-visible`) 칸에 그려집니다

**Usage**

```tsx
import { SegmentedControl, Field } from "@bigtablet/design-system";

const [currency, setCurrency] = useState<"USD" | "KRW">("USD");

<SegmentedControl<"USD" | "KRW">
  aria-label="통화"
  value={currency}
  onValueChange={setCurrency}
  items={[
    { value: "USD", label: "USD" },
    { value: "KRW", label: "KRW" },
  ]}
/>

// Field 와 함께 - 라벨 · 설명 · 필수 · 에러를 Field 가 연결한다
<Field name="locale" label="언어" required>
  <SegmentedControl size="sm" defaultValue="ko" items={[
    { value: "ko", label: "KO" },
    { value: "en", label: "EN" },
  ]} />
</Field>
```

#### 마이그레이션 - 버튼 그룹으로 만든 통화 선택

앱에서 `Button` 을 나란히 두고 선택된 쪽만 `variant` 를 바꾸던 패턴은 스크린리더에 "버튼 두 개" 로만 읽히고 어느 쪽이 선택됐는지 전달되지 않습니다.

```tsx
// Before - 선택 상태가 색(variant)으로만 전달된다
<div className="currency_toggle">
  {(["USD", "KRW"] as const).map((c) => (
    <Button key={c} size="sm" variant={currency === c ? "filled" : "outline"} onClick={() => setCurrency(c)}>
      {c}
    </Button>
  ))}
</div>

// After - radiogroup/radio 의미, 방향키, 폼 name 이 따라온다
<SegmentedControl<"USD" | "KRW">
  aria-label="통화"
  size="sm"
  value={currency}
  onValueChange={setCurrency}
  items={[{ value: "USD", label: "USD" }, { value: "KRW", label: "KRW" }]}
/>
```

---

### Switch

켜기 / 끄기 스위치 (`role="switch"`)입니다. 4.15.0 전 이름은 `Toggle` 이고, 같은 컴포넌트를 가리키는 deprecated 별칭으로 남아 있습니다 - [MIGRATION.md](./MIGRATION.md#v4150-날짜--시간-prop-이름-통일--toggle--switch) 참고. CSS 클래스(`toggle_*`)와 Vanilla(`.bt-toggle` · `Bigtablet.Toggle`)는 다음 major 에서 함께 바꿉니다.

```tsx
import { Switch } from '@bigtablet/design-system';

// 기본 사용 - ariaLabel 은 필수다 (보이는 라벨이 없는 스위치의 이름)
<Switch ariaLabel="알림 받기" onCheckedChange={(checked) => console.log(checked)} />

// Controlled
const [isOn, setIsOn] = useState(false);
<Switch ariaLabel="알림 받기" checked={isOn} onCheckedChange={setIsOn} />

// Sizes
<Switch ariaLabel="알림 받기" size="sm" />
<Switch ariaLabel="알림 받기" size="md" />
```

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

// 범위 · 막는 날
<DatePicker
  label="예약일"
  min="today"
  max="2026-12-31"
  isDateDisabled={(d) => holidays.has(d)}
  value={date}
  onValueChange={setDate}
/>
```

#### 고를 수 있는 날 정하기

날짜 · 시간 컴포넌트는 같은 이름을 씁니다 - `min` · `max` 는 값과 같은 형식의 문자열이고, 날마다 막을 때는 `isDateDisabled` 입니다.

| prop | 값 | 하는 일 |
|------|------|------|
| `min` · `max` | `"YYYY-MM-DD"` 또는 `"today"` | 가장 이른 · 늦은 날. **연 목록도 이 범위로 좁힙니다** (없으면 1950 ~ 올해 + 10) |
| `isDateDisabled` | `(date: string) => boolean` | true 인 날은 고를 수 없습니다 - 휴무일 · 주말 등. 날이 모두 막힌 달은 월 목록에서도 빠집니다 |

`"today"` 는 기기의 오늘입니다. 생년월일은 `max="today"`, 예약일은 `min="today"` 처럼 씁니다.
연 · 월을 바꿔 지금 일이 범위 밖이거나 막혔으면, 그 뒤의 가장 가까운 날로 옮깁니다.

예전 이름(`minDate` · `selectableRange` · `startYear` · `endYear` · `mode`)은 4.15.0 부터 deprecated 입니다 - [MIGRATION.md](./MIGRATION.md#v4150-날짜--시간-prop-이름-통일--toggle--switch) 참고.

---

### MonthPicker

연 · 월 선택 (`"YYYY-MM"`). 정산 월 · 카드 유효기간처럼 날까지는 고르지 않는 칸에 씁니다. `DatePicker` 의 연 · 월 드롭다운을 그대로 써서 범위 계산 · 지우기 · `Field` 연결이 같습니다.

```tsx
import { Field, MonthPicker } from '@bigtablet/design-system';

<Field name="settledMonth" label="정산 월">
  <MonthPicker value={month} onValueChange={setMonth} max="today" />
</Field>
```

`min` · `max` 는 `"YYYY-MM"` 으로 줍니다. `"today"` 는 이번 달입니다.

---

### DateCalendar

월 달력 - 날짜 하나를 고릅니다. 보이는 달 · 범위 · 고를 수 없는 날 · 주 시작 요일 · 날짜 장식(일정 점 · 배지)을 다룹니다. [DatePicker](#datepicker) `variant="calendar"` 의 팝오버도 이 컴포넌트입니다. 범위(시작~끝) 선택은 아직 없습니다 - [DateRangePicker](#daterangepicker) 를 씁니다.

#### 날짜 값과 시간대

값은 **`"YYYY-MM-DD"` 문자열**입니다 (보이는 달은 `"YYYY-MM"`). DatePicker 의 `value` · `min` · `max` 와 같은 형식입니다.

- 시간대가 없습니다 - `new Date("2026-10-16")` 은 **UTC 자정**으로 해석돼 한국(UTC+9)에서는 맞지만 미국에서는 하루 전날이 됩니다. 문자열이라 이 변환이 끼어들 자리가 없습니다
- Date 가 필요하면 **로컬 생성자**로 만듭니다: `const [y, m, d] = value.split("-").map(Number); new Date(y, m - 1, d)`
- 서버가 `2026-10-16T00:00:00Z` 같은 시각을 주면, 그 날짜를 **어느 시간대 기준으로 볼지 앱이 정해** `"YYYY-MM-DD"` 로 바꿔 넘깁니다
- `today` 기본값은 기기의 오늘입니다. 서버 기준 날짜를 써야 하면 넘깁니다

#### 접근성

- WAI-ARIA APG "Date Picker Dialog" 의 `grid` 구조 - 요일 머리글이 각 칸을 설명하고, 칸 이름은 전체 날짜("2026년 10월 16일 금요일")
- 키보드: <kbd>←</kbd>/<kbd>→</kbd> 하루, <kbd>↑</kbd>/<kbd>↓</kbd> 한 주, <kbd>Home</kbd>/<kbd>End</kbd> 주의 처음 · 끝(`weekStartsOn` 기준), <kbd>PageUp</kbd>/<kbd>PageDown</kbd> 한 달(<kbd>Shift</kbd> 와 함께면 한 해), <kbd>Enter</kbd>/<kbd>Space</kbd> 선택. 포커스는 한 칸만(roving tabindex)
- 고를 수 없는 날도 포커스는 지나갑니다 - `disabled` 가 아니라 `aria-disabled`
- **장식(`renderDay`)은 화면에만 보입니다.** 일정 개수처럼 뜻이 있으면 `describeDay` 로 같은 정보를 이름에 붙입니다 ("2026년 10월 12일 월요일, 일정 3개")

**Usage**

```tsx
import { DateCalendar } from "@bigtablet/design-system";

const [date, setDate] = useState<string | null>(null);

<DateCalendar
  value={date}
  onValueChange={setDate}
  weekStartsOn={1}
  min="2026-10-01"
  isDateDisabled={(d) => holidays.has(d)}
  renderDay={(d) => (events[d] ? <span className="event_dot" /> : null)}
  describeDay={(d) => (events[d] ? `일정 ${events[d].length}개` : undefined)}
/>
```

---

### DateRangePicker

시작일·종료일 한 쌍. `DatePicker` 둘을 묶습니다.

```tsx
import { DateRangePicker, Field } from '@bigtablet/design-system';

<Field name="period" label="조회 기간">
  <DateRangePicker value={period} onValueChange={setPeriod} max="today" />
</Field>
```

**거꾸로 된 범위를 만들 수 없습니다.** 종료일의 `min` 이 시작일이라 이전 날짜가 목록에 없고,
시작일을 종료일보다 뒤로 옮기면 **종료일이 비워집니다**(`{ start, end: undefined }`). 조용히
시작일로 맞추지 않는 이유 — 사용자가 고르지 않은 날짜가 그대로 조회·저장됩니다.

시작일을 고르기 전에는 종료일이 잠깁니다. 순서가 뒤집힌 입력을 애초에 막습니다.

`min` · `max` · `isDateDisabled` 는 시작일 · 종료일 모두에 걸립니다 ([DatePicker](#고를-수-있는-날-정하기) 와 같습니다).

### TimePicker

시·분 선택. `DatePicker` 와 같은 방식으로 `Dropdown` 두 개를 조합합니다.

```tsx
import { Field, TimePicker } from '@bigtablet/design-system';

<Field name="pickupAt" label="픽업 시각">
  <TimePicker value={time} onValueChange={setTime} minuteStep={30} min="09:00" max="21:00" />
</Field>
```

`min`/`max` 는 **시 목록까지** 좁힙니다 (`"HH:mm"`, 예전 이름 `minTime`/`maxTime`). 분만 걸러 두면 09:00 이 최소인데 08시를 고를 수
있고, 그때 분 목록이 비어 막힌 화면이 됩니다. 경계 시각에서는 분도 좁힙니다 — 최소가 09:30 이면
09시의 분은 30분부터입니다. 시를 바꿀 때 지금 분이 범위 밖이면 가장 이른 분으로 옮깁니다.

값은 24시간 `"HH:mm"` 입니다. 12시간 표기는 화면 표시의 문제라 소비자가 포맷합니다.

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

> 나머지 `input[type=file]` 네이티브 속성(`name`, `required`, `onChange` 등)은 그대로 전달됩니다. `onChange` 를 함께 넘기면 `onFiles` 뒤에 이어서 호출됩니다.

---

### ImageCropper

업로드 전에 이미지에서 **보일 정사각 영역**을 정하는 크로퍼입니다. 뷰포트 안에서 드래그·탭(또는 방향키)으로 위치를(탭하면 그 지점이 가운데로 옵니다 - 드래그 대안, WCAG 2.5.7), 휠·슬라이더·＋/－ 버튼(또는 <kbd>+</kbd>/<kbd>-</kbd> 키)으로 배율을 맞춥니다.

모달을 포함하지 않으므로 소비자가 [`Modal`](#modal) 등으로 감싸고, "적용" 버튼에서 `ref.crop()` 을 호출해 `Blob` 을 받습니다.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 프로필/아바타 이미지 업로드 전 원형 크롭 | ✅ ImageCropper (`circular`) |
| 썸네일·커버 이미지의 정사각 영역 지정 | ✅ ImageCropper |
| 자유 비율(16:9 등) 크롭 | ❌ 미지원 - 결과는 항상 정사각 |
| 크롭 없이 단순 파일 선택 + 미리보기 | ❌ [FileInput](#fileinput) `variant="preview"` 권장 |

> 루트는 표준 `div` 속성(`id` / `data-*` / `aria-*` / `style` 등)을 그대로 전달받습니다. 단 `onError` 는 이미지 디코드 실패 콜백으로 재정의되어 있고, `children` / `dangerouslySetInnerHTML` 은 루트가 항상 자체 자식을 렌더하므로 받지 않습니다.

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

> ⚠️ 원격 URL 을 넘기면 `canvas.drawImage` 결과가 서버의 CORS(`Access-Control-Allow-Origin`) 설정에 의존합니다. 확실하게 자르려면 로컬 `File`/`Blob` 을 넘겨라.

---

### OtpInput

인증 코드(OTP) 입력. 각 자리를 개별 `input` 으로 분리하고 자동 포커스 이동·붙여넣기·SMS 자동완성(`autocomplete="one-time-code"`)을 지원합니다.

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

> **제어형 전용**: `value` + `onValueChange` 를 항상 함께 넘겨야 합니다 (비제어 모드 없음). 전체 코드를 한 번에 붙여넣거나 SMS 자동완성으로 받으면 각 자리에 자동 분배됩니다.

---

## Feedback

### Alert

화면을 막고 **확인을 받는** 모달 알림. `AlertProvider` 아래에서 `useAlert().showAlert` · `useConfirm()` 으로 엽니다.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 진행 전에 확인을 받아야 함 (삭제 확인, 저장 안 한 변경) | ✅ Alert |
| 화면의 한 부분에 남아 읽혀야 하는 안내 | ❌ [InlineAlert](#inlinealert) |
| 방금 한 일의 결과를 잠깐 알림 (저장됨, 복사됨) | ❌ [Toast](#toast) |

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
      tone: 'warning',
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

#### 확인 잠금 - 창 안 입력에 따라

`showAlert` 는 핸들 `{ update(patch) }` 를 돌려줍니다. 옵션은 호출 시점에 한 번만 읽히므로, 창 안 입력에
따라 바꿀 값은 `update` 로 넘깁니다. 창이 닫혔거나 다른 알림으로 바뀐 뒤의 `update` 는 무시됩니다.

```tsx
let reason = "";
const alert = showAlert({
  tone: "warning",
  title: "버전 정책을 저장할까요?",
  message: (
    <Textarea
      label="변경 사유"
      maxLength={500}
      onValueChange={(value) => {
        reason = value;
        alert.update({ confirmDisabled: !value.trim() });
      }}
    />
  ),
  showCancel: true,
  confirmText: "저장",
  confirmDisabled: true,
  onConfirm: () => savePolicy({ reason }),
});
```

`useConfirm` 에는 `confirmDisabled` 가 없습니다 - 핸들을 돌려주지 않아 풀 방법이 없습니다. 입력을 받는 확인은 `showAlert` 로.

---

> 오버레이 클릭은 **누른 곳과 놓은 곳이 모두 오버레이**일 때만 취소로 봅니다. 메시지를 드래그로
> 선택합니다 오버레이에서 놓으면 `click` 이 공통 조상(오버레이)에 디스패치되는데, 그걸 취소로 처리하면
> 확인 대화상자가 실수로 닫힙니다 - Modal·Drawer 와 같은 판정입니다.

#### useConfirm - Promise 로 받는 확인

```tsx
import { useConfirm } from "@bigtablet/design-system";

const confirm = useConfirm();

// 미저장 변경
if (await confirm({
  tone: "warning",
  title: "변경사항을 버릴까요?",
  message: "저장하지 않은 내용은 복구할 수 없습니다.",
  confirmText: "버리기",
  cancelText: "계속 편집",
  destructive: true,
})) {
  discard();
}

// 비동기 삭제 - 끝날 때까지 열린 채 pending
await confirm({
  tone: "error",
  title: `${order.no} 를 삭제할까요?`,
  confirmText: "삭제",
  destructive: true,
  onConfirm: () => deleteOrder(order.id),   // Promise
});
```

`useAlert` 의 `AlertProvider` 를 그대로 씁니다 - 애니메이션 · 포커스 트랩 · 스크롤 잠금이 같고, 옵션도 `AlertOptions` 와 같습니다(`showCancel` 은 항상 켜지고 `onCancel` 은 없습니다).

| 경우 | 결과 |
|------|------|
| 확인 | `true` (`onConfirm` 이 Promise 면 성공한 뒤) |
| 취소 · Escape · 오버레이 | `false` |
| 열려 있는 동안 다시 `confirm`/`showAlert` | 앞의 것은 `false` 로 끝나고 새 것으로 **교체** |
| `onConfirm` 이 reject | 열린 채 버튼이 다시 살아납니다 - 재시도하거나 취소(`false`). 오류 안내는 작업 쪽에서 |
| `AlertProvider` 가 사라짐 | `false` |

- 어느 경로든 **정확히 한 번** resolve 됩니다
- pending 중 버튼은 `disabled` 가 아니라 `aria-disabled` - 누른 버튼에서 포커스가 빠지지 않습니다. 대화상자에 `aria-busy`
- 첫 포커스는 **취소 버튼**입니다 - destructive 확인이 Enter 한 번에 실행되지 않습니다

### Toast

화면을 막지 않고 **잠깐 떴습니다 사라지는** 결과 알림. `ToastProvider` 아래에서 `useToast()` 로 띄웁니다.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 방금 한 일의 결과를 잠깐 알림 (저장됨, 복사됨, 업로드 완료) | ✅ Toast |
| 화면의 한 부분에 남아 읽혀야 하는 안내 | ❌ [InlineAlert](#inlinealert) |
| 진행 전에 확인을 받아야 함 | ❌ [Alert](#alert) |

```tsx
import { ToastProvider, useToast } from '@bigtablet/design-system';

// App 을 Provider 로 감싼다 - useToast() 는 그 아래(자식)에서만 부를 수 있다
function App() {
  return (
    <ToastProvider>
      <YourComponent />
    </ToastProvider>
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

// 진행 토스트 - 띄운 뒤 같은 토스트를 바꾼다
const id = toast.info('업로드 중…', { duration: Infinity });
await upload();
toast.update(id, { tone: 'success', message: '업로드 완료', duration: 3000 });

// 실행 취소 - 버튼을 누르면 onClick 뒤 토스트가 닫힌다
toast.message('항목이 삭제되었습니다', {
  duration: 6000, // 기본 3초는 누르기에 짧다
  action: { label: '실행 취소', onClick: restore },
});

// 같은 토스트 갱신 - 저장을 연달아 눌러도 하나만 남고 남은 시간을 다시 센다 (화면 낭독기에도 다시 알림)
toast.success('설정을 저장했습니다.', { id: 'settings-save' });

// 프로그램으로 닫기
toast.dismiss(id);
```

- 최신 토스트는 늘 모서리 쪽에 붙습니다 (아래 배치면 맨 아래, `placement="top-right"` 면 맨 위). 5개를 넘으면 반대쪽 끝의 가장 오래된 것이 빠져서, 남은 토스트는 움직이지 않습니다
- 닫힐 때 자리도 같은 시간 동안 접혀, 남은 토스트가 순간 이동하지 않고 미끄러지듯 따라옵니다

#### `useToast()` 반환

| 함수 | 시그니처 | 설명 |
|------|---------|------|
| `success` `error` `warning` `info` `message` | `(message, options?) => string` | 토스트를 띄우고 **id** 를 반환합니다. `options` 는 ms 숫자(예전 방식) 또는 `ToastOptions`. `options.id` 를 주면 그 값을 돌려주고, 같은 id 가 떠 있으면 새로 쌓지 않고 그 토스트를 갱신합니다 |
| `dismiss` | `(id) => void` | 닫기 버튼과 같은 퇴출 모션으로 닫습니다. 없는 id·퇴출 중인 id 는 무시 |
| `update` | `(id, patch) => void` | `message`·`tone`·`duration`·`action` 을 바꿉니다. `duration` 이 바뀌면 진행 바가 새 값으로 다시 시작합니다. `action: null` 이면 버튼을 뗍니다 |

#### `ToastProvider` props

> **다국어(ko/en) 앱은 두 값을 주입하세요.** DS 기본값은 한글입니다 — [MIGRATION.md](./MIGRATION.md#v3130-a11y-문자열-기본값-한글화) 참고.

---

### InlineAlert

페이지 흐름 안에 **계속 남는** 안내·경고 블록. 톤 5종(`neutral` · `info` · `success` · `warning` · `error`), 제목 · 본문 · 액션 · 닫기 버튼을 조합합니다. 톤 색은 status `container`(배경) · `on-container`(아이콘·제목) 쌍이라 다크 테마에서 함께 뒤집히고, 본문은 일반 텍스트 색입니다.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 화면의 한 부분에 남아 읽혀야 하는 안내·경고 (만료 예정, 점검, 개발 환경) | ✅ InlineAlert |
| 잠깐 보였습니다 사라지는 결과 알림 | ❌ [Toast](#toast) |
| 진행 전에 확인을 받아야 함 | ❌ [Alert](#alert) (`AlertProvider` modal) |
| 화면·위젯 전체가 비었거나 로드 실패 | ❌ [EmptyState](#emptystate) / [ErrorState](#errorstate) |

#### 접근성 - 정적 안내 vs 나중에 나타나는 알림

라이브 리전을 **강제하지 않습니다.** 처음부터 화면에 있는 안내를 스크린리더가 끼어들어 읽으면 소음입니다.

| 경우 | `role` |
|------|--------|
| 페이지와 함께 처음부터 있는 안내 (점검 공지, 만료 예정) | 없음 (기본) |
| 동작 결과로 **나중에** 나타나는 정보·성공 (저장했습니다) | `role="status"` - 하던 낭독을 끝낸 뒤 읽습니다 |
| 즉시 알아야 하는 오류 (저장 실패) | `role="alert"` - 끼어들어 읽습니다. 남발하지 않습니다 |

- 아이콘은 `aria-hidden` - 톤 의미는 제목·본문 문구로 전달합니다 (색·아이콘만으로 전달하지 않습니다)
- 닫기 버튼은 32px, 이름은 `dismissLabel`. 닫은 뒤 포커스는 부모가 다음 의미 있는 요소로 옮깁니다
- `action`의 기본 강조는 `Button variant="filled"`. `outline`·`tonal`도 톤별 경계색이 적용되어 배경과 구분됩니다
- 진입 시 짧은 fade(200ms), `prefers-reduced-motion: reduce` 면 끕니다

**Usage**

```tsx
import { InlineAlert, Button } from "@bigtablet/design-system";

// 정적 안내
<InlineAlert tone="warning" title="구독이 7일 뒤 만료됩니다" action={<Button size="sm">갱신</Button>}>
  만료되면 팀원 초대가 막힙니다.
</InlineAlert>

// 닫을 수 있는 안내 - 지우는 건 부모
{showNotice && (
  <InlineAlert tone="info" onDismiss={() => setShowNotice(false)}>
    새 기능: 일정 공유 링크를 만들 수 있습니다.
  </InlineAlert>
)}

// 동작 결과로 나타나는 오류
{saveError && (
  <InlineAlert tone="error" role="alert" title="저장하지 못했습니다">
    네트워크 연결을 확인하고 다시 시도하세요.
  </InlineAlert>
)}
```

---

### Spinner

```tsx
import { Spinner } from '@bigtablet/design-system';

<Spinner />           // 기본 (24px)
<Spinner size={16} /> // 작은 크기
<Spinner size={48} /> // 큰 크기
```

> ℹ️ React 는 12개 bar 가 순차 페이드하는 iOS 스타일이고, `prefers-reduced-motion: reduce` 에서는 애니메이션을 완전히 정지시키고 12개 bar 를 모두 50% 불투명도로 둡니다(멈춰 있어도 12개 spoke 형태가 로딩 위젯으로 읽히기 때문). Vanilla `.bt-spinner` 는 서버 템플릿의 마크업 단순성(빈 요소 하나)을 위해 단일 border ring 이고, 정지 대신 회전을 늦춥니다(0.8s → 2.4s). **의도된 차이이며 통일 계획은 없습니다** - 자세한 근거는 [VANILLA.md#spinner](./VANILLA.md#spinner).

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

---

### LinearProgress

```tsx
import { LinearProgress } from '@bigtablet/design-system';

// 기본 사용
<LinearProgress totalSteps={5} currentStep={3} aria-label="진행률" />

// 완료 상태
<LinearProgress totalSteps={10} currentStep={10} aria-label="업로드 진행률" />
```

---

### Skeleton

콘텐츠가 로드되기 전 자리를 잡아 두는 플레이스홀더. 실제 콘텐츠와 **같은 크기·모양**으로 맞춰야 로드 후 레이아웃이 흔들리지 않습니다.

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

> 루트는 `div` 이고 `aria-hidden="true"` 가 자동으로 붙습니다 (스크린리더 노이즈 방지). 로딩 상태 자체를 알려야 하면 부모에 `aria-busy` / `role="status"` 를 직접 걸어라. `children` 은 받지 않으며, 그 외 `div` 속성은 그대로 전달됩니다.

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

쪽이 수백·수천 개인 목록(접속 기록 등)은 `…` 와 이전·다음만으로는 원하는 쪽에 닿을 수 없습니다 - `showPageJump` 를 켭니다.
켜면 현재 쪽이 검정 채움 대신 **테두리 있는 입력칸**으로 보여 처음부터 "적는 곳" 으로 읽힙니다. 컨트롤이 늘지 않아 좁은
화면에서도 배치가 그대로입니다. `<form>` 이 아니라서 검색 폼 안에 두어도 중첩 폼이 되지 않고, Enter 가 바깥 폼을 제출하지 않습니다.

```tsx
<Pagination page={page} totalPages={3650} onPageChange={setPage} showPageJump />
```

쪽이 많으면 넓은 폭에서는 번호 칸이 9개, 좁은 폭(600px 미만)에서는 `1 · … · 현재 · … · 끝` 5개입니다 - 9칸과 이전·다음을 합치면 460px 라 375px 화면에서 넘쳤습니다.
두 폭의 칸을 함께 그리고 CSS 가 한쪽만 숨겨, 서버 렌더 첫 화면부터 폭에 맞고 창 크기를 바꿔도 다시 그리지 않습니다. 한 폭 안에서는 어느 쪽이든 칸 수가 같아 ‹ › 가 움직이지 않습니다.

---

### Tabs

한 영역에서 서로 배타적인 콘텐츠 패널을 전환하는 네비게이션. **`Tabs` + `TabList` + `Tab` + `TabPanel` compound API**로 구성되며, 키보드 ArrowLeft/Right/Home/End를 자동 지원.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 카테고리 간 전환 (서로 배타적, 한 번에 하나만) | ✅ Tabs |
| 패널 없이 **값만** 고르는 설정·필터 (통화 USD/KRW, 로케일, 목록 상태 필터) | ❌ **[SegmentedControl](#segmentedcontrol)** (라벨이 길면 RadioGroup) - `tablist`/`tab` 은 "패널을 바꿉니다" 는 뜻이라, 패널이 없으면 스크린리더에 없는 패널을 약속합니다 |
| 점진적 노출, 여러 섹션 동시 펼침 가능 | ❌ **Accordion** |
| 페이지 간 이동 (URL 자체가 바뀜) | ❌ **NavBar / Sidebar** |
| 단순 boolean 토글 1쌍 | ❌ **Switch** |

#### variant 선택 가이드

- `variant="line"` (기본) - **하단 underline**. 페이지 내 섹션 전환 (admin 페이지 위계, 제품 상세 등). 가장 흔한 케이스
- `variant="fills"` - **deprecated (v4.10.0).** 둥근 박스 그룹 모양이 SegmentedControl 과 같아 "내용 바꾸기" 와 "값 고르기" 가 구분되지 않습니다. 패널을 바꾸면 `line`, 값만 고르면 [SegmentedControl](#segmentedcontrol) 을 씁니다. 지금은 그대로 동작하고 이후 버전에서 제거합니다

#### 제어형 vs 비제어형

```tsx
import { Tabs } from '@bigtablet/design-system';

// 비제어형 - 단순한 페이지 내 탭 전환
<Tabs defaultValue="overview"> ... </Tabs>

// 제어형 - URL 쿼리 동기화, 외부 버튼으로 탭 변경 등
const [tab, setTab] = useState("overview");
<Tabs value={tab} onValueChange={setTab}> ... </Tabs>
```

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
- 활성 표시기(`span.tabs_indicator`): 활성 tab 위치로 **200ms `left` · `width`** 슬라이드 (`easing_enter`). 첫 렌더에는 모션 없이 놓입니다
- TabPanel: 전환 자체엔 애니메이션 없음 (활성 panel만 즉시 렌더)

#### DOM 구조 (SCSS override 시 참고)

```
.tabs (+ tabs_variant_line | tabs_variant_fills, tabs_size_sm | tabs_size_md)
├── .tabs_list (+ tabs_list_line | tabs_list_fills)
│   ├── span.tabs_indicator (+ tabs_indicator_line | _fills)  ← aria-hidden, 활성 tab 으로 슬라이드
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

// 같은 데이터의 보기 전환 (패널마다 다른 화면) - 패널을 바꾸니 Tabs, 모양은 밑줄
const [view, setView] = useState("list");
<Tabs value={view} onValueChange={setView} size="sm">
  <TabList ariaLabel="보기 방식">
    <Tab value="list">목록</Tab>
    <Tab value="board">보드</Tab>
  </TabList>
  <TabPanel value="list"><OrderTable /></TabPanel>
  <TabPanel value="board"><OrderBoard /></TabPanel>
</Tabs>

// ❌ 같은 목록을 상태로 거르기만 한다면 Tabs 가 아니다 - 값만 고르는 SegmentedControl 을 쓴다

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

Admin/dashboard 좌측 메인 네비게이션. **표면 배경(`$color_bg_solid`) + 제목 텍스트 색 + 우측 1px 테두리**이고, 다크 테마를 따라갑니다. `SidebarItem` 자식과 함께 사용하며, 선택적으로 `SidebarSection`으로 그룹화. `collapsed` 모드로 아이콘만 표시되는 축소 상태 지원.

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
| **배경** | 표면(`bg_solid`, 다크 테마 따라감) + 우측 테두리 | default(흰) / transparent / accent(검정) |
| **collapsed** | 지원 (아이콘만) | 미지원 |
| **링크 형태** | icon + label + trailing | label만 (active 강조) |

#### collapsed 동작

- `collapsed={true}`: 너비가 `width`(기본 240) → `collapsedWidth`(기본 64)로 축소
- label, trailing, section label은 `visually_hidden` 으로 숨김 - 화면에서만 빠지고 스크린리더는 그대로 읽습니다
- 아이콘만 가운데 정렬로 표시. 아이콘 없이 문자열 라벨만 있는 아이템은 라벨 첫 글자(`sidebar_item_initial`)를 아이콘 자리에 보여 줍니다
- `collapsible` 이면 접기 버튼(`button.sidebar_collapse_btn`, `aria-expanded`)이 헤더(로고) 가운데 줄(`--bt-sidebar-header-center`)에 맞춰 우측 가장자리에 반쯤 걸쳐 놓입니다
- 너비 변화엔 200ms `transition_base` 애니메이션

#### 접근성

- `<aside>` 시멘틱 + 내부 `<nav>` 자동
- SidebarItem `active={true}` → `aria-current="page"` 자동
- icon은 `aria-hidden="true"` (label이 정보 전달자)
- focus ring: `token.$focus_ring` (아이템 · 접기 버튼 공통)
- collapsed 모드에서도 label은 `visually_hidden` 으로 DOM 유지 (스크린리더 접근 가능, 시각만 숨김)

#### 애니메이션

- Sidebar 너비: **200ms `width`** transition (`transition_base`)
- Item hover/active 배경: **100ms** (`transition_fast`)
- 헤더 로고 레이어(`header` ↔ `headerCollapsed`): **200ms `opacity`** 크로스페이드 (`transition_base`). 아이템 label 은 페이드 없이 바로 `visually_hidden` 으로 바뀝니다

#### DOM 구조 (SCSS override 시 참고)

```
aside.sidebar (+ sidebar_collapsed, sidebar_static)
├── .sidebar_header           ← border-bottom
│   └── .sidebar_header_layers
│       ├── .sidebar_header_layer.sidebar_header_layer_full   ← header
│       └── .sidebar_header_layer.sidebar_header_layer_mark   ← headerCollapsed
├── nav.sidebar_nav
│   ├── .sidebar_section
│   │   ├── .sidebar_section_label  ← uppercase, 접히면 visually_hidden
│   │   └── button|a.sidebar_item (+ sidebar_item_active)
│   │       ├── .sidebar_item_icon      ← aria-hidden
│   │       ├── .sidebar_item_initial   ← icon 없을 때, aria-hidden, 접혔을 때만 보임
│   │       ├── .sidebar_item_label
│   │       └── .sidebar_item_trailing
│   └── ...
├── .sidebar_footer           ← border-top
└── button.sidebar_collapse_btn   ← collapsible 일 때, aria-expanded, 우측 가장자리에 걸침
```

**Usage**

```tsx
import { Sidebar, SidebarItem, SidebarSection, Badge } from "@bigtablet/design-system";
import { Home, Users, Settings, LogOut } from "lucide-react";
// Logo 는 앱이 가진 로고 컴포넌트입니다 (DS 에 없습니다)

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

// Next.js Link 와 통합 - 컴포넌트를 그대로 넘긴다
import Link from "next/link";

<SidebarItem icon={<Home />} as={Link} href="/dashboard">대시보드</SidebarItem>
```

> **`mode`** - `"auto"` (기본) 시 viewport `< 600px` 에서 자동으로 하단 bar 형태로 변신 (CSS-only, SSR 안전). `"static"` 으로 끄기 (admin 등 desktop-only). 모바일 우선 앱이라면 별도 [BottomNav](#bottomnav) 컴포넌트를 직접 쓰는 것도 고려.

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
          badge={<Badge tone="error" shape="dot" size="sm" />} />
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

페이지 상단 네비게이션 바. 마케팅/B2C 페이지의 메인 헤더. `NavLink`를 자식으로 사용하며, `brand` / `actions`로 좌우 영역 분리. 3가지 visual variant로 흰 배경 / 투명(hero 위) / 검정 배경을 지원.

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
- `variant="accent"` - **검정 bg(`$color_brand_primary`) + 흰 텍스트**, 라이트 · 다크 테마 동일. 강한 brand 톤이 필요한 랜딩, 다크 컨텍스트

#### sticky 동작

- `sticky={true}`: `position: sticky; top: 0` + `z-index: $z_level3`
- 스크롤 시 항상 상단 고정. transparent variant와 함께 쓸 때는 스크롤하면서 배경 색을 바꾸는 패턴이 흔함 (외부에서 조건부 variant 전환)

#### 접근성

- `<header>` 시멘틱 + 내부 `<nav>` (links 영역) 자동
- NavLink `active={true}` → `aria-current="page"` 자동
- 모든 link/button에 `:focus-visible` 시 `focus_ring` 표시
- 좁은 화면(compact, 600px 미만)에서 padding과 gap 자동 축소

#### 애니메이션

- Link hover 배경: **100ms `background`, `color`** (`transition_fast`)
- 활성 표시: variant에 따라 색상/font-weight 변화 (transition 없음, 즉시)

#### 반응형

- 최대 너비 1200px의 inner container, 중앙 정렬
- desktop padding: `12px 24px`, min-height 60px
- compact (600px 미만): padding `8px 16px`, link gap 축소

#### DOM 구조 (SCSS override 시 참고)

```
header.nav_bar (+ nav_bar_variant_default | _transparent | _accent, nav_bar_sticky)
└── .nav_bar_inner               ← max-width 1200px, center
    ├── .nav_bar_brand
    ├── nav.nav_bar_links
    │   ├── a.nav_bar_link (+ nav_bar_link_active)
    │   └── span.nav_bar_indicator   ← aria-hidden, 활성 링크 표시
    ├── .nav_bar_search              ← searchSlot
    └── .nav_bar_right
        ├── .nav_bar_actions         ← actions
        ├── .nav_bar_locale          ← locale
        ├── span.nav_bar_divider     ← aria-hidden, profile 이 있고 divider 일 때
        └── .nav_bar_profile         ← profile
```

**Usage**

```tsx
import { NavBar, NavLink, Button } from "@bigtablet/design-system";
// Logo 는 앱이 가진 로고 컴포넌트입니다 (DS 에 없습니다)

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
| 순서가 있는 step indicator (체크아웃 등) | ❌ **[Stepper](#stepper)** |
| 평탄한 페이지 구조 (위계 1단) | ❌ 사용 안 함 |

#### items 동작

- 배열의 **마지막 항목은 항상 현재 페이지**로 간주 - `<span aria-current="page">`로 렌더, 링크/버튼 아님
- 그 외 항목:
  - `href`가 있으면 → `<a>`로 렌더 (페이지 이동)
  - `href` 없이 `onClick`만 있으면 → `<button>`로 렌더 (SPA 라우터 등)
  - 둘 다 없으면 → `<button>` (no-op)

라우터 링크가 필요하면 `onClick` 우회 대신 `as` 를 씁니다 - `preventDefault` + `push` 로는
수정자 클릭(`cmd`/`ctrl`/`shift`)과 새 탭 열기가 죽고, 프리페치·이동 가드처럼 `Link` 만 아는
것들은 표현할 수 없습니다.

```tsx
import Link from "next/link";

<Breadcrumb
  items={[
    { label: "홈", href: "/", as: Link },
    { label: "FAQ 관리", href: "/faq", as: Link },
    { label: "상세" }, // 마지막 = 현재 페이지, 링크 아님
  ]}
/>
```

`NavLink` 도 같은 계약입니다 - `<NavLink as={Link} href="/faq" active>`.

#### 접근성

- 컨테이너: `<nav aria-label={navLabel ?? t("breadcrumb.label")}>` - 기본 "현재 위치" (LocaleProvider 카탈로그, `navLabel` 로 덮어씀)
- 리스트: `<ol>` (순서가 의미를 가짐) - 스크린리더가 위계로 인식
- 마지막 아이템: `<span aria-current="page">` - "현재 페이지"임을 announce
- 구분자: `<span aria-hidden="true">` - 스크린리더에서는 무시
- 링크/버튼: 모두 native 시멘틱 (`<a href>`, `<button>`)

#### 애니메이션

- Link hover color: **100ms `color`** (`transition_fast`) - body → accent 색상
- 그 외 transition 없음 (정적 네비게이션)

#### DOM 구조 (SCSS override 시 참고)

```
nav.breadcrumb (+ aria-label, 기본 "현재 위치")
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

### Stepper

다단계 폼의 진행 표시. 가입·온보딩·결제처럼 **몇 단계 중 어디**를 보여 줍니다.

```tsx
import { Stepper } from '@bigtablet/design-system';

<Stepper
  steps={[
    { id: 'account', label: '계정' },
    { id: 'profile', label: '프로필', description: '이름과 소속' },
    { id: 'done', label: '완료' },
  ]}
  current={1}
  onStepClick={setStep}
/>
```

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 사용자가 순서대로 밟아 가는 절차 (가입·결제·온보딩) | ✅ Stepper |
| 시간 순 **기록** (주문 추적, 승인 이력, 활동 로그) | ❌ **Timeline** |
| 같은 페이지 안 섹션 전환 | ❌ **Tabs** |
| 페이지 위계 표시 | ❌ **Breadcrumb** |

#### 동작

- 상태는 `current` 인덱스 하나에서 파생됩니다 - 앞은 `done`, 지금은 `active`, 뒤는 `pending`. 단계마다 상태를 따로 관리하지 않습니다
- `<ol>` 로 렌더합니다. 현재 단계 `<li>` 에 `aria-current="step"`, 지나간 단계에는 시각 숨김 텍스트 **"완료"**, 현재 단계에는 **"현재 단계"** 가 붙습니다 - 색·체크 모양만으로 상태를 전하지 않습니다 (WCAG 1.4.1)
- 모양으로도 갈립니다 - `done` 체크, `active` 번호(강조), `pending` 빈 원에 번호
- `onStepClick` 을 주면 **지나간 단계만** 눌러 되돌아갈 수 있습니다. 앞으로 건너뛰면 그 사이 폼 검증을 우회하므로 막혀 있고, 앞으로 가는 길은 화면의 "다음" 버튼이 맡습니다. 누를 수 없는 단계도 `<button>`(`aria-disabled`)이라 되돌아간 순간 포커스가 사라지지 않습니다
- 연결선은 마지막 단계에서 끊깁니다. `isLast` 계산은 소비자 몫이 아닙니다

> 숨김 상태 텍스트("완료"·"현재 단계")는 [LocaleProvider](#localeprovider) 의 `stepper.done`·`stepper.current` 로 바꿉니다.

---

## Overlay

### Modal

화면 위쪽(가로 가운데)에 뜨는 대화 상자입니다. 포커스 트랩 · Esc 닫기 · 배경 스크롤 잠금을 자동으로 처리합니다.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 폼 · 상세 내용처럼 자유로운 내용을 화면 위에 띄움 | ✅ Modal |
| 삭제 확인처럼 "예 / 아니요" 만 받으면 됨 | ❌ [useConfirm](#useconfirm---promise-로-받는-확인) - 마크업 없이 `await confirm({ ... })` |
| 필터 · 상세 보기처럼 옆에서 나와 뒤 화면을 일부 보여 줌, 모바일 하단 시트 | ❌ [Drawer](#drawer) |
| 버튼 옆에 작게 붙는 내용 (선택지 · 짧은 폼) | ❌ [Popover](#popover) · 동작 목록이면 [Menu](#menu) |
| 결과를 잠깐 알림 | ❌ [Toast](#toast) |

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

#### 접근성 이름은 필수입니다

`title` 이나 `ariaLabel` 중 **하나는 반드시** 줘야 합니다. 폴백이 없으므로 둘 다 비우면 이름 없는 대화상자가 되고, axe 의 `aria-dialog-name`(serious)이 잡습니다.

> 이전에는 이름이 없으면 영어 `"Dialog"` 로 조용히 채워졌습니다. 한국어 제품의 유일한 영어 문자열이었고, 이름을 빼먹은 사실을 감추기만 했습니다.

#### 배치 — 윗변 고정

패널 윗변은 화면 높이의 15%(최소 32px · 최대 128px) 자리에 고정되고, 내용이 늘면 아래로만 자랍니다. 오류 안내가 나타나거나 단계가 바뀌어도 모달이 위아래로 튀지 않습니다. 예전에는 세로 가운데 정렬이라 늘어난 높이의 절반만큼 위로 올라갔습니다.

#### 단계 바꾸기 — `ModalSteps`

입력 → 본인 확인 → 결과처럼 **같은 창 안에서 내용을 바꿔 끼울 때** 씁니다. 내용을 한 번에 바꾸면 높이가 툭 바뀌어 모달 위에 모달이 뜬 것처럼 보입니다. `ModalSteps` 는 창은 그대로 두고 패널 높이를 이어서 바꾸고(0.2s), 새 단계는 나아가면 오른쪽 · 돌아가면 왼쪽에서 16px 밀려 들어옵니다.

```tsx
<Modal open={open} onClose={close} onExited={() => setStep("form")} title="기기 등록"
  footer={step === "form" ? <Button onClick={() => setStep("verify")}>다음</Button> : <Button onClick={close}>닫기</Button>}>
  <ModalSteps active={step}>
    <ModalStep name="form">...</ModalStep>
    <ModalStep name="verify">...</ModalStep>
  </ModalSteps>
</Modal>
```

- 방향은 `ModalStep` 순서로 정합니다. 순서와 다르게 보이려면 `direction="forward" | "back"`
- 숨긴 단계도 마운트된 채(`hidden`)라 돌아가면 입력한 값이 그대로 남습니다
- 포커스는 새 단계의 첫 컨트롤로 가고, 돌아가면 그 단계에서 마지막으로 있던 자리로 돌아옵니다. 컨트롤이 없는 단계면 패널 첫 컨트롤(닫기 버튼)로 갑니다
- 전환 동안 패널 · 본문 넘침을 숨겨 스크롤바가 잠깐 생겨 내용이 좁아지지 않게 합니다
- `prefers-reduced-motion` 이거나 모달이 닫히는 중이면 바로 바꿉니다. 첫 단계로 되돌리기는 `onExited` 에서 하면 되돌아가는 움직임이 보이지 않습니다

#### 스크롤 — 내용이 길 때

패널은 뷰포트 높이(`100dvh` - 위 자리 - 아래 32px)를 넘지 않고, **제목·푸터는 고정된 채 `children` 영역만 스크롤**됩니다. 앱이 따로 `max-height` 를 줄 필요가 없습니다. 스크롤 영역은 `tabIndex={0}` 을 받아 키보드로도 스크롤됩니다.

#### 오버레이 클릭 — 폼 모달에서는 끌 것

`closeOnOverlay` 기본값은 `true` 입니다. 읽기 전용 상세 모달에는 맞지만, **입력 요소를 담은 모달에서는 바깥 클릭 한 번에 작성 중인 내용이 사라집니다.** 폼·확인창에는 명시적으로 끕니다.

```tsx
<Modal open={open} onClose={close} closeOnOverlay={false} title="변경사항 저장">
```

패널 안에서 드래그를 시작해 오버레이에서 놓는 경우(텍스트 선택 등)는 **닫히지 않습니다** — 누른 곳과 놓은 곳이 모두 오버레이여야 닫습니다.

사용자 입장에서 Escape 와 오버레이 클릭은 같은 "실수로 닫기" 축입니다. 따로 다루면 한쪽만 막는 실수가 나옵니다 — `closeOnOverlay={false}` 만 주면 Escape 로는 여전히 닫힙니다. 둘을 함께 막으려면 `dismissible` 을 씁니다.

```tsx
// 오버레이만 막는다 - Escape 로는 닫힌다
<Modal open={open} onClose={close} closeOnOverlay={false} />

// 두 경로 모두 막는다 - X 버튼과 명시적 액션으로만 닫힌다
<Modal open={open} onClose={close} dismissible={false} />
```

`dismissible` 을 주면 `closeOnOverlay` 를 이깁니다. 안 주면 기존 동작 그대로입니다.

`dismissible={false}` 여도 Escape 스택에는 **등록됩니다.** 최상단 자리를 차지해 Escape 를 소비하므로, 아래에 열려 있는 다른 오버레이가 대신 닫히지 않습니다 — 사용자가 보고 있지 않은 것이 닫히는 게 더 나쁜 결과입니다.

안쪽의 `Combobox`·`Dropdown`·`Menu` 목록이 **열려 있으면** Esc 는 그 목록만 닫고 Modal 은 남습니다 — 열린 팝업의 Escape 는 팝업만 닫습니다(APG). 목록이 닫혀 있을 때의 Esc 는 그대로 Modal 에 닿습니다. 자식이 `preventDefault()` 또는 `stopPropagation()` 으로 처리를 알린 Escape 를 스택이 넘기는 규칙이라, 소비자 컴포넌트도 같은 방식으로 자기 Escape 를 지킬 수 있습니다.

#### 마운트 수명 — `children` 을 `open` 과 같은 값에 묶지 말 것

패널은 닫히는 모션이 끝날 때까지 마운트를 유지합니다(그래야 페이드아웃이 보입니다). **DS 가 닫히는 순간의 `children` 을 붙잡으므로**, 부모가 같은 tick 에 데이터를 비워도 본문이 먼저 사라지지 않습니다.

```tsx
// ✅ 이대로 써도 된다 - 퇴출 동안 마지막 본문이 그대로 보인다
<Modal open={!!item} onClose={close} title="상세">
  {item && <Body item={item} />}
</Modal>
```

앱이 마지막 값을 붙잡는 shim(`useState` + `useEffect`)을 두고 있었다면 지울 수 있습니다.

붙잡는 대상은 `children` 뿐이 아닙니다 — `title` · `description` · `footer` 도 함께 얼립니다. `footer` 는 선택된 항목에 종속된 액션(삭제 등)을 담는 일이 흔해서, 본문만 얼리면 footer 만 먼저 사라져 같은 버그가 그쪽에서 재현됩니다. (`Drawer` 는 `title` · `footer`.)

다시 열리면 **새** 값이 즉시 이깁니다. 붙잡는 값은 열려 있는 동안 계속 갱신되므로, 닫을 때 보이는 것은 처음 열었을 때가 아니라 **닫히는 순간**의 내용입니다.

데이터 자체를 정리할 시점이 필요하면 `onExited` 를 씁니다 — 화면 때문이 아니라 메모리·구독 정리 목적입니다.

```tsx
<Modal open={open} onClose={() => setOpen(false)} onExited={() => setItem(null)} title="상세">
  {item && <Body item={item} />}
</Modal>
```

`Drawer` 도 같은 수명·freeze 동작을 갖고 `onExited` · `dismissible` 을 제공합니다.

#### 포털 — `document.body` 로 렌더됩니다

Modal 은 `createPortal(…, document.body)` 로 렌더합니다. **앱이 다시 감쌀 필요가 없습니다.** 앱에는 `transform` 을 쓰는 조상(hover lift · 애니메이션 등)이 흔한데, `transform` 조상 아래에서는 `position: fixed` 의 containing block 이 뷰포트가 아니게 되어 오버레이가 깨집니다. 그걸 피하려고 컴포넌트가 스스로 포털합니다.

```tsx
// ❌ 이중 포털 - 사이드바의 스태킹 컨텍스트를 벗어나려고 감쌀 필요가 없다
createPortal(<Modal open={open}>…</Modal>, document.body)

// ✅ 그대로 쓴다
<Modal open={open}>…</Modal>
```

`Drawer` · `Popover` · `Tooltip` · `Alert` · `Toast` 도 같은 계약입니다.

---

### Drawer

화면 가장자리(left/right/bottom)에서 미끄러져 들어오는 패널. 필터, 상세 보기, 모바일 내비게이션, 하단 시트에 적합. Modal 과 동일하게 포커스 트랩 + Esc 닫기 + 배경 스크롤 잠금을 자동 처리합니다.

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

> 방향별 슬라이드 진입/퇴출은 CSS transition(`@starting-style` · `data-state`)으로 처리하며 `prefers-reduced-motion: reduce` 시 즉시 표시됩니다. `placement="top"` 과 배경 상호작용(non-modal) 변형은 현재 범위 밖.

**계약은 Modal 과 같습니다** — 아래 네 가지는 [Modal](#modal) 절의 설명과 동일하게 적용됩니다.

#### 접근성 이름은 필수입니다

`title` 이나 `ariaLabel` 중 **하나는 반드시** 줘야 합니다. 폴백이 없으므로 둘 다 비우면 이름 없는 대화상자가 되고, axe 의 `aria-dialog-name`(serious)이 잡습니다.

> 이전에는 이름이 없으면 영어 `"Dialog"` 로 조용히 채워졌습니다. Modal 과 같은 이유로 제거했습니다.

#### 스크롤 — 내용이 길 때

제목·푸터는 고정된 채 `children` 영역만 스크롤됩니다. 스크롤 영역은 `tabIndex={0}` 을 받아 키보드로도 스크롤되고, 초기 포커스는 그 wrapper 가 아니라 안쪽 첫 컨트롤로 갑니다.

초기 포커스 순서는 **본문 첫 컨트롤 → 닫기(X) 버튼 → 패널** 입니다. 첫 조작이 "닫기" 가 되면 Space/Enter 한 번에 모달이 사라지고 폼 모달에서는 첫 입력까지 Tab 을 한 번 더 쳐야 하므로, 본문에 컨트롤이 있으면 그쪽이 이깁니다.

**footer 는 초기 포커스 대상이 아닙니다.** `children` 없이 `footer` 만 쓰는 확인 모달에서 footer 첫 자리가 destructive 액션인 패턴이 흔해, 그리로 포커스가 가면 열자마자 Enter 한 번에 삭제가 실행됩니다. 그런 모달은 닫기 버튼으로 가고, 닫기 버튼도 없으면 패널 자신으로 갑니다. 탭 순환에는 모두 남습니다. `Drawer` 도 같습니다.

기본 순서가 틀린 자리로 가는 화면은 `initialFocusRef` 로 자리를 지정합니다 - 본문 첫 컨트롤이 필터 토글인 검색 모달은 검색 입력으로, 위험 확인 모달은 footer 의 **취소**로. 지정한 요소는 패널 안에 붙어 있어야 하고, 아니면 기본 순서로 떨어집니다.

```tsx
const cancelRef = useRef<HTMLButtonElement>(null);
<Modal open title="프로젝트 삭제" initialFocusRef={cancelRef}
  footer={<><Button danger onClick={remove}>삭제</Button><Button ref={cancelRef} onClick={close}>취소</Button></>} />
```

#### 오버레이 클릭 — 폼 드로어에서는 끌 것

`closeOnOverlay` 기본값은 `true` 입니다. **입력 요소를 담은 드로어에서는 바깥 클릭 한 번에 작성 중인 내용이 사라집니다** — 폼에는 명시적으로 끕니다. 패널 안에서 드래그를 시작해 오버레이에서 놓는 경우(텍스트 선택 등)는 닫히지 않습니다.

#### 마운트 수명

패널은 닫히는 모션이 끝날 때까지 마운트를 유지합니다. 그동안 `children` · `title` · `footer` 는 마지막으로 열려 있던 값으로 고정되므로, `open` 과 같은 값에 묶어도 본문이 먼저 사라지지 않습니다. 데이터 정리는 여전히 `onExited` 에서 합니다.

#### 포털

`document.body` 로 포털됩니다. 앱이 다시 감쌀 필요가 없습니다.

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
- **Tooltip**: hover/focus로 뜨는 **짧은 텍스트**. `role="tooltip"`, 포커스를 옮기지 않음. 포인터를 툴팁 위로 올려 읽을 수 있고 <kbd>Esc</kbd>로 닫힙니다 (WCAG 1.4.13).
- **Popover**: 클릭으로 열고 외부 클릭/Esc로 닫음. `role="dialog"`, 열릴 때 포커스가 패널로 이동. 상호작용 가능한 콘텐츠 (버튼/링크/입력) 포함 가능.

#### 선택 가이드

**placement (4방향)**
- `"top"` (기본) - 가장 자연스러운 배치. 트리거 위 공간이 충분할 때.
- `"bottom"` - 트리거가 화면 상단에 가깝거나, 위에 다른 패널이 있을 때.
- `"left"` / `"right"` - 가로 리스트(아이콘 툴바)에서 항목별 라벨, 또는 위/아래 공간이 부족할 때.

> ℹ️ `placement`는 **선호값**입니다. 뷰포트를 벗어나면 반대편으로 **flip**, 교차축으로 **shift**, 그래도 넘치면 `max-width` 축소가 자동 적용되고 `body`로 포탈됩니다(Radix `side` + `collisionPadding` 계약). 경계 근처라도 직접 조정할 필요가 없습니다.

**delay 가이드**
- 200ms (기본) - 마우스가 잠깐 머무를 때만 노출, 빠른 휙휙 이동에는 안 뜸
- 0~100ms - 즉시 노출이 필요한 키오스크/접근성 케이스
- 500ms+ - 자주 hover되는 영역 (테이블 row 등)에서 시각 노이즈 줄이기

> ⚠️ `children`은 **반드시 단일 ReactElement**여야 합니다 (`React.cloneElement`로 핸들러 주입). Fragment, 문자열, 배열은 동작하지 않음. trigger가 `<button disabled>`라도 wrapper span에 hover가 잡혀 정상 동작.

#### 접근성 (WAI-ARIA Tooltip pattern)

자동 처리되는 a11y 속성:

- 툴팁 노드: `role="tooltip"`, `id={useId()}`
- 트리거: 열렸을 때 `aria-describedby={tooltipId}` 자동 주입 → 스크린리더가 보조 설명으로 읽음
- **키보드**: <kbd>Tab</kbd>으로 트리거 포커스 → 자동 노출, <kbd>Tab</kbd>으로 벗어나면 닫힘, <kbd>Esc</kbd>로 즉시 닫힘
- focus / blur 모두 핸들링 - 키보드 전용 사용자도 동일하게 접근 가능
- **WCAG 1.4.13 Hoverable**: 툴팁에 `pointer-events` 가 살아 있어 포인터를 툴팁 위로 옮겨도 닫히지 않습니다 (`onMouseEnter` 로 지연 닫힘 취소). 다만 툴팁 안에 포커스 가능한 요소를 넣는 것은 여전히 금지 - `role="tooltip"` 은 포커스를 받지 않습니다.
- **WCAG 1.4.13 Dismissable**: 공유 오버레이 스택(`useOverlayEscape`)에 등록되어 최상단일 때만 <kbd>Esc</kbd>를 소비합니다. 다른 오버레이나 소비자 앱의 Escape 핸들러를 삼키지 않습니다.

> 📌 트리거 자체에도 라벨이 필요합니다. IconButton에는 `aria-label`을 따로 줘야 SR-only 환경에서도 의미가 전달됩니다 (tooltip은 보조이므로 시각 비의존 라벨이 우선).

#### 애니메이션

CSS transition(`token.presence`):

- **진입**: opacity `0→1` + transform `translate(4px) → 0` (placement 별로 진입 방향 다름)
  - top → 아래에서 위로, bottom → 위에서 아래로, left → 오른쪽에서 왼쪽으로, right → 그 반대
- **퇴출**: 같은 곡선으로 되돌아간 뒤 언마운트
- 곡선: 0.3s `linear()` - 스프링처럼 빠르게 나왔습니다 부드럽게 멈추는 곡선

#### 닫힘 처리

| 트리거 | 동작 |
|------|------|
| blur (트리거가 focus 잃음) | **즉시** 닫힘 |
| <kbd>Esc</kbd> | **즉시** 닫힘 (`useOverlayEscape` - 스택 최상단일 때만) |
| mouseleave (트리거 또는 툴팁) | **120ms 지연** 후 닫힘 (`HIDE_DELAY`) - 포인터가 트리거↔툴팁 사이 6px 갭을 건널 시간 |
| 툴팁 위로 mouseenter | 지연 닫힘 **취소** (열림 유지) |

- 외부 클릭으로 닫는 로직은 없습니다 (hover/focus 기반이라 불필요).
- unmount 시 timer cleanup 자동 처리.

#### DOM 구조 (SCSS override 시 참고)

```text
span.tooltip_wrapper           ← position: relative; display: inline-block
└── {children}                 ← cloneElement로 핸들러/aria 주입된 trigger

document.body (createPortal)   ← wrapper 밖으로 포탈됨 (DOM 상 트리거의 자식이 아님)
└── span.tooltip_position      ← position: fixed (좌표는 useAnchoredPosition)
        pointer-events 유지 + onMouseEnter/onMouseLeave (WCAG 1.4.13 Hoverable)
    └── span.tooltip           ← role="tooltip", transform 모션, max-width 240px
```

`document.body`로 **포탈**되고 `position: fixed` + `useAnchoredPosition`이 계산한 좌표로 배치되므로, 트리거의 `overflow: hidden`/`transform` 조상에 갇히거나 잘리지 않습니다. `z-index`는 `z_level5`.

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

> ℹ️ 세로 방향은 trigger **아래**가 우선입니다. 아래 공간이 모자라면 **위로 뒤집히고**(양쪽 다 모자라면 더 넓은 쪽), 진입 모션 방향도 따라 바뀝니다.

**trigger 패턴**
- `IconButton` + `MoreVertical` (케밥) - 행/카드의 잠재 액션 모음
- `Button` + 캐럿 아이콘 - 명시적인 액션 그룹 (`Actions ▾`)
- 일반 텍스트 / 링크는 비권장 (어포던스 부족)

> ⚠️ `trigger`는 **반드시 단일 ReactElement**. `cloneElement`로 `onClick`/`aria-*` 주입.

#### 접근성 (WAI-ARIA Menu pattern)

자동 처리되는 a11y 속성:

- 메뉴 컨테이너: `role="menu"`, `id={useId()}`
- 트리거: `aria-haspopup="menu"`, `aria-expanded={open}`, `aria-controls={menuId}` (열렸을 때)
- 각 아이템: native `<button type="button" role="menuitem" tabIndex={-1}>` (Enter/Space로 활성화) - 아이템은 Tab 순서에 들어가지 않고 화살표로 이동합니다
- 비활성 아이템은 native `disabled` 속성 → 포커스/클릭 모두 차단
- **키보드**:
  - <kbd>Tab</kbd> - trigger 포커스 → Enter/Space로 토글. 열리면 **첫 활성 아이템**으로 포커스가 갑니다
  - <kbd>↓</kbd> / <kbd>↑</kbd> - 다음/이전 아이템 (양 끝에서 순환, 비활성 아이템은 건너뜀)
  - <kbd>Home</kbd> / <kbd>End</kbd> - 첫/마지막 활성 아이템
  - <kbd>Esc</kbd> - 메뉴 닫음 + trigger 로 포커스 복귀
  - <kbd>Tab</kbd> (메뉴 안) - 메뉴를 닫고 trigger 로 포커스를 되돌린 뒤 이어서 다음 요소로 이동합니다
  - <kbd>Enter</kbd> / <kbd>Space</kbd> - 아이템 선택 → `onSelect` 호출 + 자동 close
- focus 관리: 아이템을 고르거나 Esc 로 닫으면 포커스가 trigger 로 돌아갑니다

> 📌 케밥 트리거 IconButton에는 `aria-label="More options"` 같은 식별 라벨을 꼭 줘야 합니다.

#### 애니메이션

CSS transition(`token.presence`):

- **진입**: opacity `0→1` + transform `translateY(-4px) → 0` (위에서 살짝 내려옴, 위로 flip 되면 아래에서 올라옴)
- **퇴출**: 모션 없이 바로 사라짐 - 항목을 고른 직후 메뉴가 남아 있지 않게
- 곡선: 0.3s `linear()` - 스프링처럼 빠르게 나왔습니다 부드럽게 멈추는 곡선
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
span.menu_wrapper                  ← ref 부착 (외부 클릭 판정)
├── {trigger}                      ← cloneElement로 onClick/aria 주입
└── div.menu                       ← createPortal(body), position: fixed (좌표는 useAnchoredPosition), role="menu"
    ├── menu_align_start | menu_align_end
    └── button.menu_item × N       ← role="menuitem", tabIndex -1
        ├── menu_item_destructive  ← 빨간 텍스트
        ├── menu_item_disabled     ← 비활성
        ├── span.menu_item_icon    ← aria-hidden
        └── span.menu_item_label   ← ellipsis
```

Menu 도 Dropdown·Tooltip·Popover 와 같이 **`body` 로 포탈**됩니다 - `position: fixed` + `useAnchoredPosition` 좌표로 배치되고 `z-index`는 `z_popup` 을 씁니다. 트리거에 `overflow: hidden` 이나 `transform` 조상이 있어도 잘리지 않습니다. 대신 `.menu_wrapper` 기준 선택자(`.my-card .menu`)로 스타일링하면 걸리지 않으니 클래스만으로 선택합니다. 폭은 트리거와 무관하게 내용 기준입니다.

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

trigger 클릭으로 펼쳐지는 **범용 non-modal 패널**. **임의의 interactive 콘텐츠 (폼, 설명, 액션 조합)**를 담습니다. Menu(액션 리스트) / Tooltip(hover 정보)과 역할이 다릅니다.

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

> ℹ️ `placement`는 **선호값**입니다. 뷰포트를 벗어나면 반대편으로 **flip**, 교차축으로 **shift**, 그래도 넘치면 `max-width` 축소가 자동 적용되고 `body`로 포탈됩니다(Radix `side` + `collisionPadding` 계약). 경계 근처라도 직접 조정할 필요가 없습니다.

**제어 / 비제어**
- 비제어 (기본) - `defaultOpen`만 주고 내부 state로 토글. 가장 간단.
- 제어 - `open` + `onOpenChange`로 외부 state가 소유. 외부 버튼/로직과 연동하거나 닫힘 시점을 직접 제어할 때.

> ⚠️ `trigger`는 **반드시 단일 ReactElement**. `cloneElement`로 `onClick`/`aria-*` 주입 (trigger의 기존 `onClick`은 보존). trigger 컴포넌트는 props를 forward해야 합니다 (`<button {...props}>`).

#### 접근성 (WAI-ARIA non-modal dialog)

자동 처리되는 a11y 속성:

- 패널: `role="dialog"`, `tabIndex={-1}`, `id={useId()}`
- 트리거: `aria-haspopup="dialog"`, `aria-expanded={open}`, `aria-controls={popoverId}` (열렸을 때)
- **포커스**: 열릴 때 패널 내 **첫 focusable**로 이동 (없으면 패널 자체). `Esc`로 닫으면 **trigger로 복귀**
- **키보드**: <kbd>Tab</kbd> trigger 포커스 → Enter/Space로 토글 / <kbd>Esc</kbd> 닫음 (+ trigger 복귀)
- 열린 동안 Tab 을 패널 안에 가둡니다 (`useFocusTrap`) - `body` 로 포탈되어 trigger 뒤 Tab 순서가 끊기기 때문입니다. 닫히면 포커스가 **열기 전 자리**로 돌아갑니다 - trigger 로 열었으면 trigger 입니다. `open` 을 바깥 로직으로 바꿔 열었다면 그때 포커스가 있던 요소로 가고, 그 요소가 사라졌거나 닫히는 오버레이 안이면 되돌리지 않습니다. 바깥 클릭으로는 그대로 닫히므로 페이지 나머지와 상호작용할 수 있습니다

> 📌 `dialog`는 접근성 이름이 필요합니다. content에 제목이 없으면 `aria-label`을, 있으면 그 요소 id로 `aria-labelledby`를 줍니다. **폴백이 없습니다** — 둘 다 비우면 이름 없는 대화상자가 되고 axe `aria-dialog-name` 이 잡습니다 (Modal · Drawer 와 같은 계약).

#### 애니메이션

CSS transition(`token.presence`):

- **진입**: opacity `0→1` + transform `translate(4px) → 0` (placement별 진입 방향 다름 - Tooltip과 동일 규칙)
- **퇴출**: 같은 곡선으로 되돌아간 뒤 언마운트
- 곡선: 0.3s `linear()` - 스프링처럼 빠르게 나왔습니다 부드럽게 멈추는 곡선

#### 외부 클릭/Esc 처리

열린 동안에만 listener 등록:
- **외부 클릭** (`mousedown`, wrapper · 패널 바깥) → close
- **Esc 키** (`keydown`) → close + trigger로 포커스 복귀
- 패널 내부 클릭은 닫지 않음 (interactive 콘텐츠 보호)
- `open === false`로 바뀌면 listener 모두 cleanup

#### DOM 구조 (SCSS override 시 참고)

```
div.popover_wrapper                ← position: relative; display: inline-flex; ref 부착 (외부 클릭 판정)
├── {trigger}                      ← cloneElement로 onClick/aria 주입
└── div.popover_position           ← createPortal(body), position: fixed (좌표는 useAnchoredPosition)
    └── div.popover                ← role="dialog", transform 모션
```

`document.body`로 **포탈**되고 `position: fixed` + `useAnchoredPosition` 좌표로 배치되므로 trigger의 `overflow: hidden`/`transform` 조상에 갇히거나 잘리지 않습니다. `z-index`는 `z_level5` 사용.

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

// variant - glass 는 컬러/이미지 배경 위에서 빛난다, outline 은 투명 + 테두리
<Card variant="glass" heading="Glass">내용</Card>
<Card variant="outline" heading="Outline">내용</Card>

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

> ℹ️ `interactive` 는 hover-lift **시각 효과만** 제공합니다 (MediaCard `clickable` 과 동일 범위). 조작은 `onClick` 으로 붙입니다 - `onClick` 을 주면 카드가 `role="button"` + 탭 정지가 되고 Enter·Space 로도 눌립니다(WCAG 2.1.1). `onClick` 이 없으면 탭 순서에 들어가지 않습니다. `ListItem` 과 같은 규칙입니다. **`onClick` 을 줄 때는 `interactive`(MediaCard 는 `clickable`)도 함께 켜라** - 안 켜면 키보드·스크린리더에는 버튼인데 마우스 사용자에게는 눌린다는 단서가 전혀 없는 카드가 됩니다. 카드 **안에** 링크나 버튼을 또 두면 조작 표면이 겹치므로, 그때는 카드에 `onClick` 을 주지 말고 안쪽 요소에 연결하라. `glass` 는 흰 배경 라이트 모드에서는 약하게 보이므로 컬러/이미지 배경 위에 사용합니다.

---

### Stat

대시보드의 지표 한 칸. 이름 · 값 · 변화량. 화면마다 `<p style={{ fontSize: 24, fontWeight: 700 }}>`
로 다시 만들던 층입니다.

```tsx
import { Card, Stat } from '@bigtablet/design-system';

<Card bordered padding="lg">
  <Stat label="오늘 매출" value="₩1,284,000" delta="+12%" deltaTone="positive" />
</Card>
```

**값은 `tabular-nums` 입니다.** 비례 숫자는 자릿수마다 폭이 달라 값이 갱신될 때 숫자가 좌우로
흔들리고, 여러 지표를 나란히 두면 자리가 맞지 않습니다. 화면마다 정하게 두면 대부분 빠집니다.

`deltaTone` 은 **방향이 아니라 좋음/나쁨**입니다 — "재고 부족 +2" 는 오르지만 `negative` 입니다.

표면(테두리·여백)은 `Card` 가 소유합니다. 실측 대비 — positive 5.48:1, neutral 5.02:1,
negative 6.47:1 (흰 카드 위).

### DescriptionList

이름·값 쌍의 목록. 상세 보기 화면의 기본 골격.

```tsx
import { DescriptionList } from '@bigtablet/design-system';

<DescriptionList
  divided
  items={[
    { label: "주문번호", value: "#1024" },
    { label: "배송지", value: "서울시 …", full: true },
  ]}
/>
```

`DescriptionListItem` — `{ label, value, full? }`. `full: true` 면 값이 한 줄을 다 씁니다
(주소·메모).

`<dl>` · `<dt>` · `<dd>` 로 렌더합니다. 손으로 만들면 거의 항상 `<div>` 두 개가 되고, 그러면
스크린리더에 **이름과 값의 관계가 남지 않습니다** — 이름만 읽고 값을 따로 읽어 주는 목록이 됩니다.

`row` 는 600px 아래에서 스스로 쌓입니다. 두 열을 유지하면 값이 잘립니다.

### Timeline

시간 순서로 흐르는 진행 상황. 주문 추적, 승인 단계, 활동 기록.

```tsx
import { Timeline } from '@bigtablet/design-system';

<Timeline
  items={[
    { id: 1, title: "주문 접수", time: "오후 1:32", status: "done" },
    { id: 2, title: "배송 출발", time: "오후 1:48", status: "active", icon: <Truck size={16} /> },
    { id: 3, title: "배송 완료", time: "예상 오후 2:05" },
  ]}
/>
```

`TimelineItem` — `{ id, title, time?, description?, status?, icon?, children? }`.
`status` 는 `'done' \| 'active' \| 'pending'` (기본 `pending`). `icon` 이 없어도 상태가 **모양**으로
갈립니다 — `done` 은 체크, `active` 는 꽉 찬 점, `pending` 은 빈 원. 배경색만 다르면 색을 구분하지
못하는 사용자에게 `done` 과 `active` 가 같아 보입니다(WCAG 1.4.1).
`children` 으로 항목 아래에 첨부·액션을 붙입니다.

`<ol>` 로 렌더합니다 — 순서가 있는 목록이라 스크린리더가 "3개 중 2번째" 를 읽어 줍니다.
연결선은 인디케이터의 `::before` 로 그려 **마지막 항목에서 끊습니다** — 별도 요소로 두면
`isLast` 판정을 화면마다 다시 써야 합니다. 인디케이터는 장식이라 `aria-hidden` 입니다.

### Divider

```tsx
import { Divider } from '@bigtablet/design-system';

// 기본 사용
<Divider />

// 굵은 구분선
<Divider weight="heavy" />
```

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
  overline={<Badge tone="success" appearance="soft">활성</Badge>}
  label={<span>릴리스 <strong>v3.2</strong></span>}
  supportingText={<span>자세히는 <a href="/changelog">체인지로그</a></span>}
/>
```

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
    <Badge shape="dot" tone="error" aria-label="읽지 않은 알림" />
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

작은 상태/카운트 표시. `dot` / `count` / `label` 3가지 shape × 6가지 의미 색(`tone`).

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
| 크기 | 매우 작음 (dot 8px / count 20px, `md`) | 보통 (28+px) |
| 위치 | 다른 요소에 부착 (절대 위치 흔함) | 인라인 흐름 |

#### shape 선택 가이드

| shape | 크기 | 용도 |
|-------|------|------|
| `dot` | 8×8 (`md` 기준, 텍스트 없음) | "변경사항 있음" 같은 boolean 알림. 가장 시각적 부담 적음 |
| `count` | height · min-width 20, 좌우 6px 패딩, 12px 폰트, 원형 (`md` 기준) | 알림 개수. `count > max` 시 `${max}+`로 표시 |
| `label` | 12px 폰트, padding 3×10 (`md` 기준), 대소문자 변환 없음 | "NEW", "BETA" 라벨 |

#### tone 의미 매핑

| tone | 토큰 | 의미 |
|---------|------|------|
| `accent` | accent (라이트 검정 · 다크 흰색) | 기본/브랜드 강조 |
| `neutral` | bg.solid.dim | 정보 없는 메타 라벨 |
| `info` | status.info | 정보성 ("Beta") |
| `success` | status.success | 정상/활성 |
| `warning` | status.warning | 경고 |
| `error` | status.error | 에러/긴급 알림 (배지 카운트의 기본 컬러) |

#### 접근성

- Badge는 시멘틱 없는 `<span>`이라, **스크린리더에게 의미를 전달하려면 직접 `aria-label`을 넣어야 합니다**
- 특히 `shape="dot"`은 텍스트가 없어서 SR이 아예 무시함 → 의미가 있다면 `aria-label`로 보충하세요

```tsx
import { Badge } from '@bigtablet/design-system';

// 알림 점만 있고 SR은 모름
<Badge shape="dot" tone="error" />

// SR에게 "읽지 않은 알림" 이라고 알려줌
<Badge shape="dot" tone="error" aria-label="읽지 않은 알림" />

// 부모가 의미를 전달하면 Badge는 aria-hidden으로 중복 제거
<button aria-label={`알림 ${count}개`}>
  <BellIcon />
  <Badge shape="count" count={count} tone="error" aria-hidden="true" />
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
<Badge shape="dot" tone="error" aria-label="읽지 않은 메시지 있음" />

// count - 알림 개수
<Badge shape="count" count={5} tone="error" />
<Badge shape="count" count={120} max={99} /> // "99+"

// label - tone 비교
<Badge tone="success">Active</Badge>
<Badge tone="warning">Pending</Badge>
<Badge tone="info">Beta</Badge>

// 다른 요소에 부착 - 아이콘 버튼 + 카운트
<button aria-label={`알림 ${unread}개`} style={{ position: "relative" }}>
  <BellIcon />
  <span style={{ position: "absolute", top: -4, right: -4 }}>
    <Badge shape="count" count={unread} tone="error" aria-hidden="true" />
  </span>
</button>
```

---

### Chip

읽을 거리가 있는 태그·카테고리(`static`), 또는 누르고 고르고 지우는 토큰(`basic` · `filter` · `input`).

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 태그·카테고리 라벨, 상태 라벨 (`tone`) | ✅ Chip `type="static"` |
| 필터 토글, 입력된 값 토큰 (지우기 가능) | ✅ Chip `type="filter"` · `"input"` |
| 개수 · 점 · `New` 같은 짧은 표시 | ❌ [Badge](#badge) |
| 사용자가 목록에 없는 값을 직접 여러 개 입력 | ❌ [TagInput](#taginput) |

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

> **v3.0 변경**: 기존 별도 `Tag` 컴포넌트가 `Chip`의 `type="static"`으로 흡수되었습니다. 카테고리/상태 표시는 `<Chip type="static" tone="..." />`로 마이그레이션하세요.

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

> 좁은 화면(compact, 600px 미만)에서 자동으로 더 짧아지고, title 폰트도 `display.small.medium` → `heading.large.medium`으로 축소됩니다.

#### overlay 선택 가이드

배경 이미지 위에 텍스트 대비 확보용 그라데이션:

| overlay | 그라데이션 | 권장 |
|---------|-----------|------|
| `false`/undefined | 없음 | 배경이 단색이거나 어두운 이미지일 때 |
| `true` / `'dark'` | 위→아래 검정 0.1 → 0.55 | 밝은/혼합 이미지 위 흰 텍스트 |
| `'light'` | 위→아래 흰색 0.1 → 0.7 | 어두운 이미지 위 어두운 텍스트 |

#### textColor 결정 로직 (`textColor="auto"` 기본)

```
isDarkOverlay = overlay === 'dark'     (true 는 'dark' 로 취급)
auto =
  isDarkOverlay                       → inverse (흰색)
  backgroundImage && !overlay         → inverse (이미지 위는 흰색 안전)
  나머지                              → default (텍스트 토큰)
```

배경/오버레이 조합이 특이하면 `textColor="inverse"` 또는 `"default"`로 명시하세요.

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
import { Hero } from "@bigtablet/design-system";

// 마케팅 랜딩 - 이미지 + dark overlay + 중앙 CTA
<Hero
  height="lg"
  align="center"
  backgroundImage="/hero.jpg"
  overlay="dark"
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

// 링크 CTA - href 를 주면 anchor 로 렌더
<Hero
  height="md"
  title="문서 보기"
  backgroundColor="#121212"
  textColor="inverse"
  primaryAction={{ label: "문서로 이동", href: "https://docs.bigtablet.com" }}
/>
```

#### 제목 줄바꿈 - `BalancedText`

랜딩 · 캠페인 제목을 의미 단위("고객의 신뢰를 먼저 얻은 다음에 / 더 많은 데이터를 요청하세요")로 끊고 싶으면
`@bigtablet/design-system/text` 의 `BalancedText` 를 `title` 슬롯에 넣습니다. DS 에 들어 있어 따로 설치할 의존성이 없습니다.
Hero · PageHeader · EmptyState 의 `title` 이 `ReactNode` 라 그대로 들어갑니다.

```tsx
import { Hero } from "@bigtablet/design-system";
import { BalancedText } from "@bigtablet/design-system/text";

<Hero
  title={
    <BalancedText>
      고객의 신뢰를 먼저 얻은 다음에 더 많은 데이터를 요청하세요
    </BalancedText>
  }
/>
```

- **기본 `span` 은 블록으로 놓입니다** - `BalancedText` 는 자기 폭을 줄 폭으로 잽니다. 기본 `span` 은 `.text_balanced` 가 `display: block` 으로 두어 제목 슬롯(`h1` 등) 안에 그대로 넣으면 됩니다. `as` 로 고른 요소는 제 display 를 씁니다(`li` · `td` 그대로) - 인라인 요소(`a` 등)를 고르면 `display: block` 을 줍니다
- 줄을 고르는 기준과 제약은 [문구 줄바꿈](#prop-이름-기준)의 `BalancedText` 설명을 봅니다
- SSR 앱은 [`BalancedTextScript`](#ssr---balancedtextscript) 를 `<body>` 끝에 한 번 두면 하이드레이션 전에도 같은 줄로 보입니다

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
| `overlay` | 이미지 위에 텍스트 + 어두운 scrim 그라데이션(`$color_scrim_dark_clear` → `$color_scrim_dark_heavy`), 4/3 기본 | 캠페인/히어로 카드 - 강한 시각 강조 |

#### shadow / bordered 선택 가이드

- `shadow="sm"` (기본) + `bordered={false}` - Material스러운 부드러운 카드. 90% 케이스
- `shadow="md/lg"` - 떠 있는 느낌, 강조하고 싶을 때
- `bordered={true}` + `shadow="none"` - 단정한 outline 카드 (관리자 페이지, 폼 안)
- `clickable={true}` - hover 시 `translateY(-2px) + elevation_level3` - 라우팅 가능한 카드에 사용

#### aspectRatio

- `top`/`left`에서는 `image_wrap`에 적용 (이미지만 비율 유지)
- `overlay`에서는 **카드 자체**에 적용 (텍스트가 이미지 위에 얹히기 때문)
- 미지정 시: `top`은 16/9, `overlay`는 4/3, `left`는 비율 없이 width 40% (모바일에서만 16/9)

#### 접근성

- 루트는 `<div>` - **클릭 가능한 카드는 직접 키보드 핸들링 책임**
  - 추천: `<a>` 또는 `<Link>`로 카드 전체를 감싸기 (가장 단순)
  - 대안: `role="button" tabIndex={0}` + `onKeyDown` (Enter/Space)
- 헤딩 위계: `headingAs="h2"|"h3"` 등을 페이지 구조에 맞게 조정. 예: Hero의 h1 아래라면 h2
- 이미지 alt: 의미 있는 이미지면 설명, 장식이면 `alt=""` (SR이 무시)
- `overlay` 모드에서는 텍스트가 이미지 위라 **대비 확인 필수** - 어두운 그라데이션이 자동 적용되지만 밝은 이미지 + 짧은 텍스트에서는 추가 boldness 필요할 수 있음

```tsx
import { MediaCard } from '@bigtablet/design-system';

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
| 권한 없어서 못 봄 | ✅ EmptyState (illustration: Lock 아이콘) |
| 로딩 중 | ❌ [Spinner](#spinner) 또는 Skeleton 권장 |
| 페이지 없음 (404) | ✅ EmptyState `size="lg"` + `fillHeight`  |
| 불러오기 실패 · 서버 · 네트워크 오류 (500 등) | ❌ [ErrorState](#errorstate) - 재시도 버튼을 붙일 수 있습니다 |

**EmptyState vs ErrorState vs InlineAlert**

| | EmptyState | ErrorState | InlineAlert |
|---|------------|------------|-------------|
| 의도 | "지금은 비어있어요" | "불러오지 못했어요" | "알아 둘 것이 있어요" |
| 톤 | 중립적, 안내/온보딩 | 오류, 재시도 유도 | 정보 · 경고 · 오류 (`tone`) |
| 위치 | 콘텐츠 영역 전체 차지 | 콘텐츠 영역 전체(`variant="page"`) 또는 위젯 안(`"widget"`) | 콘텐츠 위 · 사이에 끼는 띠 - 내용은 그대로 보입니다 |
| 아이콘 | Inbox, Search, FolderOpen 등 정보성 | 경고 아이콘 (기본) | `tone` 아이콘 |

> [Alert](#alert) 는 화면을 막는 **확인 창**이라 비어 있음 · 실패 표시에 쓰지 않습니다.

#### size 선택 가이드

| size | 패딩 | 제목 타이포 | 아이콘 배지 / 아이콘 | 권장 위치 |
|------|------|----------|----------|----------|
| `sm` | 24/16 | title.medium | 40 / 20px | 모달 안, 사이드바, 좁은 영역, 검색 결과 |
| `md` (기본) | 40/24 | title.large | 64 / 32px | 콘텐츠 영역 전체 |
| `lg` | 48/24 | heading.small | 96 / 48px | 페이지 메인, 온보딩, 404 |

간격은 위계를 둡니다 - 제목·설명은 붙이고(4~8px), 아이콘 아래(12~20px)와 버튼 위(16~32px)는 더 띄웁니다.

#### illustration 슬롯

lucide 아이콘을 넘기면 원형 배지(`bg-additive`)에 올리고 아이콘 크기를 `size` 에 맞춰 고정합니다 -
아이콘의 `size` prop 은 넘기지 않아도 되고, 넘겨도 무시됩니다. 이미지나 직접 그린 svg 일러스트는 배지 없이
원래 크기 그대로 렌더합니다.

```tsx
import { EmptyState } from '@bigtablet/design-system';

<EmptyState illustration={<Inbox />} title="받은 메일이 없습니다" />
```

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
  illustration={<Inbox />}
  title="받은 메일이 없습니다"
  description="새 메일이 오면 여기 표시됩니다."
  action={<Button>새 메일 작성</Button>}
/>

// 검색 결과 없음 - sm 사이즈, action 없음
<EmptyState
  illustration={<Search />}
  title="검색 결과가 없습니다"
  description="다른 키워드로 검색해보세요."
  size="sm"
/>

// 온보딩 - lg + 2개 CTA
<EmptyState
  illustration={<Inbox />}
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
  illustration={<Search />}
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
| `page` (기본) | 전체 화면/영역 fallback (route error boundary) | 배지 96 / 아이콘 48 + `min-height: 320` + 넉넉한 패딩 |
| `widget` | 위젯/카드 내부 인라인 fallback | 배지 40 / 아이콘 20 + 좁은 패딩 |

`variant` 는 [EmptyState](#emptystate) 의 `size` 에 대응합니다 - `page` ≈ `lg`, `widget` ≈ `sm` (간격 위계·제목 크기가 같습니다). 같은 화면에 둘을 섞어 쓸 때 이 짝을 맞추면 높이와 리듬이 어긋나지 않습니다.

#### 아이콘

미지정 시 기본 경고 아이콘(`TriangleAlert`). `icon` prop 으로 교체, `icon={null}` 로 숨김.

> **`icon` 은 장식 전용입니다.** 래퍼의 `aria-hidden="true"` 는 필수입니다 - 기본 아이콘이 이름 없는 bare lucide svg 라서 래퍼를 빼면 `role="alert"` 이 이름 없는 그래픽까지 읽습니다. 포커스 가능한 요소는 `action` 슬롯으로 (WCAG 4.1.2). `EmptyState.illustration` 과 같은 계약입니다.

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
  icon={<ServerCrash strokeWidth={1.5} />}
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
import { Accordion } from '@bigtablet/design-system';

// 비제어형 - 90% 케이스. defaultOpenKeys로 초기 상태만 지정
<Accordion items={faq} defaultOpenKeys={["q1"]} />

// 제어형 - 외부 state로 동기화 필요할 때 (URL 쿼리, 다른 컴포넌트와 연동)
const [open, setOpen] = useState<string[]>(["q1"]);
<Accordion items={faq} openKeys={open} onValueChange={setOpen} />
```

#### 접근성 (WAI-ARIA Disclosure pattern)

자동 처리되는 a11y 속성:

- Trigger button: `aria-expanded`, `aria-controls={panelId}`
- Panel: `role="region"`, `aria-labelledby={headerId}`, `aria-hidden={!isOpen}`
- 헤더는 `headingAs` 태그(기본 `<h3>`) 사용 (트리거 위계 보존)
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
    ├── h3.accordion_header        ← headingAs (기본 h3)
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

마크다운 등으로 렌더된 본문에 조판을 입힙니다. **파서를 포함하지 않습니다** — 앱이 `react-markdown` 같은 렌더러로 만든 결과를 감싸면 자손 셀렉터로 토큰 기반 타이포·간격·색이 적용됩니다(다크 모드 자동).

```tsx
import { Prose } from '@bigtablet/design-system';
import ReactMarkdown from 'react-markdown';

<Prose size="lg">
  <ReactMarkdown>{policy}</ReactMarkdown>
</Prose>
```

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

##### `h1` 의 밑줄

`h1` 에는 `padding-bottom: 8px` + 아래 경계선이 붙습니다. 문서 안에서 최상위 절을 나누는 장식이고, **`h1` 이 문서 제목 자체인 경우(약관·정책 페이지)에는 장식이 하나 더 붙는 셈**입니다. 그 경우 소비처에서 지웁니다.

```scss
/* 전역 SCSS (이 DS 와 같은 방식) */
.policy .prose h1 { padding-bottom: 0; border-bottom: 0; }
```

소비처가 CSS Modules(`*.module.scss`)를 쓴다면 DS 클래스는 지역화 대상이 아니므로 `:global()` 로 감쌉니다 — `.policy :global(.prose h1) { … }`.

#### 다루는 요소

`h1`~`h6` · `p` · `ul`/`ol`/`li`(중첩 포함) · `a` · `code` · `pre` · `blockquote`(중첩 포함) · `table`/`th`/`td` · `hr` · `img` · `strong` · `em` · `del`.

#### 넓은 표·코드 블록

`table` 과 `pre` 는 페이지를 가로로 밀지 않고 **자기 안에서 스크롤**됩니다. 스크롤이 실제로 생기는 경우에만 `tabindex="0"` 이 붙어 키보드로도 움직일 수 있습니다(axe `scrollable-region-focusable`). 폭이 넉넉해져 스크롤이 사라지면 떨어집니다 — 불필요한 탭 정지가 남지 않습니다.

> 표를 **별도 래퍼로 감싸는 소비자**는 여백 중복을 확인하세요. `.prose table` 은 자기 아래 여백(`margin-bottom: 16px`)을 갖기 때문에, 래퍼에도 세로 여백을 두면 두 값이 더해집니다.

#### 본문 속 링크는 밑줄이 유지됩니다

WCAG 1.4.1(Use of Color)상 색만으로 구분하는 것도 **링크와 주변 본문의 대비가 3:1 이상이면** 허용되지만, DS 의 accent 색은 그 문턱을 넘지 못해 axe 가 `link-in-text-block` 으로 잡습니다. 밑줄은 색 대비와 무관하게 성립하므로 `text-decoration: none` 으로 덮어쓰지 마세요.

---

### Table

컬럼 정의 기반 데이터 테이블.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 같은 형식의 행을 열로 비교 (주문 목록, 사용자 목록) | ✅ Table |
| 목록 화면 전체 - 검색 · 선택 액션 · 페이지 · 로딩 · 빈 상태 · 오류까지 | ❌ [DataView](#dataview) (안에서 Table 을 씁니다) |
| 한 항목의 속성을 "이름: 값" 으로 나열 (상세 화면) | ❌ [DescriptionList](#descriptionlist) |
| 열 비교가 필요 없는 한 줄짜리 항목 목록 (설정, 메뉴) | ❌ [ListItem](#listitem) |

 로딩 중에는 헤더를 유지한 채 바디만 [Skeleton](#skeleton) 행으로 대체하고, 정렬·행 선택·행 클릭을 지원합니다.

> DS 는 데이터를 **직접 정렬하지 않습니다**. `sortable` 헤더 클릭 시 `onSortChange` 만 발화하므로, 소비자가 정렬된 `data` 를 다시 내려줘야 합니다.

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
    render: (u) => <Chip type="static" tone={u.active ? "success" : "neutral"} label={u.active ? "활성" : "휴면"} />,
  },
];

function UserTable({ users, isLoading }: { users: User[]; isLoading: boolean }) {
  const [sort, setSort] = useState<TableSort | undefined>();
  const [selected, setSelected] = useState<string[]>([]);

  // 정렬은 소비자 책임 - DS 는 상태만 알려준다
  const rows = useMemo(() => (sort ? sortBy(users, sort) : users), [users, sort]);

  return (
    // stickyHeader 는 감싼 요소의 확정된 높이를 표 래퍼가 물려받아 동작한다
    <div style={{ height: 240 }}>
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
    </div>
  );
}
```

#### 접근성

- 정렬 헤더는 `<button>` 이고 현재 상태가 `aria-sort` 로 노출됩니다.
- `onRowClick` 이 있는 행에는 `rowClickHint` 가 `aria-describedby` 로 연결됩니다. `<tr>` 에 `aria-label` / `role="button"` 을 쓰면 셀 데이터를 스크린리더가 못 읽으므로 의도적으로 `aria-describedby` 를 씁니다.
- 선택 체크박스는 [Checkbox](#checkbox) 를 사용하며 `selectAllAriaLabel` / `selectRowAriaLabel` 로 레이블을 커스터마이즈합니다.
- `selectable` 이면 **미선택 행도 `aria-selected="false"`** 를 갖습니다. 속성이 없으면 보조기술은 "선택 개념이 없는 행" 으로 읽어 고를 수 있는지 알 수 없습니다(APG grid). 선택 개념이 없는 표에는 붙이지 않습니다.
- 한 쪽만 받아 그리는 표는 `rowIndexOffset` 을 줍니다. 없으면 쪽마다 번호가 1 부터 다시 시작해, 3쪽의 체크박스도 1쪽과 **글자까지 같은** 이름으로 읽힙니다 - 스크린리더 사용자는 쪽이 넘어갔는지 알 수 없습니다. `DataView` 는 `pagination.pageSize` 를 주면 자동으로 계산합니다.

---

### DataView

목록 화면 한 벌 — 검색·필터, 표, 선택 액션, 페이지네이션, 그리고 **네 상태 분기**
(loading / error / empty / data)를 한 곳에 둡니다.

`Table` 은 정렬·선택·스켈레톤을 이미 처리합니다. `DataView` 가 파는 것은 **그 위아래를 매번
다시 만들지 않는 것**입니다 — 특히 에러 상태를 빠뜨린 목록이 생기지 않게.

```tsx
import { DataView, Dropdown } from '@bigtablet/design-system';

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

동작 규칙 세 가지:

- **로딩 중에는 빈 상태를 띄우지 않습니다.** `Table` 이 스켈레톤을 그리므로, 빈 배열 + 로딩을 empty 로 처리하면 "없음 → 스켈레톤 → 데이터" 로 두 번 깜빡입니다
- **`refetch` 가 없으면 재시도 버튼도 없습니다.** 누를 수 없는 버튼을 띄우지 않습니다
- **선택 개수는 `role="status"` 로 알립니다.** 액션 줄이 시각적으로만 나타나면 키보드 사용자는 무엇이 가능해졌는지 모릅니다

> **선택 체크박스 라벨은 기본값이 순번입니다.** `"13번째 행 선택"` 이라 스크린리더 사용자는 어떤
> 행을 고르는지 번호로만 듣습니다. 행을 이름으로 구분하려면 `selectRowAriaLabel` 의 **둘째 인자**를
> 씁니다 - 그 행의 데이터가 그대로 옵니다. 첫 인자는 `Table` 과 같은 전체 순번이라 페이지가 있어도
> 오프셋 계산이 필요 없습니다.
>
> ```tsx
> <DataView selectRowAriaLabel={(_, row) => `${row.name} 선택`} />
> ```

---

### Icon

[lucide-react](https://lucide.dev/icons/) 아이콘 래퍼. `aria-label` 이 없으면 `aria-hidden` + `focusable={false}` 를 자동 적용해 스크린리더 노이즈를 막습니다.

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

> 나머지 `LucideProps`(= SVG 속성)는 그대로 전달됩니다 (`ref` 제외). `iconSize` 토큰: `xs` 14 · `sm` 16 · `md` 18 · `lg` 20 · `xl` 32.

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

규칙: **Section은 절대 Container 없이 단독으로 쓰지 않습니다.** Section은 수직 여백과 배경만 담당하고, 가로 폭 제한은 Container의 책임입니다. Stack과 Grid는 그 안쪽에서 자식 정렬을 담당합니다.

```
Section (수직 패딩 + 배경)
└── Container (max-width + 좌우 패딩)
    └── Stack (한 열 또는 한 줄)
        └── Grid (카드 격자)
            └── Card / MediaCard …
```

### AppShell

관리자·대시보드 화면의 껍데기. 사이드바 열 + 고정 헤더 + 본문을 한 곳에서 잡습니다. 화면마다
`<div style={{ display: "flex", minHeight: "100vh" }}>` 로 다시 만들던 층입니다.

```tsx
import { AppShell, Button, DataView, NavBar, PageHeader, Sidebar } from '@bigtablet/design-system';

<AppShell sidebar={<Sidebar … />} header={<NavBar layout="fluid" sticky … />}>
  <PageHeader title="대시보드" actions={<Button>추가</Button>} />
  <DataView … />
</AppShell>
```

손으로 조립할 때 조용히 빠지던 넷을 DS 가 소유합니다.

- **문서가 스크롤합니다** — 본문을 `overflow-y: auto` 로 만들면 `Modal`·`Drawer` 의 스크롤 잠금
  (`html { overflow: hidden }`)이 본문에 닿지 않아 모달 뒤 배경이 계속 스크롤됩니다. 사이드바와
  헤더는 `sticky` 입니다
- **콘텐츠 열은 `minmax(0, 1fr)`** — 자기 넘침을 스스로 처리하지 않는 자식(줄바꿈 없는 긴 문자열
  등)이 열 자체를 늘리는 것을 막습니다. 실측 - 1800px 자식을 넣으면 열이 1024px → 1869px 로 늘어나
  고정 헤더와 모든 행이 화면보다 넓어집니다
- **하단 크롬 여백** — `Sidebar` 는 600px 아래에서 fixed BottomBar 로 변신하고 `BottomNav` 도
  fixed 입니다. 본문 끝이 그 아래로 가리지 않게 `--bt-bottom-inset` 만큼 띄웁니다
- **건너뛰기 링크** — 사이드바나 헤더가 있으면 첫 Tab 에 "본문으로 건너뛰기" 가 왼쪽 위에 뜹니다.
  Enter 로 `<main tabindex="-1">` 에 포커스가 가서 다음 Tab 이 본문 첫 컨트롤이 됩니다 (WCAG 2.4.1).
  SCSS 로 직접 그릴 때는 `@include token.skip_link` (Vanilla `.bt-skip-link` 와 같은 믹스인)

헤더를 사이드바 위까지 꽉 채우려면 `AppShell` 밖에 두면 됩니다.

### PageHeader

화면 제목 줄. 경로 · 제목 · 설명 · 액션 · 탭을 한 규약으로 묶습니다. 화면마다
`<h1 style={{ fontSize: 20, fontWeight: 600 }}>` 로 다시 만들던 층입니다.

```tsx
import { Breadcrumb, Button, PageHeader } from '@bigtablet/design-system';

<PageHeader
  breadcrumb={<Breadcrumb items={…} />}
  title="주문 관리"
  description="결제 완료된 주문만 보입니다"
  actions={<Button>주문 추가</Button>}
/>
```

제목은 `h1` 입니다 — 화면의 제목이므로 문서에 하나만 있어야 합니다. 겉은 `<header>` 가 아니라 `<div>`
인데, `<header>` 는 `<main>` 안에 있어도 banner landmark 로 계산돼(`main` 은 sectioning content 가
아닙니다) `NavBar` 와 banner 가 둘이 되기 때문입니다.

`tabs` 에는 `TabList` 만 넣고, `Tabs` 는 `PageHeader` 와 본문을 **함께** 감쌉니다. 패널을 `Tabs` 밖에
두면 탭의 `aria-controls` 가 존재하지 않는 요소를 가리킵니다.

```tsx
<Tabs defaultValue="all">
  <PageHeader title="주문 관리" tabs={<TabList>…</TabList>} />
  <TabPanel value="all">…</TabPanel>
</Tabs>
```

HTML 의 `title` 속성(툴팁)은 prop 에서 제외했습니다 — 화면 제목이 `ReactNode` 를 받아야 하기 때문입니다.

### Container

max-width 제한 + 반응형 수평 패딩을 가진 컨테이너. 마케팅/서비스 페이지의 기본 wrapper.

#### 언제 쓰는가

| 상황 | 선택 |
|------|------|
| 페이지/섹션의 가로 폭을 제한하고 좌우 정렬 | ✅ Container |
| 수직 spacing이나 배경색 변경 필요 | ❌ Section을 한 단계 위에 |
| Hero 같은 풀-블리드(full-bleed) 배경이 필요 | `Section bg="inverted"` + 내부에 `Container` |
| 블로그 본문(읽기 좋은 폭) | `size="md"` (768px) |

#### size 선택 가이드

| size | max-width | 용도 |
|------|-----------|------|
| `sm` | 640px | 좁은 폼·온보딩 카드 |
| `md` | 768px | 블로그 본문·아티클·읽기 최적화 |
| `lg` | 1024px | 일반 서비스 페이지 |
| `xl` | 1200px (기본) | 마케팅 페이지·대시보드 |
| `full` | 100% | 풀-블리드 (좌우 패딩은 유지) |

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
| `inverted` | `color_accent_default` | 강한 강조 (검정/흰색 반전) - 텍스트 색이 자동으로 반전됩니다 |
| `transparent` | 없음 | 상위 배경 그대로 노출 |

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

<Section spacing="xl" bg="inverted">
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
import { Section, Container, Stack, Grid, Button, MediaCard, Stat } from "@bigtablet/design-system";

export function LandingPage() {
  return (
    <>
      {/* 1. Hero - 풀-블리드 inverted 배경 */}
      <Section spacing="xl" bg="inverted">
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
- Section 간 `bg`를 교차로(`default` ↔ `dim` ↔ `inverted` ↔ `accent`) 변경해 페이지 리듬을 만듦.
- 같은 Section 안에서도 Stack을 중첩해 헤더-본문 간 spacing을 조정.
- 카드 격자는 Grid, 그 외 한 줄/한 열 흐름은 Stack.

---

## Hooks · 유틸

컴포넌트 밖에서 쓰는 공개 export 입니다. 모두 `@bigtablet/design-system` 루트에서 가져옵니다. 클립보드는 [useClipboard / copyText](#useclipboard--copytext), 문구는 [LocaleProvider](#localeprovider) 를 봅니다.

| export | 하는 일 |
|------|------|
| `useReducedMotion()` | OS 의 "동작 줄이기"(`prefers-reduced-motion: reduce`)가 켜졌는지 `boolean` 으로 돌려줍니다. 설정이 바뀌면 다시 렌더하고, SSR 에서는 `false` 입니다. JS 로 움직이는 모션을 끌 때 씁니다 |
| `useFieldControl()` · `FieldControl` | 감싸는 [`Field`](#field) 의 연결 정보(`inputId` · `labelId` · `describedBy` · `invalid` · `required`)를 돌려줍니다. `Field` 밖에서는 `undefined` 라, 직접 만든 입력은 자기 값을 기본으로 두고 필드가 있을 때만 양보합니다 |
| `useRadioGroupContext()` | 감싸는 [`RadioGroup`](#radiogroup) 의 `name` · `value` · `onChange` · `size` · `disabled` 를 돌려줍니다. 그룹 밖에서는 `null` 입니다. 직접 만든 라디오를 그룹에 넣을 때 씁니다 |
| `useFocusTrap(ref, isActive, options?)` | `isActive` 동안 `ref` 요소 안에 Tab 을 가둡니다. 켜질 때 첫 포커스 가능한 요소로 옮기고(`options.initialFocus` · `preferWithin` 으로 지정), 꺼지면 켜기 전 포커스로 되돌립니다. Modal · Drawer · Popover 가 쓰는 훅입니다 |
| `cn(...classes)` | 클래스 이름을 합칩니다(clsx 와 비슷). 문자열 · 배열 · `{ 클래스: 조건 }` 객체를 받고 falsy 값은 뺍니다 |
| `catalogs` | 내장 문구 카탈로그 `{ ko, en }`. `LocaleProvider` 의 `locale` 값마다 쓰는 기준 문구입니다 |

```tsx
import { cn, useReducedMotion } from "@bigtablet/design-system";

const reduced = useReducedMotion();
<div className={cn("panel", open && "panel_open", { panel_static: reduced })} />
```
