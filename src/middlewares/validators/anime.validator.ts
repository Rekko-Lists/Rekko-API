import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../exceptions/exceptions';
import { seasonParamsSchema } from '../../domain/schemas/anime/mal.schemas';

function getCurrentSeason(): 'winter' | 'spring' | 'summer' | 'fall' {
    const month = new Date().getMonth();
    if (month >= 1 && month <= 3) return 'winter';
    if (month >= 4 && month <= 6) return 'spring';
    if (month >= 7 && month <= 9) return 'summer';
    return 'fall';
}

export const validateSeasonParams = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const currentYear = new Date().getFullYear();
    const currentSeason = getCurrentSeason();

    if (!req.query.year && !req.query.season) {
        (req as any).seasonParams = {
            year: currentYear,
            season: currentSeason
        };
        next();
        return;
    }

    try {
        let year = req.query.year
            ? parseInt(req.query.year as string, 10)
            : undefined;
        let season = req.query.season
            ? (req.query.season as string).toLowerCase()
            : undefined;

        const validated = seasonParamsSchema.parse({
            year,
            season
        });

        (req as any).seasonParams = {
            year: validated.year || currentYear,
            season: validated.season || currentSeason
        };

        next();
    } catch (error) {
        if (error instanceof Error) {
            throw new ValidationError(error.message, {
                year: req.query.year,
                season: req.query.season
            });
        }
        throw error;
    }
};
