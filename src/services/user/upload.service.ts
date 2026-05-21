import { CloudinaryHandler } from '../../infraestructure/services/storage/cloudinary.service';
import { UserService } from './../user/user.service';
import {
    ImageParams,
    ImageResponse
} from '../../domain/schemas/user/image.schemas';
import { IMAGE_DEFAULTS } from '../../domain/schemas/img.schema';
import { CannotDeleteImageError } from '../../domain/errors/img.errors';
import { UserNotFoundError } from '../../domain/errors/auth.errors';

export class UploadService {
    constructor(
        private readonly userService: UserService,
        private readonly cloudinaryHandler: CloudinaryHandler
    ) {}

    private isDefaultImage(
        imageUrl: string,
        imageType:
            | 'profileImage'
            | 'bannerImage'
            | 'backgroundImage'
    ): boolean {
        const defaultUrl = IMAGE_DEFAULTS[imageType];
        return (
            imageUrl === defaultUrl ||
            !imageUrl ||
            imageUrl === ''
        );
    }

    async uploadProfileImage(
        params: ImageParams
    ): Promise<ImageResponse> {
        const {
            username,
            imageType,
            imageBuffer,
            width,
            height
        } = params;

        const user =
            await this.userService.getUserByUsername(username);

        if (!user) {
            throw new UserNotFoundError('Usuario no encontrado');
        }

        const userId = user.getUserId();
        const publicId = this.cloudinaryHandler.buildPublicId(
            'users',
            userId,
            imageType
        );

        let currentImageUrl: string = '';
        let currentPublicId: string | undefined = '';

        if (imageType === 'profileImage') {
            currentImageUrl = user.getProfileImage();
            currentPublicId = user.getProfileImagePublicId();
        } else if (imageType === 'bannerImage') {
            currentImageUrl = user.getBannerImage();
            currentPublicId = user.getBannerImagePublicId();
        } else if (imageType === 'backgroundImage') {
            currentImageUrl = user.getBackgroundImage();
            currentPublicId = user.getBackgroundImagePublicId();
        }

        if (
            !this.isDefaultImage(currentImageUrl, imageType) &&
            currentPublicId
        ) {
            try {
                await this.cloudinaryHandler.deleteImage(
                    currentPublicId
                );
            } catch (error) {
                throw new CannotDeleteImageError(
                    `No se pudo eliminar imagen anterior: ${currentPublicId}`,
                    error
                );
            }
        }

        const uploadResult =
            await this.cloudinaryHandler.uploadAndProcessImage(
                imageBuffer,
                width,
                height,
                '',
                publicId
            );

        const updateData: any = {};
        updateData[imageType] = uploadResult.url;
        updateData[`${imageType}PublicId`] =
            uploadResult.publicId;

        await this.userService.updateUser(updateData, username);

        return {
            message: `${imageType} actualizada correctamente`,
            imageUrl: uploadResult.url
        };
    }
}
