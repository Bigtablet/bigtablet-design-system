/**
 * ClassValue type for cn() utility
 * Supports strings, numbers, booleans, arrays, and conditional objects
 */
type ClassValue =
    | string
    | number
    | boolean
    | undefined
    | null
    | ClassValue[]
    | Record<string, boolean | undefined | null>;

/**
 * Utility for combining class names (clsx-like)
 * Filters out falsy values and joins with space
 *
 * @example
 * // String arguments
 * cn("btn", "btn--primary")
 * // "btn btn--primary"
 *
 * @example
 * // Conditional with boolean
 * cn("btn", isActive && "btn--active")
 * // "btn btn--active" (if isActive is true)
 *
 * @example
 * // Object syntax
 * cn("btn", { "btn--active": isActive, "btn--disabled": isDisabled })
 * // "btn btn--active" (if isActive is true, isDisabled is false)
 *
 * @example
 * // Array syntax
 * cn(["btn", "btn--primary"], className)
 * // "btn btn--primary custom-class"
 */
export const cn = (...classes: ClassValue[]): string => {
    const classNames: string[] = [];

    for (const item of classes) {
        if (!item) continue;

        if (typeof item === "string" || typeof item === "number") {
            classNames.push(String(item));
        } else if (Array.isArray(item)) {
            const nested = cn(...item);
            if (nested) {
                classNames.push(nested);
            }
        } else if (typeof item === "object") {
            for (const key in item) {
                if (Object.prototype.hasOwnProperty.call(item, key) && item[key]) {
                    classNames.push(key);
                }
            }
        }
    }

    return classNames.join(" ");
};
