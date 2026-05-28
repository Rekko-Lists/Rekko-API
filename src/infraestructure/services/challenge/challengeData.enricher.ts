import { CreateChallengeDto } from '../../../domain/schemas/challenge/challenge.schemas';
import { ChallengeUploadHandler } from '../storage/challengeUpload.handler';

type EnrichedChallengeDto = CreateChallengeDto & {
    data: Record<string, any>;
};

export class ChallengeDataEnricher {
    constructor(
        private readonly uploadHandler: ChallengeUploadHandler
    ) {}

    async enrichChallenge(
        challenge: CreateChallengeDto,
        filesMap: Map<string, Express.Multer.File>,
        index: number,
        date: string
    ): Promise<EnrichedChallengeDto> {
        const uploadedData =
            await this.uploadHandler.uploadFilesForChallenge(
                filesMap,
                challenge.type as
                    | 'anime'
                    | 'character'
                    | 'opening'
                    | 'emoji',
                index,
                date
            );

        const enrichedData = {
            ...(challenge.data || {}),
            ...uploadedData
        };

        return {
            ...challenge,
            data: enrichedData
        };
    }

    async enrichBatch(
        challenges: CreateChallengeDto[],
        filesMap: Map<string, Express.Multer.File>,
        date: string
    ): Promise<EnrichedChallengeDto[]> {
        return Promise.all(
            challenges.map((challenge, index) =>
                this.enrichChallenge(
                    challenge,
                    filesMap,
                    index,
                    date
                )
            )
        );
    }
}
