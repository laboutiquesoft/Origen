import { AppError } from './error.middleware.js';

export const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const msg = error.details.map((el) => el.message).join(',');
        const appError = new AppError(msg, 400);
        appError.details = error.details;
        return next(appError);
    }
    next();
};