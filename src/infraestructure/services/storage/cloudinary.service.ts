import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { CloudinaryResponse } from '../../../domain/schemas/user/image.schemas';
import { CannotDeleteImageError } from '../../../exceptions/exceptions';

export class CloudinaryHandler {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
    }

    private generateRandomId(): string {
        return randomUUID().split('-').join('').substring(0, 11);
    }

    public buildPublicId(
        resourceType: string,
        resourceId: number | string,
        imageName: string
    ): string {
        const randomId = this.generateRandomId();
        return `${resourceType}/${resourceId}/${imageName}/${randomId}`;
    }

    async processImage(
        buffer: Buffer,
        width: number,
        height: number
    ): Promise<Buffer> {
        return await sharp(buffer)
            .resize(width, height, {
                fit: 'cover',
                position: 'center'
            })
            .webp({ quality: 85 })
            .toBuffer();
    }

    /**
     * Sube un archivo a Cloudinary.
     * Método genérico que maneja imágenes, audio y otros tipos.
     * @param buffer Contenido del archivo
     * @param folder Carpeta destino en Cloudinary
     * @param publicId ID público del archivo
     * @param resourceType Tipo de recurso ('image', 'auto', etc.)
     * @param format Formato destino opcional (ej: 'webp' para imágenes)
     */
    async uploadFile(
        buffer: Buffer,
        folder: string,
        publicId: string,
        resourceType: string = 'auto',
        format?: string
    ): Promise<CloudinaryResponse> {
        return new Promise((resolve, reject) => {
            const uploadOptions: any = {
                folder,
                public_id: publicId,
                resource_type: resourceType
            };

            if (format) {
                uploadOptions.format = format;
            }

            const uploadStream =
                cloudinary.uploader.upload_stream(
                    uploadOptions,
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve({
                                url: result!.secure_url,
                                publicId: result!.public_id
                            });
                        }
                    }
                );

            const readableStream = Readable.from(buffer);
            readableStream.pipe(uploadStream);
        });
    }

    async uploadImage(
        processedBuffer: Buffer,
        folder: string,
        publicId: string
    ): Promise<CloudinaryResponse> {
        return this.uploadFile(
            processedBuffer,
            folder,
            publicId,
            'auto',
            'webp'
        );
    }

    async deleteImage(publicId: string): Promise<void> {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            throw new CannotDeleteImageError(
                `Error al eliminar imagen en Cloudinary: ${publicId}`,
                error
            );
        }
    }

    async uploadAndProcessImage(
        imageBuffer: Buffer,
        width: number,
        height: number,
        folder: string,
        publicId: string
    ): Promise<CloudinaryResponse> {
        const processedBuffer = await this.processImage(
            imageBuffer,
            width,
            height
        );

        return await this.uploadImage(
            processedBuffer,
            folder,
            publicId
        );
    }
}
