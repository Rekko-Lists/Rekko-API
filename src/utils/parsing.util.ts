/**
 * Safely parse a string to integer with optional default value.
 * @param value - The value to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed integer or default value
 */
export function parseIntSafe(
    value: string | number | undefined | null,
    defaultValue: number = 0
): number {
    if (value === undefined || value === null || value === '') {
        return defaultValue;
    }

    const parsed = Number.parseInt(String(value), 10);
    return Number.isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Validate and parse a number parameter from request.
 * Useful for route parameters that should be numeric.
 * @param param - The parameter value to validate
 * @param errorMessage - Error message if validation fails
 * @returns Parsed number or throws error
 */
export function parseNumericParam(
    param: string | number | undefined,
    errorMessage: string = 'Invalid numeric parameter'
): number {
    const parsed = parseIntSafe(param, Number.NaN);
    if (Number.isNaN(parsed) || parsed <= 0) {
        throw new Error(errorMessage);
    }
    return parsed;
}

/**
 * Parse integer from string with radix (base), with validation.
 * @param value - String to parse
 * @param radix - Number base (default 10)
 * @returns Parsed integer
 */
export function parseIntWithRadix(
    value: string,
    radix: number = 10
): number {
    return Number.parseInt(value, radix);
}
