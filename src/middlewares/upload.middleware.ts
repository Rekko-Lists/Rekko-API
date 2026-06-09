import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import {
    ALLOWED_MIMETYPES,
    IMAGE_CONFIG,
    ImgValidation
} from '../domain/schemas/img.schema';
import {
    InvalidImageFormatError,
    SpaceLimitExceededError,
    ValidationError
} from '../exceptions/exceptions';

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

const challengeFileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedMimetypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'audio/mpeg',
        'audio/mp3',
        'audio/x-mpeg',
        'audio/x-mp3'
    ];

    if (!allowedMimetypes.includes(file.mimetype)) {
        cb(
            new InvalidImageFormatError(
                'Solo se permiten imágenes (JPG, PNG, WebP) y audio (MP3)'
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

export const uploadChallengesMiddleware = multer({
    storage,
    fileFilter: challengeFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB para audio MP3
    }
});

export const validateImage = (config: ImgValidation) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.file)
            throw new ValidationError('No file was uploaded');

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

export const validateImageOptional = (config: ImgValidation) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // If no file, continue (file is optional)
        if (!req.file) {
            next();
            return;
        }

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
    imageType:
        | 'profileImage'
        | 'bannerImage'
        | 'backgroundImage'
        | 'postImage'
) => {
    const config = IMAGE_CONFIG[imageType];
    if (config.optional) return validateImageOptional(config);
    return validateImage(config);
};
