# Bigtablet DS — 디자인 & 모션 일관성 감사

> 2026-05-19 기준. 산출물: 우선순위별 정리된 이슈 리스트 + 사이즈 스케일 권장안.
> 후속 PR이 이 문서의 체크박스를 P0 → P3 순서로 소화하면 됨.

## 1. 요약

토큰 준수율은 전반적으로 양호함. 핵심 문제는 **모션 누락**이며, 사용자가 "부자연스럽다"고 체감하는 가장 큰 원인.

| 카테고리 | 건수 |
|----------|------|
| 모션 누락 (popup 진입/퇴출 없음) | 3 — Modal, Dropdown, Select, DatePicker |
| 모션 비대칭 / 토큰 미사용 | 4 |
| 사이즈 스케일 불일치 | 3 |
| 하드코딩 값 | 3종 (총 8개 위치) |

---

## 2. 모션 (Motion) — **P0**

체감 개선이 가장 큰 영역. Modal/Dropdown/Select/DatePicker는 클릭하면 **즉시 등장/사라짐** 으로 어색함이 큼.

### 2.1 진입/퇴출 애니메이션 부재

| # | 컴포넌트 | 위치 | 권장 |
|---|----------|------|------|
| M1 | Modal | `src/ui/modal/style.scss` (`@keyframes` 없음) | overlay: fade 0.2s expo / panel: fade+scale(0.96→1) 0.2s expo. 퇴출은 fade 0.15s ease-in. |
| M2 | Dropdown | `src/ui/dropdown/style.scss:36-70` (transition만, popup 애니메이션 없음) | fade + translateY(4px → 0) 0.15s expo |
| M3 | Select 옵션 리스트 | `src/ui/select/style.scss:21-23,106` | Dropdown과 동일 |
| M4 | DatePicker 팝업 | `src/ui/date-picker/style.scss` (transition·keyframes 없음) | Dropdown과 동일 |

> Popover/Drawer 컴포넌트는 현재 존재하지 않음. 추후 신규 추가 시 같은 모션 규칙 적용 권장.

### 2.2 모션 일관성

| # | 항목 | 위치 | 현재 | 권장 |
|---|------|------|------|------|
| M5 | Toast 진입/퇴출 비대칭 | `src/ui/toast/style.scss:100,103` | in `0.3s cubic-bezier(0.16, 1, 0.3, 1)` / out `0.26s ease-in` | 동일 페어 토큰화 — `enter-base` / `exit-fast` |
| M6 | Top-loading 토큰 미사용 | `src/ui/top-loading/style.scss` | `1.5s ease-in-out` 하드코딩 | infinite 루프는 예외 OK. 단 0.1s, 0.2s 등 일반 duration은 토큰 |
| M7 | Spinner 토큰 미사용 | `src/ui/spinner/style.scss` | `0.8s linear infinite` | 동일 — infinite 예외 |
| M8 | Button hover 다중속성 transition | `src/ui/button/style.scss:14-16` | background + color + border-color 3개 동시 | `transform`/`opacity` 위주 재설계, 또는 `will-change` 명시 |

### 2.3 모션 토큰 보강

현 토큰 (`src/styles/motion/`):
- Duration: `fast(0.1s)`, `base(0.2s)`, `slow(0.3s)`, `emphasized(0.25s)`, `bounce(0.3s)`
- Easing: `ease-in-out`, Material cubic, expo cubic

권장 추가:
- **진입/퇴출 페어 별칭** — `enter-fast(0.15s)`, `enter-base(0.2s)`, `exit-fast(0.12s)`, `exit-base(0.15s)`. 퇴출이 진입보다 짧은 게 관례.
- **easing 의미 분리** — `easing-enter` = expo-out (감속 진입), `easing-exit` = ease-in (가속 퇴출).
- 사용처 가이드라인 한 줄 주석으로 토큰 옆에 명시.

---

## 3. 사이즈 스케일 (Sizing) — **P1**

### 3.1 현재 불일치

| 컴포넌트 | 위치 | 현재 사이즈 |
|----------|------|-------------|
| Button | `src/ui/button/style.scss` | sm=36 / md=40 / xl=56 (lg 없음) |
| TextField, Select | `src/ui/textfield/style.scss`, `src/ui/select/style.scss` | md=40 위주, sm/lg 불명확 |
| Chip | `src/ui/chip/style.scss:6` | **32px 고정** (사이즈 패턴 없음) |

### 3.2 권장 스케일

**Form control (Button, TextField, Select):**

| 사이즈 | 높이 | 비고 |
|--------|------|------|
| sm | 32px | 컴팩트 폼, 인라인 컨트롤 |
| md | 40px | 기본값 |
| lg | 48px | 모바일 친화, 강조 CTA |

근거:
- 4 → 8 → 16 spacing 토큰과 동일한 **8px step**
- 40px 기본 유지 — 현재 md 사용처는 변경 불필요
- 56px(현 xl)은 형식상 유지하되 신규 컴포넌트 권장 안 함

**Inline 컴포넌트 (Chip 등):**

| 사이즈 | 높이 |
|--------|------|
| sm | 24px |
| md | 28px |

form control 스케일과 섞지 말 것. Chip은 텍스트 옆에 인라인으로 붙는 컴포넌트라 더 작아야 함.

> **영향 범위:** Button sm 36→32 변경 시 기존 사용처 시각 변화 발생. 디자이너 컨펌 필수.

---

## 4. 하드코딩 값 (Hardcoded) — **P2**

| # | 항목 | 위치 (총 8개) | 권장 |
|---|------|---------------|------|
| H1 | `letter-spacing: 0.32px` | `src/ui/dropdown/style.scss:63`, `src/ui/textfield/style.scss:75`, `src/ui/list-item/style.scss:69`, `src/ui/select/style.scss:114` | typography 토큰 `letter-spacing-tight` 신설 후 일괄 교체 |
| H2 | `gap: 2px` | `src/ui/list-item/style.scss:59` | spacing 토큰 `2xs(2px)` 신설 또는 리팩토링 |
| H3 | `border-width: 2px` | `src/ui/otp-input/style.scss:51` | border-width 토큰 `thick` 신설 |
| H4 | `border.disabled: #F2F2F2` | `src/styles/tokens.json:102`, `src/styles/colors/index.ts:71`, `src/styles/colors/_index.scss:70` | 기존 `border` 토큰 alpha 조절로 파생, 또는 명시적 grayscale 토큰에서 참조 |

---

## 5. 컴포넌트 간 시각 일관성 — **P2**

Vanilla(`src/vanilla/bigtablet.scss`) ↔ React 컴포넌트 시각 비교 필요. 같은 컴포넌트가 두 빌드에서 픽셀 단위로 다를 가능성 있음.

→ 후속 작업: Vanilla/React 시각 회귀 비교 Storybook 스토리 추가, Chromatic으로 diff 확인.

---

## 6. 권장 진행 순서

### Phase 1 — 토큰 보강 (작은 변경, breaking 없음)
- [ ] 모션 토큰: enter/exit 페어 별칭, easing 의미 분리 (`src/styles/motion/`)
- [ ] typography: `letter-spacing-tight` 추가
- [ ] spacing: `2xs(2px)` 추가 또는 list-item 리팩토링
- [ ] border-width: `thick` 추가

### Phase 2 — 모션 적용 (체감 개선 큼) — **P0**
- [ ] Modal 진입/퇴출 애니메이션 신규 작성
- [ ] Dropdown 팝업 애니메이션
- [ ] Select 옵션 리스트 애니메이션
- [ ] DatePicker 팝업 애니메이션
- [ ] Toast 진입/퇴출 토큰화 (비대칭 정리)
- [ ] Button hover transition 단순화

### Phase 3 — 사이즈 정렬 (디자이너 컨펌 필수)
- [ ] Button sm 36 → 32, lg=48 추가
- [ ] TextField/Select sm/lg 명시
- [ ] Chip 사이즈 패턴 도입 (sm=24, md=28)

### Phase 4 — 하드코딩 제거
- [ ] `letter-spacing: 0.32px` 4곳 토큰화
- [ ] `gap: 2px` 토큰화 또는 제거
- [ ] `border-width: 2px` 토큰화
- [ ] `border.disabled` 토큰 참조 체계로 전환

---

## 7. 반응형 밀도 (Density) — **P1 (web 적합성)**

### 7.1 배경

Bigtablet DS는 원래 앱 디자인에서 출발해 form control 기본 사이즈가 큼 (TextField/Select md = 52px). 데스크탑 웹에서는 답답하게 느껴지고, 모바일에선 적당함. 사이즈를 단순히 줄이면 모바일 터치성이 떨어짐.

### 7.2 해결책

**의미 토큰 + 자동 반응형**:
- 데스크탑 사이즈는 그대로 유지 (non-breaking)
- compact breakpoint (`<600px`)에서 한 단계 자동 키움 (touch 친화)

### 7.3 도입한 토큰 (`src/styles/a11y/`)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `$tap_target_dense` | 32px | 데스크탑 인라인 폼 |
| `$tap_target_compact` | 40px | 데스크탑 기본 |
| `$tap_target_comfortable` | 48px | 모바일/터치 기본 (WCAG 44 초과) |
| `$tap_target_spacious` | 56px | 강조 CTA |
| `$tap_min_size` | 44px | 기존 a11y 최소값 (유지) |

### 7.4 도입한 mixin

```scss
@include token.responsive_height($desktop, $mobile: null);
// $mobile 생략 시 한 단계 자동 bump
// dense → compact → comfortable → spacious → spacious(유지)
```

### 7.5 적용 컴포넌트

| 컴포넌트 | 사이즈 | 데스크탑 | 모바일 |
|----------|--------|----------|--------|
| Button | sm | 32 | 40 |
| Button | md | **40** | 48 |
| Button | lg | 48 | 56 |
| Button | xl | 56 | 56 |
| TextField / Select / Dropdown | sm | 40 | 48 |
| TextField / Select / Dropdown | md | **40** | 48 |
| TextField / Select / Dropdown | lg | **48** | 56 |

Chip은 인라인 컴포넌트라 반응형 제외.

> **Breaking change** (한 PR로 묶음):
> - TextField/Select md: 52 → 40 (데스크탑)
> - TextField/Select lg: 64 → 48 (데스크탑)
> - Dropdown md: 56 → 40, lg: 56 → 48
>
> 모든 폼 컨트롤(Button, TextField, Select, Dropdown)이 **단일 스케일** sm=32/40, md=40/48, lg=48/56 (좌:데스크탑/우:모바일)로 정렬됨. 64px hero 사이즈는 별도 `xl` 신설 시 부활 가능.
>
> **구현 메모**: 시각 height와 min-height를 일치시키기 위해 inner/fieldset에 `box-sizing: border-box` 적용 + inner padding 제거. input_wrap/control padding은 line-height + 컨테이너 fit 기준으로 축소.

### 7.6 후속 개선 여지

- 64+ hero 사이즈가 실제 필요하면 `size="xl"` 신설 (랜딩페이지 메인 검색창 등 한정 케이스)
- Modal/Drawer의 bottom sheet 대안 (모바일 패턴) 신규 컴포넌트 검토

---

## 8. 범위 외 (Out of scope)

- Storybook 시각 회귀 도구(Chromatic 등) 도입 결정
- `size="xl"` (hero) 신설 — 실제 수요 발생 시 별도 PR
