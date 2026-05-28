/**
 * Merge CSS class names, filtering out falsy values.
 *
 * @example
 * joinClasses("base", isActive && "active", undefined) // "base active"
 */
export function joinClasses(
	...classes: Array<string | false | undefined | null>
): string {
	return classes.filter(Boolean).join(" ");
}
