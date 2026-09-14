import SpecialtyService from '../services/specialty.service.js';
import { asyncHandler, AppError } from '@origen/common';

class SpecialtyController {

    /**
     * @route POST /api/specialties
     * @desc Crea una nueva especialidad
     * @access Private (Admin/Configurador)
     */
    createSpecialty = asyncHandler(async (req, res, next) => {
        const { specialty_name, description, status } = req.body;

        if (!specialty_name) {
            return next(new AppError('Specialty name is required', 400));
        }

        const newSpecialty = await SpecialtyService.createSpecialty({ specialty_name, description, status });

        res.status(201).json({
            status: 'success',
            data: newSpecialty
        });
    });

    /**
     * @route GET /api/specialties/:id
     * @desc Obtiene una especialidad por su ID.
     * @access Private (Read)
     */
    getSpecialtyById = asyncHandler(async (req, res, next) => {
        const { id } = req.params;

        const specialty = await SpecialtyService.getSpecialtyById(id);

        res.status(200).json({
            status: 'success',
            data: specialty
        });
    });

    /**
     * @route GET /api/specialties
     * @desc Obtiene todas las especialidades con paginación y filtrado.
     * @access Private (Read)
     */
    getSpecialties = asyncHandler(async (req, res, next) => {
        const skip = parseInt(req.query.skip) || 0;
        const take = parseInt(req.query.take) || 50000;
        const where = req.query.where || {}; // Ej: { status: true }
        const orderBy = req.query.orderBy || 'specialty_name';
        const orderDirection = req.query.orderDirection || 'ASC';

        const { data, total } = await SpecialtyService.getSpecialties(skip, take, where, orderBy, orderDirection);

        res.status(200).json({
            status: 'success',
            total,
            count: data.length,
            data
        });
    });

    /**
     * @route PUT /api/specialties/:id
     * @route PATCH /api/specialties/:id
     * @desc Actualiza una especialidad por su ID
     * @access Private (Admin/Configurador)
     */
    updateSpecialty = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const updateData = req.body;

        delete updateData.id_specialty;
        delete updateData.created_at;
        delete updateData.updated_at;

        const updatedSpecialty = await SpecialtyService.updateSpecialty(id, updateData);

        res.status(200).json({
            status: 'success',
            data: updatedSpecialty
        });
    });

    /**
     * @route DELETE /api/specialties/:id
     * @desc Elimina una especialidad por su ID
     * @access Private (Admin/Configurador)
     */
    deleteSpecialty = asyncHandler(async (req, res, next) => {
        const { id } = req.params;

        await SpecialtyService.deleteSpecialty(id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    });

    /**
     * @route PATCH /api/specialties/:id/status
     * @desc Cambia el estado (activo/inactivo) de una especialidad
     * @access Private (Admin/Configurador)
     */
    changeSpecialtyStatus = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const { status } = req.body;

        if (typeof status !== 'boolean') {
            return next(new AppError('Status must be a boolean (true/false)', 400));
        }

        const updatedSpecialty = await SpecialtyService.changeSpecialtyStatus(id, status);

        res.status(200).json({
            status: 'success',
            data: updatedSpecialty
        });
    });
}

export default new SpecialtyController();