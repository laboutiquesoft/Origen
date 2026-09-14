export default class Modality {
    constructor({
        id_modality,
        modality_name,
        status = true,
        created_at = null,
        updated_at = null
    }) {
        if (!modality_name) throw new Error('Modality name is required');

        this.id_modality = id_modality;
        this.modality_name = modality_name;
        this.status = status;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}