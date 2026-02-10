# Design System Guide

디자인 시스템, SCSS 토큰, 컴포넌트 가이드라인입니다.

## Styling

| Item | Rule |
| --- | --- |
| Styling | **SCSS-based** |
| Token source | `@bigtablet/design-system/scss/token` |
| Class naming | **snake_case** (e.g., `auth_main`, `email_button`) |
| Page/Component styles | `style.module.scss` |
| Import pattern | `@use "@bigtablet/design-system/scss/token" as token;` |

### SCSS Import Example

```scss
@use "@bigtablet/design-system/scss/token" as token;

.auth_main {
  @include token.flex_center;
  background-color: token.$color_background;
  padding: token.$spacing_xl;

  @include token.mobile {
    padding: token.$spacing_lg;
  }
}

.password_toggle {
  color: token.$color_text_tertiary;
  transition: color token.$transition_fast;

  &:hover {
    color: token.$color_text_secondary;
  }
}
```

## Available Tokens (from @bigtablet/design-system)

### Colors

- `$color_primary`, `$color_primary_hover`
- `$color_background`, `$color_background_secondary`, `$color_background_neutral`, `$color_background_muted`
- `$color_text_primary`, `$color_text_secondary`, `$color_text_tertiary`
- `$color_border`, `$color_border_light`
- `$color_success`, `$color_error`, `$color_warning`, `$color_info`
- `$color_overlay`

### Spacing

- `$spacing_xs` (4px) ~ `$spacing_8xl` (48px)

### Typography

- `$font_size_xs` ~ `$font_size_4xl`
- `$font_weight_thin` ~ `$font_weight_black`
- Mixins: `text_xs`, `text_sm`, `text_base`, `text_md`, `text_lg`, `text_xl`, `text_2xl`, `text_3xl`
- Mixins: `heading_1`, `heading_2`, `heading_3`, `body_regular`, `body_medium`, `caption`

### Layout Mixins

- `flex_center`, `flex_left`, `flex_right`, `flex_between`
- `flex_column`, `flex_column_center`, `flex_column_start`

### Responsive Mixins

- `mobile`, `tablet`, `laptop`, `desktop`

### Transitions

- `$transition_fast` (0.1s), `$transition_base` (0.2s), `$transition_slow` (0.3s)
- `$transition_emphasized`, `$transition_bounce`, `$transition_fade`, `$transition_slide`, `$transition_scale`, `$transition_state`

### Radius

- `$radius_sm` (6px), `$radius_md` (8px), `$radius_lg` (12px), `$radius_xl` (16px), `$radius_full`

### Shadows

- `$shadow_sm`, `$shadow_md`, `$shadow_lg`, `$shadow_xl`

### Skeleton Mixins

- `skeleton($width, $height, $radius)`, `skeleton_text`, `skeleton_title`, `skeleton_avatar($size)`, `skeleton_rect($width, $height)`

## Visual Direction

- Monochrome/neutral palette with minimal accents
- Soft, quiet surfaces with subtle borders
- Emphasis through weight and spacing, not color
- Light/dark mode support with semantic color roles

## Typography (Pretendard)

- **Weights:** 300/400/500/600/700
- **Sizes:** Display (57/45/36), Headline (32/28/24), Title (22/16/14), Body (16/14/12), Label (14/12/11)
- **Line heights:** 1.2 (tight), 1.4 (normal), 1.6 (relaxed)

## Spacing (4px Grid)

- **Scale:** 0, 2, 4, 8, 12, 16, 24, 32, 48, 64
- **Screen padding:** 16 (large: 24)
- **Section gap:** 24
- **Item gap:** 12
- **Card padding:** 16 (large: 24)

## Radii

- **Scale:** 0, 4, 8, 12, 16, 24, full
- **Defaults:** Button (12), Card (12), Input (8), Dialog (16), Chips (full or 8)

## Color Tokens (Light)

```
background: #FFFFFF          backgroundSecondary: #F5F5F5
surface: #FFFFFF             surfaceVariant: #F8F8F8
textPrimary: #1A1A1A         textSecondary: #666666
textTertiary: #999999        textDisabled: #BDBDBD
border: #E0E0E0              borderStrong: #BDBDBD
borderFocused: #1A1A1A       hover: #0A000000
feedbackError: #D32F2F       feedbackSuccess: #388E3C
feedbackWarning: #F57C00     feedbackInfo: #1976D2
```

## Color Tokens (Dark)

```
background: #121212          backgroundSecondary: #1E1E1E
surface: #1E1E1E             surfaceVariant: #2C2C2C
textPrimary: #E0E0E0         textSecondary: #A0A0A0
textTertiary: #757575        textDisabled: #4A4A4A
border: #3D3D3D              borderStrong: #525252
borderFocused: #E0E0E0       hover: #14FFFFFF
feedbackError: #EF5350       feedbackSuccess: #66BB6A
feedbackWarning: #FFA726     feedbackInfo: #42A5F5
```

## Component Guidelines

### Buttons

- **Variants:** primary (filled), secondary (outlined), tertiary (text)
- **Sizes:** small/medium/large with proportional padding
- Loading state: 20px spinner

### Text Field

- Filled style with surfaceVariant background
- Label above input; focus border 2px borderFocused
- Error shows red text and border

### Cards

- 1px border, 12 radius, optional elevation
- Default padding 16 (large 24)
- Use for list items and info panels

### Chips

- **Filter:** pill shape, label + value, optional delete
- **Selection:** 8 radius, filled when selected
- **Action:** 8 radius, surfaceVariant background

### Tables (Admin)

- Wrap in card; row separators use border color
- Row padding 12-16; status column uses pill badge pattern

### Dashboard KPIs

- Card with title (titleMedium) and value (titleLarge/headlineSmall)
- Use tabular figures for numbers

## Responsive Design

### Breakpoints

- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

### SCSS Mixins

```scss
@mixin mobile { @media (max-width: 639px) { @content; } }
@mixin tablet { @media (min-width: 640px) and (max-width: 1023px) { @content; } }
@mixin desktop { @media (min-width: 1024px) { @content; } }
@mixin tablet-up { @media (min-width: 640px) { @content; } }
@mixin desktop-up { @media (min-width: 1024px) { @content; } }
```

### Responsive Patterns

- **Mobile-first:** Base styles for mobile, enhance with breakpoint mixins
- **Screen padding:** 16px (mobile) → 24px (tablet) → 32px (desktop)
- **Grid columns:** 1 (mobile) → 2 (tablet) → 3-4 (desktop)
- **Navigation:** Bottom nav (mobile) → Sidebar (tablet/desktop)
- **Tables:** Card list (mobile) → Full table (tablet-up)
- **Typography scale:** Reduce display/headline sizes on mobile

### Component Adaptations

- **Cards:** Full width on mobile, grid layout on larger screens
- **Dialogs:** Full screen (mobile) → Centered modal (tablet-up)
- **Forms:** Single column (mobile) → Multi-column (desktop)
- **Sidebar:** Hidden with hamburger (mobile) → Visible (desktop)
- **KPI tiles:** Stack vertically (mobile) → Grid (tablet-up)

## Layout Patterns

- **App bar:** Centered title, minimal actions
- **Lists:** Vertical cards with 12px separator, 16px horizontal padding
- **Empty states:** Centered icon (48px), short message, secondary action
- **Loading:** Centered spinner; inline small spinners in buttons/cards
- **Status badge:** Pill with icon + text using feedback colors

## Interaction States

- **Focus ring:** borderFocused, 2px
- **Hover/pressed:** Use semantic hover/pressed tokens
- Maintain accessibility with visible focus indicators

## Localization

- **Default:** Korean
- **Supported:** English
- Leave room for longer strings; avoid fixed-width labels
