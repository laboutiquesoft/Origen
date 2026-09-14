export default class Specificity {
    constructor({
        id_specificity,
        specificity_name,
        status = true,
        created_at = null,
        updated_at = null
    }) {
        if (!specificity_name) throw new Error('Specificity name is required');

        this.id_specificity = id_specificity;
        this.specificity_name = specificity_name;
        this.status = status;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}