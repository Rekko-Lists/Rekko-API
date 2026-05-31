import { z } from 'zod';

export const CHALLENGE_TYPE_IDS: Record<string, number> = {
    anime: 1,
    character: 2,
    opening: 3,
    emoji: 4
};

export const dateStringSchema = z
    .string()
    .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        'Invalid date format. Expected YYYY-MM-DD'
    )
    .refine((d) => {
        const [year, month, day] = d.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day
        );
    }, 'Invalid date value');

export enum ChallengeType {
    ANIME = 'anime', // Adivina por 4 fotos del anime
    CHARACTER = 'character', // Adivina por personaje
    OPENING = 'opening', // Adivina por opening/ending
    EMOJI = 'emoji' // Adivina por 5 emojis
}

export const animeDataSchema = z.object({
    veryEasy: z
        .union([
            z.string().describe('URL de foto'),
            z.object({
                url: z.string(),
                publicId: z.string()
            })
        ])
        .describe('Foto 1 (muy fácil)'),
    easy: z
        .union([
            z.string().describe('URL de foto'),
            z.object({
                url: z.string(),
                publicId: z.string()
            })
        ])
        .describe('Foto 2 (fácil)'),
    medium: z
        .union([
            z.string().describe('URL de foto'),
            z.object({
                url: z.string(),
                publicId: z.string()
            })
        ])
        .describe('Foto 3 (medio)'),
    hard: z
        .union([
            z.string().describe('URL de foto'),
            z.object({
                url: z.string(),
                publicId: z.string()
            })
        ])
        .describe('Foto 4 (difícil)')
});

export const characterDataSchema = z.object({
    character: z
        .union([
            z.string().describe('URL de foto'),
            z.object({
                url: z.string(),
                publicId: z.string()
            })
        ])
        .describe('Foto del personaje')
});

export const openingDataSchema = z.object({
    mediaType: z
        .enum(['opening', 'ending'])
        .describe('Tipo de media (opening o ending)'),
    opening: z
        .union([
            z.string().describe('URL de audio'),
            z.object({
                url: z.string(),
                publicId: z.string()
            })
        ])
        .describe('Audio del opening/ending')
});

export const emojiDataSchema = z.object({
    emojis: z
        .array(z.string())
        .length(5)
        .describe('Array de exactamente 5 emojis')
});

export const createChallengeDtoSchema = z.object({
    type: z
        .enum(['anime', 'character', 'opening', 'emoji'])
        .describe('Tipo de desafío'),
    malId: z.coerce
        .number()
        .int()
        .positive()
        .describe('ID del anime en MAL'),
    data: z
        .union([
            animeDataSchema,
            characterDataSchema,
            openingDataSchema,
            emojiDataSchema,
            z.record(z.string(), z.unknown())
        ])
        .optional()
        .describe(
            'Datos específicos del desafío (opcional, se enriquecen con archivos subidos)'
        )
});

export type CreateChallengeDto = z.infer<
    typeof createChallengeDtoSchema
>;

export const createDailyChallengesBatchSchema = z.object({
    date: dateStringSchema.describe(
        'Fecha de los retos en formato YYYY-MM-DD'
    ),
    challenges: z
        .array(createChallengeDtoSchema)
        .length(4)
        .describe(
            'Array de exactamente 4 desafíos para esa fecha'
        )
});

export type CreateDailyChallengesBatch = z.infer<
    typeof createDailyChallengesBatchSchema
>;

export const challengeFiltersSchema = z.object({
    fromDate: dateStringSchema
        .optional()
        .describe('Fecha inicio (YYYY-MM-DD)'),
    toDate: dateStringSchema
        .optional()
        .describe('Fecha fin (YYYY-MM-DD)'),
    type: z
        .enum(['anime', 'character', 'opening', 'emoji'])
        .optional()
        .describe('Filtrar por tipo de desafío'),
    malId: z.coerce
        .number()
        .int()
        .positive()
        .optional()
        .describe('Filtrar por malId del anime')
});

export type ChallengeFilters = z.infer<
    typeof challengeFiltersSchema
>;

export const challengeResponseSchema = z.object({
    challengeId: z.number().int(),
    typeId: z.number().int(),
    dayId: z.number().int(),
    animeId: z.number().int(),
    malId: z.number().int().optional(),
    animeName: z.string().optional(),
    animeImage: z.string().optional(),
    type: z
        .object({
            typeId: z.number().int(),
            name: z.string()
        })
        .optional(),
    day: z
        .object({
            dayId: z.number().int(),
            date: z.string()
        })
        .optional(),
    data: z.union([
        animeDataSchema,
        characterDataSchema,
        openingDataSchema,
        emojiDataSchema
    ])
});

export type ChallengeResponse = z.infer<
    typeof challengeResponseSchema
>;

export const animeInfoSchema = z.object({
    malId: z.number().int(),
    name: z.string(),
    imgMedium: z.string().optional(),
    imgLarge: z.string().optional()
});

export const challengeWithRelationsSchema = z.object({
    typeId: z.number().int(),
    dayId: z.number().int(),
    animeId: z.number().int(),
    data: z.union([
        animeDataSchema,
        characterDataSchema,
        openingDataSchema,
        emojiDataSchema
    ]),
    type: z
        .object({
            name: z.string()
        })
        .optional(),
    anime: animeInfoSchema.optional()
});

export type ChallengeWithRelations = z.infer<
    typeof challengeWithRelationsSchema
>;

export const challengeResponseDTOSchema = z.object({
    type: z.string(),
    anime: animeInfoSchema,
    data: z.union([
        animeDataSchema,
        characterDataSchema,
        openingDataSchema,
        emojiDataSchema
    ])
});

export type ChallengeResponseDTO = z.infer<
    typeof challengeResponseDTOSchema
>;
