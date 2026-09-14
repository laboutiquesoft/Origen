import CurrentCupsVersionRepository from '../repositories/currentCupsVersion.repository.js';
import CupsResolutionRepository from '../repositories/cupsResolution.repository.js'; // Para validar id_resolution
import CurrentCupsVersion from '../entities/currentCupsVersion.js';
import { AppError } from '@origen/common';

class CurrentCupsVersionService {

    /**
     * Obtiene la resolución CUPS actualmente vigente.
     * @param {boolean} [includeResolution=false] - Si es true, incluye los datos de la resolución.
     * @returns {Promise<CurrentCupsVersion>} La versión actual o null.
     */
    async getCurrentCupsVersion(includeResolution = false) {
        const currentVersion = await CurrentCupsVersionRepository.getCurrent(includeResolution);
        if (!currentVersion) {
            // Esto es normal si el sistema es nuevo y no se ha configurado una versión inicial.
            // Considera devolver un objeto vacío o null, o lanzar un error si es un estado inválido.
            throw new AppError('Current CUPS Version not set. Please configure an active resolution.', 404);
        }
        return currentVersion;
    }

    /**
     * Establece una resolución CUPS como la versión actualmente vigente.
     * Esto también puede "desactivar" la resolución anterior estableciendo su `end_date`.
     * @param {string} idResolution - El UUID de la resolución a establecer como actual.
     * @returns {Promise<CurrentCupsVersion>} La versión actual actualizada.
     * @throws {AppError} Si la resolución no existe o no está activa.
     */
    async setCurrentCupsVersion(idResolution) {
        if (!idResolution) {
            throw new AppError('Resolution ID is required to set as current', 400);
        }

        const newCurrentResolution = await CupsResolutionRepository.findById(idResolution);
        if (!newCurrentResolution) {
            throw new AppError(`CUPS Resolution with ID '${idResolution}' not found`, 404);
        }
        if (!newCurrentResolution.status) {
            throw new AppError(`CUPS Resolution '${newCurrentResolution.resolution_number}' is not active and cannot be set as current`, 400);
        }

        const oldCurrentVersion = await CurrentCupsVersionRepository.getCurrent();

        // 1. Establecer la nueva resolución como actual
        const updatedCurrent = await CurrentCupsVersionRepository.setOrUpdateCurrent(idResolution);

        // 2. Si había una resolución anterior, actualizar su end_date y status (opcional, pero buena práctica)
        if (oldCurrentVersion && oldCurrentVersion.id_resolution !== idResolution) {
            // Opcionalmente, puedes actualizar el `end_date` de la resolución anterior aquí.
            // Esto implica una actualización de la resolución en CupsResolutionRepository.
            await CupsResolutionRepository.update(oldCurrentVersion.id_resolution, {
                end_date: new Date(),
                // status: false, // Podrías inactivarla si ya no es la "actual"
            });
        }
        
        return updatedCurrent;
    }
}

export default new CurrentCupsVersionService();