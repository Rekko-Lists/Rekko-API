// ============================================
// JWT TOKEN EXPIRATION TIMES
// ============================================
export const JWT_TOKEN_EXPIRY = {
    /** Access token expiry time (15 minutes) */
    ACCESS_TOKEN: '15m',
    /** Temporary token expiry time for password/email operations (10 minutes) */
    TEMPORARY_TOKEN: '10m',
    /** Refresh token expiry time in seconds (7 days) */
    REFRESH_TOKEN_SECONDS: 7 * 24 * 60 * 60
} as const;

export enum TokenPurpose {
    VERIFY_EMAIL = 'verify-email',
    CHANGE_EMAIL = 'change-email',
    RESET_PASSWORD = 'reset-password'
}

const USERNAME_SEGMENT = '[^/]+';

export const PUBLIC_USER_ROUTE_PATTERNS = {
    GET: [
        /^\/$/,
        new RegExp(`^/${USERNAME_SEGMENT}$`),
        new RegExp(
            `^/${USERNAME_SEGMENT}/verify-email/confirm$`
        ),
        new RegExp(
            `^/${USERNAME_SEGMENT}/change-email/confirm$`
        )
    ],
    POST: [
        /^\/$/,
        new RegExp(`^/${USERNAME_SEGMENT}/forgot-password$`),
        new RegExp(`^/${USERNAME_SEGMENT}/reset-password$`)
    ]
} as const;

// ============================================
// FILE UPLOAD LIMITS (in bytes)
// ============================================
export const FILE_UPLOAD_LIMITS = {
    /** Maximum profile image size: 2MB */
    PROFILE_IMAGE: 2 * 1024 * 1024,
    /** Maximum banner image size: 1MB */
    BANNER_IMAGE: 1 * 1024 * 1024,
    /** Maximum background image size: 2MB */
    BACKGROUND_IMAGE: 2 * 1024 * 1024,
    /** Maximum audio file size: 5MB */
    AUDIO_FILE: 5 * 1024 * 1024
} as const;

// ============================================
// PAGINATION DEFAULTS
// ============================================
export const PAGINATION = {
    /** Default items per page */
    DEFAULT_LIMIT: 10,
    /** Maximum items per page */
    MAX_LIMIT: 110,
    /** Minimum items per page */
    MIN_LIMIT: 1,
    /** Default page number */
    DEFAULT_PAGE: 1,
    /** Minimum page number */
    MIN_PAGE: 1,
    /** Default sort order */
    DEFAULT_SORT_ORDER: 'asc' as const
} as const;

export const DEFAULTS = {
    SERVER_PORT: 5000,
    MAL_REQUEST_TIMEOUT_MS: 15000,
    MAL_TOKEN_REFRESH_MARGIN_MS: 60 * 1000,
    MAL_AUTH_REQUEST_TTL_MS: 15 * 60 * 1000,
    MAL_TRENDING_CACHE_TTL_MS: 15 * 60 * 1000,
    ANIME_REFRESH_FAILURE_BACKOFF_MS: 30 * 60 * 1000,
    MAX_CONCURRENT_ANIME_REFRESH: 3,
    MAL_ANIME_NEXT_UPDATE_MS: 7 * 24 * 60 * 60 * 1000,
    MAL_SEED_PAGE_DELAY_MS: 1200,
    MAL_RANKING_PAGE_SIZE: 500
} as const;

// ============================================
// REPUTATION CHANGES
// ============================================
export const REPUTATION_CHANGES = {
    /** Points for a good post */
    GOOD_POST: 10,
    /** Points for a helpful comment */
    HELPFUL_COMMENT: 5,
    /** Points deducted for spam */
    SPAM: -15,
    /** Points deducted for bad behavior */
    BAD_BEHAVIOR: -20,
    /** Points deducted for misinformation */
    MISINFORMATION: -10
} as const;

// ============================================
// VALIDATION RULES
// ============================================
export const VALIDATION = {
    /** Minimum password length */
    PASSWORD_MIN_LENGTH: 8,
    /** Maximum password length */
    PASSWORD_MAX_LENGTH: 128,
    /** Minimum username length */
    USERNAME_MIN_LENGTH: 1,
    /** Minimum email length */
    EMAIL_MIN_LENGTH: 1
} as const;

// ============================================
// IMAGE RESOLUTIONS
// ============================================
export const IMAGE_RESOLUTIONS = {
    PROFILE: { width: 400, height: 400 },
    BANNER: { width: 1500, height: 500 },
    BACKGROUND: { width: 1920, height: 1080 }
} as const;

// ============================================
// ALLOWED IMAGE FORMATS
// ============================================
export const ALLOWED_IMAGE_FORMATS = [
    'jpeg',
    'jpg',
    'webp',
    'png'
] as const;
export type AllowedImageFormat =
    (typeof ALLOWED_IMAGE_FORMATS)[number];
