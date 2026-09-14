// src/entities/tenant.js

export default class Tenant {
    constructor({
        id_tenant,
        tenant_name,
        slug,
        initials,
        nit,
        country,
        city,
        logoUrl,
        status = true
    }) {
        if (!tenant_name) throw new Error('Tenant name is required');
        if (!slug) throw new Error('Tenant slug is required');

        this.id = id_tenant;
        this.tenant_name = tenant_name;
        this.slug = slug;
        this.initials = initials;
        this.nit = nit;
        this.country = country;
        this.city = city;
        this.logoUrl = logoUrl;
        this.status = status;
    }

    isActive() {
        return this.status === true;
    }
}