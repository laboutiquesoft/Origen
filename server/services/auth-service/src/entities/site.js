// src/entities/site.js

export default class Site {
    constructor({
        id_site,
        site_name,
        city,
        id_tenant,
        status = true
    }) {
        if (!site_name) throw new Error('Site name is required');
        if (!id_tenant) throw new Error('Site must belong to a tenant');

        this.id = id_site;
        this.site_name = site_name;
        this.city = city;
        this.tenantId = id_tenant;
        this.status = status;
    }

    belongsToTenant(tenantId) {
        return this.tenantId === tenantId;
    }
}