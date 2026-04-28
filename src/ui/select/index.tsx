"use client";

/**
 * @deprecated Select는 Dropdown으로 대체되었습니다. `Dropdown`, `DropdownProps`, `DropdownOption`을 사용하세요.
 * Select는 하위 호환성을 위해 유지되며 향후 제거될 수 있습니다.
 */

export {
	Dropdown as Select,
	type DropdownProps as SelectProps,
	type DropdownOption as SelectOption,
	type DropdownSize as SelectSize,
} from "../dropdown";
