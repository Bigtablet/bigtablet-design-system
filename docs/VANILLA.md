# Bigtablet Design System - Vanilla JS

React 없이 순수 HTML/CSS/JS 환경에서 사용하는 가이드입니다.
**Thymeleaf, JSP, PHP, Django Template** 등 서버 사이드 템플릿 환경에서 활용할 수 있습니다.

---

## 목차

- [설치](#설치)
- [빠른 시작](#빠른-시작)
- [컴포넌트](#컴포넌트)
  - [Button](#button)
  - [TextField](#textfield)
  - [Checkbox](#checkbox)
  - [Radio](#radio)
  - [Toggle](#toggle)
  - [Dropdown](#dropdown)
  - [Modal](#modal)
  - [Alert](#alert)
  - [Card](#card)
  - [Spinner](#spinner)
  - [Pagination](#pagination)
  - [DatePicker](#datepicker)
  - [FileInput](#fileinput)
- [CSS Custom Properties](#css-custom-properties)
- [JavaScript API](#javascript-api)

---

## 설치

### CDN

```html
<!-- CSS -->
<link rel="stylesheet" href="https://unpkg.com/@bigtablet/design-system/dist/vanilla/bigtablet.min.css">

<!-- JS (선택사항 - 인터랙티브 컴포넌트용) -->
<script src="https://unpkg.com/@bigtablet/design-system/dist/vanilla/bigtablet.min.js"></script>
```

### NPM

```bash
npm install @bigtablet/design-system
```

```html
<!-- CSS 직접 링크 -->
<link rel="stylesheet" href="node_modules/@bigtablet/design-system/dist/vanilla/bigtablet.min.css">

<!-- 또는 빌드 도구 사용 시 -->
@import '@bigtablet/design-system/vanilla/style.min.css';
```

> 배포 패키지에 들어가는 Vanilla 산출물은 **압축본 2개뿐**입니다 - `bigtablet.min.css`(약 38KB),
> `bigtablet.min.js`(약 19KB). 비압축본(`bigtablet.css` / `bigtablet.js`)은 `package.json` 의
> `files` 에서 제외돼 npm·CDN 어느 쪽에도 없습니다. 소스를 읽어야 하면 저장소의
> `src/vanilla/bigtablet.scss` · `src/vanilla/bigtablet.js` 를 보세요.

---

## 빠른 시작

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>

  <!-- Pretendard 폰트 (권장) -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css">

  <!-- Bigtablet CSS -->
  <link rel="stylesheet" href="https://unpkg.com/@bigtablet/design-system/dist/vanilla/bigtablet.min.css">
</head>
<body>
  <div style="padding: 2rem;">
    <h1>Hello Bigtablet</h1>

    <button class="bt-button bt-button--md bt-button--filled">
      버튼
    </button>

    <div class="bt-text-field" style="margin-top: 1rem; max-width: 300px;">
      <label class="bt-text-field__label">이메일</label>
      <div class="bt-text-field__wrap">
        <input type="email" class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--md" placeholder="email@example.com">
      </div>
    </div>
  </div>

  <!-- Bigtablet JS (인터랙티브 컴포넌트용) -->
  <script src="https://unpkg.com/@bigtablet/design-system/dist/vanilla/bigtablet.min.js"></script>
</body>
</html>
```

---

## 컴포넌트

### Button

```html
<!-- 기본 -->
<button class="bt-button bt-button--md bt-button--filled">Filled</button>

<!-- Variants (React <Button variant> 와 동일) -->
<button class="bt-button bt-button--md bt-button--filled">Filled</button>
<button class="bt-button bt-button--md bt-button--tonal">Tonal</button>
<button class="bt-button bt-button--md bt-button--outline">Outline</button>
<button class="bt-button bt-button--md bt-button--text">Text</button>

<!-- danger 는 variant 와 직교하는 modifier (React <Button danger /> 와 동일) -->
<button class="bt-button bt-button--md bt-button--filled bt-button--danger">Delete</button>
<button class="bt-button bt-button--md bt-button--outline bt-button--danger">Delete</button>
<button class="bt-button bt-button--md bt-button--danger">Delete</button> <!-- variant 생략 시 filled -->

<!-- Sizes -->
<button class="bt-button bt-button--sm bt-button--filled">Small</button>
<button class="bt-button bt-button--md bt-button--filled">Medium</button>
<button class="bt-button bt-button--lg bt-button--filled">Large</button>
<button class="bt-button bt-button--xl bt-button--filled">XLarge</button>

<!-- 전체 너비 -->
<button class="bt-button bt-button--md bt-button--filled bt-button--full-width">전체 너비</button>

<!-- 비활성화 -->
<button class="bt-button bt-button--md bt-button--filled" disabled>Disabled</button>
```

**클래스 조합:**
- `.bt-button` (필수)
- `.bt-button--{size}`: `sm`, `md`, `lg`, `xl`
- `.bt-button--{variant}`: `filled`, `tonal`, `outline`, `text`
- `.bt-button--danger` (선택) - variant 와 함께 조합
- `.bt-button--radius-{none|xs|sm|md|lg|xl|full}` (선택) - React `radius` prop 과 동일. 기본값은 `full`(pill)
- `.bt-button--full-width` (선택)

```html
<!-- radius 는 기본이 pill - 사각형에 가깝게 하려면 modifier 로 -->
<button class="bt-button bt-button--md bt-button--filled bt-button--radius-md">Radius md</button>
```

> `--filled` 는 React `variant="filled"` 와 동일하게 accent 색을 씁니다 - 라이트에선 검정,
> 다크에선 흰색으로 자동 반전되어 다크 테마에서 버튼이 배경에 묻히지 않습니다.
> 양 테마 고정색이 필요하면 `--bt-color-primary` 를 직접 적용하세요.

---

### TextField

> 자동완성(autofill)으로 채운 칸은 크롬/사파리가 UA 배경(연한 라벤더)을 `!important` 로
> 강제하는데, Vanilla CSS(`@bigtablet/design-system/vanilla/style.min.css`)가 이를 DS 표면색으로 덮는다. `input`/`textarea`/`select`
> 요소 셀렉터라 DS 클래스를 안 붙인 native 입력에도 적용되고, 비활성 칸은 비활성 표면·
> 글자색을 유지한다. 소비자가 따로 할 일은 없다.

```html
<!-- 기본 -->
<div class="bt-text-field">
  <label class="bt-text-field__label">라벨</label>
  <div class="bt-text-field__wrap">
    <input type="text" class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--md" placeholder="입력하세요">
  </div>
</div>

<!-- Variants (React <TextField variant="outline" /> · variant="filled" 와 동등) -->
<input class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--md">
<input class="bt-text-field__input bt-text-field__input--filled bt-text-field__input--md">

<!-- Sizes -->
<input class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--sm">
<input class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--md">
<input class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--lg">

<!-- 에러 상태 -->
<div class="bt-text-field">
  <label class="bt-text-field__label">이메일</label>
  <div class="bt-text-field__wrap">
    <input type="email" class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--md bt-text-field__input--error" value="invalid">
  </div>
  <span class="bt-text-field__helper bt-text-field__helper--error">유효하지 않은 이메일입니다</span>
</div>

<!-- 성공 상태 -->
<div class="bt-text-field">
  <label class="bt-text-field__label">닉네임</label>
  <div class="bt-text-field__wrap">
    <input type="text" class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--md bt-text-field__input--success" value="bigtablet">
  </div>
  <span class="bt-text-field__helper bt-text-field__helper--success">사용 가능한 닉네임입니다</span>
</div>

<!-- 전체 너비 -->
<div class="bt-text-field bt-text-field--full-width">
  <input type="text" class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--md">
</div>
```

---

### Checkbox

```html
<!-- 기본 -->
<label class="bt-checkbox">
  <input type="checkbox" class="bt-checkbox__input">
  <span class="bt-checkbox__box"></span>
  <span class="bt-checkbox__label">동의합니다</span>
</label>

<!-- 체크됨 -->
<label class="bt-checkbox">
  <input type="checkbox" class="bt-checkbox__input" checked>
  <span class="bt-checkbox__box"></span>
  <span class="bt-checkbox__label">선택됨</span>
</label>

<!-- Sizes -->
<label class="bt-checkbox bt-checkbox--sm">...</label>
<label class="bt-checkbox">...</label>  <!-- 기본 md -->
<label class="bt-checkbox bt-checkbox--lg">...</label>

<!-- 비활성화 -->
<label class="bt-checkbox">
  <input type="checkbox" class="bt-checkbox__input" disabled>
  <span class="bt-checkbox__box"></span>
  <span class="bt-checkbox__label">비활성화</span>
</label>
```

---

### Radio

```html
<label class="bt-radio">
  <input type="radio" name="options" value="1" class="bt-radio__input" checked>
  <span class="bt-radio__dot"></span>
  <span class="bt-radio__label">옵션 1</span>
</label>

<label class="bt-radio">
  <input type="radio" name="options" value="2" class="bt-radio__input">
  <span class="bt-radio__dot"></span>
  <span class="bt-radio__label">옵션 2</span>
</label>

<label class="bt-radio">
  <input type="radio" name="options" value="3" class="bt-radio__input">
  <span class="bt-radio__dot"></span>
  <span class="bt-radio__label">옵션 3</span>
</label>

<!-- Sizes -->
<label class="bt-radio bt-radio--sm">...</label>
<label class="bt-radio">...</label>  <!-- 기본 md -->
<label class="bt-radio bt-radio--lg">...</label>
```

---

### Toggle

```html
<!-- 기본 (Off) -->
<button type="button" class="bt-toggle" data-bt-toggle>
  <span class="bt-toggle__thumb"></span>
</button>

<!-- On 상태 -->
<button type="button" class="bt-toggle bt-toggle--on" data-bt-toggle>
  <span class="bt-toggle__thumb"></span>
</button>

<!-- Sizes (React ToggleSize 와 동일) -->
<button type="button" class="bt-toggle bt-toggle--sm" data-bt-toggle>...</button>  <!-- 기본값 -->
<button type="button" class="bt-toggle bt-toggle--md" data-bt-toggle>...</button>

<!-- 비활성화 - React Toggle 과 동일하게 native disabled 속성을 쓴다 -->
<button type="button" class="bt-toggle" data-bt-toggle disabled>
  <span class="bt-toggle__thumb"></span>
</button>
```

**JavaScript 연동:**

```html
<button type="button" class="bt-toggle" data-bt-toggle id="my-toggle">
  <span class="bt-toggle__thumb"></span>
</button>

<script>
  // 자동 초기화 (data-bt-toggle 속성이 있으면 자동으로 초기화됨)

  // 또는 수동 초기화
  const toggleEl = document.getElementById('my-toggle');
  const myToggle = Bigtablet.Toggle(toggleEl, {
    defaultChecked: false,
    onCheckedChange: (checked) => {
      console.log('Toggle:', checked);
    }
  });

  // API
  myToggle.isChecked();     // 현재 상태
  myToggle.setChecked(true); // 상태 설정
  myToggle.toggle();        // 토글
</script>
```

> `type="button"` 을 반드시 지정하세요 - 폼 안에서 기본 type(submit)이면 토글 클릭이
> 폼을 제출합니다 (JS 초기화 시 자동 보정되지만 JS 로드 전 클릭은 막지 못합니다).

**폼 제출 참여 (Thymeleaf/JSP):**

`data-name` 을 지정하면 hidden input 이 생성되어 on/off 가 폼 POST 에 포함됩니다.
전송 값은 `"true"`/`"false"` 이며, `role="switch"` + `aria-checked` 는 자동으로 관리됩니다.
`<button>` 은 내부에 폼 요소를 자식으로 둘 수 없어 hidden input 은 버튼의 **형제**로 삽입됩니다.

서버 템플릿이 초기값 hidden input 을 미리 렌더링한 경우 그 값을 읽어 초기 상태를 맞추며,
`"true"` 외에 `"1"`/`"on"`/`"y"`/`"yes"`(대소문자 무시)도 켜짐으로 인식합니다.

```html
<!-- data-name 으로 자동 생성 -->
<button type="button" class="bt-toggle" data-bt-toggle data-name="notifications">
  <span class="bt-toggle__thumb"></span>
</button>

<!-- 또는 서버 렌더링 초기값(형제 hidden input) -->
<button type="button" class="bt-toggle" data-bt-toggle>
  <span class="bt-toggle__thumb"></span>
</button>
<input type="hidden" name="notifications" th:value="${enabled}">
```

---

### Dropdown

React `<Dropdown>` 의 Vanilla 대응입니다. 기본은 단일 선택이고,
React 와 동일하게 `multiple`(다중 선택) / `searchable`(검색)을 지원합니다.

```html
<div class="bt-dropdown" data-bt-dropdown style="width: 300px;">
  <!-- 라벨은 React 처럼 트리거 버튼과 연결하세요 (button 은 labelable 요소입니다) -->
  <label class="bt-dropdown__label" for="fruit-control">과일 선택</label>
  <button type="button" id="fruit-control" class="bt-dropdown__control bt-dropdown__control--outline bt-dropdown__control--md">
    <span class="bt-dropdown__placeholder">선택하세요...</span>
    <span class="bt-dropdown__icon">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    </span>
  </button>
  <ul class="bt-dropdown__list">
    <li class="bt-dropdown__option" data-value="apple">사과</li>
    <li class="bt-dropdown__option" data-value="banana">바나나</li>
    <li class="bt-dropdown__option" data-value="cherry">체리</li>
    <li class="bt-dropdown__option is-disabled" data-value="mango">망고 (품절)</li>
    <li class="bt-dropdown__option" data-value="orange">오렌지</li>
  </ul>
</div>
```

옵션은 위처럼 서버가 렌더링한 `<li data-value>` 마크업에서 자동 파싱됩니다
(`data-options` JSON 속성 또는 JS `options` 설정이 있으면 그쪽이 우선).

**폼 제출 참여 (Thymeleaf/JSP):**

`data-name` 을 지정하면 hidden input 이 생성되어 선택 값이 폼 POST 에 포함됩니다.
서버 템플릿이 `.bt-dropdown` 안에 hidden input 을 미리 렌더링해 두면 (예: `th:field`)
그 input 의 name/초기값을 그대로 이어받아 표시·동기화합니다.

```html
<div class="bt-dropdown" data-bt-dropdown data-name="fruit">
  <!-- 또는 서버 바인딩: <input type="hidden" th:field="*{fruit}"> -->
  ...
</div>
```

**Variants:**
- `.bt-dropdown__control--outline` (기본) - React `Dropdown` 과 동등한 스타일
- `.bt-dropdown__control--filled` - React `<Dropdown variant="filled" />` 와 동등

**Sizes:**
- `.bt-dropdown__control--sm`
- `.bt-dropdown__control--md`
- `.bt-dropdown__control--lg`

**다중 선택 (`multiple`):**

`data-multiple` 또는 JS `multiple: true` 를 주면 React `<Dropdown multiple>` 과 같게 동작합니다.
옵션을 클릭하면 **토글되고 패널은 열린 채로 유지**되며, 선택된 옵션 왼쪽에 체크
슬롯(`.bt-dropdown__option-check`)이 표시됩니다. 트리거에는 chip 이 아니라
`N개 선택` 요약 문자열이 들어가고(`selectedSummary` 로 변경), listbox 에는
`aria-multiselectable="true"` 가 붙습니다.

값 타입도 React `value` prop 규칙 그대로입니다 - 단일은 `string | null`, 다중은 `string[]`.
`getValue()` / `setValue()` / `onValueChange` 가 모두 이 규칙을 따릅니다.

폼 제출은 **같은 `name` 의 hidden input 을 선택 개수만큼 반복**해 담습니다
(React 가 `selectedValues.map(...)` 로 hidden input 을 반복 렌더하는 것과 동일).
선택이 0개면 hidden input 도 0개입니다.

```html
<div class="bt-dropdown" data-bt-dropdown data-multiple data-name="topping">
  <label class="bt-dropdown__label" for="topping-control">토핑</label>
  <button type="button" id="topping-control" class="bt-dropdown__control bt-dropdown__control--outline bt-dropdown__control--md">
    <span class="bt-dropdown__placeholder">토핑을 고르세요...</span>
    <span class="bt-dropdown__icon">▼</span>
  </button>
  <ul class="bt-dropdown__list">
    <li class="bt-dropdown__option" data-value="cheese">치즈</li>
    <li class="bt-dropdown__option" data-value="bacon">베이컨</li>
    <li class="bt-dropdown__option is-disabled" data-value="pineapple">파인애플 (품절)</li>
  </ul>
</div>

<!-- 선택 2개 → 서버에는 topping=cheese&topping=bacon 으로 전송됩니다.
     Spring MVC 라면 List<String> topping 으로 바인딩됩니다. -->
```

**검색 (`searchable`):**

`data-searchable` 또는 JS `searchable: true` 를 주면 패널 상단에 검색 행이 생깁니다.
필터는 옵션 `label` 부분 일치이고 **대소문자·공백을 무시**합니다 (React `normalizeForSearch` 와 동일).
패널을 열면 검색 입력에 포커스가 가고, 닫으면 검색어가 초기화됩니다.
결과가 0개면 `emptyText`(기본 `결과 없음`)가 표시됩니다.

> **한글 IME**: 조합 중(`compositionstart` ~ `compositionend`)에는 필터를 갱신하지 않습니다.
> 입력 표시는 즉시 반영되지만 중간 자모(`ㅍ`, `포`)로 목록이 튀지 않고, 조합이 확정된 뒤에만
> 필터가 적용됩니다. 조합 중 Enter 도 조합 확정용이라 선택/닫기를 트리거하지 않습니다.
> (React 가 `searchText` / `committedQuery` 를 분리한 것과 같은 동작)

검색 행·스크롤 컨테이너·빈 결과 안내는 JS 가 자동으로 만들어 넣으므로 마크업은 그대로 둡니다.
결과 DOM 은 React 와 같은 구조입니다:

```html
<div class="bt-dropdown__list">          <!-- 패널 (스크롤 없음) -->
  <div class="bt-dropdown__search">
    <span class="bt-dropdown__search-icon">…</span>
    <input class="bt-dropdown__search-input" role="combobox" aria-autocomplete="list" …>
  </div>
  <ul class="bt-dropdown__options" role="listbox">   <!-- 스크롤 컨테이너 -->
    <li class="bt-dropdown__option" …>…</li>
    <li class="bt-dropdown__empty" hidden>결과 없음</li>
  </ul>
</div>
```

> **`__list` 에 커스텀 클래스를 붙였다면 주의**
> 평면 `<ul class="bt-dropdown__list">` 마크업 + `searchable` 조합이면, `<ul>` 안에는 `<li>`
> 밖에 못 오므로 JS 가 새 `<div class="bt-dropdown__list">` 를 만들어 그 `<ul>` 을 감싸 올리고,
> 원래 `<ul>` 은 `.bt-dropdown__options`(스크롤 컨테이너)가 됩니다. 이때 `bt-dropdown__list`
> 로 시작하지 않는 커스텀 클래스는 **원래 붙어 있던 `<ul>` 에 그대로 남습니다** — 즉 패널
> wrapper 가 아니라 안쪽 스크롤 컨테이너를 가리키게 됩니다.
>
> 패널 wrapper 를 직접 스타일링해야 하면 승격에 맡기지 말고 최종 구조를 그대로 렌더링하세요.
> `__options` 컨테이너가 이미 있으면 JS 는 승격을 건너뛰므로 클래스가 의도한 자리에 남습니다:
>
> ```html
> <div class="bt-dropdown__list my-panel">
>   <ul class="bt-dropdown__options" role="listbox">…</ul>
> </div>
> ```

`searchable` 일 때는 React 와 동일하게 **`role="combobox"` 가 검색 입력으로 옮겨가고**
(`aria-autocomplete` / `aria-expanded` / `aria-controls` / `aria-activedescendant` 포함),
트리거 버튼에는 `aria-haspopup="listbox"` + `aria-expanded` 만 남습니다.

**키보드 (WAI-ARIA APG Combobox):**

| 키 | 동작 |
|----|------|
| `Enter` / `Space` | 닫힘이면 열기, 열림이면 활성 옵션 확정 (다중은 토글 후 유지) |
| `↑` / `↓` | **검색 필터를 통과한 옵션 목록** 위에서 이동 (비활성 건너뜀, 순환) |
| `Home` / `End` | 첫/마지막 활성 가능 옵션 (검색 입력 안에서는 커서 이동에 양보) |
| `Esc` | 닫기 (searchable 이면 트리거로 포커스 복귀) |
| `Tab` | 리스트를 닫고 기본 포커스 이동을 그대로 진행 |

**data-\* 속성:**

| 속성 | 대응 JS 옵션 |
|------|-------------|
| `data-multiple` | `multiple` |
| `data-searchable` | `searchable` |
| `data-search-placeholder` | `searchPlaceholder` |
| `data-empty-text` | `emptyText` |
| `data-placeholder` | `placeholder` (미지정 시 `.bt-dropdown__placeholder` 의 마크업 텍스트를 이어받음) |
| `data-options` | `options` (JSON 배열) |
| `data-name` | `name` |

> boolean 속성은 값을 생략해도 되고(`data-multiple`), 끄려면 `data-multiple="false"` 로 명시합니다.
> `selectedSummary` 는 함수라 JS 옵션으로만 지정할 수 있습니다.

**JavaScript 연동:**

```html
<script>
  // 옵션을 직접 넘겨 수동 초기화할 때는 `data-bt-dropdown` 을 붙이지 않는다.
  // 그 속성이 있으면 DOMContentLoaded 에 자동 초기화되어 인스턴스가 두 개 생기고
  // (각각 리스너·상태를 갖는다) 클릭 처리와 상태 동기화가 어긋난다.
  // 자동 초기화된 요소를 다루려면 새로 만들지 말고 `el._btDropdown` 을 재사용할 것.
  const myDropdown = Bigtablet.Dropdown('#fruit-dropdown', {
    placeholder: '선택하세요',
    options: [
      { value: 'apple', label: '사과' },
      { value: 'banana', label: '바나나' },
      { value: 'mango', label: '망고', disabled: true },
    ],
    onValueChange: (value, option) => {
      console.log('Selected:', value, option);
    }
  });

  // 다중 + 검색 (옵션 이름은 React Dropdown prop 과 동일)
  const cityDropdown = Bigtablet.Dropdown('#city-dropdown', {
    multiple: true,
    searchable: true,
    searchPlaceholder: '도시 검색…',
    emptyText: '일치하는 도시가 없습니다',
    selectedSummary: (count) => `도시 ${count}곳`,
    options: [
      { value: 'seoul', label: '서울 Seoul' },
      { value: 'busan', label: '부산 Busan' },
    ],
    // multiple 이면 (values, options) 로 호출됩니다
    onValueChange: (values, options) => console.log(values, options),
  });

  // API
  myDropdown.getValue();       // 단일 → string | null / 다중 → string[]
  myDropdown.setValue('apple'); // 값 설정 (다중은 배열도 가능: setValue(['a', 'b']))
  myDropdown.open();           // 드롭다운 열기
  myDropdown.close();          // 드롭다운 닫기
  myDropdown.toggle();         // 열림/닫힘 토글
  myDropdown.setDisabled(true); // 비활성화
  myDropdown.destroy();        // 바인딩한 이벤트 리스너 해제
</script>
```

> `options` / `data-options` 만 주고 `<li class="bt-dropdown__option">` 마크업을 두지 않으면
> 옵션 DOM 을 JS 가 대신 생성합니다 (라벨은 `textContent` 로 넣으므로 XSS 위험 없음).
> 서버가 `<li>` 를 렌더링한 경우에는 그 DOM 을 그대로 씁니다.

---

### Modal

```html
<!-- 트리거 버튼 -->
<button class="bt-button bt-button--md bt-button--filled" data-bt-modal-open="my-modal">
  모달 열기
</button>

<!-- 모달 -->
<div id="my-modal" class="bt-modal" data-bt-modal>
  <div class="bt-modal__panel" style="width: 480px;">
    <button class="bt-modal__close" data-modal-close aria-label="닫기">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
    <div class="bt-modal__header">모달 제목</div>
    <div class="bt-modal__body">
      <p>모달 내용을 여기에 작성합니다.</p>
      <p>여러 줄의 콘텐츠도 가능합니다.</p>
    </div>
    <div class="bt-modal__footer">
      <button class="bt-button bt-button--md bt-button--outline" data-modal-close>취소</button>
      <button class="bt-button bt-button--md bt-button--filled" data-modal-close>확인</button>
    </div>
  </div>
</div>
```

**JavaScript 연동:**

```html
<script>
  const modalEl = document.getElementById('my-modal');
  const myModal = Bigtablet.Modal(modalEl, {
    closeOnOverlay: true,
    closeOnEscape: true,
    onOpen: () => console.log('Modal opened'),
    onClose: () => console.log('Modal closed')
  });

  // API
  myModal.open();   // 열기
  myModal.close();  // 닫기
  myModal.toggle(); // 토글
  myModal.isOpen(); // 상태 확인
</script>
```

---

### Alert

Alert는 JavaScript로만 사용합니다.

```html
<button class="bt-button bt-button--md bt-button--filled" onclick="showAlert()">
  알림 표시
</button>

<script>
  function showAlert() {
    Bigtablet.Alert({
      title: '알림',
      message: '작업이 완료되었습니다.',
      variant: 'info',  // 'info', 'success', 'warning', 'error'
      confirmText: '확인'
    });
  }

  // 확인/취소 Alert
  function showConfirm() {
    Bigtablet.Alert({
      title: '삭제 확인',
      message: '정말 삭제하시겠습니까?',
      variant: 'warning',
      showCancel: true,
      confirmText: '삭제',
      cancelText: '취소',
      actionsAlign: 'right',  // 'left', 'center', 'right'
      onConfirm: () => {
        console.log('삭제됨');
      },
      onCancel: () => {
        console.log('취소됨');
      }
    });
  }
</script>
```

**옵션:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `string` | - | 제목 |
| `message` | `string` | - | 메시지 |
| `variant` | `string` | `'info'` | `'info'`, `'success'`, `'warning'`, `'error'` |
| `confirmText` | `string` | `'확인'` | 확인 버튼 텍스트 |
| `cancelText` | `string` | `'취소'` | 취소 버튼 텍스트 |
| `showCancel` | `boolean` | `false` | 취소 버튼 표시 |
| `destructive` | `boolean` | `false` | 확인 버튼을 danger(빨강)로 강조 (React `AlertOptions.destructive` 와 동일) |
| `actionsAlign` | `string` | `'right'` | 버튼 정렬 |
| `closeOnOverlay` | `boolean` | `true` | 오버레이 클릭으로 닫기 허용 (React `AlertOptions.closeOnOverlay` 와 동일) |
| `onConfirm` | `function` | - | 확인 콜백 |
| `onCancel` | `function` | - | 취소 콜백 |

---

### Card

```html
<!-- 기본 - title / body / footer 3단 구성 (React Card 의 heading / children / footer 와 동일) -->
<div class="bt-card bt-card--bordered bt-card--p-md">
  <h3 class="bt-card__title">카드 제목</h3>
  <div class="bt-card__body">
    <p>카드 내용입니다.</p>
  </div>
  <div class="bt-card__footer">
    <button class="bt-button bt-button--sm bt-button--text">취소</button>
    <button class="bt-button bt-button--sm bt-button--filled">저장</button>
  </div>
</div>

<!-- Footer 정렬 (React footerAlign prop 과 동일, 기본 end) -->
<div class="bt-card__footer bt-card__footer--start">...</div>
<div class="bt-card__footer bt-card__footer--between">...</div>
<div class="bt-card__footer bt-card__footer--end">...</div>

<!-- Shadow (React Card shadow prop 과 동일) -->
<div class="bt-card bt-card--shadow-none bt-card--p-md">내용</div>
<div class="bt-card bt-card--shadow-sm bt-card--p-md">내용</div>
<div class="bt-card bt-card--shadow-md bt-card--p-md">내용</div>
<div class="bt-card bt-card--shadow-lg bt-card--p-md">내용</div>

<!-- Padding (React Card padding prop 과 동일) -->
<div class="bt-card bt-card--bordered bt-card--p-none">No padding</div>
<div class="bt-card bt-card--bordered bt-card--p-sm">Small padding</div>
<div class="bt-card bt-card--bordered bt-card--p-md">Medium padding</div>
<div class="bt-card bt-card--bordered bt-card--p-lg">Large padding</div>

<!-- Variant (React Card variant prop 과 동일) -->
<div class="bt-card bt-card--accent bt-card--p-md">Accent</div>
<div class="bt-card bt-card--outlined bt-card--p-md">Outlined (shadow 무시)</div>
<div class="bt-card bt-card--glass bt-card--p-md">Glass (컬러/이미지 배경 위에서)</div>

<!-- interactive - hover 시 살짝 떠오름 (React interactive prop) -->
<div class="bt-card bt-card--interactive bt-card--p-md">클릭 가능한 카드</div>
```

**클래스 조합:**
- `.bt-card` (필수) - 기본값은 React 와 동일하게 `shadow=sm` / `padding=md`
- `.bt-card--shadow-{none|sm|md|lg}` (선택)
- `.bt-card--p-{none|sm|md|lg}` (선택)
- `.bt-card--bordered` (선택)
- `.bt-card--{accent|outlined|glass}` (선택) - variant. 미지정 시 `default`
- `.bt-card--interactive` (선택)

**내부 요소:**
- `.bt-card__title` - 제목. React `headingAs`(기본 `h3`)와 맞춰 **`<h2>`~`<h6>` 시맨틱 헤딩**을 쓰세요
  (`<div>` 로 쓰면 스크린리더 문서 개요에서 빠집니다)
- `.bt-card__body` - 본문 영역
- `.bt-card__footer` - 하단 액션 영역. 위에 구분선(`border-top`)이 붙고,
  `--start` / `--between` / `--end`(기본) 로 정렬을 바꿉니다.
  `--accent` / `--glass` 카드에서는 구분선이 반투명 흰색으로 자동 전환됩니다 (React 와 동일)

> `.bt-card` 는 클래스를 하나도 더 붙이지 않아도 React `<Card>` 기본값과 같은
> 그림자(sm)·여백(md)을 갖습니다. 없애려면 `--shadow-none` / `--p-none` 을 명시하세요.

---

### Spinner

React `<Spinner size>` 가 px 숫자를 그대로 받는 것과 맞춰, 크기는 size enum 클래스가 아니라
`--bt-spinner-size` CSS 커스텀 프로퍼티로 지정합니다. 기본값은 React 와 같은 **24px** 입니다.

```html
<!-- 기본 24px -->
<span class="bt-spinner" role="status" aria-label="로딩 중"></span>

<!-- 임의 크기 -->
<span class="bt-spinner" style="--bt-spinner-size: 16px" role="status" aria-label="로딩 중"></span>
<span class="bt-spinner" style="--bt-spinner-size: 32px" role="status" aria-label="로딩 중"></span>
<span class="bt-spinner" style="--bt-spinner-size: 48px" role="status" aria-label="로딩 중"></span>
```

> `role="status"` + `aria-label` 을 직접 붙이세요 - React `<Spinner>` 는 이 둘을 자동으로
> 렌더링하지만 Vanilla 는 CSS 만 제공하므로 마크업에서 지정해야 스크린리더에 로딩 상태가 전달됩니다.
>
> **회전 모양은 React 와 다릅니다 (의도된 차이, 통일 계획 없음).**
> React `<Spinner>` 는 12개 bar 가 순차적으로 페이드하는 iOS 스타일이고, Vanilla 는 단일 border ring 입니다.
> React 는 컴포넌트가 12개 `<span>` 을 직접 렌더링하지만, Vanilla 는 Thymeleaf/JSP 같은
> 서버 템플릿에서 **빈 요소 하나(`<span class="bt-spinner">`)만 찍으면 되는 마크업 단순성**을
> 우선했습니다. 12개 bar 를 CSS 만으로(추가 DOM 없이) 만들 수 없으므로 형태를 맞추려면
> 템플릿마다 12개 자식을 반복해야 하고, 그 비용이 시각적 일치보다 크다고 판단했습니다.
>
> **reduced motion 대응도 이 형태 차이 때문에 갈립니다 (역시 의도된 차이).**
> React 는 `prefers-reduced-motion: reduce` 에서 애니메이션을 완전히 정지시킵니다
> (`animation: none; opacity: .5`) - 12개 spoke 는 멈춰 있어도 "로딩 위젯"으로 읽히기 때문입니다.
> Vanilla 의 단일 ring 은 멈추면 그냥 원 하나라 상태 정보가 사라지므로, 정지 대신
> 회전을 크게 늦춥니다(0.8s → 2.4s). 둘 다 "모션은 줄이되 로딩 상태는 유지"라는 같은 원칙의
> 서로 다른 구현입니다.

---

### Pagination

```html
<nav class="bt-pagination" data-bt-pagination data-page="1" data-total-pages="10">
  <!-- JS가 자동으로 렌더링 -->
</nav>
```

**JavaScript 연동:**

```html
<script>
  // Dropdown 과 마찬가지로, 수동 초기화 대상에는 `data-bt-pagination` 을 붙이지 않는다
  // (붙이면 자동 초기화와 인스턴스가 겹친다).
  const pagination = Bigtablet.Pagination('#article-pagination', {
    page: 1,
    totalPages: 20,
    onPageChange: (page) => {
      console.log('Page:', page);
      // 데이터 로드 등
    }
  });

  // API
  pagination.getPage();       // 현재 페이지
  pagination.setPage(5);      // 페이지 이동
  pagination.setTotalPages(30); // 총 페이지 수 변경
</script>
```

---

### DatePicker

```html
<div class="bt-date-picker">
  <label class="bt-date-picker__label">
    생년월일
    <span class="bt-date-picker__label-required">*</span>
  </label>
  <div class="bt-date-picker__fields">
    <select class="bt-date-picker__select" name="year">
      <option value="">연도</option>
      <option value="2024">2024</option>
      <option value="2023">2023</option>
      <option value="2022">2022</option>
      <!-- ... -->
    </select>
    <select class="bt-date-picker__select" name="month">
      <option value="">월</option>
      <option value="1">1월</option>
      <option value="2">2월</option>
      <!-- ... -->
      <option value="12">12월</option>
    </select>
    <select class="bt-date-picker__select" name="day">
      <option value="">일</option>
      <option value="1">1일</option>
      <option value="2">2일</option>
      <!-- ... -->
      <option value="31">31일</option>
    </select>
  </div>
</div>

<!-- 전체 너비 -->
<div class="bt-date-picker bt-date-picker--full-width">
  ...
</div>
```

---

### FileInput

```html
<div class="bt-file-input">
  <input type="file" class="bt-file-input__control" id="file-upload" accept="image/*">
  <label class="bt-file-input__label" for="file-upload">파일 선택</label>
</div>

<!-- 여러 파일 -->
<div class="bt-file-input">
  <input type="file" class="bt-file-input__control" id="files-upload" multiple>
  <label class="bt-file-input__label" for="files-upload">파일 선택</label>
</div>

<!-- 비활성화 -->
<div class="bt-file-input bt-file-input--disabled">
  <input type="file" class="bt-file-input__control" id="file-disabled" disabled>
  <label class="bt-file-input__label" for="file-disabled">파일 선택</label>
</div>
```

---

## CSS Custom Properties

모든 디자인 토큰을 CSS Custom Properties로 제공합니다. 테마 커스터마이징에 활용하세요.

```css
:root {
  /* Colors */
  --bt-color-primary: #000000;
  --bt-color-primary-hover: #333333;
  --bt-color-primary-container: rgba(0, 0, 0, 0.05);  /* .bt-button--tonal 채움색 */
  --bt-color-background: #ffffff;
  --bt-color-background-secondary: #fafafa;
  --bt-color-text-primary: #1a1a1a;
  --bt-color-text-secondary: #666666;
  --bt-color-text-tertiary: #999999;
  --bt-color-border: #e5e5e5;
  --bt-color-success: #047857;
  --bt-color-error: #ef4444;
  --bt-color-warning: #f59e0b;
  --bt-color-info: #2563eb;

  /* Spacing */
  --bt-spacing-xs: 0.25rem;   /* 4px */
  --bt-spacing-sm: 0.5rem;    /* 8px */
  --bt-spacing-md: 0.75rem;   /* 12px */
  --bt-spacing-lg: 1rem;      /* 16px */
  --bt-spacing-xl: 1.25rem;   /* 20px */
  --bt-spacing-2xl: 1.5rem;   /* 24px */

  /* Typography */
  --bt-font-family: "Pretendard", sans-serif;
  --bt-font-size-sm: 0.875rem;
  --bt-font-size-base: 0.9375rem;
  --bt-font-size-md: 1rem;
  --bt-font-size-lg: 1.125rem;

  /* Radius (React `radius` prop 스케일과 동일) */
  --bt-radius-none: 0px;
  --bt-radius-xs: 4px;
  --bt-radius-sm: 6px;
  --bt-radius-md: 8px;
  --bt-radius-lg: 12px;
  --bt-radius-xl: 16px;
  --bt-radius-full: 9999px;

  /* Elevation (구 --bt-shadow-* 는 존재하지 않음) */
  --bt-elevation-1: var(--bt-elevation-level1);
  --bt-elevation-2: var(--bt-elevation-level2);
  --bt-elevation-3: var(--bt-elevation-level3);
  --bt-elevation-4: var(--bt-elevation-level4);
  --bt-elevation-5: var(--bt-elevation-level5);

  /* Transitions */
  --bt-transition-fast: 0.1s ease-in-out;
  --bt-transition-base: 0.2s ease-in-out;
}
```

**테마 커스터마이징 예시:**

```css
/* 커스텀 테마 */
:root {
  --bt-color-primary: #2563eb;
  --bt-color-primary-hover: #1d4ed8;
  --bt-radius-md: 12px;
}

/* 다크 모드 */
[data-theme="dark"] {
  --bt-color-background: #1a1a1a;
  --bt-color-background-secondary: #2a2a2a;
  --bt-color-text-primary: #ffffff;
  --bt-color-text-secondary: #a0a0a0;
  --bt-color-border: #404040;
}
```

---

## JavaScript API

### 자동 초기화

`data-bt-*` 속성이 있는 요소는 페이지 로드 시 자동으로 초기화됩니다.

```html
<div data-bt-dropdown>...</div>   <!-- Dropdown 자동 초기화 -->
<div data-bt-modal>...</div>      <!-- Modal 자동 초기화 -->
<button data-bt-toggle>...</button> <!-- Toggle 자동 초기화 -->
<nav data-bt-pagination>...</nav> <!-- Pagination 자동 초기화 -->
```

### 수동 초기화

```javascript
// 페이지 로드 후 수동 초기화
document.addEventListener('DOMContentLoaded', function() {
  // Dropdown
  const dropdown = Bigtablet.Dropdown('#my-dropdown', options);

  // Modal
  const modal = Bigtablet.Modal('#my-modal', options);

  // Toggle
  const sw = Bigtablet.Toggle('#my-toggle', options);

  // Pagination
  const pagination = Bigtablet.Pagination('#my-pagination', options);

  // Alert (즉시 표시)
  Bigtablet.Alert({ title: '알림', message: '메시지' });
});

// 전체 재초기화
Bigtablet.init();
```

### 콜백 이름 (React 와 동일)

값 변경 콜백은 React 컴포넌트와 같은 이름을 사용합니다. 구 `onChange` 는 **더 이상 호출되지
않습니다** (v3.8.0 제거 - [마이그레이션 가이드](./MIGRATION.md#v380-vanilla-패키지-정리) 참고).

| 컴포넌트 | 콜백 |
|---|---|
| `Bigtablet.Dropdown` | `onValueChange(value, option)` |
| `Bigtablet.Toggle` | `onCheckedChange(checked)` |
| `Bigtablet.Pagination` | `onPageChange(page)` |

### 유틸리티

```javascript
// DOM 선택자
Bigtablet.$('#element');      // querySelector
Bigtablet.$$('.elements');    // querySelectorAll (Array 반환)

// ID 생성
Bigtablet.generateId('prefix');  // 'prefix_abc123'

// 이벤트 리스너 (cleanup 함수 반환)
const cleanup = Bigtablet.on(element, 'click', handler);
cleanup();  // 리스너 제거
```

---

## Thymeleaf 예시

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
  <link rel="stylesheet" href="/css/bigtablet.min.css">
</head>
<body>
  <form th:action="@{/submit}" method="post">
    <!-- TextField -->
    <div class="bt-text-field">
      <label class="bt-text-field__label">이름</label>
      <div class="bt-text-field__wrap">
        <input type="text"
               th:field="*{name}"
               class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--md"
               th:classappend="${#fields.hasErrors('name')} ? 'bt-text-field__input--error' : ''">
      </div>
      <span class="bt-text-field__helper bt-text-field__helper--error"
            th:if="${#fields.hasErrors('name')}"
            th:errors="*{name}"></span>
    </div>

    <!-- Select -->
    <div class="bt-text-field">
      <label class="bt-text-field__label">카테고리</label>
      <select th:field="*{category}" class="bt-date-picker__select">
        <option value="">선택하세요</option>
        <option th:each="cat : ${categories}"
                th:value="${cat.id}"
                th:text="${cat.name}"></option>
      </select>
    </div>

    <!-- Button -->
    <button type="submit" class="bt-button bt-button--md bt-button--filled">
      제출
    </button>
  </form>

  <script src="/js/bigtablet.min.js"></script>
</body>
</html>
```

---

## 브라우저 지원

- Chrome 88+
- Firefox 78+
- Safari 14+
- Edge 88+

---

## 라이센스

[Bigtablet Inc. Open Source License](../LICENSE)
