# Migration

Bigtablet Design System의 deprecated prop 마이그레이션 가이드입니다.

---

## 목차

- [개요](#개요)
- [v3.9.0 (React variant/success)](#v390-react-variantsuccess)
- [v3.8.0 (Vanilla 패키지 정리)](#v380-vanilla-패키지-정리)
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
- React 컴포넌트 섹션은 `grep -rn "@deprecated" src/ui --include=index.tsx` 로 코드에 실제 존재하는 deprecated prop 전체를 기준으로 작성했습니다.
- **Vanilla JS 패키지(`/vanilla`)는 deprecated 유예 없이 한 번에 정리**했습니다. 클래스 이름은 컴파일러가 잡아주지 않으므로 [v3.8.0 섹션](#v380-vanilla-패키지-정리)의 old → new 표와 치환 스크립트를 그대로 사용하세요.
- 버전은 semver 내림차순으로 정렬되어 있습니다.

---

## v3.9.0 (React variant/success)

### Dropdown - `variant="ghost"` 제거 (타입 레벨 파괴적 변경)

`Dropdown` 의 `variant` 는 v2.4.0 부터 `@deprecated` no-op 이었습니다. 이번 릴리즈에서 **다시 동작하게 되살리면서** Vanilla 번들과 같은 두 값만 남겼습니다.

| 컴포넌트 | 구 타입 | 신 타입 | 비고 |
|------|------|------|------|
| Dropdown | `'outline' \| 'filled' \| 'ghost'` (no-op) | `'outline' \| 'filled'` (동작함, 기본 `'outline'`) | `'ghost'` 는 어떤 스타일도 구현된 적이 없고 대응하는 Vanilla 클래스도 없어 제거 |

- **런타임 영향 없음** - `'ghost'` 는 no-op 이었으므로 지우면 렌더링이 그대로입니다. 다만 `variant="ghost"` 를 넘기던 호출부는 **타입 에러**가 납니다.
- `variant` 를 아예 넘기지 않던 코드는 영향이 없습니다 (`'outline'` 이 기본값이고 기존 렌더링과 동일).

Before:
```tsx
<Dropdown options={options} variant="ghost" />
```

After:
```tsx
{/* 기본(테두리) */}
<Dropdown options={options} />
{/* 채움 배경 */}
<Dropdown options={options} variant="filled" />
```

### 신규 추가 (비파괴 — 마이그레이션 불필요, 참고용)

| 컴포넌트 | 추가 | 설명 |
|------|------|------|
| TextField | `variant` | `'outline'`(기본) / `'filled'`. Vanilla `.bt-text-field__input--outline/--filled` 와 1:1 |
| TextField | `success` | 검증 통과 상태. `error` 와 동시에 주면 `error` 우선, `aria-invalid` 는 켜지 않음. Vanilla `.bt-text-field__input--success` 와 1:1 |
| Dropdown | `variant` | `'outline'`(기본) / `'filled'`. Vanilla `.bt-dropdown__control--outline/--filled` 와 1:1 |

---

## v3.8.0 (Vanilla 패키지 정리)

> ⚠️ **Vanilla 패키지(`@bigtablet/design-system/vanilla`, `dist/vanilla/*`)의 파괴적 변경입니다.**
> React export 는 영향이 없습니다.

Vanilla 번들의 클래스·JS API 이름이 React 컴포넌트 API 와 갈라져 있어, 같은 디자인 시스템인데도 두 벌의 이름을 외워야 했습니다. v3.8.0 에서 **구 이름을 별칭으로 남기지 않고 전부 제거**하고 React 쪽 이름으로 통일했습니다. 처음부터 React API 를 보고 설계한 것처럼 보이게 하는 것이 목표라, deprecated 별칭은 두지 않았습니다.

**타입 검사가 잡아주지 않습니다.** 구 클래스를 쓰면 에러 없이 스타일만 조용히 사라지므로, 아래 표와 치환 스크립트로 마크업 전체를 한 번에 훑으세요.

### 1. Button - variant 이름

React `<Button variant>` 값과 동일하게 맞췄습니다.

| 구 클래스 (제거됨) | 대체 |
|---|---|
| `.bt-button--primary` | `.bt-button--filled` |
| `.bt-button--secondary` | `.bt-button--outline` |
| `.bt-button--ghost` | `.bt-button--text` |

`.bt-button--danger` 는 그대로입니다. React 의 `danger` boolean 처럼 variant 와 **직교**하므로 `--outline --danger` 같이 조합해 쓸 수 있고, variant 없이 단독으로 쓰면 React `<Button danger />`(기본 variant `filled`)와 같은 red filled 입니다.

### 2. Button - 기본 radius 와 filled 채움색 (클래스 이름은 그대로, 렌더링이 바뀜)

| 항목 | 구 동작 | 신 동작 (React 와 동일) |
|---|---|---|
| 기본 `border-radius` | `--bt-radius-md` (8px) | `--bt-radius-full` (pill) |
| `--filled` 배경 | `--bt-color-primary` (양 테마 검정 고정) | `--bt-color-accent` (light 검정 / dark 흰색 자동 반전) |

- **각진 버튼을 유지하려면** 새로 추가된 `.bt-button--radius-md` 를 명시하세요 (React `radius` prop 과 같은 `none/xs/sm/md/lg/xl/full` 스케일 전체 제공).
- filled 색 변경은 **다크 테마에서만** 눈에 띕니다. 구 동작은 다크에서도 검정 채움이라 페이지 배경에 묻혔습니다. 양 테마 고정색이 꼭 필요하면 `--bt-color-primary` 를 직접 적용하세요.

### 3. Card - elevation → shadow, 기본값 도입

| 구 클래스 (제거됨) | 대체 |
|---|---|
| `.bt-card--elevation-1` | `.bt-card--shadow-sm` |
| `.bt-card--elevation-2` | `.bt-card--shadow-md` |
| `.bt-card--elevation-3` | `.bt-card--shadow-lg` |

`.bt-card` 의 **기본값도 React `<Card>` 와 같아졌습니다** - shadow 클래스를 안 붙이면 `shadow=sm`, padding 클래스를 안 붙이면 `padding=md` 가 적용됩니다 (구 Vanilla 는 둘 다 없음). 그림자·여백이 없는 맨 카드가 필요하면 `.bt-card--shadow-none .bt-card--p-none` 을 명시하세요.

React 의 `variant`(`accent` / `glass` / `outlined`)와 `interactive` 도 새로 추가됐습니다 (`.bt-card--accent` / `--glass` / `--outlined` / `--interactive`) - 추가라 마이그레이션은 불필요합니다.

### 4. Select → Dropdown 전면 개명

React 컴포넌트 이름이 `Dropdown` 이므로 블록 이름·data 속성·JS 팩토리를 모두 맞췄습니다. **CSS 만의 변경이 아니라 JS 런타임까지 걸쳐 있습니다.**

| 구 이름 (제거됨) | 대체 |
|---|---|
| `.bt-select` | `.bt-dropdown` |
| `.bt-select__label` | `.bt-dropdown__label` |
| `.bt-select__control` | `.bt-dropdown__control` |
| `.bt-select__control--outline` / `--filled` | `.bt-dropdown__control--outline` / `--filled` |
| `.bt-select__control--sm` / `--md` / `--lg` | `.bt-dropdown__control--sm` / `--md` / `--lg` |
| `.bt-select__value` | `.bt-dropdown__value` |
| `.bt-select__placeholder` | `.bt-dropdown__placeholder` |
| `.bt-select__icon` | `.bt-dropdown__icon` |
| `.bt-select__list` | `.bt-dropdown__list` |
| `.bt-select__list--up` | `.bt-dropdown__list--up` |
| `.bt-select__option` | `.bt-dropdown__option` |
| `data-bt-select` (자동 초기화 속성) | `data-bt-dropdown` |
| `Bigtablet.Select(el, options)` | `Bigtablet.Dropdown(el, options)` |
| `el._btSelect` (자동 초기화 인스턴스) | `el._btDropdown` |

`.is-open` / `.is-selected` / `.is-active` / `.is-disabled` 상태 클래스와 인스턴스 API(`getValue` / `setValue` / `open` / `close` / `toggle` / `setDisabled` / `destroy`)는 그대로입니다.

> React `Dropdown` 의 `multiple`(다중 선택)·`searchable`(검색 필터)도 Vanilla 에서 지원합니다 (JS 옵션 또는 `data-multiple` / `data-searchable`). 사용법은 [VANILLA.md#dropdown](./VANILLA.md#dropdown) 참고.

### 5. Spinner - size enum → px 커스텀 프로퍼티

React `<Spinner size>` 는 enum 이 아니라 px 숫자(기본 24)를 받습니다. Vanilla 도 자유 스케일로 맞췄습니다.

| 구 클래스 (제거됨) | 대체 |
|---|---|
| `.bt-spinner--sm` | `style="--bt-spinner-size: 16px"` |
| `.bt-spinner--md` | (기본값 24px - 아무것도 안 붙이면 됨) |
| `.bt-spinner--lg` | `style="--bt-spinner-size: 32px"` |
| `.bt-spinner--xl` | `style="--bt-spinner-size: 48px"` |

React `<Spinner>` 가 자동으로 붙이는 `role="status"` + `aria-label` 은 Vanilla 에선 마크업에서 직접 지정해야 합니다.

### 6. JS 변경 콜백 - `onChange` 제거

v3.3.0 에서 React 가 `on*Change` 패밀리로 통일된 것에 맞춰 Vanilla 도 canonical 이름만 남겼습니다. `onChange` 를 계속 넘기면 **조용히 무시**됩니다(에러 없음).

| 팩토리 | 구 옵션 (제거됨) | 대체 |
|---|---|---|
| `Bigtablet.Dropdown` | `onChange(value, option)` | `onValueChange(value, option)` |
| `Bigtablet.Toggle` | `onChange(checked)` | `onCheckedChange(checked)` |
| `Bigtablet.Pagination` | `onChange(page)` | `onPageChange(page)` |

### 7. Alert - 오버레이·Escape 닫힘이 `onCancel` 을 경유

구 동작에서는 오버레이 클릭이나 Escape 로 닫으면 `onCancel` 이 호출되지 않아, 취소 정리 로직(롤백 등)이 조용히 우회됐습니다. React `Alert`(`dismiss = onCancel ?? onClose`)와 동일하게 두 경로 모두 `onCancel` 을 먼저 호출한 뒤 닫습니다 (WAI-ARIA APG alertdialog).

- **영향**: `onCancel` 안에서 "취소 버튼을 눌렀다"고 가정하고 로그를 남기거나 카운트를 올리던 코드는 이제 오버레이/Escape 에서도 실행됩니다.
- 오버레이 닫힘 자체를 막고 싶으면 `closeOnOverlay: false` 를 쓰세요.

또한 `Bigtablet.Alert` 가 생성하는 확인/취소 버튼의 클래스가 `bt-button--primary` / `bt-button--secondary` → `bt-button--filled` / `bt-button--outline` 로 바뀝니다. 생성된 마크업의 클래스를 셀렉터로 잡아 스타일을 덮어쓰던 CSS 가 있다면 함께 수정하세요.

### 치환 스크립트

기계적으로 바꿀 수 있는 항목만 모았습니다. **순서대로** 실행하세요 (`bt-select` → `bt-dropdown` 을 먼저 돌려야 다른 규칙과 겹치지 않습니다).

```bash
# 대상 디렉터리로 이동 후 실행. 확장자는 프로젝트에 맞게 조정하세요.
# macOS(BSD sed)는 -i '' , GNU sed 는 -i 를 사용합니다.
# 소스만 대상으로 하고 의존성/빌드 산출물은 제외. 경로에 공백이 있어도 안전하도록 NUL 구분 사용.
INCLUDES=(--include='*.html' --include='*.jsp' --include='*.php' --include='*.js' --include='*.css' --include='*.scss')
EXCLUDES=(--exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git)

# 1) Select → Dropdown (클래스 / data 속성 / JS 팩토리 / 인스턴스 프로퍼티)
grep -rlZ -E 'bt-select|Bigtablet\.Select|_btSelect' "${INCLUDES[@]}" "${EXCLUDES[@]}" . \
  | xargs -0 sed -i '' -e 's/bt-select/bt-dropdown/g' \
                       -e 's/Bigtablet\.Select/Bigtablet.Dropdown/g' \
                       -e 's/_btSelect/_btDropdown/g'

# 2) Button variant
grep -rlZ -E 'bt-button--(primary|secondary|ghost)' "${INCLUDES[@]}" "${EXCLUDES[@]}" . \
  | xargs -0 sed -i '' -e 's/bt-button--primary/bt-button--filled/g' \
                       -e 's/bt-button--secondary/bt-button--outline/g' \
                       -e 's/bt-button--ghost/bt-button--text/g'

# 3) Card elevation → shadow
grep -rlZ -E 'bt-card--elevation' "${INCLUDES[@]}" "${EXCLUDES[@]}" . \
  | xargs -0 sed -i '' -e 's/bt-card--elevation-1/bt-card--shadow-sm/g' \
                       -e 's/bt-card--elevation-2/bt-card--shadow-md/g' \
                       -e 's/bt-card--elevation-3/bt-card--shadow-lg/g'

# 4) 확인 - 남은 구 이름이 없어야 합니다 (동일 --include 로 이 문서(.md) 는 대상에서 제외됨)
grep -rn -E 'bt-select|bt-button--(primary|secondary|ghost)|bt-card--elevation|bt-spinner--|Bigtablet\.Select|_btSelect|data-bt-select' \
  "${INCLUDES[@]}" "${EXCLUDES[@]}" . || echo "clean"
```

기계적으로 치환할 수 없어 **손으로 확인해야 하는 항목**:

- `.bt-spinner--*` → `--bt-spinner-size` 인라인 스타일 (클래스 삭제 + `style` 추가라 1:1 치환 불가)
- JS 옵션의 `onChange:` → `onValueChange:` / `onCheckedChange:` / `onPageChange:` (같은 이름이 다른 팩토리에서 다른 이름으로 바뀌므로 호출부별 판단 필요)
- 각진 버튼을 유지할지(`.bt-button--radius-md` 추가) 아니면 pill 기본값을 받아들일지
- 그림자·여백 없는 `.bt-card` 를 유지할지(`--shadow-none --p-none` 추가) 아니면 React 기본값을 받아들일지
- `onCancel` 이 오버레이/Escape 에서도 불리게 된 것에 대한 영향

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
- **해결**: `React.ComponentProps<typeof Button>` 로 참조한 뒤 교차 타입(`&`) 으로 확장하세요. (내부 공통 베이스 `ButtonBaseProps` 는 export 되지 않으므로 소비자가 쓸 수 없습니다.)
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
| Dropdown | `variant` | 없음 | v2.4.0 | Dropdown 은 outline 스타일만 지원합니다. **v3.9.0 에서 `'outline' \| 'filled'` 로 부활** - [v3.9.0 섹션](#v390-react-variantsuccess) 참고 |
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

### 3. Dropdown - fullWidth / textAlign 제거

`fullWidth`/`textAlign` 은 넘겨도 에러가 나지는 않지만 아무 효과가 없습니다(no-op). Dropdown 은 항상 부모 너비를 채웁니다.

> `variant` 는 v2.4.0~v3.8.0 동안 no-op 이었지만 v3.9.0 에서 `'outline' | 'filled'` 로 되살아났습니다 - [v3.9.0 섹션](#v390-react-variantsuccess) 참고.

Before:
```tsx
<Dropdown options={options} fullWidth textAlign="left" />
```

After:
```tsx
{/* 인라인 폭이 필요하면 부모를 inline-block + width 로 감싸세요 */}
<span style={{ display: "inline-block", width: 240 }}>
  <Dropdown options={options} />
</span>
```
