# Vanilla JS Package (src/vanilla/)

> src/vanilla 작업 시 로드되는 참조. 전체 프로젝트 규약은 루트 [CLAUDE.md](../../CLAUDE.md).


For non-React environments (Thymeleaf, JSP, PHP, Django, etc.)

### Build Output
```
dist/vanilla/
├── bigtablet.css       # Full CSS (~40KB)
├── bigtablet.min.css   # Minified CSS (~31KB)
├── bigtablet.js        # Full JS (~30KB)
├── bigtablet.min.js    # Minified JS (~13KB)
└── examples/           # HTML examples
```

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
[docs/MIGRATION.md](./docs/MIGRATION.md) 에 old → new 표를 남긴다 (v3.8.0 에서 정리 완료).

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
| Dropdown Option | `.bt-dropdown__option` | | `.is-selected`, `.is-active`, `.is-disabled` |
| Modal | `.bt-modal` | | `.is-open` |
| Card | `.bt-card` | `--bordered`, `--shadow-none/sm/md/lg`(기본 sm), `--p-none/sm/md/lg`(기본 md), `--accent/glass/outlined`, `--interactive` | |
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
  <label class="bt-dropdown__label">Label</label>
  <button type="button" class="bt-dropdown__control bt-dropdown__control--outline bt-dropdown__control--md">
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
<div class="bt-card bt-card--bordered bt-card--p-md">
  <div class="bt-card__title">Title</div>
  <p>Content</p>
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

// Manual initialization
const dropdown = Bigtablet.Dropdown('#my-dropdown', {
  options: [{ value: '1', label: 'One' }],
  onValueChange: (value, option) => console.log(value)
});
dropdown.getValue();
dropdown.setValue('1');
dropdown.open();
dropdown.close();

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

