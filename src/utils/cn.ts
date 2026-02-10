/**
 * Utility for combining class names
 * Filters out falsy values and joins with space
 *
 * @example
 * cn("btn", isActive && "btn--active", className)
 * // "btn btn--active custom-class"
 */
export const cn = (
    ...classes: (string | boolean | undefined | null)[]
): string => classes.filter(Boolean).join(" ");
