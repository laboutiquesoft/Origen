// src/entities/role.js

export default class Role {
  constructor({
    id_role,
    role_name,
    description = null,
    is_system = false,
    id_tenant = null,
    id_site = null,
    created_at = null,
    updated_at = null
  }) {
    if (!role_name) throw new Error('Role name is required');

    this.id = id_role;
    this.role_name = role_name;
    this.description = description;
    this.isSystem = is_system;
    this.tenantId = id_tenant;
    this.siteId = id_site;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }

  isGlobal() {
    return !this.tenantId && !this.siteId;
  }

  isTenantScoped() {
    return !!this.tenantId && !this.siteId;
  }

  isSiteScoped() {
    return !!this.tenantId && !!this.siteId;
  }
}