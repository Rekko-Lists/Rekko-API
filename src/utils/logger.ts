type LogContext = Record<string, unknown>;

function normalizeContext(context?: unknown): unknown {
    if (context instanceof Error) {
        return {
            name: context.name,
            message: context.message,
            stack: context.stack
        };
    }

    return context;
}

export const logger = {
    warn(message: string, context?: unknown): void {
        console.warn(message, normalizeContext(context));
    },

    error(message: string, context?: unknown): void {
        console.error(message, normalizeContext(context));
    },

    info(message: string, context?: LogContext): void {
        console.info(message, context ?? {});
    }
};
