import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Conectar usando la cadena de conexión del VPS de Hostinger
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres:pis1BnUwdo6T9KIHO7i6xFRHuxkrUsteiggoWG7mySve1907KfPNiOsAYYCJ8Wko@2.25.219.16:5432/postgres',
});

async function seedAllmightyUser() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1️⃣ Definición y creación/aseguramiento de los roles del sistema
    console.log('1️⃣ Asegurando que existan los roles globales del sistema (AllMighty, Admin, SiteAdmin)...');

    const systemRoles = [
      {
        name: 'AllMighty',
        description: 'Superadministrador global del sistema con acceso sin restricciones',
      },
      {
        name: 'Admin',
        description: 'Administrador general de Tenant / Organización',
      },
      {
        name: 'SiteAdmin',
        description: 'Administrador de Sede / Sitio',
      },
    ];

    const roleMap = {};

    for (const role of systemRoles) {
      let roleRes = await client.query(
        `SELECT id_role FROM roles WHERE role_name = $1 AND id_tenant IS NULL AND id_site IS NULL`,
        [role.name]
      );

      if (roleRes.rows.length === 0) {
        const insertRoleQuery = `
          INSERT INTO roles (role_name, description, is_system, id_tenant, id_site)
          VALUES ($1, $2, TRUE, NULL, NULL)
          RETURNING id_role;
        `;
        const newRole = await client.query(insertRoleQuery, [
          role.name,
          role.description,
        ]);
        roleMap[role.name] = newRole.rows[0].id_role;
        console.log(`   └─ Rol '${role.name}' creado con ID: ${newRole.rows[0].id_role}`);
      } else {
        roleMap[role.name] = roleRes.rows[0].id_role;
        console.log(`   └─ Rol '${role.name}' ya existía con ID: ${roleRes.rows[0].id_role}`);
      }
    }

    // Credenciales del usuario que se CREARÁ en la tabla "users"
    const userEmail = 'laboutique.soft@gmail.com';
    const plainPassword = 'AllMightyPassword123!';

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    console.log('\n2️⃣ Creando o actualizando usuario en la tabla users...');
    const userQuery = `
      INSERT INTO users (email, password, first_name, last_name, status)
      VALUES ($1, $2, $3, $4, TRUE)
      ON CONFLICT (email) 
      DO UPDATE SET 
        password = EXCLUDED.password, 
        updated_at = CURRENT_TIMESTAMP
      RETURNING id_user;
    `;
    const userRes = await client.query(userQuery, [
      userEmail,
      hashedPassword,
      'System',
      'AllMighty',
    ]);
    const userId = userRes.rows[0].id_user;

    console.log('3️⃣ Asignando el Rol AllMighty al Usuario...');
    const allmightyRoleId = roleMap['AllMighty'];

    const userRoleQuery = `
      INSERT INTO user_roles (id_user, id_role)
      VALUES ($1, $2)
      ON CONFLICT (id_user, id_role) DO NOTHING;
    `;
    await client.query(userRoleQuery, [userId, allmightyRoleId]);

    await client.query('COMMIT');

    console.log('\n========================================');
    console.log('✅ SEED COMPLETADO CON ÉXITO');
    console.log('========================================');
    console.log(`Roles en la BD: AllMighty, Admin, SiteAdmin`);
    console.log(`Usuario Creado: ${userEmail}`);
    console.log(`Password:       ${plainPassword}`);
    console.log(`User ID:        ${userId}`);
    console.log('========================================\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error durante la ejecución del seed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedAllmightyUser();