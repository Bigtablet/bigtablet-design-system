# Migration

Bigtablet Design System의 deprecated prop 마이그레이션 가이드입니다.

---

## 목차

- [개요](#개요)
- [v3.5.0](#v350)
- [v3.3.0](#v330)
- [v3.0.0](#v300)
- [v2.4.0](#v240)
- [v1.24.1](#v1241)
- [Before / After 예시](#before--after-예시)

---

## 개요

- `@deprecated` 로 표시된 prop 은 삭제되지 않고 계속 동작합니다. 실제 제거는 다음 major 릴리즈에서 이루어집니다.
- deprecated prop 외에, **동작·타입 레벨 변경**(예: 렌더링 위치 변경, 타입 형태 변경)도 소비자에게 영향이 있으면 해당 버전 섹션에 함께 정리합니다 (v3.5.0 참고).
- 변경 콜백(`onChange` 계열) 은 신규(canonical) prop 과 구(deprecated) prop 을 동시에 넘겨도 안전합니다. 컴포넌트 내부는 `canonical ?? deprecated` 순서로 우선 적용하므로, 신규 prop 을 넘기면 그 값만 호출되고 신규 prop 이 없을 때만 구 prop 이 fallback 으로 호출됩니다.
- 이 문서는 `grep -rn "@deprecated" src/ui --include=index.tsx` 로 코드에 실제 존재하는 deprecated prop 전체를 기준으로 작성했습니다 (React 컴포넌트 공개 prop 기준 - Vanilla JS 패키지는 별도).
- 버전은 semver 내림차순으로 정렬되어 있습니다.

---

## v3.5.0

v3.5.0 은 deprecated prop 제거는 없지만, **소비자에게 영향이 있을 수 있는 동작·타입 변경 2건**이 있습니다. (신규 추가 prop/export 는 비파괴 — 맨 아래 표 참고.)

### 1. Modal · Drawer 가 `document.body` 포털로 렌더링 (동작 변경)

기존에는 트리거 위치에 인라인 렌더됐으나, `transform`/`filter` 조상 아래에서 `position: fixed` 가 깨지는 문제 때문에 이제 `createPortal(document.body)` 로 body 끝에 렌더링됩니다 (Alert/Toast 와 동일).

- **영향**: 패널을 **후손 선택자**로 스타일링하던 코드가 조용히 깨집니다. 패널이 더 이상 감싸던 래퍼의 자식이 아니기 때문입니다.
  ```css
  /* ❌ 이제 매칭 안 됨 - .modal_panel 이 body 로 이동 */
  .my-wrapper .modal_panel { ... }
  ```
- **해결**: (a) 패널 스타일은 `className` prop 으로 직접 넘기거나, (b) 래퍼 종속 없는 전역 셀렉터를 쓰세요.
  ```tsx
  // ✅ className 으로 패널에 직접 적용
  <Modal open={open} onClose={close} className="my-modal-panel">...</Modal>
  ```
  ```css
  /* ✅ 또는 래퍼 없이 전역으로 */
  .modal_panel.my-modal-panel { ... }
  ```
- SSR: 서버·하이드레이션 첫 렌더에서는 `null` 을 반환하고 마운트 후 포털이 붙습니다(`useIsMounted` 게이트). open 상태로 첫 페인트되는 경우에도 hydration mismatch 가 없습니다.

### 2. `ButtonProps` 가 discriminated union 으로 변경 (타입 레벨)

Button 이 `as`/`href` 로 anchor 렌더링을 지원하면서 `ButtonProps` 가 `ButtonAsButton | ButtonAsAnchor` union 이 됐습니다.

- **런타임·공개 prop 은 100% 호환** — 기존 `<Button variant size onClick disabled>` 사용은 그대로 동작합니다.
- **타입 레벨만 영향**: TS interface 는 union 을 확장할 수 없어 `interface X extends ButtonProps {}` 형태가 깨집니다.
- **해결**: 스타일 props 만 확장하려면 공통 베이스 `ButtonBaseProps` 를, 전체 prop 을 참조하려면 `React.ComponentProps<typeof Button>` 을 쓰세요.
  ```tsx
  // ❌ An interface can only extend an object type...
  interface MyButtonProps extends ButtonProps { extra?: string }
  // ✅
  type MyButtonProps = React.ComponentProps<typeof Button> & { extra?: string };
  ```

### 신규 추가 (비파괴 — 마이그레이션 불필요, 참고용)

| 컴포넌트/모듈 | 추가 | 설명 |
|------|------|------|
| Button | `as` / `href` / `target` / `rel` / `disabled` | `as="a"`(또는 `href`) 시 동일 스타일 anchor 렌더. anchor disabled 는 `aria-disabled`+클릭 차단 |
| Dropdown | `name` | hidden input 으로 네이티브 폼 제출 참여 |
| Alert | `closeOnOverlay` | 오버레이 클릭 닫힘 on/off (기본 true) |
| Chip | `removeLabel` | 삭제 버튼 접근성 레이블 커스터마이즈 (기본 `"{label} 제거"`) |
| utils | `useOverlayEscape` / `registerOverlay` / `useIsMounted` | 공유 오버레이 Escape 스택, 클라이언트 마운트 훅 |

> Vanilla JS 패키지도 폼 참여(`data-name` on Select/Toggle)·combobox ARIA 등이 추가됐습니다. HTML/CSS/JS 환경 사용법은 [docs/VANILLA.md](./VANILLA.md) 참고.

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
