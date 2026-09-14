// src/controllers/AllergyController.js

import AllergyService from '../services/allergy.service.js';
import { asyncHandler } from '@origen/common';
import { AppError } from '@origen/common';

class AllergyController {

    /**
     * @route POST /api/allergies
     * @desc Crea una nueva alergia
     * @access Private (Admin/Configurador)
     */
    createAllergy = asyncHandler(async (req, res, next) => {
        const { allergy_name, description } = req.body;

        // Validación básica de entrada (más validaciones en el servicio)
        if (!allergy_name) {
            return next(new AppError('Allergy name is required', 400));
        }

        const newAllergy = await AllergyService.createAllergy({ allergy_name, description });

        res.status(201).json({
            status: 'success',
            data: newAllergy
        });
    });

    /**
     * @route GET /api/allergies/:id
     * @desc Obtiene una alergia por su ID
     * @access Private (Read)
     */
    getAllergyById = asyncHandler(async (req, res, next) => {
        const { id } = req.params;

        const allergy = await AllergyService.getAllergyById(id);

        res.status(200).json({
            status: 'success',
            data: allergy
        });
    });

    /**
     * @route GET /api/allergies
     * @desc Obtiene todas las alergias con paginación y filtrado
     * @access Private (Read)
     */
    getAllergies = asyncHandler(async (req, res, next) => {
        const skip = parseInt(req.query.skip) || 0;
        const take = parseInt(req.query.take) || 10;
        const where = req.query.where || {}; // Filtros dinámicos
        const orderBy = req.query.orderBy || 'allergy_name';
        const orderDirection = req.query.orderDirection || 'ASC';

        const { data, total } = await AllergyService.getAllergies(skip, take, where, orderBy, orderDirection);

        res.status(200).json({
            status: 'success',
            total,
            count: data.length,
            data
        });
    });

    /**
     * @route PUT /api/allergies/:id
     * @route PATCH /api/allergies/:id
     * @desc Actualiza una alergia por su ID
     * @access Private (Admin/Configurador)
     */
    updateAllergy = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const updateData = req.body;

        // Limpiar datos que no deben ser actualizados
        delete updateData.id_allergy;
        delete updateData.created_at;
        delete updateData.updated_at; // El servicio/repositorio se encarga de esto

        const updatedAllergy = await AllergyService.updateAllergy(id, updateData);

        res.status(200).json({
            status: 'success',
            data: updatedAllergy
        });
    });

    /**
     * @route DELETE /api/allergies/:id
     * @desc Elimina una alergia por su ID
     * @access Private (Admin/Configurador)
     */
    deleteAllergy = asyncHandler(async (req, res, next) => {
        const { id } = req.params;

        await AllergyService.deleteAllergy(id);

        res.status(204).json({
            status: 'success',
            data: null // No content for 204
        });
    });

    /**
     * @route PATCH /api/allergies/:id/status
     * @desc Cambia el estado (activo/inactivo) de una alergia
     * @access Private (Admin/Configurador)
     */
    changeAllergyStatus = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const { status } = req.body; // Se espera { status: true/false }

        // Validar que 'status' sea un booleano
        if (typeof status !== 'boolean') {
            return next(new AppError('Status must be a boolean (true/false)', 400));
        }

        const updatedAllergy = await AllergyService.changeAllergyStatus(id, status);

        res.status(200).json({
            status: 'success',
            data: updatedAllergy
        });
    });
}

export default new AllergyController();