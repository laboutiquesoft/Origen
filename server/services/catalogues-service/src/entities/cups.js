export default class Cups {
    constructor({
        id_cups,
        cups_code,
        cups_description,
        cups_observation = null,
        status = true,
        id_resolution,
        created_at = null,
        updated_at = null,
        resolution = null 
    }) {
        if (!cups_code) throw new Error('CUPS code is required');
        if (!cups_description) throw new Error('CUPS description is required');
        if (!id_resolution) throw new Error('Resolution ID is required for CUPS');

        this.id_cups = id_cups;
        this.cups_code = cups_code;
        this.cups_description = cups_description;
        this.cups_observation = cups_observation;
        this.status = status;
        this.id_resolution = id_resolution;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.resolution = resolution;
    }
}