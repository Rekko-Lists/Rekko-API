import z from 'zod';

export const imgValidationSchema = z.object({
    maxSize: z.number(),
    width: z.number(),
    height: z.number()
});

export type ImgValidation = z.infer<typeof imgValidationSchema>;

export const IMAGE_CONFIG = {
    profileImage: {
        optional: false,
        maxSize: 2 * 1024 * 1024,
        width: 400,
        height: 400
    },
    bannerImage: {
        optional: false,

        maxSize: 1 * 1024 * 1024,
        width: 1500,
        height: 500
    },
    backgroundImage: {
        optional: false,
        maxSize: 2 * 1024 * 1024,
        width: 1920,
        height: 1080
    },
    postImage: {
        optional: true,
        maxSize: 2 * 1024 * 1024,
        width: 1200,
        height: 800
    }
};

export const ALLOWED_MIMETYPES = [
    'image/jpeg',
    'image/png',
    'image/webp'
];

export const IMAGE_DEFAULTS = {
    profileImage: '',
    bannerImage: '',
    backgroundImage: ''
};
