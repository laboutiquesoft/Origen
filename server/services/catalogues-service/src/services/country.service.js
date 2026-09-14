// src/services/CountryService.js

import CountryRepository from '../repositories/country.repository.js';
import Country from '../entities/country.js';
import { AppError } from '@origen/common';

class CountryService {

    /**
     * Crea un nuevo país.
     * @param {object} countryData - Datos del país (country_code, country_name, demonym, flag).
     * @returns {Promise<Country>} El nuevo país creado.
     * @throws {AppError} Si el código o nombre del país ya existe.
     */
    async createCountry(countryData) {
        if (!countryData.country_code) throw new AppError('Country code is required', 400);
        if (!countryData.country_name) throw new AppError('Country name is required', 400);

        countryData.country_code = countryData.country_code.trim().toUpperCase();
        countryData.country_name = countryData.country_name.trim();

        const existingByCode = await CountryRepository.findByCode(countryData.country_code);
        if (existingByCode) {
            throw new AppError(`Country with code '${countryData.country_code}' already exists`, 409);
        }

        const existingByName = await CountryRepository.findByName(countryData.country_name);
        if (existingByName) {
            throw new AppError(`Country with name '${countryData.country_name}' already exists`, 409);
        }

        const newCountry = new Country(countryData);
        const created = await CountryRepository.create(newCountry);
        return created;
    }

    /**
     * Obtiene un país por su ID.
     * @param {string} id - El UUID del país.
     * @returns {Promise<Country>} El país encontrado.
     * @throws {AppError} Si el país no se encuentra.
     */
    async getCountryById(id) {
        const country = await CountryRepository.findById(id);
        if (!country) {
            throw new AppError('Country not found', 404);
        }
        return country;
    }

    /**
     * Obtiene todos los países con paginación y filtrado, aplicando ordenamiento especial.
     * @param {number} skip - Número de registros a omitir.
     * @param {number} take - Número de registros a tomar.
     * @param {object} where - Condiciones de filtro.
     * @returns {Promise<{data: Country[], total: number}>} Lista de países y el total.
     */
    async getCountries(skip, take, where) {
        // Obtenemos TODOS los países del repositorio, sin paginar ni ordenar inicialmente.
        // El repositorio filtra, pero la paginación y el ordenamiento final se hacen aquí.
        const allCountries = await CountryRepository.findAll(0, 999999, where, 'country_name', 'ASC'); // Obtener todos o un número muy grande
        const total = await CountryRepository.count(where);

        const specialCountriesNames = ['Colombia', 'Venezuela (Bolivarian Republic of)', 'United States of America']; // Nombres exactos de la DB
        const specialCountries = [];
        let remainingCountries = [];

        // Separar países especiales y el resto
        allCountries.forEach(country => {
            if (specialCountriesNames.includes(country.country_name)) {
                specialCountries.push(country);
            } else {
                remainingCountries.push(country);
            }
        });

        // Ordenar los países especiales en el orden deseado
        specialCountries.sort((a, b) => {
            return specialCountriesNames.indexOf(a.country_name) - specialCountriesNames.indexOf(b.country_name);
        });

        // El resto de países ya viene ordenado alfabéticamente desde el repositorio
        // Combinar la lista
        const sortedCountries = [...specialCountries, ...remainingCountries];

        // Aplicar paginación final
        const paginatedCountries = sortedCountries.slice(skip, skip + take);

        return { data: paginatedCountries, total };
    }

    /**
     * Actualiza un país existente.
     * @param {string} id - El UUID del país a actualizar.
     * @param {object} updateData - Datos para actualizar el país.
     * @returns {Promise<Country>} El país actualizado.
     * @throws {AppError} Si el país no se encuentra o el código/nombre ya existe para otro país.
     */
    async updateCountry(id, updateData) {
        const existingCountry = await CountryRepository.findById(id);
        if (!existingCountry) {
            throw new AppError('Country not found', 404);
        }

        if (updateData.country_code && updateData.country_code.trim().toUpperCase() !== existingCountry.country_code) {
            updateData.country_code = updateData.country_code.trim().toUpperCase();
            const countryWithNewCode = await CountryRepository.findByCode(updateData.country_code);
            if (countryWithNewCode && countryWithNewCode.id_country !== id) {
                throw new AppError(`Country with code '${updateData.country_code}' already exists`, 409);
            }
        }

        if (updateData.country_name && updateData.country_name.trim() !== existingCountry.country_name) {
            updateData.country_name = updateData.country_name.trim();
            const countryWithNewName = await CountryRepository.findByName(updateData.country_name);
            if (countryWithNewName && countryWithNewName.id_country !== id) {
                throw new AppError(`Country with name '${updateData.country_name}' already exists`, 409);
            }
        }

        const updatedCountryInstance = new Country({ ...existingCountry, ...updateData });

        const updated = await CountryRepository.update(id, {
            country_code: updatedCountryInstance.country_code,
            country_name: updatedCountryInstance.country_name,
            demonym: updatedCountryInstance.demonym,
            flag: updatedCountryInstance.flag,
            status: updatedCountryInstance.status,
        });

        if (!updated) {
            throw new AppError('Failed to update country', 500);
        }
        return updated;
    }

    /**
     * Elimina un país por su ID.
     * @param {string} id - El UUID del país a eliminar.
     * @returns {Promise<boolean>} True si el país fue eliminado.
     * @throws {AppError} Si el país no se encuentra.
     */
    async deleteCountry(id) {
        const existingCountry = await CountryRepository.findById(id);
        if (!existingCountry) {
            throw new AppError('Country not found', 404);
        }

        // Aquí deberías considerar si hay dependencias (ej. en la tabla `tenants.country`).
        // Si hay, PostgreSQL fallará si tienes FKs que impiden la eliminación y ON DELETE SET NULL no está configurado.
        // Asegúrate de manejar esto o de que el diseño de la DB sea adecuado.

        const deleted = await CountryRepository.delete(id);
        if (!deleted) {
            throw new AppError('Failed to delete country', 500);
        }
        return deleted;
    }

    /**
     * Cambia el estado de un país (activo/inactivo).
     * @param {string} id - El UUID del país.
     * @param {boolean} status - El nuevo estado.
     * @returns {Promise<Country>} El país con el estado actualizado.
     * @throws {AppError} Si el país no se encuentra.
     */
    async changeCountryStatus(id, status) {
        const existingCountry = await CountryRepository.findById(id);
        if (!existingCountry) {
            throw new AppError('Country not found', 404);
        }
        const updated = await CountryRepository.changeStatus(id, status);
        if (!updated) {
            throw new AppError('Failed to change country status', 500);
        }
        return updated;
    }
}

export default new CountryService();