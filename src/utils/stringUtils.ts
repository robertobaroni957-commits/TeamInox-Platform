/**
 * Safely converts an input to a string, ensuring no runtime errors occur during string manipulation.
 * @param value The value to convert.
 * @param fallback The value to return if the input is null or undefined.
 */
export const safeString = (value: unknown, fallback: string = ''): string => {
  if (value === null || value === undefined) {
    return fallback;
  }
  return String(value);
};
