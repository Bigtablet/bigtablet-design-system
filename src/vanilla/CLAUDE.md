# Vanilla JS Package (src/vanilla/)

> src/vanilla 작업 시 로드되는 참조. 전체 프로젝트 규약은 루트 [CLAUDE.md](../../CLAUDE.md).


For non-React environments (Thymeleaf, JSP, PHP, Django, etc.)

### Build Output
```
dist/vanilla/
├── bigtablet.css       # Full CSS (~55KB)      - 배포 제외
├── bigtablet.min.css   # Minified CSS (~38KB)  - 배포됨
├── bigtablet.js        # Full JS (~48KB)       - 배포 제외
├── bigtablet.min.js    # Minified JS (~19KB)   - 배포됨
└── examples/           # HTML examples         - 배포 제외
```

"배포 제외" 는 `package.json` `files` 의 `!dist/vanilla/...` 로 npm tarball 에서 빠진다는 뜻이다
(로컬 빌드에는 생성된다). 소비자에게 안내할 경로는 압축본 2개뿐 - `docs/VANILLA.md#설치` 참고.

### 테스트

`bigtablet.test.ts` 가 이 번들을 덮는다 (`pnpm test` 에 포함). 소스를 직접 import 하므로
여기 코드를 고치면 테스트가 먼저 걸린다. 새 동작을 추가하면 같은 파일에 케이스를 더한다.

jsdom 은 레이아웃을 하지 않으니 스크롤바 폭 같은 값은 직접 세워야 한다. 자세한 주의점은
[docs/TESTING.md](../../docs/TESTING.md#vanilla-번들-테스트) 참고.

### Class Naming Convention (BEM-like)
```
.bt-{component}
.bt-{component}__{element}
.bt-{component}--{modifier}
.bt-{component}.is-{state}
```

### Component Classes Reference

클래스 이름·JS 옵션 이름은 대응하는 React 컴포넌트의 prop 값과 **같게 맞춘다**. deprecated 별칭은
두지 않는다 - 이름이 갈라지면 별칭을 추가하는 대신 구 이름을 제거하고
[docs/MIGRATION.md](../../docs/MIGRATION.md) 에 old → new 표를 남긴다 (v3.8.0 에서 정리 완료).

| Component | Base Class | Modifiers | States |
|-----------|------------|-----------|--------|
| Button | `.bt-button` | `--sm/md/lg/xl`, `--filled/tonal/outline/text`, `--danger`(variant 와 직교), `--radius-none/xs/sm/md/lg/xl/full`(기본 full), `--full-width` | `:disabled` |
| TextField | `.bt-text-field` | `--full-width` | |
| TextField Input | `.bt-text-field__input` | `--outline/filled`, `--sm/md/lg`, `--error/success` | `:disabled` |
| Checkbox | `.bt-checkbox` | `--sm/md/lg` | `:checked`, `:disabled` |
| Radio | `.bt-radio` | `--sm/md/lg` | `:checked`, `:disabled` |
| Toggle | `.bt-toggle` | `--sm/md` | `.bt-toggle--on`, `:disabled` |
| Dropdown | `.bt-dropdown` | | |
| Dropdown Control | `.bt-dropdown__control` | `--outline/filled`, `--sm/md/lg` | `.is-open`, `.is-disabled` |
| Dropdown List | `.bt-dropdown__list` | `--up` (opens upward) | |
| Dropdown Search | `.bt-dropdown__search` (+ `__search-icon`, `__search-input`) | | |
| Dropdown Options | `.bt-dropdown__options` (role=listbox 스크롤 컨테이너) | | |
| Dropdown Option | `.bt-dropdown__option` | | `.is-selected`, `.is-active`, `.is-disabled`, `[hidden]`(필터로 숨김) |
| Dropdown Option Check | `.bt-dropdown__option-check` (multiple 전용 좌측 체크 슬롯) | | |
| Dropdown Empty | `.bt-dropdown__empty` (검색 결과 0개) | | |
| Modal | `.bt-modal` | | `.is-open` |
| Card | `.bt-card` | `--bordered`, `--shadow-none/sm/md/lg`(기본 sm), `--p-none/sm/md/lg`(기본 md), `--accent/glass/outlined`, `--interactive` | |
| Card Title / Body | `.bt-card__title`(h2~h6), `.bt-card__body` | | |
| Card Footer | `.bt-card__footer` | `--start/between/end`(기본 end) | |
| Spinner | `.bt-spinner` | 없음 - 크기는 `--bt-spinner-size` (기본 24px) | |
| Pagination | `.bt-pagination` | | |
| DatePicker | `.bt-date-picker` | `--full-width` | |
| FileInput | `.bt-file-input` | | `.bt-file-input--disabled` |

### HTML Examples

#### Button
```html
<button class="bt-button bt-button--md bt-button--filled">Filled</button>
<button class="bt-button bt-button--md bt-button--tonal">Tonal</button>
<button class="bt-button bt-button--md bt-button--outline">Outline</button>
<button class="bt-button bt-button--md bt-button--text">Text</button>
<button class="bt-button bt-button--md bt-button--outline bt-button--danger">Delete</button>
```

#### TextField
```html
<div class="bt-text-field">
  <label class="bt-text-field__label">Label</label>
  <div class="bt-text-field__wrap">
    <input type="text" class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--md" placeholder="Enter...">
  </div>
  <span class="bt-text-field__helper">Helper text</span>
</div>

<!-- Error state -->
<input class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--md bt-text-field__input--error">
<span class="bt-text-field__helper bt-text-field__helper--error">Error message</span>
```

#### Checkbox
```html
<label class="bt-checkbox">
  <input type="checkbox" class="bt-checkbox__input">
  <span class="bt-checkbox__box"></span>
  <span class="bt-checkbox__label">Label</span>
</label>
```

#### Radio
```html
<label class="bt-radio">
  <input type="radio" name="group" class="bt-radio__input">
  <span class="bt-radio__dot"></span>
  <span class="bt-radio__label">Option</span>
</label>
```

#### Toggle
```html
<button class="bt-toggle" data-bt-toggle>
  <span class="bt-toggle__thumb"></span>
</button>

<!-- On state -->
<button class="bt-toggle bt-toggle--on" data-bt-toggle>
  <span class="bt-toggle__thumb"></span>
</button>
```

#### Dropdown
```html
<div class="bt-dropdown" data-bt-dropdown>
  <label class="bt-dropdown__label" for="my-dropdown-control">Label</label>
  <button type="button" id="my-dropdown-control" class="bt-dropdown__control bt-dropdown__control--outline bt-dropdown__control--md">
    <span class="bt-dropdown__placeholder">Select...</span>
    <span class="bt-dropdown__icon">▼</span>
  </button>
  <ul class="bt-dropdown__list">
    <li class="bt-dropdown__option" data-value="1">Option 1</li>
    <li class="bt-dropdown__option" data-value="2">Option 2</li>
    <li class="bt-dropdown__option is-disabled" data-value="3">Disabled</li>
  </ul>
</div>
```

React 와 동일하게 `multiple` / `searchable` 을 지원한다. 마크업은 그대로 두고
`data-multiple` / `data-searchable` 만 붙이면 되고, 검색 행(`__search`)·스크롤 컨테이너
(`__options`)·빈 결과(`__empty`)·체크 슬롯(`__option-check`)은 JS 가 만들어 넣는다.

```html
<!-- 다중 선택 - 옵션 토글 시 패널 유지, 트리거는 "N개 선택" 요약, hidden input 은 같은 name 반복 -->
<div class="bt-dropdown" data-bt-dropdown data-multiple data-name="topping">
  <button type="button" class="bt-dropdown__control bt-dropdown__control--outline bt-dropdown__control--md">
    <span class="bt-dropdown__placeholder">토핑을 고르세요...</span>
    <span class="bt-dropdown__icon">▼</span>
  </button>
  <ul class="bt-dropdown__list">
    <li class="bt-dropdown__option" data-value="cheese">치즈</li>
    <li class="bt-dropdown__option" data-value="bacon">베이컨</li>
  </ul>
</div>

<!-- 검색 - 대소문자·공백 무시 부분 일치. 한글 IME 조합 중에는 필터를 보류한다. -->
<div class="bt-dropdown" data-bt-dropdown data-searchable
     data-search-placeholder="검색…" data-empty-text="결과 없음">
  ...
</div>
```

#### Modal
```html
<button data-bt-modal-open="my-modal">Open</button>

<div id="my-modal" class="bt-modal" data-bt-modal>
  <div class="bt-modal__panel" style="width: 480px;">
    <button class="bt-modal__close" data-modal-close aria-label="Close">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
    <div class="bt-modal__header">Title</div>
    <div class="bt-modal__body">Content</div>
    <div class="bt-modal__footer">
      <button class="bt-button bt-button--md bt-button--outline" data-modal-close>Cancel</button>
      <button class="bt-button bt-button--md bt-button--filled" data-modal-close>Confirm</button>
    </div>
  </div>
</div>
```

#### Card
```html
<!-- title / body / footer 3단 구성 (React Card 의 heading / children / footer 와 동일).
     제목은 React `headingAs`(기본 h3)와 맞춰 시맨틱 헤딩 태그를 쓴다. -->
<div class="bt-card bt-card--bordered bt-card--p-md">
  <h3 class="bt-card__title">Title</h3>
  <div class="bt-card__body">
    <p>Content</p>
  </div>
  <div class="bt-card__footer">  <!-- --start / --between / --end (기본 end) -->
    <button class="bt-button bt-button--sm bt-button--text">Cancel</button>
    <button class="bt-button bt-button--sm bt-button--filled">Save</button>
  </div>
</div>

<div class="bt-card bt-card--shadow-md bt-card--p-lg">
  Shadow card
</div>

<div class="bt-card bt-card--accent bt-card--interactive">
  Accent + interactive card
</div>
```

#### Spinner
```html
<!-- 기본 24px (React <Spinner /> 기본값) -->
<span class="bt-spinner" role="status" aria-label="Loading"></span>
<!-- 임의 크기 -->
<span class="bt-spinner" style="--bt-spinner-size: 32px" role="status" aria-label="Loading"></span>
```

#### Pagination
```html
<nav class="bt-pagination" data-bt-pagination data-page="1" data-total-pages="10">
  <!-- JS renders automatically -->
</nav>
```

### JavaScript API

```javascript
// Auto-init: elements with data-bt-* are initialized on DOMContentLoaded

// Manual initialization - 옵션 이름은 React Dropdown prop 과 동일 (별칭 없음)
const dropdown = Bigtablet.Dropdown('#my-dropdown', {
  options: [{ value: '1', label: 'One' }],
  placeholder: 'Select...',
  name: 'field',            // hidden input 으로 폼 제출 참여 (multiple 은 같은 name 반복)
  multiple: false,          // true 면 값이 string[] 이고 선택해도 패널이 닫히지 않는다
  searchable: false,        // true 면 패널 상단 검색 입력 (대소문자·공백 무시, IME 조합 중 필터 보류)
  searchPlaceholder: '검색…',
  emptyText: '결과 없음',
  selectedSummary: (count) => `${count}개 선택`,  // multiple 트리거 요약 문구
  onValueChange: (value, option) => console.log(value)
  // multiple 이면 (values: string[], options: Option[]) 로 호출된다
});
dropdown.getValue();        // 단일 → string | null / 다중 → string[]
dropdown.setValue('1');     // 다중 모드는 배열도 받는다: setValue(['1', '2'])
dropdown.open();
dropdown.close();
dropdown.toggle();
dropdown.setDisabled(true);
dropdown.destroy();         // 바인딩한 리스너 해제

const modal = Bigtablet.Modal('#my-modal', {
  closeOnOverlay: true,
  onOpen: () => {},
  onClose: () => {}
});
modal.open();
modal.close();

const sw = Bigtablet.Toggle('#my-toggle', {
  onCheckedChange: (checked) => console.log(checked)
});
sw.toggle();
sw.setChecked(true);

const pagination = Bigtablet.Pagination('#my-pagination', {
  page: 1,
  totalPages: 10,
  onPageChange: (page) => console.log(page)
});
pagination.setPage(5);

// Alert (no element needed)
Bigtablet.Alert({
  title: 'Title',
  message: 'Message',
  variant: 'info',  // info, success, warning, error
  showCancel: true,
  onConfirm: () => {},
  onCancel: () => {}
});
```

### CSS Custom Properties

All design tokens available as CSS variables:
```css
:root {
  --bt-color-primary: #000000;
  --bt-color-background: #ffffff;
  --bt-color-text-primary: #1a1a1a;
  --bt-color-border: #e5e5e5;
  --bt-color-error: #ef4444;
  --bt-color-success: #047857;
  --bt-color-info: #2563eb;
  --bt-spacing-xs: 0.25rem;
  --bt-spacing-sm: 0.5rem;
  --bt-spacing-md: 0.75rem;
  --bt-spacing-lg: 1rem;
  --bt-radius-sm: 6px;
  --bt-radius-md: 8px;
  --bt-radius-full: 9999px;
  --bt-elevation-1: 0 1px 1px -1px rgba(0,0,0,0.20), 0 3px 3px 0 rgba(0,0,0,0.12);
  --bt-transition-base: 0.2s ease-in-out;
}
```

### Thymeleaf Example
```html
<form th:action="@{/submit}" method="post">
  <div class="bt-text-field">
    <label class="bt-text-field__label">Name</label>
    <input type="text"
           th:field="*{name}"
           class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--md"
           th:classappend="${#fields.hasErrors('name')} ? 'bt-text-field__input--error' : ''">
    <span class="bt-text-field__helper bt-text-field__helper--error"
          th:if="${#fields.hasErrors('name')}"
          th:errors="*{name}"></span>
  </div>

  <button type="submit" class="bt-button bt-button--md bt-button--filled">Submit</button>
</form>
```

