# [4.0.0](https://github.com/Bigtablet/bigtablet-design-system/compare/v3.1.1...v4.0.0) (2026-06-16)


### Bug Fixes

* address Gemini review feedback (PR [#276](https://github.com/Bigtablet/bigtablet-design-system/issues/276)) ([6cad4ad](https://github.com/Bigtablet/bigtablet-design-system/commit/6cad4ad7fc0ab75e7042d32aaa8b0da461717bf2)), closes [#7f1d1d](https://github.com/Bigtablet/bigtablet-design-system/issues/7f1d1d)
* address Gemini review feedback (PR [#277](https://github.com/Bigtablet/bigtablet-design-system/issues/277)) ([5429be8](https://github.com/Bigtablet/bigtablet-design-system/commit/5429be833e8cd2f0c68ee02a06f21123ae69a5c0))
* derived-state IME guard bug + emit useCallback (PR [#281](https://github.com/Bigtablet/bigtablet-design-system/issues/281) review) ([73995b9](https://github.com/Bigtablet/bigtablet-design-system/commit/73995b93ac0d5d6d39932897203df422ee4b336b))
* glass variant card_footer border uses hover_on_dark token ([bfd2aa3](https://github.com/Bigtablet/bigtablet-design-system/commit/bfd2aa35dd2dac86c9c26da8bdf954477f7ea0c6))
* list-item text slots span→div, story link stopPropagation ([fa16ebe](https://github.com/Bigtablet/bigtablet-design-system/commit/fa16ebe680ccdc5c9c66d656bd5a4c455ade6406))
* popover exit animation, focus ring, div wrapper, placement interpolation ([ec3fc66](https://github.com/Bigtablet/bigtablet-design-system/commit/ec3fc66604820c711f3463302f614aa333bf3ed4))
* status text color → *-on-surface for dark mode legibility ([cdd2db6](https://github.com/Bigtablet/bigtablet-design-system/commit/cdd2db63e3bf9aab8f750cfa0ebdbf99707e8ea7))
* Textarea/TextField SSR-safe layout effect + derived state + IME dup guard (PR [#280](https://github.com/Bigtablet/bigtablet-design-system/issues/280) review) ([bfd5b2a](https://github.com/Bigtablet/bigtablet-design-system/commit/bfd5b2a5fcef8811f3ceea5e198af644bfa8f7fd))
* update TokenComparison hex values and correct dark mode comments ([98aad53](https://github.com/Bigtablet/bigtablet-design-system/commit/98aad534bb07bb31bea2b15430626a11c356ac4a)), closes [B4C2CD/#3D4852](https://github.com/Bigtablet/bigtablet-design-system/issues/3D4852) [333333/#777777](https://github.com/Bigtablet/bigtablet-design-system/issues/777777)


### Features

* add Popover - general-purpose non-modal popover overlay ([1f57a90](https://github.com/Bigtablet/bigtablet-design-system/commit/1f57a906f7a1d9f44a12b83edd9edbaf5ba3359e)), closes [#286](https://github.com/Bigtablet/bigtablet-design-system/issues/286)
* add RadioGroup - Context-based composite wrapper for Radio ([3ed8c18](https://github.com/Bigtablet/bigtablet-design-system/commit/3ed8c18f91de7f47aad6e279d4763076704a923a)), closes [#284](https://github.com/Bigtablet/bigtablet-design-system/issues/284)
* allow ReactNode in ListItem text slots (overline/label/supportingText/metadata) ([ef1c38b](https://github.com/Bigtablet/bigtablet-design-system/commit/ef1c38b89f9d527a0fe6c59c2a1ad5b7f8272d4a)), closes [#290](https://github.com/Bigtablet/bigtablet-design-system/issues/290)
* Badge appearance prop — solid (default) | soft ([027bb3c](https://github.com/Bigtablet/bigtablet-design-system/commit/027bb3ce6a4596e58b4863b31ff99320946754e5))
* ErrorState component (error boundary / widget fallback) ([5b92726](https://github.com/Bigtablet/bigtablet-design-system/commit/5b927268f4f76f635a57d06b55a27e0f8c45bebb))
* export Textarea + ErrorState + update AGENT_GUIDE ([2324822](https://github.com/Bigtablet/bigtablet-design-system/commit/232482293bd0d5027137712a09f359fdd7211ac0))
* extend Card with glass/outlined variants, interactive, footer slot ([23509c2](https://github.com/Bigtablet/bigtablet-design-system/commit/23509c27e9cbb1d9b968461ecc7bd09a31282724)), closes [#288](https://github.com/Bigtablet/bigtablet-design-system/issues/288)
* status token contract — AA-pass hex + container/on-container/on-surface ([f0d68fc](https://github.com/Bigtablet/bigtablet-design-system/commit/f0d68fcc85b66569a742e0e9f427f04a69927a55)), closes [#fff](https://github.com/Bigtablet/bigtablet-design-system/issues/fff) [#10B981](https://github.com/Bigtablet/bigtablet-design-system/issues/10B981) [#047857](https://github.com/Bigtablet/bigtablet-design-system/issues/047857) [#3B82F6](https://github.com/Bigtablet/bigtablet-design-system/issues/3B82F6) [#1D4ED8](https://github.com/Bigtablet/bigtablet-design-system/issues/1D4ED8) [#F59E0B](https://github.com/Bigtablet/bigtablet-design-system/issues/F59E0B) [#B45309](https://github.com/Bigtablet/bigtablet-design-system/issues/B45309) [#EF4444](https://github.com/Bigtablet/bigtablet-design-system/issues/EF4444) [#B91C1C](https://github.com/Bigtablet/bigtablet-design-system/issues/B91C1C) [#DCFCE7](https://github.com/Bigtablet/bigtablet-design-system/issues/DCFCE7) [#F3F3F3](https://github.com/Bigtablet/bigtablet-design-system/issues/F3F3F3)
* Textarea component (multi-line input) ([b7fc921](https://github.com/Bigtablet/bigtablet-design-system/commit/b7fc921ca110d1da17fd00534983fba95bf0c1e6))
* TextField imeStrategy prop for live IME subscription ([59de002](https://github.com/Bigtablet/bigtablet-design-system/commit/59de00278621e386bd98be746f18bbb99cd5f20f))


### merge

* feat/status-a11y-tokens ([#276](https://github.com/Bigtablet/bigtablet-design-system/issues/276)) ([1166ec3](https://github.com/Bigtablet/bigtablet-design-system/commit/1166ec3f670b4593b1b4241119d8202f66e6ed30)), closes [#fff](https://github.com/Bigtablet/bigtablet-design-system/issues/fff) [#10B981](https://github.com/Bigtablet/bigtablet-design-system/issues/10B981) [#047857](https://github.com/Bigtablet/bigtablet-design-system/issues/047857) [#3B82F6](https://github.com/Bigtablet/bigtablet-design-system/issues/3B82F6) [#1D4ED8](https://github.com/Bigtablet/bigtablet-design-system/issues/1D4ED8) [#F59E0B](https://github.com/Bigtablet/bigtablet-design-system/issues/F59E0B) [#B45309](https://github.com/Bigtablet/bigtablet-design-system/issues/B45309) [#EF4444](https://github.com/Bigtablet/bigtablet-design-system/issues/EF4444) [#B91C1C](https://github.com/Bigtablet/bigtablet-design-system/issues/B91C1C) [#DCFCE7](https://github.com/Bigtablet/bigtablet-design-system/issues/DCFCE7) [#F3F3F3](https://github.com/Bigtablet/bigtablet-design-system/issues/F3F3F3) [#fff](https://github.com/Bigtablet/bigtablet-design-system/issues/fff) [#121212](https://github.com/Bigtablet/bigtablet-design-system/issues/121212) [#7f1d1d](https://github.com/Bigtablet/bigtablet-design-system/issues/7f1d1d)
* release ([#280](https://github.com/Bigtablet/bigtablet-design-system/issues/280)) ([1174100](https://github.com/Bigtablet/bigtablet-design-system/commit/117410085e11b03389856dac03451c8bb219990a)), closes [#fff](https://github.com/Bigtablet/bigtablet-design-system/issues/fff) [#10B981](https://github.com/Bigtablet/bigtablet-design-system/issues/10B981) [#047857](https://github.com/Bigtablet/bigtablet-design-system/issues/047857) [#3B82F6](https://github.com/Bigtablet/bigtablet-design-system/issues/3B82F6) [#1D4ED8](https://github.com/Bigtablet/bigtablet-design-system/issues/1D4ED8) [#F59E0B](https://github.com/Bigtablet/bigtablet-design-system/issues/F59E0B) [#B45309](https://github.com/Bigtablet/bigtablet-design-system/issues/B45309) [#EF4444](https://github.com/Bigtablet/bigtablet-design-system/issues/EF4444) [#B91C1C](https://github.com/Bigtablet/bigtablet-design-system/issues/B91C1C) [#DCFCE7](https://github.com/Bigtablet/bigtablet-design-system/issues/DCFCE7) [#F3F3F3](https://github.com/Bigtablet/bigtablet-design-system/issues/F3F3F3) [#fff](https://github.com/Bigtablet/bigtablet-design-system/issues/fff) [#121212](https://github.com/Bigtablet/bigtablet-design-system/issues/121212) [#276](https://github.com/Bigtablet/bigtablet-design-system/issues/276) [#7f1d1d](https://github.com/Bigtablet/bigtablet-design-system/issues/7f1d1d) [#271](https://github.com/Bigtablet/bigtablet-design-system/issues/271)
* style/dark-mode-neutral ([#292](https://github.com/Bigtablet/bigtablet-design-system/issues/292)) ([cef0292](https://github.com/Bigtablet/bigtablet-design-system/commit/cef0292bc1a3ca7546a695a5ad43ea2ea1481e9a)), closes [#141414](https://github.com/Bigtablet/bigtablet-design-system/issues/141414) [#0A0A0A](https://github.com/Bigtablet/bigtablet-design-system/issues/0A0A0A) [#0A0A0A](https://github.com/Bigtablet/bigtablet-design-system/issues/0A0A0A) [#141414](https://github.com/Bigtablet/bigtablet-design-system/issues/141414) [1F2630/#303841](https://github.com/Bigtablet/bigtablet-design-system/issues/303841) [#B3B3B3](https://github.com/Bigtablet/bigtablet-design-system/issues/B3B3B3) [B4C2CD/#3D4852](https://github.com/Bigtablet/bigtablet-design-system/issues/3D4852) [333333/#777777](https://github.com/Bigtablet/bigtablet-design-system/issues/777777)


### Styles

* replace navy palette with pure neutral gray in dark mode ([6084c55](https://github.com/Bigtablet/bigtablet-design-system/commit/6084c5553169b6e7f36a91708447ab6d9efd8e6a)), closes [#141414](https://github.com/Bigtablet/bigtablet-design-system/issues/141414) [#0A0A0A](https://github.com/Bigtablet/bigtablet-design-system/issues/0A0A0A) [#0A0A0A](https://github.com/Bigtablet/bigtablet-design-system/issues/0A0A0A) [#141414](https://github.com/Bigtablet/bigtablet-design-system/issues/141414) [1F2630/#303841](https://github.com/Bigtablet/bigtablet-design-system/issues/303841) [#B3B3B3](https://github.com/Bigtablet/bigtablet-design-system/issues/B3B3B3)


### BREAKING CHANGES

* status base hex 값 변경 — 시각적으로 더 진한 톤. Notiiv 4개 앱은 brand.css 에서 status 자체 override 중이라 영향 없음. 다른 소비처는 PR 머지 전 시각 검토 권장.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

* feat: Badge appearance prop — solid (default) | soft

신규 prop `appearance?: "solid" | "soft"` 추가 (기본 `solid` — 호환):
- `solid`: 강한 fill bg + 흰/검 텍스트 (status hex darken 후 AA 통과)
- `soft`: tint 배경 (status-*-container) + 진한 텍스트 (status-*-on-container) — 정보성 라벨용 차분한 인상, AA 5~7:1

Badge style.scss 의 raw `color: #fff` 4 라인 (info/success/warning/error) 제거 — `status-*-on-default` 토큰 사용. accent / neutral 도 solid/soft 분기 지원.

테스트 + Storybook story (Solid vs Soft 비교) 추가.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

* fix: status text color → *-on-surface for dark mode legibility

surface 위 직접 status 텍스트 사용처를 `*-on-surface` 토큰으로 교체 — light/dark 자동 swap (light=darkened, dark=brightened) 으로 다크 모드 가독성 보장:

- TextField error label / helper — `status_error_on_surface`
- OtpInput error supporting — 동일
- DatePicker required (*) 표시 — 동일
- Alert icon + title (variant 4종) — `status_*_on_surface`
- Toast icon (variant 4종) — 동일
- Menu destructive item — `status_error_on_surface`

다크 모드 (navy_900 surface) 위 대비:
- error #F87171: 6.8:1 ✅
- success #4ADE80: 10.5:1 ✅
- warning #FBBF24: 13:1 ✅
- info #60A5FA: 7.8:1 ✅

border / solid bg 사용처 (Checkbox border, Button danger fill 등) 는 그대로 — surface 위 텍스트 아닌 케이스라 토큰 의미 다름.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

* style: replace raw hex in component SCSS with theme-invariant tokens

src/ui/**/*.scss 의 raw hex 11건 제거 — Stylelint color-no-hex 룰 적용 준비:

- nav-bar.scss (8): `color/background: #fff` → `token.\$color_brand_on_primary` (light/dark 동일 흰색 토큰)
- hero.scss (2): `color: #1A1A1A` → `token.\$color_brand_primary`, `color: #fff` → `token.\$color_brand_on_primary`
* HeroOverlay type no longer accepts "navy" (use "dark"); Section bg prop no longer accepts "navy" (use "inverted")

Co-Authored-By: Claude <noreply@anthropic.com>

* fix: update TokenComparison hex values and correct dark mode comments
* HeroOverlay type no longer accepts "navy" (use "dark"); Section bg prop no longer accepts "navy" (use "inverted")

Co-Authored-By: Claude <noreply@anthropic.com>
* status base hex 값 변경 — 시각적으로 더 진한 톤. Notiiv 4개 앱은 brand.css 에서 status 자체 override 중이라 영향 없음. 다른 소비처는 PR 머지 전 시각 검토 권장.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

* feat: Badge appearance prop — solid (default) | soft

신규 prop `appearance?: "solid" | "soft"` 추가 (기본 `solid` — 호환):
- `solid`: 강한 fill bg + 흰/검 텍스트 (status hex darken 후 AA 통과)
- `soft`: tint 배경 (status-*-container) + 진한 텍스트 (status-*-on-container) — 정보성 라벨용 차분한 인상, AA 5~7:1

Badge style.scss 의 raw `color: #fff` 4 라인 (info/success/warning/error) 제거 — `status-*-on-default` 토큰 사용. accent / neutral 도 solid/soft 분기 지원.

테스트 + Storybook story (Solid vs Soft 비교) 추가.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

* fix: status text color → *-on-surface for dark mode legibility

surface 위 직접 status 텍스트 사용처를 `*-on-surface` 토큰으로 교체 — light/dark 자동 swap (light=darkened, dark=brightened) 으로 다크 모드 가독성 보장:

- TextField error label / helper — `status_error_on_surface`
- OtpInput error supporting — 동일
- DatePicker required (*) 표시 — 동일
- Alert icon + title (variant 4종) — `status_*_on_surface`
- Toast icon (variant 4종) — 동일
- Menu destructive item — `status_error_on_surface`

다크 모드 (navy_900 surface) 위 대비:
- error #F87171: 6.8:1 ✅
- success #4ADE80: 10.5:1 ✅
- warning #FBBF24: 13:1 ✅
- info #60A5FA: 7.8:1 ✅

border / solid bg 사용처 (Checkbox border, Button danger fill 등) 는 그대로 — surface 위 텍스트 아닌 케이스라 토큰 의미 다름.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

* style: replace raw hex in component SCSS with theme-invariant tokens

src/ui/**/*.scss 의 raw hex 11건 제거 — Stylelint color-no-hex 룰 적용 준비:

- nav-bar.scss (8): `color/background: #fff` → `token.\$color_brand_on_primary` (light/dark 동일 흰색 토큰)
- hero.scss (2): `color: #1A1A1A` → `token.\$color_brand_primary`, `color: #fff` → `token.\$color_brand_on_primary`
* status base hex 값 변경 — 시각적으로 더 진한 톤. Notiiv 4개 앱은 brand.css 에서 status 자체 override 중이라 영향 없음. 다른 소비처는 PR 머지 전 시각 검토 권장.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

## [3.1.1](https://github.com/Bigtablet/bigtablet-design-system/compare/v3.1.0...v3.1.1) (2026-05-26)

# [3.1.0](https://github.com/Bigtablet/bigtablet-design-system/compare/v3.0.0...v3.1.0) (2026-05-26)


### Bug Fixes

* address Gemini review feedback (PR [#269](https://github.com/Bigtablet/bigtablet-design-system/issues/269)) ([22f5a1c](https://github.com/Bigtablet/bigtablet-design-system/commit/22f5a1c45b2798b5ed50051e2d89f347691e477b)), closes [#2](https://github.com/Bigtablet/bigtablet-design-system/issues/2)
* convert SidebarItem + BottomNavItem to discriminated union (PR [#269](https://github.com/Bigtablet/bigtablet-design-system/issues/269)) ([a5aa1e0](https://github.com/Bigtablet/bigtablet-design-system/commit/a5aa1e071d5e88f802dff18803d4e7d3e238b3a9)), closes [#2](https://github.com/Bigtablet/bigtablet-design-system/issues/2)


### Features

* add BottomNav + Sidebar responsive transform for mobile nav ([f2f67b1](https://github.com/Bigtablet/bigtablet-design-system/commit/f2f67b111069f0187d9cc3dd0b2756675cbf0802))

# [3.0.0](https://github.com/Bigtablet/bigtablet-design-system/compare/v2.5.0...v3.0.0) (2026-05-26)


### Bug Fixes

* Accordion hover bg leaks on opened trigger ([59f3741](https://github.com/Bigtablet/bigtablet-design-system/commit/59f3741b5908fd32787a60f2085cd218264bf318))
* Accordion trigger padding too big (hover area felt too large) ([d058bdc](https://github.com/Bigtablet/bigtablet-design-system/commit/d058bdc9299d6bf240ca056dcb14fded87252ee7))
* adapt component tokens for dark mode visibility ([8aa3ee7](https://github.com/Bigtablet/bigtablet-design-system/commit/8aa3ee787fe30078a7a000739be28fee71f14608)), closes [#121212](https://github.com/Bigtablet/bigtablet-design-system/issues/121212)
* adapt stories hardcoded colors for dark mode ([54c9e62](https://github.com/Bigtablet/bigtablet-design-system/commit/54c9e628dc094ba171ac3d643848dfeb3b5902fd))
* address gemini review feedback (PR [#258](https://github.com/Bigtablet/bigtablet-design-system/issues/258)) ([a151273](https://github.com/Bigtablet/bigtablet-design-system/commit/a151273f9855e0c6115f8bd0d6315caa51042f40))
* address Gemini review feedback (PR [#268](https://github.com/Bigtablet/bigtablet-design-system/issues/268)) ([96adabd](https://github.com/Bigtablet/bigtablet-design-system/commit/96adabd682e53d67e61a18c9a12efcb6201758e5))
* cookbook layout patterns visual consistency ([983ed74](https://github.com/Bigtablet/bigtablet-design-system/commit/983ed74979859570237def56fc98da6f727a965c))
* dark mode coverage — elevation + focus ring + page composition tokens ([48ff083](https://github.com/Bigtablet/bigtablet-design-system/commit/48ff083a4c7637329bd3e1310639f841160ff9cb))
* dark mode text invisible on dark/brand bg (5 components) ([97d6100](https://github.com/Bigtablet/bigtablet-design-system/commit/97d6100953428d7ca5e3b5f391b2917a14a21f73)), closes [#FFFFFF](https://github.com/Bigtablet/bigtablet-design-system/issues/FFFFFF) [#121212](https://github.com/Bigtablet/bigtablet-design-system/issues/121212) [#121212](https://github.com/Bigtablet/bigtablet-design-system/issues/121212) [#FFFFFF](https://github.com/Bigtablet/bigtablet-design-system/issues/FFFFFF)
* dark mode text rendering (smoothing + opacity) ([3cac2a3](https://github.com/Bigtablet/bigtablet-design-system/commit/3cac2a30c7513fa8b398b042508ff09a27c2025c))
* dropdown dropUp threshold conservative for small viewports ([c049224](https://github.com/Bigtablet/bigtablet-design-system/commit/c049224984a2aa73e442d2e2701640d7729ca5bd))
* dropdown width stability and dark mode panel visibility ([98a323c](https://github.com/Bigtablet/bigtablet-design-system/commit/98a323c532b23b6f3656481a6942f13a6f20bd66))
* dropdown/menu panel bg white in light, bg_solid_dim in dark ([38a6044](https://github.com/Bigtablet/bigtablet-design-system/commit/38a6044b86523054ca2c0ad762cc541c5dfe7a9c))
* keep Dropdown on Menu/Tooltip spring pattern (no shouldRender) ([6809df0](https://github.com/Bigtablet/bigtablet-design-system/commit/6809df07522e7c3132aeb1bb3c8604658c477d2e))
* menu trigger props forwarding + dark mode panel bg ([39ef952](https://github.com/Bigtablet/bigtablet-design-system/commit/39ef95238cf9dce2d7dd984c61975be1afcd08e6))
* misc UI refinements across components ([d591fe5](https://github.com/Bigtablet/bigtablet-design-system/commit/d591fe5067e004ac5116f1f9e9a3aed0d5158583))
* move chip to display category and symmetric padding ([dff1122](https://github.com/Bigtablet/bigtablet-design-system/commit/dff1122a0dd31f9cfdf754a7760e62f06954635a))
* real logo + dark mode canvas background ([1c2aa02](https://github.com/Bigtablet/bigtablet-design-system/commit/1c2aa02492b5a0943d5a13e48bdd471855963f7e))
* replace hardcoded black shadows with theme variable ([5c9ba58](https://github.com/Bigtablet/bigtablet-design-system/commit/5c9ba5854e6ed2773915708162d45d6465689011)), closes [#260](https://github.com/Bigtablet/bigtablet-design-system/issues/260)
* replace hardcoded colors with theme tokens in stories ([6fcdedb](https://github.com/Bigtablet/bigtablet-design-system/commit/6fcdedb41c9edfb53d4c7d9d1db16e69431c9617)), closes [#121212](https://github.com/Bigtablet/bigtablet-design-system/issues/121212) [#888](https://github.com/Bigtablet/bigtablet-design-system/issues/888) [#444](https://github.com/Bigtablet/bigtablet-design-system/issues/444) [#fff](https://github.com/Bigtablet/bigtablet-design-system/issues/fff) [#F2F5F8](https://github.com/Bigtablet/bigtablet-design-system/issues/F2F5F8) [444/#303841](https://github.com/Bigtablet/bigtablet-design-system/issues/303841) [f8f9fa/#E5E5E5](https://github.com/Bigtablet/bigtablet-design-system/issues/E5E5E5) [e5e5e5/#E5E7EB](https://github.com/Bigtablet/bigtablet-design-system/issues/E5E7EB) [F59E0B/#94A3B8](https://github.com/Bigtablet/bigtablet-design-system/issues/94A3B8) [DCFCE7/#047857](https://github.com/Bigtablet/bigtablet-design-system/issues/047857)
* restore Accordion hover bg on opened trigger (revert) ([a70b8a8](https://github.com/Bigtablet/bigtablet-design-system/commit/a70b8a88cceeec13f47032fd92db6b139b5ddb4a))
* sidebar logo crossfade between expanded and collapsed states ([d1f3557](https://github.com/Bigtablet/bigtablet-design-system/commit/d1f3557772159aca44bc634c683f780b53476e41))
* skip Chromatic review job on dependabot PRs ([ca8e721](https://github.com/Bigtablet/bigtablet-design-system/commit/ca8e721bdb61d355d41049b79654aaf6363f06b9))
* skip Chromatic review job on dependabot PRs ([#267](https://github.com/Bigtablet/bigtablet-design-system/issues/267)) ([2887e77](https://github.com/Bigtablet/bigtablet-design-system/commit/2887e77b5462bf5454394f8c462f34331e967f82))
* storybook test failures (React null + a11y) ([6708530](https://github.com/Bigtablet/bigtablet-design-system/commit/6708530699fbc3807ad25e3866a7a509d2c1a728))
* Tabs support uncontrolled mode via defaultValue prop ([55adca2](https://github.com/Bigtablet/bigtablet-design-system/commit/55adca22de8ed4a7f68030a524ba5fb25f8d5f44))
* ThemeProvider demo Dark button text invisible in dark mode ([148652a](https://github.com/Bigtablet/bigtablet-design-system/commit/148652a119c22abc5204e81421838049d4ef7474))
* tooltip centering + long text wrap consistency ([41542fe](https://github.com/Bigtablet/bigtablet-design-system/commit/41542fef318a2c95667d4ef8b76eb03e5de8163a))
* vanilla SCSS dark mode parity + Modal X close icon ([01b9ff4](https://github.com/Bigtablet/bigtablet-design-system/commit/01b9ff4ac69612492677fa71b8308866ecdbca09))


### Features

* add Getting Started and Cookbook story sections ([b92a7f3](https://github.com/Bigtablet/bigtablet-design-system/commit/b92a7f377c33e3ab51e82cee4b80447542b1b8b5))
* add preview variant to FileInput ([6607b5b](https://github.com/Bigtablet/bigtablet-design-system/commit/6607b5b021cc2d659e319d70cbcc82d7ba21a35c))
* add top-right X close icon to Modal ([73f2e8e](https://github.com/Bigtablet/bigtablet-design-system/commit/73f2e8e9a83f9774abd595c05fd32f3300560a04))
* Chip type='static' + tone variants (replaces Tag) ([a00b7a9](https://github.com/Bigtablet/bigtablet-design-system/commit/a00b7a9fd63bdb00da6eb9f333f6a5133cba88d2))
* Icon component — Material Symbols → lucide-react ([b4b4b8b](https://github.com/Bigtablet/bigtablet-design-system/commit/b4b4b8bbbc0f84d624e612bafd0a794388a7badc))
* migrate Dropdown and Toast to react-spring ([1b5853b](https://github.com/Bigtablet/bigtablet-design-system/commit/1b5853b1ed59e84eb704904f38409596cfabf674))
* migrate Modal and Alert from CSS keyframes to react-spring ([780fef8](https://github.com/Bigtablet/bigtablet-design-system/commit/780fef82d063464264dfee12835fe5f729ae172f))
* redesign Spinner and LinearProgress ([a6ea9e9](https://github.com/Bigtablet/bigtablet-design-system/commit/a6ea9e94233f32af9639713290a9c170ac3e45b4))
* typography v3.0 — bold + responsive + semantic + utils ([213f42c](https://github.com/Bigtablet/bigtablet-design-system/commit/213f42c2c4aae6c0a732247ee55276561e2f78a4))
* unify TextField w/ Dropdown label pattern + bump all deps to latest ([0540465](https://github.com/Bigtablet/bigtablet-design-system/commit/0540465b036cff8cf9b0a0f56e635f29ef3009c9))
* useSpringPresence onExitComplete + test skipAnimation ([840c5e6](https://github.com/Bigtablet/bigtablet-design-system/commit/840c5e66cb074e5188c8855531b5b5d3e55f5182))
* v3.0 — brand policy + ui reorg + coverage 90%+ ([52dd73f](https://github.com/Bigtablet/bigtablet-design-system/commit/52dd73ff6a8191331bb1464e4d5851dab4358916)), closes [#47555E](https://github.com/Bigtablet/bigtablet-design-system/issues/47555E) [#121212](https://github.com/Bigtablet/bigtablet-design-system/issues/121212) [#FFFFFF](https://github.com/Bigtablet/bigtablet-design-system/issues/FFFFFF)
* v3.0 — navy accent DS, dark mode, 15 new components, layout primitives ([d305223](https://github.com/Bigtablet/bigtablet-design-system/commit/d3052230d931b0c30416bf5ef98ff624940667bc))
* v3.0 release marker ([b8df580](https://github.com/Bigtablet/bigtablet-design-system/commit/b8df5803bf4801df8bfeec7c425b39dc12ad5950))


### BREAKING CHANGES

* Select component removed (use Dropdown). Chip moved
from src/ui/general/chip to src/ui/display/chip (path import update
required). Vanilla --bt-color-primary now reserved for Button --primary
fill only — accent indicators use new --bt-color-accent / --bt-color-
accent-on-surface CSS vars. fullWidth prop on Dropdown is now a no-op
(default fills parent).

# [3.0.0](https://github.com/Bigtablet/bigtablet-design-system/compare/v2.4.2...v3.0.0) (2026-05-20)


### ⚠ BREAKING CHANGES

* **Tag**: `Tag` component is removed — migrate to `Chip type="static" tone={...}`
* **TextField**: markup changed from `<fieldset>` + `<legend>` to `<div>` + `<label>` (label now sits standalone above the control)
* **TextField**: placeholder color updated from `text_caption` to `text_body`
* **TextField**: inner padding reduced 6px → 4px


### Features

* add 16 new components — `Tabs` (compound API), `Sidebar`, `NavBar`, `Breadcrumb`, `Avatar`, `Badge`, `EmptyState`, `Accordion`, `Tooltip`, `Menu`, `Skeleton`, `Table`, `MediaCard`, plus layout primitives `Container`, `Section`, `Stack`, `Grid`
* add `ThemeProvider` + `useTheme` hook for light/dark theme management
* add full dark mode support via CSS custom properties (`:root` + `[data-theme="dark"]`) — every component token auto-adapts
* add `Chip` `type="static"` + `tone` prop (absorbs former `Tag` component)
* add `Tabs` `defaultValue` for uncontrolled mode
* add `Hero` `primaryAction` / `secondaryAction` props
* add Storybook toolbar theme toggle (☀️ / 🌙 / 🖥)


### Bug Fixes

* fix `React.useState` null issue in Chip / Dropdown / TextField by importing hooks directly
* fix Vite 8 upgrade resolves `import.meta.env` clone error in Storybook test environment


### Dependencies

* upgrade `vite` 6 → 8 (major)
* upgrade `storybook` 10.3 → 10.4
* upgrade `vitest` 4.1.5 → 4.1.6
* upgrade `chromatic` 16 → 17, `@commitlint/*` 20 → 21, `@types/node` 24 → 25
* minor bumps on remaining dependencies

## [2.4.2](https://github.com/Bigtablet/bigtablet-design-system/compare/v2.4.1...v2.4.2) (2026-05-06)


### Bug Fixes

* restore vanilla example function names broken by lint auto-fix ([df706f8](https://github.com/Bigtablet/bigtablet-design-system/commit/df706f8a6a57c727ea6ffc1fe34ac2f5581c0bd8))

## [2.4.1](https://github.com/Bigtablet/bigtablet-design-system/compare/v2.4.0...v2.4.1) (2026-05-04)

# [2.4.0](https://github.com/Bigtablet/bigtablet-design-system/compare/v2.3.0...v2.4.0) (2026-04-28)


### Bug Fixes

* address Gemini code review on Dropdown component ([ab0c279](https://github.com/Bigtablet/bigtablet-design-system/commit/ab0c279da372adcb5d794303e46cd12145d33bf0))


### Features

* add Dropdown component — redesign from Figma spec ([a89e1e5](https://github.com/Bigtablet/bigtablet-design-system/commit/a89e1e55ffc4d8c4ad8b40c8774afd1b09101225))

# [2.3.0](https://github.com/Bigtablet/bigtablet-design-system/compare/v2.2.4...v2.3.0) (2026-04-24)


### Bug Fixes

* restore tokens.json original format, apply only targeted token changes ([7ad6e63](https://github.com/Bigtablet/bigtablet-design-system/commit/7ad6e63855146e9e3f6f4cdeff182c9c4cef363c)), closes [#6B6B6B](https://github.com/Bigtablet/bigtablet-design-system/issues/6B6B6B) [#777777](https://github.com/Bigtablet/bigtablet-design-system/issues/777777) [#333333](https://github.com/Bigtablet/bigtablet-design-system/issues/333333)


### Features

* update color tokens — neutral 600/800, add bg inverse-surface ([6c975a2](https://github.com/Bigtablet/bigtablet-design-system/commit/6c975a2b8341fed175979d790b2cc8f17c8d89a1)), closes [#6B6B6B](https://github.com/Bigtablet/bigtablet-design-system/issues/6B6B6B) [#777777](https://github.com/Bigtablet/bigtablet-design-system/issues/777777) [#333333](https://github.com/Bigtablet/bigtablet-design-system/issues/333333) [#228](https://github.com/Bigtablet/bigtablet-design-system/issues/228)

## [2.2.4](https://github.com/Bigtablet/bigtablet-design-system/compare/v2.2.3...v2.2.4) (2026-04-20)


### Bug Fixes

* align Select focus highlight style with TextField pattern ([e4c6917](https://github.com/Bigtablet/bigtablet-design-system/commit/e4c691743a4e3357f87a9b528018e5d9a9eb4968))
* clamp minDay at definition to guard upper bound against invalid input ([ff6645c](https://github.com/Bigtablet/bigtablet-design-system/commit/ff6645c5adbe0521f061a617812fca0591b94478))
* clamp minDay to 1–31 range to guard against invalid minDate input ([32c8f9c](https://github.com/Bigtablet/bigtablet-design-system/commit/32c8f9c23bcd3e964638dae84905250bbf31dd5c))
* clamp minMonth to 1–12 range to guard against invalid minDate input ([7619fc7](https://github.com/Bigtablet/bigtablet-design-system/commit/7619fc7cc8d166334c12614f77feb0e725fe92c0))
* refactor DatePicker to use DS Select component for consistent UX ([5387f9a](https://github.com/Bigtablet/bigtablet-design-system/commit/5387f9aa84a16c2365f17604d6d90780a790cc10))
* remove default margin-top from Card title ([cf44ff7](https://github.com/Bigtablet/bigtablet-design-system/commit/cf44ff758f8c3423a46758bc3c88c4bd20dcd45c))
* Select 밀림 및 클릭 테두리 강조 버그 수정 ([eeb8a0c](https://github.com/Bigtablet/bigtablet-design-system/commit/eeb8a0cdc350f5bbcfef93bc8300aeee32cbb834))

## [2.2.2](https://github.com/Bigtablet/bigtablet-design-system/compare/v2.2.1...v2.2.2) (2026-04-20)


### Bug Fixes

* align Select focus highlight style with TextField pattern ([e4c6917](https://github.com/Bigtablet/bigtablet-design-system/commit/e4c691743a4e3357f87a9b528018e5d9a9eb4968))
* clamp minMonth to 1–12 range to guard against invalid minDate input ([7619fc7](https://github.com/Bigtablet/bigtablet-design-system/commit/7619fc7cc8d166334c12614f77feb0e725fe92c0))
* refactor DatePicker to use DS Select component for consistent UX ([5387f9a](https://github.com/Bigtablet/bigtablet-design-system/commit/5387f9aa84a16c2365f17604d6d90780a790cc10))
* remove default margin-top from Card title ([cf44ff7](https://github.com/Bigtablet/bigtablet-design-system/commit/cf44ff758f8c3423a46758bc3c88c4bd20dcd45c))

## [2.2.1](https://github.com/Bigtablet/bigtablet-design-system/compare/v2.2.0...v2.2.1) (2026-04-17)


### Bug Fixes

* Select fieldset/legend 구조 전환으로 label 배경색 제거 ([b9113be](https://github.com/Bigtablet/bigtablet-design-system/commit/b9113becdb3dabfafca0808fff415832e345be41))
* Select 밀림 및 클릭 테두리 강조 버그 수정 ([eeb8a0c](https://github.com/Bigtablet/bigtablet-design-system/commit/eeb8a0cdc350f5bbcfef93bc8300aeee32cbb834))
* TextField fieldset/legend 구조 전환으로 label 배경색 제거 ([724bd1a](https://github.com/Bigtablet/bigtablet-design-system/commit/724bd1a65226966a59ccbe62bc10813ece152408))
* TextField 컨테이너 흰색 배경 복구 ([ff57129](https://github.com/Bigtablet/bigtablet-design-system/commit/ff57129b5668c6913593ba7591178b3589584a2c))
* TextField 코드리뷰 반영 ([3cb9cba](https://github.com/Bigtablet/bigtablet-design-system/commit/3cb9cba8f7a8e747a231f66827c9f767fdf4da7c))

## [2.2.3](https://github.com/Bigtablet/bigtablet-design-system/compare/v2.2.2...v2.2.3) (2026-04-17)


### Bug Fixes

* Select fieldset/legend 구조 전환으로 label 배경색 제거 ([b9113be](https://github.com/Bigtablet/bigtablet-design-system/commit/b9113becdb3dabfafca0808fff415832e345be41))

## [2.2.2](https://github.com/Bigtablet/bigtablet-design-system/compare/v2.2.1...v2.2.2) (2026-04-17)


### Bug Fixes

* TextField 컨테이너 흰색 배경 복구 ([ff57129](https://github.com/Bigtablet/bigtablet-design-system/commit/ff57129b5668c6913593ba7591178b3589584a2c))
* TextField 코드리뷰 반영 ([3cb9cba](https://github.com/Bigtablet/bigtablet-design-system/commit/3cb9cba8f7a8e747a231f66827c9f767fdf4da7c))

## [2.2.1](https://github.com/Bigtablet/bigtablet-design-system/compare/v2.2.0...v2.2.1) (2026-04-17)


### Bug Fixes

* TextField fieldset/legend 구조 전환으로 label 배경색 제거 ([724bd1a](https://github.com/Bigtablet/bigtablet-design-system/commit/724bd1a65226966a59ccbe62bc10813ece152408))

# [2.2.0](https://github.com/Bigtablet/bigtablet-design-system/compare/v2.1.0...v2.2.0) (2026-04-17)


### Bug Fixes

* apply paste handler to all OTP inputs and redirect focus to first empty box ([f1c48d7](https://github.com/Bigtablet/bigtablet-design-system/commit/f1c48d76bbdd636a350d1b9c5a8d64aa93525422))


### Features

* add size prop to TextField and use CSS variable for surface color ([4868811](https://github.com/Bigtablet/bigtablet-design-system/commit/4868811c90373d9b5379c3c6ebb5daef08ddafca)), closes [#fff](https://github.com/Bigtablet/bigtablet-design-system/issues/fff)
* redesign Select label to floating style and align height with TextField ([15ca34c](https://github.com/Bigtablet/bigtablet-design-system/commit/15ca34ca4d107afed614f0699434124c2bdb6216))

# [2.1.0](https://github.com/Bigtablet/bigtablet-design-system/compare/v2.0.7...v2.1.0) (2026-04-16)


### Bug Fixes

* remove opacity from disabled OtpInput, use text color token instead ([6f7a498](https://github.com/Bigtablet/bigtablet-design-system/commit/6f7a4982ad3547e38c6c651333fb5b41b0e08c41))
* use text/body color for disabled OtpInput per Figma spec ([a6c060a](https://github.com/Bigtablet/bigtablet-design-system/commit/a6c060a75efaad51e3b2b1951d780ae3a675fe67))


### Features

* add OtpInput component per Figma spec ([fce5540](https://github.com/Bigtablet/bigtablet-design-system/commit/fce5540c68bce4a999177b8b6da558650a81c4e9))

## [2.0.7](https://github.com/Bigtablet/bigtablet-design-system/compare/v2.0.6...v2.0.7) (2026-04-15)


### Bug Fixes

* correct Toggle thumb sizes and remove border in disabled state ([09163a5](https://github.com/Bigtablet/bigtablet-design-system/commit/09163a54bdd87a4b5a6beeeefa9b2559445a5456))
* ensure disabled state overrides on-state via compound selector ([6d8973b](https://github.com/Bigtablet/bigtablet-design-system/commit/6d8973b4cce6c2389ec77c6e88c66429ad20bcf9))
* rename switch folder and files to toggle ([cb8db54](https://github.com/Bigtablet/bigtablet-design-system/commit/cb8db547bffbb643773906baacca6a69120ca57b))
* rename Switch to Toggle and reduce sizes to sm/md ([7864b1f](https://github.com/Bigtablet/bigtablet-design-system/commit/7864b1faa6685df4576046e8fa810701629258ea))
* rename vanilla Switch to Toggle and update sizes ([3b6fe83](https://github.com/Bigtablet/bigtablet-design-system/commit/3b6fe83e74650887a23ca8490d920f23804ca004))
* update Toggle disabled state to use explicit #B3B3B3 background ([e7ccdca](https://github.com/Bigtablet/bigtablet-design-system/commit/e7ccdca177fa147822dbc48f5ce35a69069e7c04)), closes [#B3B3B3](https://github.com/Bigtablet/bigtablet-design-system/issues/B3B3B3) [#B3B3B3](https://github.com/Bigtablet/bigtablet-design-system/issues/B3B3B3)
* update Toggle OFF state background to #B3B3B3 per Figma spec ([a04003b](https://github.com/Bigtablet/bigtablet-design-system/commit/a04003b058f91eea6822328942786939ea8b129a)), closes [#B3B3B3](https://github.com/Bigtablet/bigtablet-design-system/issues/B3B3B3) [#F4F4F4](https://github.com/Bigtablet/bigtablet-design-system/issues/F4F4F4) [#B3B3B3](https://github.com/Bigtablet/bigtablet-design-system/issues/B3B3B3)

## [2.0.6](https://github.com/Bigtablet/bigtablet-design-system/compare/v2.0.5...v2.0.6) (2026-04-11)


### Bug Fixes

* update token import ([025f397](https://github.com/Bigtablet/bigtablet-design-system/commit/025f3974b1ff714ededb4fa55fe6a7801c419d5a))

## [2.0.5](https://github.com/Bigtablet/bigtablet-design-system/compare/v2.0.4...v2.0.5) (2026-04-10)


### Bug Fixes

* use relative paths for Storybook logo and favicon ([ac2c2fa](https://github.com/Bigtablet/bigtablet-design-system/commit/ac2c2fa00f2de31e4e50b8cf1a4b03a3cf837288))

## [2.0.4](https://github.com/Bigtablet/bigtablet-design-system/compare/v2.0.3...v2.0.4) (2026-04-10)

## [2.0.3](https://github.com/Bigtablet/bigtablet-design-system/compare/v2.0.2...v2.0.3) (2026-04-10)


### Bug Fixes

* add full-area state layer to chip_trailing X button ([628ff7f](https://github.com/Bigtablet/bigtablet-design-system/commit/628ff7fc9ab87c9f5e184d6ce755cb1c4b055c4a))
* chip_trailing X button full-area state layer on hover ([95e9ce8](https://github.com/Bigtablet/bigtablet-design-system/commit/95e9ce8d69fcc0f83c22af4cef5182410e7e143a))
* eliminate double state layer overlap on Chip active/pressed ([6d264d4](https://github.com/Bigtablet/bigtablet-design-system/commit/6d264d4dc67f22dfa5ae7b2622c2ee04b9541d97))
* move hover state layer from chip_content to chip container ([ef862e1](https://github.com/Bigtablet/bigtablet-design-system/commit/ef862e1145d299271461fc161bfabac3d5d8585f))
* refactor Chip hover zones — split content into separate buttons ([a8691da](https://github.com/Bigtablet/bigtablet-design-system/commit/a8691da8cfb5977eae28bf1aca9db47782a67794))
* revert Chip to single-button structure with smart icon hover toggle ([395c79c](https://github.com/Bigtablet/bigtablet-design-system/commit/395c79c59be26b0f4c045af2a8d570c0693b3037))
* revert chip_trailing to icon-only circular hover for consistency ([7512e9a](https://github.com/Bigtablet/bigtablet-design-system/commit/7512e9aad5f02aca5b49111be617648b5264f68e))
* simplify chip_trailing hover — full state layer only, no icon toggle ([88c9432](https://github.com/Bigtablet/bigtablet-design-system/commit/88c943264658645ffe932639571ef489f5d17f9c))
* unify chip_trailing hover with other icons — circular only ([a7e99aa](https://github.com/Bigtablet/bigtablet-design-system/commit/a7e99aa95a9b2ab6d0c6f9022476120409370504))
* zone-based hover for Chip — each icon/label area highlights independently ([3d5da7e](https://github.com/Bigtablet/bigtablet-design-system/commit/3d5da7ea693e6f67696b92b1fd7b9a5a699fe6df))

## [2.0.2](https://github.com/Bigtablet/bigtablet-design-system/compare/v2.0.1...v2.0.2) (2026-04-10)


### Bug Fixes

* fix chip double action and double hover, scope icon circular hover to trailing button only ([38fcdf0](https://github.com/Bigtablet/bigtablet-design-system/commit/38fcdf03f91e97bf7b1609633ef83f79ef673f81))
* fix Spinner animation, add hover effect to chip_icon ([e1320f4](https://github.com/Bigtablet/bigtablet-design-system/commit/e1320f4267a7917fcdc2b6109cb7e770a907c95a))
* restore Chip trailing hover, widen left padding, add removable interactive story ([0456c78](https://github.com/Bigtablet/bigtablet-design-system/commit/0456c782d5e118f342d7e08896b17e917fc9d2df))

## [2.0.1](https://github.com/Bigtablet/bigtablet-design-system/compare/v2.0.0...v2.0.1) (2026-04-10)


### Bug Fixes

* reset version to 2.0.0 for 2.0.1 patch release ([6c093ff](https://github.com/Bigtablet/bigtablet-design-system/commit/6c093ff6544423636eb3c1d86a01c9e845e1d57d))

# [2.0.1](https://github.com/Bigtablet/bigtablet-design-system/compare/v2.0.0...v2.0.1) (2026-04-10)


### Bug Fixes

* add chip aria attrs, textfield clearable story, tokenize borders, replace inset shorthand ([2f1f62c](https://github.com/Bigtablet/bigtablet-design-system/commit/2f1f62cffbd947e177fbac15f978be5f10c53449))
* add equal right padding to ListItem state layer ([df5cf8b](https://github.com/Bigtablet/bigtablet-design-system/commit/df5cf8bc5907cbccbfb0083ba7470e713a6f9783))
* align toast icon to text baseline, add clearable prop to TextField ([39f6f9e](https://github.com/Bigtablet/bigtablet-design-system/commit/39f6f9e717f3594f5977896c966218b95d354b7d))
* improve Chip aria-expanded and TextField clear button accessibility ([6dfc7bf](https://github.com/Bigtablet/bigtablet-design-system/commit/6dfc7bf3012f5c423c593bbb39aba00418c04cc9))
* make entire Chip clickable, move filter chevron into content button ([1e2505e](https://github.com/Bigtablet/bigtablet-design-system/commit/1e2505e31a2ac7c275e9d80250951fa38a475126))
* use Icon component for TextField clear button, increase size-limit for icon data ([de8bff9](https://github.com/Bigtablet/bigtablet-design-system/commit/de8bff98db959724f978447c3d9931ca0a702dd0))
* use inset + margin auto for Radio ::after centering ([3ea8880](https://github.com/Bigtablet/bigtablet-design-system/commit/3ea8880bd807bfc9d1e43ec485580dc9659cfc80))
* use whole-pixel inner dot sizes for Radio, fix Icon story invalid name ([b9d864f](https://github.com/Bigtablet/bigtablet-design-system/commit/b9d864fe9597c022dadbb25b8389860230f89cd2))


### Features

* add Icon component with 57 Material Symbols icons ([7a2ef79](https://github.com/Bigtablet/bigtablet-design-system/commit/7a2ef79a3fd1683e78e07fd2b6a4eba5d4b0e8fd))

# [2.0.0](https://github.com/Bigtablet/bigtablet-design-system/compare/v1.24.2...v2.0.0) (2026-04-10)


### Bug Fixes

* add breaking change rule to semantic-release config ([811dc56](https://github.com/Bigtablet/bigtablet-design-system/commit/811dc561ab87320e95e469ae20a6610a7522e607))
* add state layer to Radio for hover/focus/pressed feedback ([340d2c4](https://github.com/Bigtablet/bigtablet-design-system/commit/340d2c45de5e9e42740e3b61dc8fddb4ddf587c1))
* address code review — a11y and default prop issues ([77c873c](https://github.com/Bigtablet/bigtablet-design-system/commit/77c873c99666cf05410b70027b866d3eb24046cf))
* address code review issues and update text.body to neutral-500 ([d8591e8](https://github.com/Bigtablet/bigtablet-design-system/commit/d8591e80c9988eab3708b1124fd7bb7ef1c9ec37)), closes [#666666](https://github.com/Bigtablet/bigtablet-design-system/issues/666666) [#888888](https://github.com/Bigtablet/bigtablet-design-system/issues/888888)
* align color tokens with Figma and rename helperText to supportingText ([a88dc9e](https://github.com/Bigtablet/bigtablet-design-system/commit/a88dc9e26161474bf97e475e9877d5f63dce8e94)), closes [#EF4444](https://github.com/Bigtablet/bigtablet-design-system/issues/EF4444) [#CC0000](https://github.com/Bigtablet/bigtablet-design-system/issues/CC0000) [#F2F2F2](https://github.com/Bigtablet/bigtablet-design-system/issues/F2F2F2)
* align existing components with design token system ([5b0f695](https://github.com/Bigtablet/bigtablet-design-system/commit/5b0f6959fc2f8e16fca056583baba0c7b480a85e))
* allow button label to wrap on long text, add headingAs select control to Card ([72d6a61](https://github.com/Bigtablet/bigtablet-design-system/commit/72d6a61d37919e2ff2711d2fffc73d40c3a0d32e))
* apply code review feedback — use warning token, guard month range ([8a04139](https://github.com/Bigtablet/bigtablet-design-system/commit/8a041394646d5b3dde40792b2b05006f4b279ed7))
* apply code review feedback on manager-head and TextField ([efcd009](https://github.com/Bigtablet/bigtablet-design-system/commit/efcd009eb14f29928a6253ec741b6be206de25b3))
* complete token alignment, rename helperText, add missing tests ([0dac392](https://github.com/Bigtablet/bigtablet-design-system/commit/0dac392fcfcab652de189d2b288222009390efc1)), closes [#888](https://github.com/Bigtablet/bigtablet-design-system/issues/888) [#666](https://github.com/Bigtablet/bigtablet-design-system/issues/666)
* darken success/info status colors for WCAG AA compliance ([5af63bf](https://github.com/Bigtablet/bigtablet-design-system/commit/5af63bf489adb5442c3500f22e91052f109e88b3)), closes [#10B981](https://github.com/Bigtablet/bigtablet-design-system/issues/10B981) [#047857](https://github.com/Bigtablet/bigtablet-design-system/issues/047857) [#3B82F6](https://github.com/Bigtablet/bigtablet-design-system/issues/3B82F6) [#2563EB](https://github.com/Bigtablet/bigtablet-design-system/issues/2563EB)
* export all Props types, remove dead next.ts bundle, fix index.ts categories ([dfe9c7e](https://github.com/Bigtablet/bigtablet-design-system/commit/dfe9c7ef28b168344df2cf8cf9e2929f6ac6e388))
* optimize DatePicker with memoization, type safety, and auto-correction ([cdd8811](https://github.com/Bigtablet/bigtablet-design-system/commit/cdd8811014a570241a5b648dad7cfc65ba9c315e))
* redesign Switch to MD3 pattern, fix OFF contrast and disabled state ([7d71e73](https://github.com/Bigtablet/bigtablet-design-system/commit/7d71e733442e5ab1d69bc42e2e3c7fe92ea5faff))
* reduce Storybook viewport heights to avoid scrolling ([7cd8e6b](https://github.com/Bigtablet/bigtablet-design-system/commit/7cd8e6ba8c32374a67ef0a7c2f7f3ab6284a6564))
* reduce toast item size on mobile for compact appearance ([23b1c95](https://github.com/Bigtablet/bigtablet-design-system/commit/23b1c9570ddc5e1ec4c17573b613a2c0b63aadf8))
* restore exitOnceUploaded for PR Chromatic checks ([55de0f4](https://github.com/Bigtablet/bigtablet-design-system/commit/55de0f4701b99138386f6a46102fade4e60cde42))
* revert a11y test to "todo" (valid value) ([8428970](https://github.com/Bigtablet/bigtablet-design-system/commit/8428970aaae63ad46a27d4613b473c1746cc83c3))
* skip z-index story from vitest to prevent React hooks teardown error in CI ([b4278f4](https://github.com/Bigtablet/bigtablet-design-system/commit/b4278f4ae76a1e3c5d2a7bc6226d8716091b9f42))
* sync color tokens with tokens.json (status, alpha, border, state) ([480e6fd](https://github.com/Bigtablet/bigtablet-design-system/commit/480e6fd419a7730506186579b5fa03338e085121))
* use Storybook 10 globals API for viewport auto-switching ([16514cd](https://github.com/Bigtablet/bigtablet-design-system/commit/16514cda64fca80eb2f678f51e50cbd9732bc44a))


### Features

* add automated a11y testing with axe-core in CI ([c279984](https://github.com/Bigtablet/bigtablet-design-system/commit/c279984bb1e1f16d303cb8fc261730f5a18e04b2)), closes [#6B6B6B](https://github.com/Bigtablet/bigtablet-design-system/issues/6B6B6B)
* add Guide section to Storybook ([a11e97d](https://github.com/Bigtablet/bigtablet-design-system/commit/a11e97ddb2894c91b2b6aa804baec8fd8a5d7e3c))
* add missing SCSS design tokens and update token structure ([4856e6a](https://github.com/Bigtablet/bigtablet-design-system/commit/4856e6a1908a668fe79544f4129b404c46803651))
* add mobile responsive layout to Toast component ([f541e91](https://github.com/Bigtablet/bigtablet-design-system/commit/f541e91724c3cfda04035a31338cc62a3e24d951))
* add new components — IconButton, Chip, FAB, Divider, LinearProgress, ListItem ([9df667d](https://github.com/Bigtablet/bigtablet-design-system/commit/9df667d0e95b368f0107ec6e3ca66badffd901b0))
* add radius token prop to Button, add preview prop to FileInput ([86c474f](https://github.com/Bigtablet/bigtablet-design-system/commit/86c474f4d0fddf22ef9bbd6bc074adac69bf4c00))
* add Thin(100) to Black(900) font weight base tokens ([bf7a90b](https://github.com/Bigtablet/bigtablet-design-system/commit/bf7a90bc4a1f74ea472125f4e425a94e2222839e))
* renew Button component to match Figma DS ([5f87dc4](https://github.com/Bigtablet/bigtablet-design-system/commit/5f87dc4274ac1517f69b4748a5a8a676a09cda26))
* renew Checkbox component to match Figma DS ([c74ad2d](https://github.com/Bigtablet/bigtablet-design-system/commit/c74ad2dae9173e68f711dcdf1006cc8d6db76e19))
* TextField 리뉴얼 — Figma DS 기준 outlined + floating label ([2f37d06](https://github.com/Bigtablet/bigtablet-design-system/commit/2f37d06ba22a0f30c08c5a665f68ad63601817a3)), closes [#185](https://github.com/Bigtablet/bigtablet-design-system/issues/185)
* trigger v2.0.0 major release ([f55a240](https://github.com/Bigtablet/bigtablet-design-system/commit/f55a240fe8932b31aad62f5ce63097e1e2db36c3))
* v2.0.0 major release ([498f3cd](https://github.com/Bigtablet/bigtablet-design-system/commit/498f3cdc81e1cd9fcd1e83b3fe010bed7594a2d6))


### BREAKING CHANGES

* helperText renamed to supportingText in TextField. src/styles restructured to domain-based architecture — import paths changed. src/ui directory flattened — import paths changed. Button, TextField, Checkbox APIs fully renewed.
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
* helperText renamed to supportingText in TextField. src/styles restructured to domain-based architecture — import paths changed. src/ui directory flattened — import paths changed. Button, TextField, Checkbox APIs fully renewed.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>

# [1.24.2](https://github.com/Bigtablet/bigtablet-design-system/compare/v1.24.1...v1.24.2) (2026-04-08)


### Bug Fixes

* restore exitOnceUploaded for PR Chromatic checks ([55de0f4](https://github.com/Bigtablet/bigtablet-design-system/commit/55de0f4701b99138386f6a46102fade4e60cde42))


# [1.24.1](https://github.com/Bigtablet/bigtablet-design-system/compare/v1.24.0...v1.24.1) (2026-04-03)


### Bug Fixes

* revert a11y test to "todo" (valid value) ([8428970](https://github.com/Bigtablet/bigtablet-design-system/commit/8428970aaae63ad46a27d4613b473c1746cc83c3))
* skip z-index story from vitest to prevent React hooks teardown error in CI ([b4278f4](https://github.com/Bigtablet/bigtablet-design-system/commit/b4278f4ae76a1e3c5d2a7bc6226d8716091b9f42))
* use Storybook 10 globals API for viewport auto-switching ([16514cd](https://github.com/Bigtablet/bigtablet-design-system/commit/16514cda64fca80eb2f678f51e50cbd9732bc44a))


# [1.24.0](https://github.com/Bigtablet/bigtablet-design-system/compare/v1.23.0...v1.24.0) (2026-04-02)


### Features

* add automated a11y testing with axe-core in CI ([c279984](https://github.com/Bigtablet/bigtablet-design-system/commit/c279984bb1e1f16d303cb8fc261730f5a18e04b2))
