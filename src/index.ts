// Hooks / Utils

export { cn, useFocusTrap, useSpringHover, useSpringPresence } from "./utils";

// New primitives (v3.0)

export type { AccordionItem, AccordionProps } from "./ui/display/accordion";
export { Accordion } from "./ui/display/accordion";
export type { AvatarProps, AvatarShape, AvatarSize } from "./ui/display/avatar";
export { Avatar } from "./ui/display/avatar";
export type { BadgeProps, BadgeShape, BadgeSize, BadgeVariant } from "./ui/display/badge";
export { Badge } from "./ui/display/badge";
export type { BottomNavItemProps, BottomNavProps } from "./ui/navigation/bottom-nav";
export { BottomNav, BottomNavItem, BottomNavSpacer } from "./ui/navigation/bottom-nav";
export type { BreadcrumbItem, BreadcrumbProps } from "./ui/navigation/breadcrumb";
export { Breadcrumb } from "./ui/navigation/breadcrumb";
export type { EmptyStateProps } from "./ui/feedback/empty-state";
export { EmptyState } from "./ui/feedback/empty-state";
export type { ErrorStateProps, ErrorStateVariant } from "./ui/feedback/error-state";
export { ErrorState } from "./ui/feedback/error-state";
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
export { motion } from "./styles/motion";
export { opacity } from "./styles/opacity";
export { radius } from "./styles/radius";
export { skeleton } from "./styles/skeleton";
export { spacing } from "./styles/spacing";
export { baseTypography, typography } from "./styles/typography";
export { zIndex } from "./styles/z-index";

// Components

export { AlertProvider, useAlert } from "./ui/feedback/alert";
export type { ButtonProps } from "./ui/general/button";
export { Button } from "./ui/general/button";
export type { CardProps } from "./ui/display/card";
export { Card } from "./ui/display/card";
export type { CheckboxProps } from "./ui/forms/checkbox";
export { Checkbox } from "./ui/forms/checkbox";
export type { ChipProps, ChipSize, ChipTone, ChipType } from "./ui/display/chip";
export { Chip } from "./ui/display/chip";
export type { DatePickerProps } from "./ui/forms/date-picker";
export { DatePicker } from "./ui/forms/date-picker";
export type { DividerProps } from "./ui/display/divider";
export { Divider } from "./ui/display/divider";
export type { DropdownOption, DropdownProps, DropdownSize } from "./ui/forms/dropdown";
export { Dropdown } from "./ui/forms/dropdown";
export type { FileInputProps } from "./ui/forms/file";
export { FileInput } from "./ui/forms/file";
export type { HeroAction, HeroAlign, HeroHeight, HeroOverlay, HeroProps } from "./ui/display/hero";
export { Hero } from "./ui/display/hero";
export type { IconProps, LucideIcon, LucideProps } from "./ui/display/icon";
export { Icon } from "./ui/display/icon";
export type { IconButtonProps, IconButtonSize, IconButtonVariant } from "./ui/general/icon-button";
export { IconButton } from "./ui/general/icon-button";
export type { LinearProgressProps } from "./ui/feedback/linear-progress";
export { LinearProgress } from "./ui/feedback/linear-progress";
export type { ListItemProps } from "./ui/display/list-item";
export { ListItem } from "./ui/display/list-item";
export type {
	MediaCardImage,
	MediaCardImagePosition,
	MediaCardProps,
	MediaCardShadow,
} from "./ui/display/media-card";
export { MediaCard } from "./ui/display/media-card";
export type { ModalProps } from "./ui/overlay/modal";
export { Modal } from "./ui/overlay/modal";
export type { OtpInputProps } from "./ui/forms/otp-input";
export { OtpInput } from "./ui/forms/otp-input";
export type { PaginationProps } from "./ui/navigation/pagination";
export { Pagination } from "./ui/navigation/pagination";
export type { RadioProps } from "./ui/forms/radio";
export { Radio } from "./ui/forms/radio";
export type {
	RadioGroupOrientation,
	RadioGroupProps,
	RadioGroupSize,
} from "./ui/forms/radio-group";
export { RadioGroup } from "./ui/forms/radio-group";
export type { SkeletonProps, SkeletonVariant } from "./ui/feedback/skeleton";
export { Skeleton } from "./ui/feedback/skeleton";
export type { SpinnerProps } from "./ui/feedback/spinner";
export { Spinner } from "./ui/feedback/spinner";
export type { TableColumn, TableProps, TableSize } from "./ui/display/table";
export { Table } from "./ui/display/table";
export type { ResolvedTheme, ThemeMode, ThemeProviderProps } from "./ui/system/theme-provider";
export { ThemeProvider, useTheme } from "./ui/system/theme-provider";
export type { ImeStrategy, TextFieldProps, TextFieldSize } from "./ui/forms/textfield";
export { TextField } from "./ui/forms/textfield";
export type {
	TextareaProps,
	TextareaResize,
	TextareaSize,
} from "./ui/forms/textarea";
export { Textarea } from "./ui/forms/textarea";
export { ToastProvider } from "./ui/feedback/toast";
export { useToast } from "./ui/feedback/toast/use-toast";
export type { ToggleProps } from "./ui/forms/toggle";
export { Toggle } from "./ui/forms/toggle";
export type { TopLoadingProps } from "./ui/feedback/top-loading";
export { TopLoading } from "./ui/feedback/top-loading";

// Layout Primitives (v3.0)

export type { ContainerProps, ContainerSize } from "./ui/layout/container";
export { Container } from "./ui/layout/container";
export type { SectionBg, SectionProps, SectionSpacing } from "./ui/layout/section";
export { Section } from "./ui/layout/section";
export type { StackAlign, StackDirection, StackGap, StackJustify, StackProps, StackWrap } from "./ui/layout/stack";
export { Stack } from "./ui/layout/stack";
export type { GridCols, GridGap, GridProps } from "./ui/layout/grid";
export { Grid } from "./ui/layout/grid";
