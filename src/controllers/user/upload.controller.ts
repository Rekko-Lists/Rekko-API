import { Request, Response } from 'express';
import { catchAsync } from '../../utils/http/catchAsync';
import { created } from '../../utils/http/response';
import { ValidationError } from '../../exceptions/exceptions';

export const uploadProfileImage = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const username = req.params.username as string;
        const imageConfig = (req as any).imageConfig;

        if (!req.file)
            throw new ValidationError('No file was uploaded');

        await services.upload.uploadProfileImage({
            username,
            imageType: 'profileImage',
            imageBuffer: req.file.buffer,
            width: imageConfig.width,
            height: imageConfig.height
        });

        created(res, 'Profile Image updated');
    }
);

export const uploadBannerImage = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const username = req.params.username as string;
        const imageConfig = (req as any).imageConfig;

        if (!req.file)
            throw new ValidationError('No file was uploaded');

        await services.upload.uploadProfileImage({
            username,
            imageType: 'bannerImage',
            imageBuffer: req.file.buffer,
            width: imageConfig.width,
            height: imageConfig.height
        });

        created(res, 'Banner Image updated');
    }
);

export const uploadBackgroundImage = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const username = req.params.username as string;
        const imageConfig = (req as any).imageConfig;

        if (!req.file)
            throw new ValidationError('No file was uploaded');

        await services.upload.uploadProfileImage({
            username,
            imageType: 'backgroundImage',
            imageBuffer: req.file.buffer,
            width: imageConfig.width,
            height: imageConfig.height
        });

        created(res, 'Backgrpund Image updated');
    }
);
