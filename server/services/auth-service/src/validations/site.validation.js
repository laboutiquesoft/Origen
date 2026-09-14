import Joi from 'joi';

export const createSiteSchema = Joi.object({
    site_name: Joi.string().required().messages({
        'any.required': 'El nombre de la sede es obligatorio',
        'string.empty': 'El nombre de la sede no puede estar vacío'
    }),
    site_code: Joi.string().allow('', null).optional(),
    city: Joi.string().required().messages({
        'any.required': 'La ciudad es obligatoria',
        'string.empty': 'La ciudad no puede estar vacía'
    }),
    neighborhood: Joi.string().allow('', null).optional(),
    address: Joi.string().allow('', null).optional(),
    phone: Joi.string().allow('', null).optional(),
    email: Joi.string().email().required().messages({
        'any.required': 'El correo electrónico es obligatorio',
        'string.email': 'El correo electrónico debe ser válido'
    }),
    id_tenant: Joi.string().uuid().optional(),
    status: Joi.boolean().optional()
});

export const updateSiteSchema = Joi.object({
    site_name: Joi.string().optional().messages({
        'string.empty': 'El nombre de la sede no puede estar vacío'
    }),
    site_code: Joi.string().allow('', null).optional(),
    city: Joi.string().optional().messages({
        'string.empty': 'La ciudad no puede estar vacía'
    }),
    neighborhood: Joi.string().allow('', null).optional(),
    address: Joi.string().allow('', null).optional(),
    phone: Joi.string().allow('', null).optional(),
    email: Joi.string().email().optional().messages({
        'string.email': 'El correo electrónico debe ser válido'
    }),
    id_tenant: Joi.string().uuid().optional(),
    status: Joi.boolean().optional()
});