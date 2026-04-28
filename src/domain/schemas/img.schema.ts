import z from 'zod';

export const imgValidationSchema = z.object({
    maxSize: z.number(),
    width: z.number(),
    height: z.number()
});

export type ImgValidation = z.infer<typeof imgValidationSchema>;

export const IMAGE_CONFIG = {
    profileImage: {
        maxSize: 2 * 1024 * 1024,
        width: 400,
        height: 400
    },
    bannerImage: {
        maxSize: 1 * 1024 * 1024,
        width: 1500,
        height: 500
    },
    backgroundImage: {
        maxSize: 2 * 1024 * 1024,
        width: 1920,
        height: 1080
    }
};

export const ALLOWED_MIMETYPES = [
    'image/jpeg',
    'image/png',
    'image/webp'
];

export const IMAGE_DEFAULTS = {
    profileImage: process.env.DEFAULT_PROFILE_IMAGE_URL || '',
    bannerImage: process.env.DEFAULT_BANNER_IMAGE_URL || '',
    backgroundImage:
        process.env.DEFAULT_BACKGROUND_IMAGE_URL || ''
};
