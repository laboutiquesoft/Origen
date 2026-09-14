export default class Specialty {
    constructor({
        id_specialty,
        specialty_name,
        description,
        status = true,
        created_at = null,
        updated_at = null
    }) {
        if (!specialty_name) throw new Error('Specialty name is required');

        this.id_specialty = id_specialty;
        this.specialty_name = specialty_name;
        this.description = description;
        this.status = status;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}