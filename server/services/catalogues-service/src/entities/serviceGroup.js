export default class ServiceGroup {
    constructor({
        id_service_group,
        code,
        service_group_name,
        description,
        status = true,
        created_at = null,
        updated_at = null
    }) {
        if (!code) throw new Error('Group code is required');
        if (!service_group_name) throw new Error('Group name is required');

        this.id_service_group = id_service_group;
        this.code = code;
        this.service_group_name = service_group_name;
        this.description = description;
        this.status = status;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}