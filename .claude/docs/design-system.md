# Bigtablet Design System - AI Assistant Guide

이 레포에서 코드를 쓰거나 리뷰하는 AI(Claude 리뷰 워크플로 포함)가 **컴포넌트 API 를 틀리지 않게** 하는 문서다.
prop 표·예시를 여기 다시 옮겨 적지 않는다 - 옮겨 적은 사본은 소스가 바뀌면 낡는다 (이 파일이 4.x 내내 3.x 이전 API 를 담고 있었다).

## 무엇을 믿나 (우선순위)

1. **소스** - `src/ui/{category}/{component}/index.tsx` 의 props 인터페이스와 `export type …Variant/Tone/Size` union. 문서와 다르면 소스가 맞다
2. [`docs/COMPONENTS.md`](../../docs/COMPONENTS.md) - 컴포넌트별 props 표·예시. `pnpm check:defaults` 가 표의 union 값을 소스와 대조한다
3. [`docs/AGENT_GUIDE.md`](../../docs/AGENT_GUIDE.md) - 소비 앱에서 DS 를 쓰는 쪽의 가이드 (토큰·다크 모드·조합 패턴·안티 패턴)
4. [`docs/MIGRATION.md`](../../docs/MIGRATION.md) - 이름이 바뀌거나 지워진 이력. 옛 이름을 보면 여기서 대체를 찾는다

규약(파일 구조·SCSS·애니메이션·커밋)은 루트 [`CLAUDE.md`](../../CLAUDE.md), Vanilla 는 [`src/vanilla/CLAUDE.md`](../../src/vanilla/CLAUDE.md).

## 자주 틀리는 이름

### prop 이름 기준

| 고르는 것 | prop | 비고 |
|------|------|------|
| 모양 | `variant` | 같은 모양은 컴포넌트가 달라도 같은 값 이름 - `outline` · `text` · `filled` · `tonal` |
| 의미 색 | `tone` | Alert · Badge · Toast · Chip · InlineAlert. 회색 기본은 `neutral` |
| 값 변경 콜백 | `onValueChange` | 입력·선택류 전부 (Dropdown · Combobox · TextField · Textarea · DatePicker · TimePicker · Tabs · SegmentedControl · RadioGroup · Accordion · OtpInput · TagInput · NavBar `locale` 등) |
| 켜짐 콜백 | `onCheckedChange` | Toggle |
| 페이지 콜백 | `onPageChange` | Pagination · DataView |
| 로딩 | `isLoading` | DataView · Table · TopLoading · FilterBar |

`onChange` 는 **네이티브 요소를 그대로 감싼 것만** 받는다 - Checkbox · Radio · FileInput 의 `<input>` 이벤트다. 위 컴포넌트에 `onChange` 를 쓰면 타입 에러다.

### 값 union (4.1.0 기준)

| 타입 | 값 |
|------|------|
| `ButtonVariant` · `IconButtonVariant` | `filled` · `tonal` · `outline` · `text` (Button 기본 `filled`, IconButton 기본 `text`). 빨간 강조는 variant 가 아니라 Button `danger` |
| `TextFieldVariant` · `DropdownVariant` | `outline` · `filled` |
| `CardVariant` | `default` · `accent` · `glass` · `outline` |
| `TabsVariant` | `line` · `fills` |
| `NavBarVariant` | `default` · `transparent` · `accent` |
| `AlertTone` | `info` · `success` · `warning` · `error` |
| `ToastTone` | `success` · `error` · `warning` · `info` · `neutral` |
| `BadgeTone` · `ChipTone` | `accent` · `neutral` · `info` · `success` · `warning` · `error` |
| `InlineAlertTone` | `neutral` · `info` · `success` · `warning` · `error` |

### 지워진 이름 - 보이면 고친다

| 옛 이름 | 지금 |
|------|------|
| Button `variant="primary" \| "secondary" \| "ghost" \| "danger"` | `filled` · `tonal` · `outline` · `text` + `danger` |
| `onChange` (Dropdown · DatePicker · Accordion · OtpInput · NavBar `locale` · Toggle · Pagination) | 위 표의 `on*Change` |
| `onChangeAction` (TextField · Textarea) | `onValueChange` |
| Alert · Badge · Toast `variant` · `*Variant` 타입 | `tone` · `*Tone` |
| IconButton `standard` · `outlined`, Card `outlined`, Chip `default`, Toast `default` | `text` · `outline` · `outline` · `neutral` · `neutral` |
| FilterBar `loading` | `isLoading` |
| Dropdown `fullWidth` · `textAlign`, DatePicker `width` | 없음 (Dropdown 은 항상 부모 폭) |
| `ButtonAsButton` · `ButtonAsAnchor` | `ButtonProps<"button">` · `ButtonProps<"a">` |
| `Select` · `Tag` | `Dropdown` · `<Chip type="static">` |
| `@bigtablet/design-system/next` | 없음 - 루트 import 가 빌드 시 `"use client"` 를 갖는다 |

### Provider 패턴

- Alert: `<AlertProvider>` 안에서 `const { showAlert, confirm } = useAlert()` 또는 `useConfirm()`. 옵션은 `{ tone, title, message, destructive, onConfirm, … }`
- Toast: `<ToastProvider>` 안에서 `const toast = useToast()` → `toast.success|error|warning|info|message(msg, options?)` 가 id 를 돌려주고, `toast.update(id, { message, tone, … })` · `toast.dismiss(id)`

## 리뷰할 때 확인할 것

- 위 "지워진 이름" 이 코드·문서·스토리에 다시 들어오는가
- 새 prop 이름이 위 기준(모양 `variant` · 의미 색 `tone` · `on*Change`)을 따르는가
- 문서에 prop 표를 새로 적었다면 `pnpm check:defaults` 가 통과하는가 (소스 union 과 대조)
