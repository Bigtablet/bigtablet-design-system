# Migration

Bigtablet Design System의 deprecated prop 마이그레이션 가이드입니다.

---

## 목차

- [개요](#개요)
- [v3.3.0](#v330)
- [v3.0.0](#v300)
- [v2.4.0](#v240)
- [v1.24.1](#v1241)
- [Before / After 예시](#before--after-예시)

---

## 개요

- `@deprecated` 로 표시된 prop 은 삭제되지 않고 계속 동작합니다. 실제 제거는 다음 major 릴리즈에서 이루어집니다.
- 변경 콜백(`onChange` 계열) 은 신규(canonical) prop 과 구(deprecated) prop 을 동시에 넘겨도 안전합니다. 컴포넌트 내부는 `canonical ?? deprecated` 순서로 우선 적용하므로, 신규 prop 을 넘기면 그 값만 호출되고 신규 prop 이 없을 때만 구 prop 이 fallback 으로 호출됩니다.
- 이 문서는 `grep -rn "@deprecated" src/ui --include=index.tsx` 로 코드에 실제 존재하는 deprecated prop 전체를 기준으로 작성했습니다 (React 컴포넌트 공개 prop 기준 - Vanilla JS 패키지는 별도).
- 버전은 semver 내림차순으로 정렬되어 있습니다.

---

## v3.3.0

변경 콜백 네이밍을 Radix 스타일 `on*Change` 패밀리로 통일했습니다 (`onValueChange` / `onCheckedChange` / `onPageChange`). 기존 `onChange`(TextField/Textarea 는 `onChangeAction`) 는 `@deprecated` alias 로 계속 동작합니다.

| 컴포넌트 | 구 prop | 신 prop | 도입 버전 | 비고 |
|------|------|------|------|------|
| Dropdown | `onChange` | `onValueChange` | v3.3.0 | 시그니처 동일: `(value: string \| null, option?: DropdownOption \| null) => void` |
| OtpInput | `onChange` | `onValueChange` | v3.3.0 | 시그니처 동일: `(value: string) => void` |
| Toggle | `onChange` | `onCheckedChange` | v3.3.0 | 시그니처 동일: `(checked: boolean) => void` |
| TextField | `onChangeAction` | `onValueChange` | v3.3.0 | 시그니처 동일: `(value: string) => void`. Next 서버 액션에 직접 전달할 때 `Action` 접미사가 필요하면 `onChangeAction` 을 그대로 사용해도 됩니다 |
| Textarea | `onChangeAction` | `onValueChange` | v3.3.0 | 시그니처 동일: `(value: string) => void`. TextField와 동일하게 `onChangeAction` 유지 가능 |
| DatePicker | `onChange` | `onValueChange` | v3.3.0 | 시그니처 동일: `(value: string) => void`. controlled 전용 컴포넌트라 `onValueChange` 또는 `onChange` 중 최소 하나는 필수(TS 유니언 타입으로 강제) |
| Accordion | `onChange` | `onValueChange` | v3.3.0 | 시그니처 동일: `(openKeys: string[]) => void` |
| NavBar | `locale.onChange` | `locale.onValueChange` | v3.3.0 | `NavBarProps.locale`(`NavBarLocaleConfig`) 내부 필드입니다. 시그니처 동일: `(next: string) => void` |
| Pagination | `onChange` | `onPageChange` | v3.3.0 | 시그니처 동일: `(page: number) => void`. controlled 전용 컴포넌트라 `onPageChange` 또는 `onChange` 중 최소 하나는 필수(TS 유니언 타입으로 강제) |

---

## v3.0.0

| 컴포넌트 | 구 prop | 신 prop | 도입 버전 | 비고 |
|------|------|------|------|------|
| Dropdown | `fullWidth` | 없음 | v3.0.0 | Dropdown 은 이제 항상 부모 너비를 채웁니다. 인라인 폭이 필요하면 부모를 `inline-block + width` 로 감싸세요 |

---

## v2.4.0

Figma 스펙 기반으로 Dropdown 이 전면 재설계되면서 아래 prop 이 더 이상 동작에 영향을 주지 않습니다.

| 컴포넌트 | 구 prop | 신 prop | 도입 버전 | 비고 |
|------|------|------|------|------|
| Dropdown | `variant` | 없음 | v2.4.0 | Dropdown 은 outline 스타일만 지원합니다 |
| Dropdown | `textAlign` | 없음 | v2.4.0 | 더 이상 지원되지 않습니다 |

---

## v1.24.1

| 컴포넌트 | 구 prop | 신 prop | 도입 버전 | 비고 |
|------|------|------|------|------|
| DatePicker | `width` | `fullWidth` 또는 CSS | v1.24.1 | 커스텀 너비가 필요하면 `fullWidth` 를 사용하거나 wrapper 에 CSS 로 처리하세요 |

---

## Before / After 예시

### 1. 변경 콜백 rename (Dropdown 예시)

가장 흔한 패턴 - `onChange` 를 `onValueChange` 로 바꾸기만 하면 됩니다. Toggle(`onCheckedChange`), Pagination(`onPageChange`) 도 이름만 다를 뿐 동일한 패턴입니다.

Before:
```tsx
<Dropdown
  options={options}
  value={fruit}
  onChange={(value, option) => setFruit(value)}
/>
```

After:
```tsx
<Dropdown
  options={options}
  value={fruit}
  onValueChange={(value, option) => setFruit(value)}
/>
```

### 2. TextField / Textarea - onChangeAction → onValueChange

Before:
```tsx
<TextField
  label="이름"
  value={name}
  onChangeAction={(value) => setName(value)}
/>
```

After:
```tsx
<TextField
  label="이름"
  value={name}
  onValueChange={(value) => setName(value)}
/>
```

> Next.js 서버 액션에 값을 바로 넘겨야 해서 `Action` 접미사가 필요하다면 `onChangeAction` 을 그대로 사용해도 됩니다 - 두 prop 은 시그니처가 동일합니다.

### 3. Dropdown - fullWidth / variant / textAlign 제거

`fullWidth`/`variant`/`textAlign` 은 넘겨도 에러가 나지는 않지만 아무 효과가 없습니다(no-op). Dropdown 은 항상 부모 너비를 채우고 outline 스타일만 지원합니다.

Before:
```tsx
<Dropdown options={options} fullWidth variant="outline" textAlign="left" />
```

After:
```tsx
{/* 인라인 폭이 필요하면 부모를 inline-block + width 로 감싸세요 */}
<span style={{ display: "inline-block", width: 240 }}>
  <Dropdown options={options} />
</span>
```
