# Changelog

`@bigtablet/design-system` 의 모든 주요 변경 사항. / All notable changes.

이 문서는 [GitHub Releases](https://github.com/Bigtablet/bigtablet-design-system/releases) 를 기준으로 정리됩니다. 릴리즈는 `v*` 태그 푸시로 배포됩니다.

## [3.11.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.11.0) - 2026-08-20

- `TextField` 에 조작 슬롯 `leadingAction` · `trailingAction` 추가 - 아이콘 슬롯(`leadingIcon`·`trailingIcon`)은 장식 전용이라 `aria-hidden` 을 유지하고, 포커스 가능한 요소는 이 새 슬롯에 넣는다. 아이콘 칸의 위치·크기 CSS 를 그대로 재사용하고 넘긴 요소가 40x40 히트 영역을 채운다
- 아이콘 슬롯에 버튼을 넣으면 발생하던 접근성 위반 해소 - `aria-hidden` 조상 때문에 포커스는 가는데 보조기기엔 존재하지 않는 요소가 되어 WCAG 4.1.2(Name/Role/Value) 위반이었고, Chrome 은 `Blocked aria-hidden on an element because its descendant retained focus` 를 남기며 `aria-hidden` 적용을 거부했다
- `TextField` 에 비밀번호 표시/숨기기 토글 내장 - `showPasswordToggle` 로 켜고, 문구는 i18n 때문에 `passwordToggleLabels` 로 앱이 주입한다(기본값 영문). 오른쪽 칸 우선순위는 `showPasswordToggle` > `clearable` > `trailingAction` > `trailingIcon`
- `TextField` 내장 버튼이 `disabled` 를 따르도록 수정 - 비밀번호 토글과 지우기(X) 버튼이 비활성 필드에서도 포커스·클릭됐다(비활성 입력의 비밀번호를 드러낼 수 있었음). 비활성 스타일은 `opacity` 만 걸고 `pointer-events` 는 건드리지 않는다
- `EmptyState.illustration` · `ErrorState.icon` 의 장식 슬롯 계약 명시 - 두 슬롯은 `aria-hidden` 으로 접근성 트리에서 제외되고, 조작 요소는 기존 `action` 슬롯을 쓴다. `ErrorState` 의 래퍼는 필수다(기본 아이콘이 이름 없는 svg 라서 빼면 `role="alert"` 이 이름 없는 그래픽까지 읽는다)
- `TextField` 아이콘·조작 칸 치수를 `$tap_target_compact` 토큰으로 교체 (하드코딩 40px 제거, 값 동일)

## [3.10.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.10.1) - 2026-08-18

- 오버레이 스크롤 잠금이 스크롤바 폭을 보정 - Modal · Drawer · Alert 가 열릴 때 사라지는 스크롤바 폭을 재서 `body` `padding-right` 로 되돌린다. 잠금 시 배경 콘텐츠가 그 폭만큼 튀던 문제 해소. 소비자가 이미 준 `padding-right` 에 더하므로 기존 여백은 유지된다
- `--bt-scrollbar-width` 노출 - 위 보정에 쓰인 실측 폭을 `:root` 로 함께 내보낸다(잠금 밖에서는 `0px`). `right` 기준 고정 요소는 잠금 중 그만큼 밀리므로 `right: calc(16px + var(--bt-scrollbar-width))` 로 자체 보정하면 된다
- `scrollbar-gutter: stable` 앱에서 오버레이가 전폭을 덮도록 수정 - 거터가 예약된 채 남으면 `position: fixed` 의 컨테이닝 블록이 콘텐츠 영역이라 dim 옆에 밝은 띠가 남았다(`100vw`·`100dvw`·`100lvw` 로도 넘을 수 없음). 잠금 동안 거터를 놓고 그만큼을 위의 `padding-right` 가 대신 잡는다. 해제 시 원복
- 잠금 해제 시 인라인 스타일 복원 정확도 개선 - 기존에는 `overflow` 를 계산값으로 저장해 되써서 원래 없던 인라인 선언이 생기고 소비자 스타일시트 규칙을 덮을 수 있었다. 인라인 값만 스냅샷해 되돌린다
- Vanilla 번들에도 동일 적용 - `/vanilla` CSS·JS 는 별도 번들이라 Thymeleaf/JSP 폼도 같은 문제를 겪었다
- (개발) 3중 복제였던 잠금 로직을 `utils/scroll-lock.ts` 로 통합 (Modal · Drawer · Alert). 내부 유틸이라 공개 export 는 변화 없음

## [3.10.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.10.0) - 2026-08-18

- 자동완성(autofill) 입력칸을 DS 가 소유 - 크롬/사파리가 `!important` 로 강제하는 UA 배경(연한 라벤더)·글자색을 DS 표면 토큰으로 덮는다. DS 폼 컨트롤은 배경을 컨테이너가 갖고 입력 요소가 투명해서, 자동완성된 칸만 옆 칸과 다른 색이 되고 다크 테마에선 밝은 상자로 튀던 문제 해소. `style.css` 만 import 하고 있으면 자동 적용되고 소비자가 따로 할 일은 없다
- 상태별 표면 유지 - `variant="filled"` 는 dim 채움(포커스 시 solid)을, `disabled` 는 비활성 표면·글자색을 그대로 유지한다. 에러 칸은 배경이 아니라 테두리로만 구분된다
- 둥근 모서리 유지 - UA 배경을 덮는 inset 그림자가 네모라서 컨테이너 모서리를 각지게 만들던 문제를, 자동완성된 칸에서만 컨테이너를 `:has()` 로 클리핑해 해결
- DS 컴포넌트 밖 native 입력도 커버 - 규칙이 `input`/`textarea`/`select` 요소 셀렉터라 `TextField` 로 감싸지 않은 native 입력에도 적용된다
- Vanilla 번들에도 동일 적용 - `/vanilla` CSS 는 별도 번들이라 Thymeleaf/JSP 폼도 같은 문제를 겪었다 (입력 요소가 배경·반경을 직접 가져 클리핑 규칙은 불필요)

## [3.9.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.9.0) - 2026-08-06

- Vanilla Dropdown 다중 선택·검색 지원 - React `<Dropdown multiple searchable>` 과 동등하게 `data-multiple` / `data-searchable`(또는 JS 옵션) 지원. 선택 시 패널 유지·"N개 선택" 요약·좌측 체크 슬롯·같은 `name` 반복 hidden input, 한글 IME 조합 중 필터 보류, 필터된 목록 기준 방향키·`role="combobox"` 이동 등 WAI-ARIA APG Combobox 정합. 기존 평면 `<ul>` 마크업은 그대로 동작
- TextField `variant` · `success` prop 추가 - `variant="outline"`(기본, 기존 렌더링과 동일) / `"filled"`, 검증 통과 상태 `success`(`error` 와 동시 지정 시 `error` 우선, `aria-invalid` 는 켜지 않음). Vanilla `--filled` / `--success` 와 1:1 대응
- Dropdown `variant` prop 복원 - v2.4.0 부터 no-op 이던 `@deprecated variant` 를 `"outline"`(기본) / `"filled"` 로 실제 동작하게 되살림. **(주의: 구현된 적 없는 `variant="ghost"` 제거 - 넘기던 호출부는 타입 에러, 런타임 렌더링은 불변)**
- Vanilla Card body·footer 구획 추가 - React Card 의 `heading` / `children` / `footer` 3단 구성에 맞춰 `.bt-card__body` · `.bt-card__footer`(`--start/between/end`) 추가, 예시의 `__title` 을 시맨틱 헤딩으로 교체. **(주의: `.bt-dropdown__option` 이 `space-between` → `flex-start` 로 변경 - 우측 정렬 요소를 두던 마크업은 `.bt-dropdown__option-content` 로 감싸야 함)**
- Vanilla Dropdown 초기화 버그 수정 - 마크업의 placeholder 문구를 라이브러리 기본값이 덮어쓰던 문제, 다중 모드에서 서버 렌더링된 hidden input 을 값 읽기 전에 지우던 문제 수정 (Thymeleaf `th:field` 영향)
- TextField filled × disabled 테두리 수정 - 특이도 동률로 disabled 규칙이 이겨 filled 에 회색 테두리가 되살아나던 문제 수정
- (개발) 콜백 우선순위·danger×variant 테스트 커버리지 - canonical/deprecated 콜백 쌍 10종의 우선순위와 FileInput 의 both-call 예외, Button `danger` × 4 variant 조합을 자동 검증

## [3.8.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.8.0) - 2026-08-05

- Tooltip·Popover 뷰포트 충돌 회피 + 진입/퇴출 애니메이션 - `body` 포탈 + `position: fixed` 로 조상의 `overflow`/`transform` 을 벗어나 잘리지 않게 하고, flip→shift→shrink 로 화면 안에 맞추도록 재배치. Tooltip 은 언마운트 전에 퇴출 애니메이션을 재생 (#429, #431). **(주의: 오버레이가 `body` 로 포탈됨 - z-index/스타일 상속을 부모 트리 기준으로 가정하던 코드는 확인 필요)**
- IconButton 접근 이름 필수화 - `aria-label` 또는 `aria-labelledby` 중 하나를 반드시 받도록 판별 유니온 타입으로 강제. **(주의: 접근 이름 없이 쓰던 호출부는 타입 에러 - 하나를 추가해야 함)**
- 접근성 accessible name 보강 - NavBar 로케일 트리거·IconButton·Popover dialog 에 접근 이름 부여
- 공개 컴포넌트 타입 16종 barrel re-export - `import type { ButtonProps } from "@bigtablet/design-system"` 형태로 직접 임포트 가능
- Vanilla 번들 React API 정합 - 클래스명·JS 콜백을 React 쪽 canonical 이름으로 통일하고 레거시 alias 제거. **(주의: 구 Vanilla 클래스명/콜백명 제거 - `docs/MIGRATION.md` 의 v3.8.0 가이드 참고)**
- 라이선스 통일 - MIT → Bigtablet Inc. Open Source License. **(주의: 배포 패키지 라이선스 변경)**
- reduced-motion 준수 확대 - 컴포넌트 SCSS·Vanilla 번들·layout hover mixin 에 `prefers-reduced-motion` 가드 추가 (WCAG 2.1 SC 2.3.3)
- (개발) 토큰 규율·문서 정비 - stylelint 로 컴포넌트 SCSS 의 raw `rgb/rgba/hsl/hsla` 차단, 죽은 토큰 정리, PR 라벨 자동화 워크플로우 추가, 컴포넌트/아키텍처 문서 실 API 와 동기화

## [3.7.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.7.0) - 2026-08-05

- ImageCropper 문구 다국어 대응 - 조작 안내·줌 버튼/슬라이더 접근성 레이블·이동 여유 안내를 `hint`/`zoomOutLabel`/`zoomLabel`/`zoomInLabel`/`noPanHint` prop 으로 개방(각 기본값 동일 → 기존 호출부 무영향). 다국어 앱에서 스크린리더에 한국어가 고정 낭독되던 문제 해소
- ImageCropper 네이티브 div 속성 forwarding - `ImageCropperProps` 가 `Omit<HTMLAttributes<HTMLDivElement>, "onError" | "children" | "dangerouslySetInnerHTML">` 를 확장해 `id`·`data-*`·`aria-*`·`style` 등을 루트로 전달(폼/오버레이 식별·라벨 연결). `onError`(이미지 디코드 콜백)는 그대로 유지
- ImageCropper 다중 인스턴스 접근성 - hint id 를 `useId()` 로 인스턴스별 고유화해 한 화면에 크로퍼가 여럿일 때 `aria-describedby` 가 충돌하지 않도록 수정
- ImageCropper 휠 줌 정리 - 휠 확대 시 뒤 페이지가 함께 스크롤되던 문제를 네이티브 `passive: false` 리스너로 해결하고, 최신 배율 ref 를 상태 변경 지점에서 동기화해 트랙패드 연타 시 줌 델타가 유실되지 않도록 수정
- (개발) 의존성 보안 패치 - undici `^7.29.0`·fast-uri `^3.1.5`·postcss `^8.5.23` override floor 상향(Dependabot dev-scope 알림 #100-106, 배포 패키지 무관)

## [3.6.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.6.0) - 2026-08-04

- ImageCropper 신규 컴포넌트 - 드래그 이동·휠/슬라이더/버튼/키보드 줌·원형·사각 마스크·rule-of-thirds 그리드로 이미지 크롭. `crop()` 로 `Blob` 반환, `outputSize`/`outputType`/`quality`/`circular` 등 지원 (React 19 ref-as-prop)
- 다크 모드 대비 개선 - TextField·Textarea·Dropdown placeholder 를 caption 토큰으로 낮춰 다크 모드에서 hint 로 읽히도록, FileInput 빈 미리보기 텍스트를 WCAG AA(4.5:1) 충족하게 진하게
- 테마 인식 색상 - Button·IconButton·Sidebar·Pagination brand fill 을 accent 토큰으로 교체해 다크 모드에서 안 보이던 문제 해소 (nav-bar accent variant 는 brand 유지)
- FileInput 정리 - hover 시 파일명 기본 툴팁 억제(투명 input `pointer-events: none`), 라벨에 pointer 커서 직접 지정
- Button·IconButton 아이콘 크기 - 전달한 아이콘 사이즈를 늘리지 않도록 수정
- (개발) dependabot dev 의존성 버전·보안 업데이트 (react/storybook/playwright/lucide/next 그룹)

## [3.5.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.5.0) - 2026-07-16

- 접근성(a11y) 대규모 개선 - 전체 컴포넌트 감사 후 WAI-ARIA/WCAG 위반 수정: Alert 포커스 트랩, Tooltip dismissable·hoverable(WCAG 1.4.13), Toast 자동 닫힘 hover/focus 일시정지(WCAG 2.2.1), Tabs 로빙 tabindex, Checkbox·OTP `aria-invalid`, Chip·ListItem 선택 상태 노출, NavBar locale `menuitemradio`, Table `aria-busy`
- Button `as`/`href` 지원 - `<Button as="a" href="...">` 로 동일 스타일의 anchor 렌더링(링크 시맨틱), `disabled` anchor 대응. Hero CTA 가 이를 재사용
- 폼 참여 prop 추가 - Dropdown `name`(hidden input 으로 네이티브 폼 제출), Alert `closeOnOverlay`, Chip `removeLabel`(삭제 버튼 레이블 커스터마이즈)
- 오버레이 Escape 통일 - `useOverlayEscape`/`registerOverlay` 공유 스택으로 "최상단 오버레이만 닫힘"(APG) 보장, 자식 요소 Escape 우선 처리
- Modal · Drawer 포털 렌더링 - `createPortal(document.body)` 로 transform/filter 조상 아래에서도 `position: fixed` 정상 동작 (기존 인라인 렌더 → body 포털; 후손 선택자 스타일링 시 영향 가능)
- Vanilla 번들 대폭 수정 - 색상 토큰 자기참조/미정의 해소(+다크 테마), Select `<li data-value>` 서버 마크업 파싱, Select/Toggle 폼 제출 참여(`data-name`)·combobox ARIA·Modal 포커스 트랩·스크롤 잠금 카운터·FOUC 방지
- reduced-motion(WCAG 2.3.3) - Modal/Alert 진입·퇴출, Toast progress 를 `prefers-reduced-motion` 대응
- (주의) `ButtonProps` 가 discriminated union(`ButtonAsButton | ButtonAsAnchor`)으로 변경 - 런타임/공개 prop 은 100% 호환이나, 타입 레벨에서 `interface X extends ButtonProps` 확장은 불가(union 확장 불가). 확장이 필요하면 `ButtonBaseProps` 또는 `ComponentProps<typeof Button>` 사용

## [3.4.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.4.1) - 2026-07-10

- Modal · Drawer: 소비자 `style`/`className`/`data-*` 는 반영하되 컴포넌트의 애니메이션 style · `onClick`/`onKeyDown`(stopPropagation·Escape) · `role` 이 항상 우선하도록 정리 (소비자 style 이 오버레이 동작을 덮던 문제 수정)
- Table clickable 행 접근성 개선 - `rowClickHint` prop 으로 동작 설명을 `aria-describedby` 로 노출(셀 데이터 낭독을 가리지 않도록 `role="button"`/`aria-label` 을 tr 에 부여하지 않음)
- Dropdown 옵션 리스트 max-height 를 `$overlay_list_max_height` 토큰으로 추출

## [3.4.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.4.0) - 2026-07-09

- Dropdown `searchable`(검색 필터) + `multiple`(다중 선택) opt-in 추가 - 한글 IME 조합 대응, 선택 요약 텍스트 커스터마이즈(`selectedSummary`)
- Table 정렬(제어형 `sort` / `onSortChange`) + 행 선택(`selectable` / `selectedKeys` / `onSelectionChange`) 추가 - 전체 선택 3-state, 다른 페이지의 선택 상태 보존
- Drawer 신규 컴포넌트 - left/right/bottom 슬라이드 오버레이 (Modal 인프라 재사용, 포커스 트랩·스크롤 잠금·방향별 애니메이션)
- `iconSize` 토큰 export 추가 (xs~xl 스케일) - 컴포넌트 내부 아이콘 사이즈 하드코딩 제거
- Modal · Drawer 포커스 트랩이 "닫힌 채 마운트 후 열림" 제어형(controlled) 패턴에서 활성화되지 않던 버그 수정
- 마이그레이션 가이드 `docs/MIGRATION.md` + 테마 가이드 `docs/THEMING.md` 문서 추가
- 문서 정합화: `docs/COMPONENTS.md` 를 v3.3.0 canonical prop 이름으로 갱신, 릴리즈 노트 양식 통일, em-dash 등 타이포 정리
- (개발) Claude PR 리뷰 워크플로 도입, dev 의존성 보안/버전 업데이트

## [3.3.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.3.0) - 2026-06-25

- `ref` 전달(React 19 ref-as-prop) 지원 - Button · IconButton · Card · Container · Stack · Grid · Section
- 변경 콜백 네이밍을 Radix식 `on*Change` 패밀리로 통일 (`onValueChange` / `onCheckedChange` / `onPageChange`) - 기존 prop은 `@deprecated` alias로 호환 유지
- 접근성: Menu · NavBar 화살표키 네비게이션(WAI-ARIA APG), Tooltip `aria-describedby` 합성, ThemeProvider SSR hydration mismatch 수정
- Chip tone · 통계 카드 트렌드 WCAG AA(4.5:1) 대비 충족, Storybook 에 테마 CSS 변수 로드(Divider 등 표시 수정)
- TS 컬러 토큰을 AA 값으로 SCSS 와 동기화, `next` peer 범위를 `>=15`(React 19 호환)로 정정
- FileInput objectURL 정리 안정화, Modal Escape 핸들러 React 19 전 버전 호환
- undici dev 의존성 보안 패치 (`>=7.28.0`, 경보 6건 해소)

## [3.2.2](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.2.2) - 2026-06-18

- caption 텍스트 색을 WCAG AA(4.5:1) 충족값으로 조정하고, axe `color-contrast` 검사를 재활성화해 전 컴포넌트 대비를 CI 가 가드
- `prefers-reduced-motion` 대응 확대 - spring 훅(Modal/Toast/Dropdown/Menu/Tooltip/Popover) + CSS 모션 컴포넌트(button/checkbox/radio/toggle/tabs/sidebar/skeleton 등), 커버 7→20개
- 커밋 컨벤션에 `refactor` 라벨 추가, 미사용 changeset 설정 정리

## [3.2.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.2.1) - 2026-06-17

- 라이트/다크 테마 CSS custom property를 `theme.scss`로 분리 - `scss/token`을 `@use` 하는 소비자에게 테마가 강제 주입되거나 CSS Modules pure-selector 검사가 깨지던 문제 수정
- 컴포넌트 사용 시 `@bigtablet/design-system/style.css` 가 테마 변수를 제공 (단일 번들 포함)
- dark 테마 속성 중복을 mixin 으로 정리 (출력 CSS 동일)

## [3.2.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.2.0) - 2026-06-16

- `RadioGroup` 신규 컴포넌트 - Context 기반 합성 래퍼, name/value/onChange 중앙 관리
- `Popover` 신규 컴포넌트 - 클릭 트리거 non-modal 패널, placement 4방향, spring 애니메이션
- `Textarea` 신규 컴포넌트 - auto-grow, 글자 카운터, 한글 IME 정책
- `ErrorState` 신규 컴포넌트 - error boundary / widget fallback, variant page/widget
- Card variant 확장 - glass(frosted+blur), outlined(투명+테두리), interactive hover-lift, footer 슬롯
- ListItem 텍스트 슬롯 string → ReactNode 확장 (하위호환)
- 다크모드 표면 색상 navy → 순수 중성 그레이 전환
- status 색상 WCAG AA 통과 hex + container/on-container/on-surface 토큰 신설
- Badge `appearance` prop - solid/soft 지원
- Stylelint `color-no-hex` CI 게이트 도입
- semantic-release → 태그 기반 배포 전환
- 보안 취약점 6건 수정 (vite, esbuild, @vitest/browser, js-yaml)

## [3.1.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.1.1) - 2026-05-26

- npm v11+ 업그레이드 - OIDC Trusted Publisher 방식 npm 배포 정상화
- release workflow에 `npm install -g npm@latest` step 추가

## [3.1.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.1.0) - 2026-05-26

- `BottomNav` 신규 컴포넌트 - iOS safe-area 대응, 2-5 항목 균등 분할, `BottomNavSpacer` helper
- `Sidebar` 자동 반응형 변신 - `mode="auto"` 시 600px 미만에서 하단 bar로 전환 (CSS-only, SSR 안전)
- `SidebarItem` + `BottomNavItem` discriminated union 타입 전환 - as="a"/"button" 조합 컴파일 에러 차단
- `docs/AGENT_GUIDE.md` 신규 - AI 코딩 에이전트용 영문 레퍼런스

## [3.0.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.0.0) - 2026-05-26

- 다크 모드 풀 지원 - `ThemeProvider` + `useTheme` hook, CSS custom properties 자동 swap
- Navy accent 팔레트 전면 도입 - `color_accent_*` 토큰 체계
- 15+ 신규 컴포넌트: Modal, Toast, Tooltip, Menu, Dropdown, MediaCard, Hero, NavBar, Tabs, LinearProgress, FAB, FileInput, DatePicker, Pagination, Chip
- react-spring 기반 진입/퇴출 애니메이션 - Modal, Toast, Tooltip, Menu 적용
- Vanilla JS 패키지 완성 - Thymeleaf/JSP/PHP 환경 지원
- `useSpringPresence` hook 공개 - 커스텀 overlay 애니메이션 지원
- 추가 컴포넌트: Accordion · Table · Breadcrumb · EmptyState + 레이아웃 프리미티브(Container · Stack · Grid · Section)

## [2.5.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v2.5.0) - 2026-05-18

- 6개 컴포넌트에 react-spring 자연스러운 애니메이션 일괄 적용 (Dropdown, Modal, Checkbox, Radio, Button, Card)
- Modal: 오버레이 fade + 패널 scale-up 진입 / scale-down 퇴출
- Dropdown: 패널 spring 열림/닫힘 (opacity + translateY)

## [2.4.4](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v2.4.4) - 2026-05-15

- FAB / LinearProgress 테스트 타입 에러 수정
- Typography 비교 스토리 `fontWeightMap` 사용으로 수정
- OtpInput / Dropdown SCSS 축약 변수명 → 명확한 이름으로 리네임
- Biome 스캔에서 `.claude/`, tsup 빌드 아티팩트 제외

## [2.4.3](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v2.4.3) - 2026-05-11

- CI 워크플로우 경로 기반 조건부 실행 최적화
- 의존성 업데이트: `@biomejs/biome`, `chromatic`, `@semantic-release/github`, `@material-symbols/svg-400`, `@types/node`

## [2.4.2](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v2.4.2) - 2026-05-06

- Vanilla 예제 파일 함수명 복원 - lint auto-fix가 잘못 변경한 function 이름 수정
- 코드 품질 lint 에러 정리

## [2.4.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v2.4.1) - 2026-05-04

- 보안 취약점 수정 (npm audit fix)
- 의존성 업데이트: `@biomejs/biome`, `@commitlint/cli`, `chromatic`, `@material-symbols/svg-300`

## [2.4.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v2.4.0) - 2026-04-28

- `Dropdown` 신규 컴포넌트 - Figma 스펙 기반 완전 재설계, 옵션 그룹핑/검색/다중 선택 지원
- `Select` 컴포넌트 deprecated (Dropdown으로 대체)
- 키보드 네비게이션, aria-* 완전 지원
- TypeScript 6.0.3 업그레이드

## [2.3.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v2.3.0) - 2026-04-24

- `neutral-600`, `neutral-800` 색상 토큰 값 조정
- `bg.inverse-surface` 신규 토큰 추가

## [2.2.4](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v2.2.4) - 2026-04-20

- DatePicker `minDay` 상한 경계 유효하지 않은 입력 방어 (clamp 적용)
- Select 포커스 하이라이트 정렬 수정

## [2.2.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v2.2.0) - 2026-04-17

- Select label floating 스타일로 재설계, TextField와 높이 통일
- TextField `size` prop 추가 (sm/md/lg)
- OtpInput paste handler 개선 - 전체 입력에 적용, 첫 번째 빈 칸으로 포커스 이동
- OtpInput disabled 상태 opacity 제거, 텍스트 색상 토큰으로 처리

## [2.1.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v2.1.0) - 2026-04-16

- `OtpInput` 신규 컴포넌트 - n자리 OTP 박스형 입력, 자동 포커스 이동, paste 지원

## [2.0.7](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v2.0.7) - 2026-04-15

- `Switch` → `Toggle` 전체 리네임 (컴포넌트, SCSS, Vanilla, 문서)
- Toggle 크기 sm/md로 단순화, OFF 상태 bg 수정, disabled compound selector 수정

## [2.0.6](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v2.0.6) - 2026-04-11

- 토큰 import 경로 수정

## [2.0.5](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v2.0.5) - 2026-04-10

- Storybook 로고 및 파비콘 상대 경로 수정
- next CVE 보안 업데이트

## [2.0.4](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v2.0.4) - 2026-04-10

- next CVE 보안 업데이트

## [2.0.3](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v2.0.3) - 2026-04-10

- Chip active/pressed 상태 이중 state layer 중복 제거
- Chip hover zone 리팩토링 - trailing 아이콘 circular hover 통일

## [2.0.2](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v2.0.2) - 2026-04-10

- Chip 더블 액션 / 더블 hover 버그 수정
- Chip trailing 아이콘 circular hover 범위 수정
- Spinner 애니메이션 수정

## [2.0.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v2.0.1) - 2026-04-10

- 버전 초기화 패치

## [2.0.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v2.0.0) - 2026-04-10

- GitHub Pages Storybook 배포 - 클라이언트 사이드 비밀번호 보호 적용
- Chip `aria-expanded` 및 TextField clear button 접근성 개선
- `IconButton` 컴포넌트 추가

## [1.24.2](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.24.2) - 2026-04-08

- Vanilla CSS 변수 수정
- 의존성 업데이트: playwright, sass-embedded

## [1.24.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.24.1) - 2026-04-03

- Escape 키 핸들러 버그 수정

## [1.24.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.24.0) - 2026-04-02

- `borderWidth`, `baseBorderWidth`, `opacity`, `baseTypography` 토큰 신규 export
- border-width, opacity 토큰 Storybook foundation 스토리 추가

## [1.23.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.23.0) - 2026-04-01

- Vanilla Alert / Pagination HTML injection XSS 취약점 수정 - HTML escape 처리
- 주요 의존성 업그레이드

## [1.22.2](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.22.2) - 2026-03-31

- 보안 취약점 수정 및 의존성 업데이트

## [1.22.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.22.1) - 2026-03-23

- `next`를 optional peerDependency로 설정 - 중복 React 인스턴스 방지

## [1.22.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.22.0) - 2026-03-17

- Skeleton 디자인 토큰 신규 추가 및 전체 토큰 export
- Skeleton Storybook foundation 스토리 추가

## [1.21.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.21.1) - 2026-03-13

- 접근성 개선 (focus ring, tap target)
- 의존성 업데이트: sass-embedded, semantic-release

## [1.21.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.21.0) - 2026-03-13

- Figma 색상 변경 자동 동기화 workflow 추가
- dependabot, commitlint, husky, CODEOWNERS 설정 추가
- Node.js 20 → 22 업그레이드

## [1.20.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.20.1) - 2026-03-12

- Chromatic CI 환경 변수 수정 (`CHROMATIC_PROJECT_TOKEN` → `CHROMATIC_TOKEN`)

## [1.20.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.20.0) - 2026-03-12

- Size limit 설정 추가 - bundle 크기 CI 게이트
- 보안 취약점 수정

## [1.19.4](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.19.4) - 2026-03-09

- a11y / i18n 컨벤션 개선
- 구 `tokens/design-tokens.json` 제거 (src/styles/ts/tokens.json으로 대체)
- README npm 패키지 기준으로 개선

## [1.19.3](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.19.3) - 2026-03-09

- 디자인 토큰 리뷰 피드백 반영 및 Storybook color 스토리 업데이트

## [1.19.2](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.19.2) - 2026-03-05

- Storybook 10.1.11 다운그레이드 - Chromatic 빌드 오류 수정

## [1.19.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.19.1) - 2026-03-03

- ToastProvider SSR 하이드레이션 불일치 수정

## [1.19.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.19.0) - 2026-02-27

- 접근성 개선 - Gemini 리뷰 피드백 반영
- 단위 테스트 커버리지 강화

## [1.18.9](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.18.9) - 2026-02-26

- Chromatic main PR 빌드 오류 수정
- ESM 빌드 경고 제거

## [1.18.8](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.18.8) - 2026-02-26

- main 브랜치 push 시 자동 릴리즈 workflow 추가

## [1.18.7](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.18.7) - 2026-02-26

- README 한국어 / 영어 분리 재작성 및 상세화

## [1.18.6](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.18.6) - 2026-02-26

- rollup, lodash, lodash-es 보안 취약점 pnpm overrides로 패치
- overrides caret range 적용으로 major 버전 점프 방지

## [1.18.5](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.18.5) - 2026-02-26

- DatePicker 옵션 상세 문서 보강

## [1.18.4](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.18.4) - 2026-02-13

- Modal overflow 수정
- AI 친화적 디자인 시스템 문서 업데이트

## [1.18.3](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.18.3) - 2026-02-11

- FileInput cursor pointer 수정

## [1.18.2](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.18.2) - 2026-02-11

- FileInput cursor 수정
- JSDoc 추가

## [1.18.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.18.1) - 2026-02-10

- 문서 구조 재정리

## [1.18.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.18.0) - 2026-02-10

- 전체 UI 컴포넌트 단위 테스트 추가 (form, display, overlay, navigation)
- 커버리지 설정 최적화

## [1.17.4](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.17.4) - 2026-01-26

- npm 패키지 크기 최적화 - 비압축 파일 배포 제외

## [1.17.3](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.17.3) - 2026-01-26

- Vanilla CSS 빌드에서 source map 제거

## [1.17.2](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.17.2) - 2026-01-26

- 서버 개발자용 Vanilla JS 프롬프트 파일 추가

## [1.17.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.17.1) - 2026-01-26

- Vanilla JS CLAUDE.md 레퍼런스 추가

## [1.17.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.17.0) - 2026-01-26

- Vanilla JS 패키지 초기 릴리즈 - Thymeleaf/JSP/PHP 등 non-React 환경 지원
- Vanilla JS 문서 추가

## [1.16.2](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.16.2) - 2026-01-26

- Select portal 롤백, absolute positioning + auto-flip으로 위치 깜빡임 수정

## [1.16.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.16.1) - 2026-01-26

- Select overflow createPortal로 수정

## [1.16.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.16.0) - 2026-01-26

- Select 자동 flip 드롭다운 추가 - 화면 하단 여백 부족 시 위로 열림

## [1.15.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.15.0) - 2026-01-23

- 의존성 및 설정 업데이트

## [1.14.3](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.14.3) - 2026-01-22

- Checkbox disabled 디자인 수정

## [1.14.2](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.14.2) - 2026-01-21

- README 전체 컴포넌트 문서화 업데이트

## [1.14.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.14.1) - 2026-01-21

- 문서 업데이트

## [1.14.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.14.0) - 2026-01-21

- Spinner / TopLoading 컴포넌트 분리 (기존 Loading 분할)
- CSS Modules 제거, global SCSS 통일

## [1.13.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.13.0) - 2026-01-16

- Skeleton 디자인 토큰 추가

## [1.12.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.12.1) - 2026-01-15

- 버전 문서 업데이트

## [1.12.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.12.0) - 2026-01-15

- GitHub release 복원

## [1.11.6](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.11.6) - 2026-01-13

- DatePicker 윤년 버그 추가 수정

## [1.11.5](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.11.5) - 2026-01-13

- DatePicker 윤년 처리 수정

## [1.11.4](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.11.4) - 2026-01-12

- DatePicker yyyy-mm 로직 수정

## [1.11.3](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.11.3) - 2026-01-12

- 인증 차단 UI 반영

## [1.11.2](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.11.2) - 2026-01-12

- TextField 한글 IME 처리 수정

## [1.11.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.11.1) - 2026-01-08

- background color 토큰 추가

## [1.11.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.11.0) - 2026-01-08

- spacing 토큰 체계 정비
- 컬러 토큰 수정

## [1.10.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.10.0) - 2026-01-07

- Button `width` 속성 추가

## [1.9.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.9.1) - 2026-01-06

- DatePicker Select label 수정

## [1.9.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.9.0) - 2026-01-06

- DatePicker 컴포넌트 export 추가

## [1.8.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.8.0) - 2026-01-06

- Sidebar open/close 제어 기능 추가

## [1.7.2](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.7.2) - 2025-12-18

- 로컬 전용 코드 제거

## [1.7.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.7.1) - 2025-12-18

- Sidebar 스타일 수정

## [1.7.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.7.0) - 2025-12-18

- Sidebar 그룹 기능 추가

## [1.6.7](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.6.7) - 2025-12-18

- Radio dot 위치 수정

## [1.6.6](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.6.6) - 2025-12-17

- layout import 수정
- spacing Storybook 문서 추가

## [1.6.5](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.6.5) - 2025-12-17

- spacing 4xl, 5xl 토큰 추가

## [1.6.4](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.6.4) - 2025-12-17

- 커밋 컨벤션 수정

## [1.6.3](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.6.3) - 2025-12-17

- Sidebar pure export 제거
- 커밋 컨벤션 문서 수정

## [1.6.2](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.6.2) - 2025-12-17

- SCSS 토큰 소비처 export 추가

## [1.6.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.6.1) - 2025-12-16

- Pretendard Safari 폰트 로딩 오류 수정

## [1.6.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.6.0) - 2025-12-16

- 토큰 스타일링 수정
- Storybook 설정 수정

## [1.5.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.5.0) - 2025-12-16

- Modal 문서 개선

## [1.4.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.4.0) - 2025-12-16

- Button `danger` variant 추가

## [1.3.2](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.3.2) - 2025-12-04

- next 보안 업데이트

## [1.3.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.3.1) - 2025-12-01

- Select Option export 추가

## [1.3.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.3.0) - 2025-12-01

- Card heading 텍스트 스타일 추가
- 자동 설치 상태 수정

## [1.2.5](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.2.5) - 2025-11-24

- Button size 수정

## [1.2.4](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.2.4) - 2025-11-18

- 커밋 컨벤션 및 릴리즈 라벨 수정
- 불필요한 마크다운 파일 삭제

## [1.2.3](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.2.3) - 2025-11-13

- CSS import 수정
- 서버 컴포넌트 사용 지원
- 컴포넌트 export 정리

## [1.2.2](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.2.2) - 2025-11-11

- Sidebar, Pagination Storybook 수정
- dist 파일 수정
- pnpm 버전 언핀

## [1.2.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.2.1) - 2025-11-11

- Next.js 호환성 수정
- Alert 재설계
- Storybook 오류 수정, Pretendard 폰트 적용

## [1.1.3](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.1.3) - 2025-11-07

- Divider 클라이언트 지시어 수정

## [1.1.2](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.1.2) - 2025-11-07

- 클라이언트 컴포넌트 지시어 수정

## [1.1.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.1.0) - 2025-11-06

- Sidebar Next.js 라우팅 지원

## [1.0.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.0.1) - 2025-11-06

- Toast 위치 수정

## [1.0.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v1.0.0) - 2025-11-06

- 초기 릴리즈 - Button, TextField, Checkbox, Radio, Toggle, Select, Modal, Toast, Card, Chip, Avatar, Badge, Divider, Icon, Pagination, DatePicker, FileInput, Spinner 등 기본 컴포넌트 제공
