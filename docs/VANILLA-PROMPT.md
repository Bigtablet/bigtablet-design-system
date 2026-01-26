# Bigtablet Design System - Vanilla JS 프롬프트

서버 개발자가 Claude에게 복붙해서 사용할 수 있는 프롬프트 모음입니다.

---

## 기본 설정 프롬프트

아래 내용을 Claude에게 먼저 전달하세요:

```
Bigtablet Design System의 Vanilla JS 패키지를 사용해서 HTML을 작성해줘.

CSS: https://unpkg.com/@bigtablet/design-system/dist/vanilla/bigtablet.min.css
JS: https://unpkg.com/@bigtablet/design-system/dist/vanilla/bigtablet.min.js

클래스 네이밍 규칙:
- .bt-{component} (기본)
- .bt-{component}__{element} (하위 요소)
- .bt-{component}--{modifier} (변형)
- .is-{state} (상태)

사용 가능한 컴포넌트:
- Button: .bt-button --sm/md/lg --primary/secondary/ghost/danger
- TextField: .bt-text-field, .bt-text-field__input --outline/filled --sm/md/lg --error/success
- Checkbox: .bt-checkbox --sm/md/lg
- Radio: .bt-radio --sm/md/lg
- Switch: .bt-switch --sm/md/lg --on --disabled
- Select: .bt-select, .bt-select__control --outline/filled --sm/md/lg
- Modal: .bt-modal .is-open
- Card: .bt-card --bordered --shadow-sm/md/lg --p-sm/md/lg
- Spinner: .bt-spinner --sm/md/lg/xl
- Pagination: .bt-pagination
- DatePicker: .bt-date-picker --full-width
- FileInput: .bt-file-input --disabled
```

---

## 컴포넌트별 프롬프트

### 로그인 폼

```
Bigtablet Design System으로 로그인 폼 HTML 만들어줘.
- 이메일 입력 (필수, outline 스타일)
- 비밀번호 입력 (필수, outline 스타일)
- 로그인 버튼 (primary, 전체 너비)
- "비밀번호 찾기" 링크
```

### 회원가입 폼

```
Bigtablet Design System으로 회원가입 폼 HTML 만들어줘.
- 이름
- 이메일
- 비밀번호
- 비밀번호 확인
- 생년월일 (DatePicker)
- 이용약관 동의 (Checkbox)
- 가입하기 버튼
```

### 검색 필터

```
Bigtablet Design System으로 검색 필터 영역 HTML 만들어줘.
- 검색어 입력
- 카테고리 Select (전체, 카테고리1, 카테고리2, 카테고리3)
- 정렬 Select (최신순, 인기순, 가격순)
- 검색 버튼
- 초기화 버튼 (secondary)
```

### 데이터 테이블

```
Bigtablet Design System으로 데이터 테이블 페이지 HTML 만들어줘.
- Card 안에 테이블
- 테이블 헤더: 번호, 제목, 작성자, 날짜, 상태
- 5개 샘플 행
- 하단에 Pagination
```

### 설정 페이지

```
Bigtablet Design System으로 설정 페이지 HTML 만들어줘.
- 알림 설정 (Switch로 이메일 알림, 푸시 알림)
- 테마 설정 (Radio로 라이트/다크/시스템)
- 언어 설정 (Select로 한국어/English)
- 저장 버튼
```

### 모달 다이얼로그

```
Bigtablet Design System으로 확인 모달 HTML 만들어줘.
- 모달 열기 버튼
- 모달 제목: "삭제 확인"
- 모달 내용: "정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
- 취소 버튼 (secondary)
- 삭제 버튼 (danger)
```

### 대시보드 카드

```
Bigtablet Design System으로 대시보드 통계 카드 3개 HTML 만들어줘.
- 총 사용자 수 카드
- 오늘 방문자 카드
- 총 매출 카드
각 카드는 shadow-md, p-lg 스타일로
```

---

## Thymeleaf 전용 프롬프트

### 폼 with 에러 처리

```
Bigtablet Design System + Thymeleaf로 폼 HTML 만들어줘.
- 이름 필드 (th:field="*{name}")
- 이메일 필드 (th:field="*{email}")
- 필드 에러 시 bt-text-field__input--error 클래스 추가
- 에러 메시지는 bt-text-field__helper--error로 표시
- th:action="@{/submit}"
```

### 리스트 with 반복

```
Bigtablet Design System + Thymeleaf로 상품 목록 HTML 만들어줘.
- Card로 상품 카드
- th:each="item : ${items}"
- 상품명, 가격, 상태 표시
- 수정/삭제 버튼
```

### Select with 동적 옵션

```
Bigtablet Design System + Thymeleaf로 카테고리 Select HTML 만들어줘.
- th:each="cat : ${categories}"
- th:value="${cat.id}"
- th:text="${cat.name}"
- th:selected="${cat.id == selectedId}"
```

---

## 빠른 참조 - HTML 구조

### Button
```html
<button class="bt-button bt-button--md bt-button--primary">버튼</button>
```

### TextField
```html
<div class="bt-text-field">
  <label class="bt-text-field__label">라벨</label>
  <div class="bt-text-field__wrap">
    <input type="text" class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--md">
  </div>
  <span class="bt-text-field__helper">도움말</span>
</div>
```

### Checkbox
```html
<label class="bt-checkbox">
  <input type="checkbox" class="bt-checkbox__input">
  <span class="bt-checkbox__box"></span>
  <span class="bt-checkbox__label">라벨</span>
</label>
```

### Radio
```html
<label class="bt-radio">
  <input type="radio" name="group" class="bt-radio__input">
  <span class="bt-radio__dot"></span>
  <span class="bt-radio__label">옵션</span>
</label>
```

### Switch
```html
<button class="bt-switch" data-bt-switch>
  <span class="bt-switch__thumb"></span>
</button>
```

### Select
```html
<div class="bt-select" data-bt-select>
  <button type="button" class="bt-select__control bt-select__control--outline bt-select__control--md">
    <span class="bt-select__placeholder">선택...</span>
    <span class="bt-select__icon">▼</span>
  </button>
  <ul class="bt-select__list">
    <li class="bt-select__option" data-value="1">옵션 1</li>
  </ul>
</div>
```

### Modal
```html
<button data-bt-modal-open="modal-id">열기</button>
<div id="modal-id" class="bt-modal" data-bt-modal>
  <div class="bt-modal__panel">
    <div class="bt-modal__header">제목</div>
    <div class="bt-modal__body">내용</div>
    <div class="bt-modal__footer">
      <button class="bt-button bt-button--md bt-button--secondary" data-modal-close>취소</button>
      <button class="bt-button bt-button--md bt-button--primary" data-modal-close>확인</button>
    </div>
  </div>
</div>
```

### Card
```html
<div class="bt-card bt-card--bordered bt-card--p-md">
  <div class="bt-card__title">제목</div>
  <p>내용</p>
</div>
```

### Spinner
```html
<div class="bt-spinner bt-spinner--md"></div>
```

### Pagination
```html
<nav class="bt-pagination" data-bt-pagination data-page="1" data-total-pages="10"></nav>
```

### DatePicker
```html
<div class="bt-date-picker">
  <label class="bt-date-picker__label">날짜</label>
  <div class="bt-date-picker__fields">
    <select class="bt-date-picker__select"><option>연도</option></select>
    <select class="bt-date-picker__select"><option>월</option></select>
    <select class="bt-date-picker__select"><option>일</option></select>
  </div>
</div>
```

### FileInput
```html
<div class="bt-file-input">
  <input type="file" class="bt-file-input__control" id="file">
  <label class="bt-file-input__label" for="file">파일 선택</label>
</div>
```
