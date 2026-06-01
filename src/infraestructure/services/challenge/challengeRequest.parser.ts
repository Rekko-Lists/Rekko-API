import {
    createDailyChallengesBatchSchema,
    CreateDailyChallengesBatch
} from '../../../domain/schemas/challenge/challenge.schemas';
import { ValidationError } from '../../../exceptions/exceptions';

export class ChallengeRequestParser {
    parseChallengesJson(
        challengesField: any
    ): CreateDailyChallengesBatch {
        if (!challengesField) {
            throw new ValidationError(
                'Field "challenges" with JSON structure is required. Make sure to send it as form-data with type "Text"'
            );
        }

        let challengesData;
        try {
            const challengesStr =
                typeof challengesField === 'string'
                    ? challengesField
                    : JSON.stringify(challengesField);

            challengesData = JSON.parse(challengesStr);
        } catch (error) {
            throw new ValidationError(
                `Invalid JSON in "challenges" field: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }

        if (!challengesData) {
            throw new ValidationError(
                'Parsed challenges data is empty'
            );
        }

        return challengesData;
    }

    validateStructure(
        data: CreateDailyChallengesBatch
    ): CreateDailyChallengesBatch {
        try {
            return createDailyChallengesBatchSchema.parse({
                date: data.date,
                challenges: data.challenges
            });
        } catch (error) {
            throw error; // Zod validation error propagates naturally
        }
    }

    buildFilesMap(
        files: Express.Multer.File[]
    ): Map<string, Express.Multer.File> {
        const filesMap = new Map<string, Express.Multer.File>();

        files.forEach((file) => {
            filesMap.set(file.fieldname, file);
        });

        return filesMap;
    }

    parse(
        challengesField: any,
        files: Express.Multer.File[]
    ): {
        validated: CreateDailyChallengesBatch;
        filesMap: Map<string, Express.Multer.File>;
    } {
        const parsed = this.parseChallengesJson(challengesField);
        const validated = this.validateStructure(parsed);
        const filesMap = this.buildFilesMap(files);

        return { validated, filesMap };
    }
}
