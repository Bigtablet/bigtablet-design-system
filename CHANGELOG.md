# Changelog

`@bigtablet/design-system` 의 모든 주요 변경 사항. / All notable changes.

이 문서는 [GitHub Releases](https://github.com/Bigtablet/bigtablet-design-system/releases) 를 기준으로 정리됩니다. 릴리즈는 `v*` 태그 푸시로 배포됩니다.

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
