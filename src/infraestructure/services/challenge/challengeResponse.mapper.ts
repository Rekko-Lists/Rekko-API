import {
    ChallengeWithRelations,
    ChallengeResponseDTO
} from '../../../domain/schemas/challenge/challenge.schemas';

export class ChallengeResponseMapper {
    static toDTO(
        challenge: ChallengeWithRelations
    ): ChallengeResponseDTO {
        return {
            type: challenge.type?.name || 'unknown',
            anime: {
                malId: challenge.anime?.malId || 0,
                name: challenge.anime?.name || 'Unknown',
                imgMedium: challenge.anime?.imgMedium,
                imgLarge: challenge.anime?.imgLarge
            },
            data: challenge.data || {}
        };
    }

    static toDTOArray(
        challenges: ChallengeWithRelations[]
    ): ChallengeResponseDTO[] {
        return challenges.map((c) => this.toDTO(c));
    }
}
