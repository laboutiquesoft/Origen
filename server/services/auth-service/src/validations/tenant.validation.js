import Joi from 'joi';

export const createTenantSchema = Joi.object({
    name: Joi.string().required(),
    initials: Joi.string().required(),
    nit: Joi.string().required(),
    country: Joi.string().required(),
    city: Joi.string().required(),
    address: Joi.string().optional(),
    phone: Joi.string().optional(),
    email: Joi.string().email().required(),
    habilitation_code: Joi.string().allow('', null).optional(),
    logoUrl: Joi.string().allow('', null).optional(),
    territorial_code: Joi.string().allow('', null).optional(),
    verification_code: Joi.string().allow('', null).optional(),
    adminUser: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        first_name: Joi.string().required(),
        last_name: Joi.string().required()
    }).required()
});