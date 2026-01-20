/**
 * Utility function to conditionally join classNames together
 * @param classes - Array of class names or conditional class names
 * @returns Combined class string
 */
export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
