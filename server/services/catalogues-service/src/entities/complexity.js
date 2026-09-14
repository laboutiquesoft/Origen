export default class Complexity {
    constructor({
        id_complexity,
        complexity_name,
        status = true,
        created_at = null,
        updated_at = null
    }) {
        if (!complexity_name) throw new Error('Complexity name is required');

        this.id_complexity = id_complexity;
        this.complexity_name = complexity_name;
        this.status = status;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}