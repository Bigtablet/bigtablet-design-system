# Changelog

`@bigtablet/design-system` 의 모든 주요 변경 사항. / All notable changes.

이 문서는 [GitHub Releases](https://github.com/Bigtablet/bigtablet-design-system/releases) 를 기준으로 정리됩니다. 릴리즈는 `v*` 태그 푸시로 배포됩니다.

## [3.17.4](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.17.4) - 2026-09-03
- (렌더 변경) 오버레이가 열리는 동안 예약된 거터만 먼저 어두워지던 문제를 고칩니다. 거터 색이 딤의 진입 애니메이션과 같은 진행도를 따라가고, 중첩 오버레이에서는 겹친 딤 두께를 씁니다 (React·Vanilla 양쪽)
- (렌더 변경·다크 전용) 다크 테마에서 상태색 텍스트의 대비를 고칩니다. `danger` Button 의 outline·tonal·text 라벨과 Vanilla 의 TextField helper·Alert 제목(variant 포함)·필수 표시가 다크에서 2.85~3.94:1 로 AA 미달이었습니다 - 다크 대응 토큰으로 바꿔 6.66:1 이상이 됩니다. **라이트 렌더는 바뀌지 않습니다**
- Vanilla 에 텍스트용 상태색 토큰 4종을 추가합니다 - `--bt-color-{error,success,warning,info}-text`. 기존 `--bt-color-{...}` 는 배경·테두리 전용입니다
- `useSpringPresence` 에 `onProgress` 옵션이 추가됩니다 - 진입/퇴출 진행도를 프레임마다 받습니다

## [3.17.3](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.17.3) - 2026-09-03
- (렌더 변경) 오버레이가 열릴 때 예약된 스크롤바 거터에 밝은 띠가 남던 문제를 고칩니다. 그 띠는 캔버스(루트 배경)가 칠하는 영역이라 dim 이 닿지 못했습니다 - 잠금이 딤을 캔버스 색 위에 합성해 루트 배경색으로 심습니다 (React·Vanilla 양쪽)
- 잠금 중 루트에 `data-bt-scroll-locked` 가 붙습니다. 고정 요소나 자체 오버레이를 잠금 상태에 맞춰 조정할 때 쓸 수 있습니다
- 3.17.1 이 넣었던 오버레이의 음수 `right` 오프셋은 제거됐습니다 - 페인트되지 않는 죽은 코드였습니다. 같은 오프셋을 자체 오버레이에 넣어 둔 앱은 걷어내면 됩니다

## [3.17.2](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.17.2) - 2026-09-03
- (렌더 변경) `disabled` 를 준 `type="static"` Chip 의 라벨이 더 이상 흐려지지 않습니다. static 은 컨트롤이 아닌 텍스트 라벨이라 흐리면 대비가 1.68:1 로 AA 미달이었습니다 - remove 버튼만 흐려집니다
- `fast-uri` 오버라이드를 `^3.1.6` 으로 올려 dev 전용 의존성의 high 경보 4건을 닫습니다 (배포 패키지에는 영향 없음)

## [3.17.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.17.1) - 2026-09-03
- (렌더 변경) 오버레이가 열릴 때 `position: fixed` 요소가 스크롤바 폭의 절반만큼 움직이던 문제를 고칩니다. 스크롤 잠금이 거터를 놓지 않고 예약해 ICB 폭을 유지하고, dim 은 예약된 거터를 넘어가 덮습니다 (React·Vanilla 양쪽)
- (렌더 변경) `--bt-scrollbar-width` 로 고정 요소를 직접 보정하던 앱은 **그 보정을 지워야 합니다** - 잠금이 더 이상 폭을 바꾸지 않으므로 보정이 이중으로 걸립니다

## [3.17.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.17.0) - 2026-09-03
- 폼 계층을 DS 가 소유합니다. `Field` 가 라벨·필수 표시·도움말·에러와 `aria-describedby`·`aria-invalid` 연결을 갖고, `Form` 이 `errors` 맵을 각 필드로 흘립니다 — 입력 11종이 여기에 연결됩니다
- `DataView` 를 추가했습니다. 목록 화면의 네 상태(로딩·에러·빈 목록·데이터)와 툴바·선택 액션·페이지네이션을 한 곳에서 처리합니다
- `Combobox` — 후보를 서버에서 가져오는 선택 입력. 디바운스·로딩 표시·응답 경합 차단·"검색 전"과 "결과 없음" 구분을 DS 가 처리합니다
- `TagInput` — 후보 목록에 없는 값을 사용자가 만들어 넣는 다중 입력. Enter 가 폼을 제출하지 않고, 빈 입력에서 Backspace 로 마지막 태그를 지우고, 붙여넣은 목록을 쉼표·줄바꿈으로 나눕니다
- `AppShell` · `PageHeader` — 관리자 화면의 껍데기와 제목 줄. 스크롤은 문서가 갖습니다(본문을 스크롤 컨테이너로 만들면 `Modal`·`Drawer` 의 스크롤 잠금이 닿지 않습니다)
- `LocaleProvider` 를 추가했습니다. DS 가 스스로 렌더하는 문구 63개를 카탈로그로 옮겨, `locale="en"` 하나로 전환하거나 `messages` 로 한 줄만 덮어쓸 수 있습니다. Provider 를 감싸지 않으면 지금과 똑같습니다
- `Stat` · `DescriptionList` · `Timeline` — 지표 한 칸, 이름·값 목록(`<dl>`), 진행 상황(`<ol>`)
- `DateRangePicker` · `TimePicker` — 거꾸로 된 기간을 만들 수 없고(종료일의 최소값이 시작일), 시각은 `minTime`/`maxTime` 이 시 목록까지 좁힙니다
- `as` prop 이 어떤 요소·컴포넌트든 받습니다. `Button`·`SidebarItem`·`BottomNavItem`·`Container`·`Grid`·`Section`·`Stack` 에서 `as={Link}`(Next.js) 가 됩니다. 기존 타입 이름은 deprecated 별칭으로 남겨 두었습니다
- (렌더 변경) 스크롤 컨테이너 10곳(React 8 · Vanilla 2)의 스크롤바가 얇아지고 DS 색을 씁니다. 소비자는 `@include token.scrollable;` 로 같은 모양을 얻습니다
- (렌더 변경) `Dropdown`·`Combobox` 에서 방향키로 옮긴 활성 항목이 화면 밖에 있으면 따라 스크롤합니다 — 포커스가 입력에 남는 패턴이라 브라우저가 해 주지 않던 부분입니다
- (렌더 변경) `DatePicker` 의 `minDate` 가 연 목록도 좁힙니다. 이전에는 월·일만 제한돼 `minDate` 보다 이전 연도를 고를 수 있었습니다. 연 칸 너비와 비활성 라벨 대비(2.38:1 → 5.0:1)도 함께 고쳤습니다
- (렌더 변경) `Sidebar` 가 하단 BottomBar 로 변신할 때 `--bt-bottom-inset` 을 채웁니다. 그 값을 읽는 플로팅 요소가 이제 BottomBar 를 비켜 갑니다
- 문장 속 링크 규약(`.text_link`)과 `Prose` 밖에서 쓰는 인라인 링크 스타일을 추가했습니다
- `Foundation/Z-Index` 스토리가 실제 레이어 7개를 그립니다. 이름 12개를 레이어 12개로 그려 라벨이 겹치던 문제와, 의미 이름이 전부 "공통 레이어" 로 표시되던 문제를 고쳤습니다

## [3.16.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.16.0) - 2026-08-25
- `Textarea` 에 `toolbar` 슬롯을 추가했습니다. 서식 툴바를 테두리 안쪽에 넣어 포커스 표시·모서리·구분선을 DS 가 처리합니다 — 소비자가 내부 클래스를 건드리던 3곳이 사라집니다
- 비활성 `Textarea` 의 툴바는 흐려질 뿐 아니라 상호작용도 막힙니다

## [3.15.2](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.15.2) - 2026-08-25
- 오버레이가 닫히는 동안 스크롤 잠금이 먼저 풀려, `scrollbar-gutter: stable` 환경에서 오른쪽에 빈 띠가 보이고 배경 콘텐츠가 튀던 문제를 고쳤습니다 (`Modal`·`Drawer`)
- Vanilla 모달이 좁은 화면에서 잘리던 문제를 고쳤습니다 (375px 에서 우측 89px 잘림 — React 는 3.15.0 에서 이미 수정)

## [3.15.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.15.1) - 2026-08-25
- `scrollbar-gutter: stable` 을 쓰는 앱에서 오버레이(Modal·Alert·Drawer) 오른쪽에 배경색 띠가 남던 문제를 고쳤습니다. 스크롤 잠금이 예약된 거터를 재지 못해 보정이 걸리지 않았습니다 — React 와 Vanilla 양쪽 다 적용됩니다

## [3.15.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.15.0) - 2026-08-24
- `Modal` 이 좁은 화면에서 잘리고 우상단 닫기 버튼이 화면 밖으로 나가던 문제를 고쳤습니다 (기본 `width` 만으로도 375px 화면에서 재현됐습니다)
- `Modal`·`Drawer` 닫기 버튼 여백이 패널 패딩에서 파생됩니다 - 데스크톱에서 X 가 내용 열 밖으로 20px 튀어나가던 어긋남이 사라집니다
- spacing 스케일에 10·64·96·128, 타이포에 `font_size_10` 을 추가했습니다 (`Section` 의 화면 단위 여백과 조밀한 컨트롤 여백이 raw 값이었습니다)
- vanilla 예제·문서의 라벨이 실제 입력과 연결됩니다 (`for`/`id`, 날짜 선택은 `role="group"`)
- 회귀 검사 추가 - 오버레이 닫기 버튼 기하, prop 기본값 3축(노출 문자열 한글·JSDoc·문서 표)

## [3.14.2](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.14.2) - 2026-08-24
- Modal 이 처음부터 열린 상태로 마운트돼도(전역 모달 스택·조건부 렌더) 등장 애니메이션이 나옵니다
- `prefers-reduced-motion` 에서 Toast·Drawer·Popover·Tooltip·Menu·Dropdown 의 한 프레임 깜빡임을 없앴습니다
- Modal·Alert 의 진입/퇴출 스프링 값을 공용화하고 진입에도 오버슈트를 없앴습니다
- prop 기본값 3축(노출 문자열 한글 · JSDoc `@default` · `docs/COMPONENTS.md` 표)을 CI 에서 검사합니다

## [3.14.1](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.14.1) - 2026-08-24

- **`Prose` 제목 굵기 계층 수정 (렌더 변경)** - `h1`·`h2` 가 접미사 없는 타이포 변형(regular 400)을 써서 본문과 같은 굵기였고, `h3`~`h6` 만 700 이라 **`h1` 이 `h3` 보다 가늘게** 보였다. 제목 전부 bold 변형으로 교체했다. 스케일이 24px 이상 bold 에서 자간을 조이므로(`-0.01em`) `h1` 은 `md`·`lg` 양쪽에서, `h2` 는 `lg` 에서 자간도 함께 복원된다
- `Prose` `size="lg"` 가 크기·행간을 손으로 적는 대신 한 단계 위 믹스인을 쓴다 - 값은 이전과 같고(28/36 · 24/32 · 20/28) 빠져 있던 자간만 따라온다
- `docs/COMPONENTS.md` `Prose` 절에 **굵기·자간 표**(md/lg × h1~h6 + 본문) 추가 - 이전 `size` 표에는 크기만 있어 굵기가 어디서 오는지 알 수 없었다. `h1` 밑줄이 문서 제목일 때 장식 중복이라는 점과 opt-out 도 명시
- 회귀 방지 - `scripts/check-prose-headings.sh` 가 빌드 CSS 에서 md·lg × h1~h6 열두 제목이 전부 700 인지 확인한다. jsdom 은 스타일시트를 계산하지 않아 단위 테스트로는 잡을 수 없는 종류다
- **stylelint 에 raw 값 금지 4개** - `word-break: break-word`(한글 어절 중간 끊김) · `clip: rect()`(sr-only 복제) · 두 자리 이상 `z-index`(DS 레이어를 손으로 적음) · 숫자 `font-weight`(스케일·자간 램프 이탈). 컴포넌트 내부 겹침용 `z-index: 0/1/2` 는 허용. 이 규칙이 잡은 실제 이탈 2건(`sidebar`·`bottom-nav` 의 `600`)을 `$font_weight_semi_bold` 로 교체했고 산출 CSS 는 동일하다
- CI - `check:css-vars` · `check:prose` 를 빌드 뒤 스텝으로 편입했다(둘 다 지금까지 수동 실행 전용). `lint:css` 가 `src/vanilla/**` 를 보지 않아 `.stylelintrc.json` 의 vanilla override 가 도달하지 못하던 것도 고쳤다

## [3.14.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.14.0) - 2026-08-24

- **`Prose` `size="lg"` 가 본문까지 키운다 (동작 변경)** - 이전까지 제목만 키우고 본문은 `md` 와 같은 15px/22.5px 였다. 약관·정책처럼 페이지를 채우는 긴 본문이 오히려 작아져서 그 용도에 쓸 수 없었다. 이제 16px/28px(1.75)이고 `p`·`li`·`blockquote`·표 셀이 함께 커진다(`code` 는 13px 고정폭 유지). `h4`~`h6` 은 본문과 같은 크기가 되지 않도록 16 → 18px. **`md` 는 영향 없음**
- **z-index 를 역할 이름으로 노출** - `token.$z_content`(10) · `$z_chrome`(100) · `$z_app_chrome`(150) · `$z_notification`(200) · `$z_loading`(500) · `$z_popup`(1000) 과 같은 이름의 CSS 변수 `--bt-z-*`, TS `zIndex` 키. 이전에는 레벨 이름(`$z_level2`)뿐이라 어떤 컴포넌트가 어느 레이어에 있는지 알려면 배포 CSS 를 grep 해야 했다. `$z_level*` 은 그대로 유지된다
- `--bt-z-app-chrome`(150) - 앱이 소유한 하단·상단 크롬을 DS 크롬(100) 위, 알림(200) 아래에 놓기 위한 대역. `calc(var(--bt-z-notification) - 1)` 처럼 역할 이름 기준으로 계산해도 된다
- DS 컴포넌트 14파일 17선택자를 역할 토큰으로 교체 - **z-index 값은 하나도 바뀌지 않았다**
- **Vanilla z-index 정렬 (동작 변경)** - `--bt-z-modal` 1000 → 100, `--bt-z-toast` 1000 → 200(이전엔 미사용). 둘 다 1000 이라 Vanilla 에서 모달과 토스트의 순서를 정할 수 없었고 React(100/200)와도 어긋났다. `.bt-toast` 는 이전에 `z-index` 가 없어 DOM 순서에 의존했다. 두 이름은 역할 변수의 별칭으로 남아 오버라이드 가능하다 - **`101`~`999` 사이 자기 레이어가 있는 Vanilla 페이지는 점검 필요** (`docs/MIGRATION.md`)
- 문서 - `docs/THEMING.md` 에 레이어 표와 "DS 레이어 사이에 앱 레이어 놓는 법", `docs/COMPONENTS.md` `Prose` `size` 표에 본문 열 추가. `scripts/check-css-vars.sh` 가 "이것만 내보낸다" 고 주장하는 문서 4곳(THEMING 포함)을 모두 검사한다

## [3.13.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.13.0) - 2026-08-21

- **a11y 문자열 정책 통일 (동작 변경)** — 기본값은 한글, 모든 문자열은 prop 으로 교체 가능. 이전엔 절반이 한글·절반이 영문이라 컴포넌트마다 말하는 언어가 달랐다. `Dropdown` 은 형제 prop 이 이미 한글인데 `placeholder` 만 영문이라 한 컴포넌트 안에서도 갈려 있었다
- 교체 수단이 아예 없던 4곳에 prop 신설 — `TextField.clearLabel`(`"지우기"`), `Pagination.navLabel`(`"페이지 이동"`), `Breadcrumb.navLabel`(`"현재 위치"`), `ToastProvider.regionLabel`(`"알림"`). 랜드마크·리전 이름은 스크린리더의 리전 목록에 그대로 뜬다
- 영문 기본값 10건을 한글로 — `FileInput.label`(화면에 보이는 버튼 텍스트), `DatePicker` 의 `yearLabel`·`monthLabel`·`dayLabel`·`minDateSrFormat`·`selectableRangeUntilTodaySrText`, `Pagination` 의 `prevLabel`·`nextLabel`, `TopLoading.ariaLabel`, `ToastProvider.closeAriaLabel`, `Spinner.ariaLabel`, `TextField.passwordToggleLabels`, `Dropdown.placeholder`. **다국어(ko/en) 앱은 업그레이드 전에 라벨을 주입할 것** — `docs/MIGRATION.md` 참고
- `Modal`·`Drawer` 가 닫히는 순간의 내용을 붙잡는다 — `children`·`title`·`description`·`footer` 를 함께 얼려, 부모가 `open` 과 같은 값에 데이터를 묶어도 내용이 패널보다 먼저 사라지지 않는다. 앱이 두던 shim(`useState` + `useEffect`)이 불필요해진다
- `Modal`·`Drawer` 에 `dismissible` 추가 — Escape 와 오버레이 클릭을 한 축으로 묶는다. `closeOnOverlay={false}` 만으로는 Escape 로 여전히 닫혀 폼 입력을 지키지 못했다. `dismissible={false}` 여도 Escape 스택에는 등록되어 아래 오버레이가 대신 닫히지 않는다
- `token.visually_hidden` · `visually_hidden_reset` · `visually_hidden_focusable` 믹스인 추가 — 스크린리더 전용 숨김 레시피가 손으로 7곳에 복제돼 있었고 4곳은 deprecated `clip: rect()` 만 써서 `clip-path` 가 없었다. Vanilla 에 `.bt-sr-only-focusable`(스킵 링크) 신설
- `--bt-bottom-inset` 을 DS 몫(`--bt-bottom-nav-inset`)과 앱 몫(`--bt-bottom-inset-app`)의 합으로 분리 — 앱이 소유한 하단 크롬(플로팅 바·고정 액션 바)을 표현할 수단이 없었다. 같은 변수를 양쪽이 쓰면 `:has()` 특이도가 같아 CSS 로드 순서가 승자를 정하고 둘이 동시에 있을 때 합성되지 않았다. 읽는 쪽은 `--bt-bottom-inset` 하나만 그대로 쓰면 된다

## [3.12.0](https://github.com/Bigtablet/bigtablet-design-system/releases/tag/v3.12.0) - 2026-08-21

- `Prose` 컴포넌트 추가 - 마크다운·리치텍스트 본문을 DS 타이포로 조판한다. `size="md" | "lg"`, 루트 ref forwarding, 넘치는 `pre`·`table` 에만 `tabindex="0"` 를 붙여 키보드로 스크롤되게 하고 `ResizeObserver` + `MutationObserver` 로 다시 계산한다
- `Modal` 6건 수정 - 패널에서 시작한 드래그를 오버레이에서 놓아도 닫히지 않고(누른 곳과 놓은 곳이 모두 오버레이여야 닫는다), 내용이 길면 제목·푸터는 고정된 채 본문만 스크롤하며(`100dvh` 기준), 제목이 `heading_large_responsive` 로 좁은 화면에서 접히지 않는다. 패널의 `role="document"` 제거, 퇴출 완료 후 발화하는 `onExited` 추가
- `Drawer` 를 `Modal` 과 같은 오버레이·dialog 계약으로 - 위 수정 중 5건이 `Drawer` 에는 빠져 있었다. 오버레이 닫힘 판정, `role="document"` 제거, `onExited`, 키보드로 스크롤되는 본문, 접근성 이름 폴백 제거
- **접근성 이름 폴백 제거 (동작 변경)** - `Modal` · `Drawer` · `Popover` 가 이름이 없을 때 영문 `"Dialog"` 로 채우던 것을 없앴다. 한국어 제품에서 그대로 낭독됐고, 무엇보다 이름 누락을 가려 axe `aria-dialog-name` 이 거짓 통과했다. `title` · `ariaLabel` 중 하나는 반드시 줘야 한다
- `Toast` × `BottomNav` 겹침 해소 - `--bt-bottom-inset` 계약 신설. `body:has(.bottom_nav)` 에서 BottomNav 높이로 설정되고 `Toast` 가 스스로 비켜난다. 앱 CSS 보정이 필요 없다. `.bottom_nav` 를 `border-box` 로 바꿔 실제 높이와 값이 일치한다(safe-area 이중 계산으로 1px 틀어졌음)
- `EmptyState` 에 `fillHeight` 추가 - 부모 높이를 채우고 세로 중앙 정렬한다. 앱마다 만들던 래퍼가 필요 없다
- `TextField` 에 `identifier` 추가 - `l`·`I`·`1` 과 `0`·`O` 를 구분되게 렌더한다(Pretendard `cv05`·`cv08` + `slashed-zero`). 아이디·인증코드·시리얼처럼 화면을 보고 한 글자씩 옮겨 적는 값에 쓴다. Vanilla 는 `.bt-text-field__input--identifier`
- **한글 줄바꿈 수정 (동작 변경)** - `Button` · `Toast` 가 `word-break: break-word` 로 어절 중간에서 끊었다(`안녕하세` / `요`). 새 믹스인 `token.wrap_keep_all`(`overflow-wrap: anywhere` + `word-break: keep-all`)로 통일했고 Vanilla `.bt-button` · `.bt-toast` 도 같다. 줄바꿈 위치가 바뀐다
- `Toggle` 히트 영역이 tap target 하한을 충족 - 트랙 모양은 그대로 두고 `::after` 로 넓혔다. 데스크탑 32px / 좁은 화면 40px. Vanilla 도 미러링
- SCSS 믹스인 3개 추가 - `token.hairline($side, $color)`(1px 경계선), `token.wrap_keep_all`(한글 줄바꿈), `token.legible_identifiers`(식별자 판독)
- `a11y` 토큰에 `$tap_target_dense` 가 인터랙티브 컨트롤의 하한이라는 것과 마우스 전용 내부 도구(admin 등)의 예외를 명시
- 문서 - 컴포넌트가 노출하는 CSS 변수·마운트 수명·포털 계약(`Modal`·`Drawer` 도 `document.body` 로 포털한다), React/Vanilla 번들별 변수 차이, 하드코딩 대신 쓸 토큰 매핑. 드리프트 감지용 `scripts/check-css-vars.sh` 추가
- Storybook - 설명을 한글 단독으로 정리, GitHub Pages 하위 경로에서 깨졌던 로고·파비콘 경로 수정

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
