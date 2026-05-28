import { Request } from 'express';
import { Container } from '../infraestructure/container/container';
import { FindOptions } from '../domain/schemas/find.schemas';

export interface RequestWithContainer extends Request {
    container?: Container;
}

export interface RequestWithFindOptions extends Request {
    findOptions?: FindOptions;
}

export interface ImageConfig {
    field: string;
    maxSize: number;
    formats: string[];
}

export interface RequestWithImageConfig extends Request {
    imageConfig?: ImageConfig;
}

export interface SeasonParams {
    year: number;
    season: string;
}

export interface RequestWithSeasonParams extends Request {
    seasonParams?: SeasonParams;
}

export interface ExtendedRequest
    extends
        RequestWithContainer,
        RequestWithFindOptions,
        RequestWithImageConfig,
        RequestWithSeasonParams {}

declare global {
    namespace Express {
        interface Request {
            container?: Container;
            findOptions?: FindOptions;
            imageConfig?: ImageConfig;
            seasonParams?: SeasonParams;
        }
    }
}
