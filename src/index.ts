// Theme CSS custom properties (:root + [data-theme="dark"]).
// 컴포넌트 번들(dist/index.css = style.css)에 1회 포함시킨다.
// scss/token 진입점에서 분리되어 있어 소비자 module.scss 로는 새지 않는다.
import "./styles/theme.scss";
// 자동완성(autofill) 칸의 UA 배경/글자색 무력화 - 전역 요소 규칙이라 theme.scss 와 분리.
import "./styles/autofill.scss";
// 문장 속 링크(`.text_link`) - UI 텍스트용. Prose 는 마크다운 본문에만 적용되므로 그 밖의
// 라벨·설명 안 링크가 갈 곳이 없었다. 값은 Prose 와 같은 믹스인을 공유한다.
import "./styles/link.scss";

// Hooks / Utils

export { cn, useFocusTrap, useReducedMotion, useSpringHover, useSpringPresence } from "./utils";
export type {
	ListboxItem,
	UseListboxPopupArgs,
	UseListboxPopupResult,
} from "./utils/use-listbox-popup";
export { useListboxPopup } from "./utils/use-listbox-popup";

// New primitives (v3.0)

export type { AccordionItem, AccordionProps } from "./ui/display/accordion";
export { Accordion } from "./ui/display/accordion";
export type { AvatarProps, AvatarShape, AvatarSize } from "./ui/display/avatar";
export { Avatar } from "./ui/display/avatar";
export type {
	BadgeAppearance,
	BadgeProps,
	BadgeShape,
	BadgeSize,
	BadgeVariant,
} from "./ui/display/badge";
export { Badge } from "./ui/display/badge";
export type {
	DescriptionListItem,
	DescriptionListLayout,
	DescriptionListProps,
} from "./ui/display/description-list";
export { DescriptionList } from "./ui/display/description-list";
export type { StatDeltaTone, StatProps } from "./ui/display/stat";
export { Stat } from "./ui/display/stat";
export type { TimelineItem, TimelineProps, TimelineStatus } from "./ui/display/timeline";
export { Timeline } from "./ui/display/timeline";
export type { EmptyStateProps } from "./ui/feedback/empty-state";
export { EmptyState } from "./ui/feedback/empty-state";
export type { ErrorStateProps, ErrorStateVariant } from "./ui/feedback/error-state";
export { ErrorState } from "./ui/feedback/error-state";
export type { BottomNavItemProps, BottomNavProps } from "./ui/navigation/bottom-nav";
export { BottomNav, BottomNavItem, BottomNavSpacer } from "./ui/navigation/bottom-nav";
export type { BreadcrumbItem, BreadcrumbProps } from "./ui/navigation/breadcrumb";
export { Breadcrumb } from "./ui/navigation/breadcrumb";
export type { MenuItem, MenuProps } from "./ui/navigation/menu";
export { Menu } from "./ui/navigation/menu";
export type {
	NavBarLayout,
	NavBarLocaleConfig,
	NavBarLocaleOption,
	NavBarProps,
	NavBarVariant,
	NavLinkProps,
} from "./ui/navigation/nav-bar";
export { NavBar, NavLink } from "./ui/navigation/nav-bar";
export type {
	SidebarItemProps,
	SidebarMode,
	SidebarProps,
	SidebarSectionProps,
} from "./ui/navigation/sidebar";
export { Sidebar, SidebarItem, SidebarSection } from "./ui/navigation/sidebar";
export type {
	TabListProps,
	TabPanelProps,
	TabProps,
	TabsProps,
	TabsSize,
	TabsVariant,
} from "./ui/navigation/tabs";
export { Tab, TabList, TabPanel, Tabs } from "./ui/navigation/tabs";
export type { PopoverPlacement, PopoverProps } from "./ui/overlay/popover";
export { Popover } from "./ui/overlay/popover";
export type { TooltipPlacement, TooltipProps } from "./ui/overlay/tooltip";
export { Tooltip } from "./ui/overlay/tooltip";

// Design Tokens

export { a11y } from "./styles/a11y";
export { baseBorderWidth, borderWidth } from "./styles/border-width";
export { breakpoints } from "./styles/breakpoints";
export { baseColors, colors } from "./styles/colors";
export { elevation } from "./styles/elevation";
export { iconSize } from "./styles/icon";
export { motion } from "./styles/motion";
export { opacity } from "./styles/opacity";
export { radius } from "./styles/radius";
export { skeleton } from "./styles/skeleton";
export { spacing } from "./styles/spacing";
export { baseTypography, typography } from "./styles/typography";
export { zIndex } from "./styles/z-index";

// Components

export type { CardFooterAlign, CardProps, CardVariant } from "./ui/display/card";
export { Card } from "./ui/display/card";
export type { ChipProps, ChipSize, ChipTone, ChipType } from "./ui/display/chip";
export { Chip } from "./ui/display/chip";
export type {
	DataViewPagination,
	DataViewProps,
	DataViewQuery,
	DataViewSelectionAction,
	DataViewToolbar,
} from "./ui/display/data-view";
export { DataView } from "./ui/display/data-view";
export type { DividerProps } from "./ui/display/divider";
export { Divider } from "./ui/display/divider";
export type { HeroAction, HeroAlign, HeroHeight, HeroOverlay, HeroProps } from "./ui/display/hero";
export { Hero } from "./ui/display/hero";
export type { IconProps, LucideIcon, LucideProps } from "./ui/display/icon";
export { Icon } from "./ui/display/icon";
export type { ListItemProps } from "./ui/display/list-item";
export { ListItem } from "./ui/display/list-item";
export type {
	MediaCardImage,
	MediaCardImagePosition,
	MediaCardProps,
	MediaCardShadow,
} from "./ui/display/media-card";
export { MediaCard } from "./ui/display/media-card";
export type { ProseProps, ProseSize } from "./ui/display/prose";
export { Prose } from "./ui/display/prose";
export type {
	TableColumn,
	TableProps,
	TableSize,
	TableSort,
	TableSortDirection,
} from "./ui/display/table";
export { Table } from "./ui/display/table";
export type { AlertActionsAlign, AlertOptions, AlertVariant } from "./ui/feedback/alert";
export { AlertProvider, useAlert } from "./ui/feedback/alert";
export type { LinearProgressProps } from "./ui/feedback/linear-progress";
export { LinearProgress } from "./ui/feedback/linear-progress";
export type { SkeletonProps, SkeletonVariant } from "./ui/feedback/skeleton";
export { Skeleton } from "./ui/feedback/skeleton";
export type { SpinnerProps } from "./ui/feedback/spinner";
export { Spinner } from "./ui/feedback/spinner";
export type { ToastProviderProps, ToastVariant } from "./ui/feedback/toast";
export { ToastProvider } from "./ui/feedback/toast";
export { useToast } from "./ui/feedback/toast/use-toast";
export type { TopLoadingProps } from "./ui/feedback/top-loading";
export { TopLoading } from "./ui/feedback/top-loading";
export type { CheckboxProps } from "./ui/forms/checkbox";
export { Checkbox } from "./ui/forms/checkbox";
export type { ComboboxOption, ComboboxProps, ComboboxSize } from "./ui/forms/combobox";
export { Combobox } from "./ui/forms/combobox";
export type { DatePickerProps } from "./ui/forms/date-picker";
export { DatePicker } from "./ui/forms/date-picker";
export type { DateRange, DateRangePickerProps } from "./ui/forms/date-range-picker";
export { DateRangePicker } from "./ui/forms/date-range-picker";
export type {
	DropdownMultipleProps,
	DropdownOption,
	DropdownProps,
	DropdownSingleProps,
	DropdownSize,
	DropdownVariant,
} from "./ui/forms/dropdown";
export { Dropdown } from "./ui/forms/dropdown";
export type { FieldControl, FieldProps } from "./ui/forms/field";
export { Field, useFieldControl } from "./ui/forms/field";
export type { FileInputProps, FileInputVariant } from "./ui/forms/file";
export { FileInput } from "./ui/forms/file";
export type { FormActionsProps, FormProps } from "./ui/forms/form";
export { Form } from "./ui/forms/form";
export type {
	CropImageSize,
	CropOffset,
	CropRect,
	ImageCropperHandle,
	ImageCropperProps,
} from "./ui/forms/image-cropper";
export { ImageCropper } from "./ui/forms/image-cropper";
export type { OtpInputProps } from "./ui/forms/otp-input";
export { OtpInput } from "./ui/forms/otp-input";
export type { RadioProps } from "./ui/forms/radio";
export { Radio } from "./ui/forms/radio";
export type {
	RadioGroupContextValue,
	RadioGroupOrientation,
	RadioGroupProps,
	RadioGroupSize,
} from "./ui/forms/radio-group";
export { RadioGroup, useRadioGroupContext } from "./ui/forms/radio-group";
export type { TagInputProps, TagInputSize } from "./ui/forms/tag-input";
export { TagInput } from "./ui/forms/tag-input";
export type {
	TextareaProps,
	TextareaResize,
	TextareaSize,
} from "./ui/forms/textarea";
export { Textarea } from "./ui/forms/textarea";
export type {
	ImeStrategy,
	TextFieldProps,
	TextFieldSize,
	TextFieldVariant,
} from "./ui/forms/textfield";
export { TextField } from "./ui/forms/textfield";
export type { TimePickerProps } from "./ui/forms/time-picker";
export { TimePicker } from "./ui/forms/time-picker";
export type { ToggleProps } from "./ui/forms/toggle";
export { Toggle } from "./ui/forms/toggle";
export type {
	ButtonAsAnchor,
	ButtonAsButton,
	ButtonProps,
	ButtonSize,
	ButtonVariant,
} from "./ui/general/button";
export { Button } from "./ui/general/button";
export type { IconButtonProps, IconButtonSize, IconButtonVariant } from "./ui/general/icon-button";
export { IconButton } from "./ui/general/icon-button";
export type { PaginationProps } from "./ui/navigation/pagination";
export { Pagination } from "./ui/navigation/pagination";
export type { DrawerPlacement, DrawerProps } from "./ui/overlay/drawer";
export { Drawer } from "./ui/overlay/drawer";
export type { ModalFooterAlign, ModalProps } from "./ui/overlay/modal";
export { Modal } from "./ui/overlay/modal";
export type {
	LocaleKey,
	LocaleMessages,
	LocaleName,
	LocaleProviderProps,
	LocaleText,
} from "./ui/system/locale-provider";
export {
	catalogs,
	en,
	ko,
	LocaleProvider,
	useLocaleName,
	useLocaleText,
} from "./ui/system/locale-provider";
export type { ResolvedTheme, ThemeMode, ThemeProviderProps } from "./ui/system/theme-provider";
export { ThemeProvider, useTheme } from "./ui/system/theme-provider";

// Layout Primitives (v3.0)

export type { AppShellProps } from "./ui/layout/app-shell";
export { AppShell } from "./ui/layout/app-shell";
export type { ContainerProps, ContainerSize } from "./ui/layout/container";
export { Container } from "./ui/layout/container";
export type { GridCols, GridGap, GridProps } from "./ui/layout/grid";
export { Grid } from "./ui/layout/grid";
export type { PageHeaderProps } from "./ui/layout/page-header";
export { PageHeader } from "./ui/layout/page-header";
export type { SectionBg, SectionProps, SectionSpacing } from "./ui/layout/section";
export { Section } from "./ui/layout/section";
export type {
	StackAlign,
	StackDirection,
	StackGap,
	StackJustify,
	StackProps,
	StackWrap,
} from "./ui/layout/stack";
export { Stack } from "./ui/layout/stack";
