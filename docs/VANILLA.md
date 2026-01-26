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
  - [Switch](#switch)
  - [Select](#select)
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
@import '@bigtablet/design-system/dist/vanilla/bigtablet.css';
```

### 직접 다운로드

[GitHub Releases](https://github.com/Bigtablet/bigtablet-design-system/releases)에서 다운로드:

- `bigtablet.css` - 비압축 CSS (27KB)
- `bigtablet.min.css` - 압축 CSS (21KB)
- `bigtablet.js` - 비압축 JS (20KB)
- `bigtablet.min.js` - 압축 JS (9KB)

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

    <button class="bt-button bt-button--md bt-button--primary">
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
<button class="bt-button bt-button--md bt-button--primary">Primary</button>

<!-- Variants -->
<button class="bt-button bt-button--md bt-button--primary">Primary</button>
<button class="bt-button bt-button--md bt-button--secondary">Secondary</button>
<button class="bt-button bt-button--md bt-button--ghost">Ghost</button>
<button class="bt-button bt-button--md bt-button--danger">Danger</button>

<!-- Sizes -->
<button class="bt-button bt-button--sm bt-button--primary">Small</button>
<button class="bt-button bt-button--md bt-button--primary">Medium</button>
<button class="bt-button bt-button--lg bt-button--primary">Large</button>

<!-- 전체 너비 -->
<button class="bt-button bt-button--md bt-button--primary bt-button--full-width">전체 너비</button>

<!-- 비활성화 -->
<button class="bt-button bt-button--md bt-button--primary" disabled>Disabled</button>
```

**클래스 조합:**
- `.bt-button` (필수)
- `.bt-button--{size}`: `sm`, `md`, `lg`
- `.bt-button--{variant}`: `primary`, `secondary`, `ghost`, `danger`
- `.bt-button--full-width` (선택)

---

### TextField

```html
<!-- 기본 -->
<div class="bt-text-field">
  <label class="bt-text-field__label">라벨</label>
  <div class="bt-text-field__wrap">
    <input type="text" class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--md" placeholder="입력하세요">
  </div>
</div>

<!-- Variants -->
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

### Switch

```html
<!-- 기본 (Off) -->
<button class="bt-switch" data-bt-switch>
  <span class="bt-switch__thumb"></span>
</button>

<!-- On 상태 -->
<button class="bt-switch bt-switch--on" data-bt-switch>
  <span class="bt-switch__thumb"></span>
</button>

<!-- Sizes -->
<button class="bt-switch bt-switch--sm" data-bt-switch>...</button>
<button class="bt-switch" data-bt-switch>...</button>  <!-- 기본 md -->
<button class="bt-switch bt-switch--lg" data-bt-switch>...</button>

<!-- 비활성화 -->
<button class="bt-switch bt-switch--disabled" data-bt-switch>
  <span class="bt-switch__thumb"></span>
</button>
```

**JavaScript 연동:**

```html
<button class="bt-switch" data-bt-switch id="my-switch">
  <span class="bt-switch__thumb"></span>
</button>

<script>
  // 자동 초기화 (data-bt-switch 속성이 있으면 자동으로 초기화됨)

  // 또는 수동 초기화
  const switchEl = document.getElementById('my-switch');
  const mySwitch = Bigtablet.Switch(switchEl, {
    defaultChecked: false,
    onChange: (checked) => {
      console.log('Switch:', checked);
    }
  });

  // API
  mySwitch.isChecked();     // 현재 상태
  mySwitch.setChecked(true); // 상태 설정
  mySwitch.toggle();        // 토글
</script>
```

---

### Select

```html
<div class="bt-select" data-bt-select style="width: 300px;">
  <label class="bt-select__label">과일 선택</label>
  <button type="button" class="bt-select__control bt-select__control--outline bt-select__control--md">
    <span class="bt-select__placeholder">선택하세요...</span>
    <span class="bt-select__icon">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    </span>
  </button>
  <ul class="bt-select__list">
    <li class="bt-select__option" data-value="apple">사과</li>
    <li class="bt-select__option" data-value="banana">바나나</li>
    <li class="bt-select__option" data-value="cherry">체리</li>
    <li class="bt-select__option is-disabled" data-value="mango">망고 (품절)</li>
    <li class="bt-select__option" data-value="orange">오렌지</li>
  </ul>
</div>
```

**Variants:**
- `.bt-select__control--outline` (기본)
- `.bt-select__control--filled`

**Sizes:**
- `.bt-select__control--sm`
- `.bt-select__control--md`
- `.bt-select__control--lg`

**JavaScript 연동:**

```html
<script>
  const selectEl = document.querySelector('[data-bt-select]');
  const mySelect = Bigtablet.Select(selectEl, {
    placeholder: '선택하세요',
    options: [
      { value: 'apple', label: '사과' },
      { value: 'banana', label: '바나나' },
      { value: 'mango', label: '망고', disabled: true },
    ],
    onChange: (value, option) => {
      console.log('Selected:', value, option);
    }
  });

  // API
  mySelect.getValue();       // 현재 값
  mySelect.setValue('apple'); // 값 설정
  mySelect.open();           // 드롭다운 열기
  mySelect.close();          // 드롭다운 닫기
  mySelect.setDisabled(true); // 비활성화
</script>
```

---

### Modal

```html
<!-- 트리거 버튼 -->
<button class="bt-button bt-button--md bt-button--primary" data-bt-modal-open="my-modal">
  모달 열기
</button>

<!-- 모달 -->
<div id="my-modal" class="bt-modal" data-bt-modal>
  <div class="bt-modal__panel" style="width: 480px;">
    <div class="bt-modal__header">모달 제목</div>
    <div class="bt-modal__body">
      <p>모달 내용을 여기에 작성합니다.</p>
      <p>여러 줄의 콘텐츠도 가능합니다.</p>
    </div>
    <div class="bt-modal__footer">
      <button class="bt-button bt-button--md bt-button--secondary" data-modal-close>취소</button>
      <button class="bt-button bt-button--md bt-button--primary" data-modal-close>확인</button>
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
<button class="bt-button bt-button--md bt-button--primary" onclick="showAlert()">
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
| `actionsAlign` | `string` | `'right'` | 버튼 정렬 |
| `onConfirm` | `function` | - | 확인 콜백 |
| `onCancel` | `function` | - | 취소 콜백 |

---

### Card

```html
<!-- 기본 -->
<div class="bt-card bt-card--bordered bt-card--p-md">
  <div class="bt-card__title">카드 제목</div>
  <p>카드 내용입니다.</p>
</div>

<!-- Shadow -->
<div class="bt-card bt-card--shadow-sm bt-card--p-md">내용</div>
<div class="bt-card bt-card--shadow-md bt-card--p-md">내용</div>
<div class="bt-card bt-card--shadow-lg bt-card--p-md">내용</div>

<!-- Padding -->
<div class="bt-card bt-card--bordered bt-card--p-sm">Small padding</div>
<div class="bt-card bt-card--bordered bt-card--p-md">Medium padding</div>
<div class="bt-card bt-card--bordered bt-card--p-lg">Large padding</div>
```

---

### Spinner

```html
<div class="bt-spinner bt-spinner--sm"></div>  <!-- 16px -->
<div class="bt-spinner bt-spinner--md"></div>  <!-- 24px -->
<div class="bt-spinner bt-spinner--lg"></div>  <!-- 32px -->
<div class="bt-spinner bt-spinner--xl"></div>  <!-- 48px -->
```

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
  const paginationEl = document.querySelector('[data-bt-pagination]');
  const pagination = Bigtablet.Pagination(paginationEl, {
    page: 1,
    totalPages: 20,
    onChange: (page) => {
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
  --bt-color-background: #ffffff;
  --bt-color-background-secondary: #fafafa;
  --bt-color-text-primary: #1a1a1a;
  --bt-color-text-secondary: #666666;
  --bt-color-text-tertiary: #999999;
  --bt-color-border: #e5e5e5;
  --bt-color-success: #10b981;
  --bt-color-error: #ef4444;
  --bt-color-warning: #f59e0b;
  --bt-color-info: #3b82f6;

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

  /* Radius */
  --bt-radius-sm: 6px;
  --bt-radius-md: 8px;
  --bt-radius-lg: 12px;

  /* Shadows */
  --bt-shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.04);
  --bt-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --bt-shadow-lg: 0 8px 20px rgba(0, 0, 0, 0.12);

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
<div data-bt-select>...</div>     <!-- Select 자동 초기화 -->
<div data-bt-modal>...</div>      <!-- Modal 자동 초기화 -->
<button data-bt-switch>...</button> <!-- Switch 자동 초기화 -->
<nav data-bt-pagination>...</nav> <!-- Pagination 자동 초기화 -->
```

### 수동 초기화

```javascript
// 페이지 로드 후 수동 초기화
document.addEventListener('DOMContentLoaded', function() {
  // Select
  const select = Bigtablet.Select('#my-select', options);

  // Modal
  const modal = Bigtablet.Modal('#my-modal', options);

  // Switch
  const sw = Bigtablet.Switch('#my-switch', options);

  // Pagination
  const pagination = Bigtablet.Pagination('#my-pagination', options);

  // Alert (즉시 표시)
  Bigtablet.Alert({ title: '알림', message: '메시지' });
});

// 전체 재초기화
Bigtablet.init();
```

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
    <button type="submit" class="bt-button bt-button--md bt-button--primary">
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

[MIT License](../LICENSE)
