// src/controllers/ComplexityController.js
import ComplexityService from '../services/complexity.service.js';
import { asyncHandler, AppError } from '@origen/common';

class ComplexityController {

    /**
     * @route POST /api/complexities
     * @desc Crea una nueva complejidad
     * @access Private (Admin/Configurador)
     */
    createComplexity = asyncHandler(async (req, res, next) => {
        const { complexity_name, status } = req.body;

        if (!complexity_name) {
            return next(new AppError('Complexity name is required', 400));
        }

        const newComplexity = await ComplexityService.createComplexity({ complexity_name, status });

        res.status(201).json({
            status: 'success',
            data: newComplexity
        });
    });

    /**
     * @route GET /api/complexities/:id
     * @desc Obtiene una complejidad por su ID
     * @access Private (Read)
     */
    getComplexityById = asyncHandler(async (req, res, next) => {
        const { id } = req.params;

        const complexity = await ComplexityService.getComplexityById(id);

        res.status(200).json({
            status: 'success',
            data: complexity
        });
    });

    /**
     * @route GET /api/complexities
     * @desc Obtiene todas las complejidades con paginación y filtrado
     * @access Private (Read)
     */
    getComplexities = asyncHandler(async (req, res, next) => {
        const skip = parseInt(req.query.skip) || 0;
        const take = parseInt(req.query.take) || 50000;
        const where = req.query.where || {};
        const orderBy = req.query.orderBy || 'complexity_name';
        const orderDirection = req.query.orderDirection || 'ASC';

        const { data, total } = await ComplexityService.getComplexities(skip, take, where, orderBy, orderDirection);

        res.status(200).json({
            status: 'success',
            total,
            count: data.length,
            data
        });
    });

    /**
     * @route PUT /api/complexities/:id
     * @route PATCH /api/complexities/:id
     * @desc Actualiza una complejidad por su ID
     * @access Private (Admin/Configurador)
     */
    updateComplexity = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const updateData = req.body;

        delete updateData.id_complexity;
        delete updateData.created_at;
        delete updateData.updated_at;

        const updatedComplexity = await ComplexityService.updateComplexity(id, updateData);

        res.status(200).json({
            status: 'success',
            data: updatedComplexity
        });
    });

    /**
     * @route DELETE /api/complexities/:id
     * @desc Elimina una complejidad por su ID
     * @access Private (Admin/Configurador)
     */
    deleteComplexity = asyncHandler(async (req, res, next) => {
        const { id } = req.params;

        await ComplexityService.deleteComplexity(id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    });

    /**
     * @route PATCH /api/complexities/:id/status
     * @desc Cambia el estado (activo/inactivo) de una complejidad
     * @access Private (Admin/Configurador)
     */
    changeComplexityStatus = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const { status } = req.body;

        if (typeof status !== 'boolean') {
            return next(new AppError('Status must be a boolean (true/false)', 400));
        }

        const updatedComplexity = await ComplexityService.changeComplexityStatus(id, status);

        res.status(200).json({
            status: 'success',
            data: updatedComplexity
        });
    });
}

export default new ComplexityController();