import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { created } from '../../utils/handlers/response.handler';
import { uploadService } from '../../infraestructure/container/user.container';
import { BadRequestError } from '../../domain/errors/http.errors';

export const uploadProfileImage = catchAsync(
    async (req: Request, res: Response) => {
        const username = req.params.username as string;
        const imageConfig = (req as any).imageConfig;

        if (!req.file)
            throw new BadRequestError('No se envió archivo');

        const result = await uploadService.uploadProfileImage({
            username,
            imageType: 'profileImage',
            imageBuffer: req.file.buffer,
            width: imageConfig.width,
            height: imageConfig.height
        });

        created(res, result.message);
    }
);

export const uploadBannerImage = catchAsync(
    async (req: Request, res: Response) => {
        const username = req.params.username as string;
        const imageConfig = (req as any).imageConfig;

        if (!req.file)
            throw new BadRequestError('No se envió archivo');

        const result = await uploadService.uploadProfileImage({
            username,
            imageType: 'bannerImage',
            imageBuffer: req.file.buffer,
            width: imageConfig.width,
            height: imageConfig.height
        });

        created(res, result.message);
    }
);

export const uploadBackgroundImage = catchAsync(
    async (req: Request, res: Response) => {
        const username = req.params.username as string;
        const imageConfig = (req as any).imageConfig;

        if (!req.file)
            throw new BadRequestError('No se envió archivo');

        const result = await uploadService.uploadProfileImage({
            username,
            imageType: 'backgroundImage',
            imageBuffer: req.file.buffer,
            width: imageConfig.width,
            height: imageConfig.height
        });

        created(res, result.message);
    }
);
