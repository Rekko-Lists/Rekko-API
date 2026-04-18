import { Response } from 'express';

export const ok = <T>(
    res: Response,
    message: string,
    data?: T | null
) => {
    res.status(200).json({
        success: true,
        message: message,
        data: data
    });
};

export const created = <T>(res: Response, data: T) => {
    res.status(201).json({
        success: true,
        data: data
    });
};

export const noContent = (res: Response) => {
    res.status(204).json({
        success: false
    });
};
