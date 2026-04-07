import { z } from 'zod';

export const linkOAuthAccountSchema = z
    .object({
        userId: z.number(),
        provider: z.string(),
        providerUserId: z.number(),
        accessToken: z.string()
    })
    .strict();

export type LinkOAuthAccount = z.infer<
    typeof linkOAuthAccountSchema
>;
