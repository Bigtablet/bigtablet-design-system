# [2.1.0](https://github.com/Bigtablet/bigtablet-design-system/compare/v2.0.0...v2.1.0) (2026-04-10)


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
