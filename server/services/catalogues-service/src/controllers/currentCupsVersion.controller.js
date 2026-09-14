import CurrentCupsVersionService from '../services/currentCupsVersion.service.js';
import { asyncHandler, AppError } from '@origen/common';

class CurrentCupsVersionController {

    /**
     * @route GET /api/current-cups-version
     * @desc Obtiene la resolución CUPS actualmente vigente.
     * @access Private (Read)
     */
    getCurrentCupsVersion = asyncHandler(async (req, res, next) => {
        const includeResolution = req.query.include === 'resolution' || req.query.include === 'true';
        const currentVersion = await CurrentCupsVersionService.getCurrentCupsVersion(includeResolution);
        res.status(200).json({
            status: 'success',
            data: currentVersion
        });
    });

    /**
     * @route POST /api/current-cups-version
     * @desc Establece una resolución CUPS como la versión actualmente vigente.
     * @access Private (Admin)
     */
    setCurrentCupsVersion = asyncHandler(async (req, res, next) => {
        const { id_resolution } = req.body;
        if (!id_resolution) {
            return next(new AppError('Resolution ID is required', 400));
        }
        const updatedCurrentVersion = await CurrentCupsVersionService.setCurrentCupsVersion(id_resolution);
        res.status(200).json({
            status: 'success',
            message: 'Current CUPS version updated successfully',
            data: updatedCurrentVersion
        });
    });
}

export default new CurrentCupsVersionController();