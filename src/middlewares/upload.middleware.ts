import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import {
    ALLOWED_MIMETYPES,
    IMAGE_CONFIG,
    ImgValidation
} from '../domain/schemas/img.schema';
import {
    InvalidImageFormatError,
    SpaceLimitExceededError
} from '../domain/errors/img.errors';
import { BadRequestError } from '../domain/errors/http.errors';

const storage = multer.memoryStorage();

const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
        cb(
            new InvalidImageFormatError(
                'Solo se permiten imágenes JPG, JPEG, PNG y WebP'
            )
        );
    } else {
        cb(null, true);
    }
};

export const uploadMiddleware = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024
    }
});

export const validateImage = (config: ImgValidation) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.file)
            throw new BadRequestError('No se envió archivo');

        const fileSize = req.file.size;

        if (fileSize > config.maxSize) {
            throw new SpaceLimitExceededError(
                `El archivo es muy grande. Máximo permitido: ${config.maxSize / (1024 * 1024)}MB`
            );
        }

        (req as any).imageConfig = config;

        next();
    };
};

export const validateImageType = (
    imageType: 'profileImage' | 'bannerImage' | 'backgroundImage'
) => {
    const config = IMAGE_CONFIG[imageType];
    return validateImage(config);
};
