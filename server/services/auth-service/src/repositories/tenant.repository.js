import { pool } from "../config/db.js";

class TenantRepository {
  async create(data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map((_, i) => `$${i + 1}`);

    const result = await pool.query(
      `INSERT INTO tenants (${fields.map((f) => `"${f}"`).join(", ")}) 
             VALUES (${placeholders.join(", ")}) 
             RETURNING *`,
      values,
    );
    return result.rows[0];
  }

  async findAll(skip = 0, limit = 10, where = {}) {
    const client = await pool.connect();
    try {
      let query = `SELECT * FROM tenants`;
      const { sql, values } = this._buildWhereClause(where);

      if (sql) {
        query += ` WHERE ${sql}`;
      }

      query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
      values.push(limit, skip);

      const result = await client.query(query, values);

      // Fetch relations for each tenant
      const tenants = [];
      for (const tenant of result.rows) {
        tenants.push(await this._getTenantWithRelations(client, tenant));
      }
      return tenants;
    } finally {
      client.release();
    }
  }

  async count(where = {}) {
    let query = `SELECT COUNT(*) FROM tenants`;
    const { sql, values } = this._buildWhereClause(where);

    if (sql) {
      query += ` WHERE ${sql}`;
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count);
  }

  async findById(id) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM tenants WHERE id_tenant = $1`,
        [id],
      );
      if (!result.rows.length) return null;
      return await this._getTenantWithRelations(client, result.rows[0]);
    } finally {
      client.release();
    }
  }

  async _getTenantWithRelations(client, tenant) {

    const microservices = await client.query(
      `
        SELECT m.*, m.microservice_name as name
        FROM tenant_microservices tm
        JOIN microservices m ON m.id_microservice = tm.id_microservice
        WHERE tm.id_tenant = $1
    `,
      [tenant.id_tenant],
    );

    const sites = await client.query(
      `
        SELECT * FROM sites WHERE id_tenant = $1 ORDER BY site_name ASC
    `,
      [tenant.id_tenant],
    );

    const users = await client.query(
      `
        SELECT 
            u.id_user,
            u.email,
            u.first_name,
            u.last_name,
            u.status,
            u.created_at,
            r.role_name
        FROM users u
        LEFT JOIN user_roles ur ON u.id_user = ur.id_user
        LEFT JOIN roles r ON ur.id_role = r.id_role
        WHERE u.id_tenant = $1
        ORDER BY u.created_at ASC
    `,
      [tenant.id_tenant],
    );

    return {
      ...tenant,
      tenant_microservices: microservices.rows.map((m) => ({
        microservice: m,
      })),
      sites: sites.rows,
      users: users.rows, // <-- Arreglo de usuarios asociados
      adminUser: users.rows[0] || null, // <-- Primer usuario creado (Administrador inicial)
    };
  }

  async update(id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);

    const setClause = fields
      .map((field, i) => `"${field}" = $${i + 1}`)
      .join(", ");

    const result = await pool.query(
      `UPDATE tenants SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
             WHERE id_tenant = $${fields.length + 1} 
             RETURNING *`,
      [...values, id],
    );
    return result.rows[0];
  }

  async delete(id) {
    await pool.query("DELETE FROM tenants WHERE id_tenant = $1", [id]);
    return true;
  }

  async getStats(tenantId) {
    const sitesCount = await pool.query(
      "SELECT COUNT(*) FROM sites WHERE id_tenant = $1",
      [tenantId],
    );
    const professionalsCount = await pool.query(
      "SELECT COUNT(*) FROM tenant_professionals WHERE id_tenant = $1",
      [tenantId],
    );

    // Services counting: unique services enabled across all sites of the tenant
    const servicesCount = await pool.query(
      `
            SELECT COUNT(DISTINCT sgs.id_service) 
            FROM site_group_services sgs 
            JOIN site_groups sg ON sgs.id_site_group = sg.id_site_group 
            JOIN sites s ON sg.id_site = s.id_site 
            WHERE s.id_tenant = $1
        `,
      [tenantId],
    );

    // Rooms (Consultorios) - Individual queries to be safer
    const { rows: crCount } = await pool.query(
      "SELECT COUNT(*) FROM consulting_rooms JOIN sites ON consulting_rooms.id_site = sites.id_site WHERE sites.id_tenant = $1",
      [tenantId],
    );
    const { rows: prCount } = await pool.query(
      "SELECT COUNT(*) FROM procedure_rooms JOIN sites ON procedure_rooms.id_site = sites.id_site WHERE sites.id_tenant = $1",
      [tenantId],
    );
    const { rows: srCount } = await pool.query(
      "SELECT COUNT(*) FROM surgery_rooms JOIN sites ON surgery_rooms.id_site = sites.id_site WHERE sites.id_tenant = $1",
      [tenantId],
    );

    const totalRooms =
      parseInt(crCount[0].count) +
      parseInt(prCount[0].count) +
      parseInt(srCount[0].count);

    const stats = {
      sites: parseInt(sitesCount.rows[0]?.count || 0),
      professionals: parseInt(professionalsCount.rows[0]?.count || 0),
      services: parseInt(servicesCount.rows[0]?.count || 0),
      consultorios: totalRooms,
    };
    console.log(`[getStats] DEBUG: tenantId=${tenantId}`, stats);
    return stats;
  }

  // Helper to build WHERE clause from Prisma-like objects or simple objects
  _buildWhereClause(where) {
    const conditions = [];
    const values = [];

    if (where.OR) {
      const orConditions = where.OR.map((cond) => {
        const key = Object.keys(cond)[0];
        const value = cond[key];
        if (typeof value === "object" && value.contains) {
          values.push(`%${value.contains}%`);
          return `"${key}" ILIKE $${values.length}`;
        } else {
          values.push(value);
          return `"${key}" = $${values.length}`;
        }
      });
      conditions.push(`(${orConditions.join(" OR ")})`);
    }

    Object.keys(where).forEach((key) => {
      if (key === "OR") return;
      const value = where[key];
      if (typeof value === "object" && value.contains) {
        values.push(`%${value.contains}%`);
        conditions.push(`"${key}" ILIKE $${values.length}`);
      } else if (value !== undefined) {
        values.push(value);
        conditions.push(`"${key}" = $${values.length}`);
      }
    });

    return {
      sql: conditions.length > 0 ? conditions.join(" AND ") : null,
      values,
    };
  }
}

export default new TenantRepository();
