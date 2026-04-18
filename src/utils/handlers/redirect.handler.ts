/**
 * REDIRECT STATUS VALUES:
 *  - success
 *  - expired
 *  - invalid
 *  - user_not_found
 *  - token_used
 *  - email_taken
 */

interface BuildUrlOptions {
    domain: string;
    path: string;
    params?: Record<string, string | number | boolean>;
}

export function buildUrl(options: BuildUrlOptions): string {
    const cleanDomain = options.domain.endsWith('/')
        ? options.domain.slice(0, -1)
        : options.domain;

    const cleanPath = !options.path.startsWith('/')
        ? `/${options.path}`
        : options.path;

    if (options.params) {
        const queryParams = new URLSearchParams();
        Object.entries(options.params).forEach(
            ([key, value]) => {
                if (value !== null && value !== undefined) {
                    queryParams.append(key, String(value));
                }
            }
        );

        const queryString = queryParams.toString();

        return `${cleanDomain}${cleanPath}?${queryString}`;
    }
    return `${cleanDomain}${cleanPath}`;
}
