export default class Eps {
    constructor({
        id_eps,
        eps_name,
        status = true,
        created_at = null,
        updated_at = null,
    }) {
        if (!eps_name) throw new Error('EPS name is required');

        this.id_eps = id_eps;
        this.eps_name = eps_name;
        this.status = status;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}