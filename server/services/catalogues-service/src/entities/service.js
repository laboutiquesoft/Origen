export default class Service {
    constructor({
        id_service,
        code,
        service_name,
        description,
        status = true,
        id_service_group = null,
        created_at = null,
        updated_at = null,
        service_group = null
    }) {
        if (!code) throw new Error('Service code is required');
        if (!service_name) throw new Error('Service name is required'); 
        
        this.id_service = id_service;
        this.code = code;
        this.service_name = service_name;
        this.description = description;
        this.status = status;
        this.id_service_group = id_service_group;        
        this.created_at = created_at;
        this.updated_at = updated_at;

        this.service_group = service_group;
    }
}