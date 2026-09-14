export default class CurrentCupsVersion {
    constructor({
        id,
        id_resolution,
        updated_at = null,
        resolution = null
    }) {
        if (!id_resolution) throw new Error('Resolution ID is required for Current CUPS Version');

        this.id = id;
        this.id_resolution = id_resolution;
        this.updated_at = updated_at;
        this.resolution = resolution;
    }
}