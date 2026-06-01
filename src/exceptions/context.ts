export function normalizeErrorContext(
    context?: unknown
): Record<string, any> {
    if (context === undefined || context === null) return {};

    if (typeof context === 'string') {
        return { details: context };
    }

    if (typeof context === 'object' && !Array.isArray(context)) {
        return context as Record<string, any>;
    }

    return { details: context };
}
