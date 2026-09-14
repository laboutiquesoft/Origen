// src/controllers/CountryController.js

import CountryService from '../services/country.service.js';
import { asyncHandler, AppError } from '@origen/common';

class CountryController {

    /**
     * @route POST /api/countries
     * @desc Crea un nuevo país
     * @access Private (Admin/Configurador)
     */
    createCountry = asyncHandler(async (req, res, next) => {
        const { country_code, country_name, demonym, flag, status } = req.body;

        if (!country_code || !country_name) {
            return next(new AppError('Country code and name are required', 400));
        }

        const newCountry = await CountryService.createCountry({ country_code, country_name, demonym, flag, status });

        res.status(201).json({
            status: 'success',
            data: newCountry
        });
    });

    /**
     * @route GET /api/countries/:id
     * @desc Obtiene un país por su ID
     * @access Private (Read)
     */
    getCountryById = asyncHandler(async (req, res, next) => {
        const { id } = req.params;

        const country = await CountryService.getCountryById(id);

        res.status(200).json({
            status: 'success',
            data: country
        });
    });

    /**
     * @route GET /api/countries
     * @desc Obtiene todos los países con paginación y filtrado (ordenamiento especial)
     * @access Private (Read)
     */
    getCountries = asyncHandler(async (req, res, next) => {
        const skip = parseInt(req.query.skip) || 0;
        const take = parseInt(req.query.take) || 50000;
        const where = req.query.where || {}; // Puedes enviar filtros como { status: true }

        // El ordenamiento especial se maneja dentro del servicio
        const { data, total } = await CountryService.getCountries(skip, take, where);

        res.status(200).json({
            status: 'success',
            total,
            count: data.length,
            data
        });
    });

    /**
     * @route PUT /api/countries/:id
     * @route PATCH /api/countries/:id
     * @desc Actualiza un país por su ID
     * @access Private (Admin/Configurador)
     */
    updateCountry = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const updateData = req.body;

        delete updateData.id_country;
        delete updateData.created_at;
        delete updateData.updated_at;

        const updatedCountry = await CountryService.updateCountry(id, updateData);

        res.status(200).json({
            status: 'success',
            data: updatedCountry
        });
    });

    /**
     * @route DELETE /api/countries/:id
     * @desc Elimina un país por su ID
     * @access Private (Admin/Configurador)
     */
    deleteCountry = asyncHandler(async (req, res, next) => {
        const { id } = req.params;

        await CountryService.deleteCountry(id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    });

    /**
     * @route PATCH /api/countries/:id/status
     * @desc Cambia el estado (activo/inactivo) de un país
     * @access Private (Admin/Configurador)
     */
    changeCountryStatus = asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const { status } = req.body;

        if (typeof status !== 'boolean') {
            return next(new AppError('Status must be a boolean (true/false)', 400));
        }

        const updatedCountry = await CountryService.changeCountryStatus(id, status);

        res.status(200).json({
            status: 'success',
            data: updatedCountry
        });
    });
}

export default new CountryController();