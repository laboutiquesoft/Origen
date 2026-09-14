export default class Allergy {
    constructor({
        id_allergy,
        allergy_name,
        description,
        status = true,
        created_at = null,
        updated_at = null
    }) {
         if (!allergy_name) throw new Error('Allergy name is required');

        this.id_allergy = id_allergy
        this.allergy_name = allergy_name
        this.description = description
        this.status = status
        this.created_at = created_at
        this.updated_at = updated_at
    }
}