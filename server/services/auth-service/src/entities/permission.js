export default class Permission {
    constructor({
        id_permission,
        permission_resource,
        permission_action,
        description = null
    }) {
        if (!permission_resource) throw new Error('Permission resource is required');
        if (!permission_action) throw new Error('Permission action is required');

        this.id = id_permission;
        this.permission_resource = permission_resource;
        this.permission_action = permission_action;   
        this.description = description;
    }

    get code() {        
        return `${this.permission_resource}:${this.permission_action}`;
    }
}