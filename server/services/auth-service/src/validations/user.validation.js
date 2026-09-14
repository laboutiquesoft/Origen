import Joi from 'joi';

export const createUserSchema = Joi.object({
    first_name: Joi.string().required().messages({
        'any.required': 'El nombre es obligatorio',
        'string.empty': 'El nombre no puede estar vacío'
    }),
    last_name: Joi.string().required().messages({
        'any.required': 'El apellido es obligatorio',
        'string.empty': 'El apellido no puede estar vacío'
    }),
    email: Joi.string().email().required().messages({
        'any.required': 'El email es obligatorio',
        'string.email': 'Debe ser un email válido'
    }),
    password: Joi.string().min(6).required().messages({
        'any.required': 'La contraseña es obligatoria',
        'string.min': 'La contraseña debe tener al menos 6 caracteres'
    }),
    id_tenant: Joi.string().uuid().optional(),
    roles: Joi.array().items(Joi.string().uuid()).min(1).required().messages({
        'array.min': 'Debes asignar al menos un rol',
        'any.required': 'Los roles son obligatorios'
    }),
    sites: Joi.array().items(Joi.string().uuid()).min(1).required().messages({
        'array.min': 'Debes asignar al menos una sede',
        'any.required': 'Las sedes son obligatorias'
    }),
    microservices: Joi.array().items(Joi.string().uuid()).optional(),
    status: Joi.boolean().optional()
});

export const updateUserSchema = Joi.object({
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
    id_tenant: Joi.string().uuid().optional(),
    roles: Joi.array().items(Joi.string().uuid()).optional(),
    sites: Joi.array().items(Joi.string().uuid()).optional(),
    microservices: Joi.array().items(Joi.string().uuid()).optional(),
    status: Joi.boolean().optional()
});