import { CloudinaryHandler } from './cloudinary.service';

type ChallengeFileConfig = {
    fieldname: string;
    dataKey: string;
};
type ChallengeTypeConfig = Record<string, ChallengeFileConfig[]>;

export class ChallengeUploadHandler {
    private readonly fileConfigs: ChallengeTypeConfig = {
        anime: [
            { fieldname: 'veryEasy', dataKey: 'veryEasy' },
            { fieldname: 'easy', dataKey: 'easy' },
            { fieldname: 'medium', dataKey: 'medium' },
            { fieldname: 'hard', dataKey: 'hard' }
        ],
        character: [
            { fieldname: 'character', dataKey: 'character' }
        ],
        opening: [{ fieldname: 'opening', dataKey: 'opening' }],
        emoji: []
    };

    constructor(
        private readonly cloudinaryHandler: CloudinaryHandler
    ) {}

    /**
     * Sube archivos para un challenge específico.
     * @param filesMap Mapa de fieldname -> archivo multer
     * @param challengeType Tipo de challenge (anime|character|opening|emoji)
     * @param challengeIndex Índice del challenge (0-3)
     * @param date Fecha en formato YYYY-MM-DD
     * @returns Record con datos enriquecidos (url, publicId) por fieldname
     */
    async uploadFilesForChallenge(
        filesMap: Map<string, Express.Multer.File>,
        challengeType:
            | 'anime'
            | 'character'
            | 'opening'
            | 'emoji',
        challengeIndex: number,
        date: string
    ): Promise<Record<string, any>> {
        const fileConfigs =
            this.fileConfigs[challengeType] || [];
        const folder = `challenges/${date}`;
        const uploadedData: Record<string, any> = {};

        await Promise.all(
            fileConfigs.map((config) =>
                this.uploadSingleFile(
                    filesMap,
                    config,
                    challengeType,
                    challengeIndex,
                    folder,
                    uploadedData
                )
            )
        );

        return uploadedData;
    }

    private async uploadSingleFile(
        filesMap: Map<string, Express.Multer.File>,
        config: ChallengeFileConfig,
        challengeType: string,
        challengeIndex: number,
        folder: string,
        uploadedData: Record<string, any>
    ): Promise<void> {
        const fieldname = `challenge_${challengeIndex}_${config.fieldname}`;
        const file = filesMap.get(fieldname);

        if (!file) return;

        const publicId = this.cloudinaryHandler.buildPublicId(
            'challenges',
            folder,
            `${challengeType}_${config.dataKey}`
        );

        const isAudio = file.mimetype.startsWith('audio/');
        const result = isAudio
            ? await this.cloudinaryHandler.uploadFile(
                  file.buffer,
                  folder,
                  publicId,
                  'auto'
              )
            : await this.uploadAndProcessImage(
                  file.buffer,
                  folder,
                  publicId
              );

        uploadedData[config.dataKey] = {
            url: result.url,
            publicId: result.publicId
        };
    }

    private async uploadAndProcessImage(
        buffer: Buffer,
        folder: string,
        publicId: string
    ) {
        const webpBuffer =
            await this.cloudinaryHandler.processImage(
                buffer,
                1920,
                1080
            );

        return await this.cloudinaryHandler.uploadFile(
            webpBuffer,
            folder,
            publicId,
            'image'
        );
    }
}
