import { z } from 'zod';

export const cloudinaryResponseSchema = z.object({
    url: z.url(),
    publicId: z.string()
});
export type CloudinaryResponse = z.infer<
    typeof cloudinaryResponseSchema
>;

export const imageUploadParams = z
    .object({
        username: z.string(),
        imageType: z.enum([
            'profileImage',
            'bannerImage',
            'backgroundImage'
        ]),
        imageBuffer: z.instanceof(Buffer),
        width: z.number(),
        height: z.number()
    })
    .strict();
export type ImageParams = z.infer<typeof imageUploadParams>;

export const imageUploadResponse = z.object({
    message: z.string(),
    imageUrl: z.url().optional()
});
export type ImageResponse = z.infer<typeof imageUploadResponse>;
