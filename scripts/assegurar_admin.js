#!/usr/bin/env node

/**
 * Script per assegurar l'existència de l'usuari administrador principal
 * Credencials:
 *   - Email:    admin@admin.es
 *   - Password: adminadmin
 *   - Rol:      ADMIN
 *
 * No crea cap taula: l'esquema és de Flyway. Si encara no existeix, no fa res,
 * perquè crear-la ací impediria arrancar el backend, i el perfil dev ja crearà l'admin.
 */

let pg;
try {
  pg = require('pg');
} catch (e) {
  try {
    const path = require('path');
    pg = require(path.join(__dirname, '..', 'node_modules', 'pg'));
  } catch (e1) {
    try {
      const path = require('path');
      pg = require(path.join(__dirname, '..', 'FRONT-PROJECT-JJAUX', 'node_modules', 'pg'));
    } catch (e2) {
      try {
        pg = require('/home/jautursis/.gemini/antigravity/brain/ac12e9c2-506a-4129-bb08-8c851cfd0667/scratch/pg/node_modules/pg');
      } catch (e3) {
        console.error('❌ Mòdul "pg" no trobat.');
        process.exit(1);
      }
    }
  }
}
const { Client } = pg;

// Fora del perfil dev, l'admin el crea el backend (AdminSeeder) amb la contrasenya de AVISA_ADMIN_PASSWORD.
// Aquest script només hi posa la contrasenya de proves en dev, perquè no la trepitge.
const perfil = process.env.SPRING_PROFILES_ACTIVE || '';
if (perfil.split(',').map(s => s.trim()).indexOf('dev') === -1) {
  console.log("ℹ️  Perfil '" + perfil + "': l'administrador el crea el backend amb AVISA_ADMIN_PASSWORD.");
  process.exit(0);
}

const config = {
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD !== undefined ? process.env.PGPASSWORD : (process.env.DB_PASSWORD || ''),
  database: process.env.PGDATABASE || 'jjaux_db'
};

async function connectClient() {
  let client = new Client(config);
  try {
    await client.connect();
    return client;
  } catch (err) {
    if (config.password === '' && (err.code === '28P01' || (err.message && err.message.toLowerCase().includes('password')))) {
      client = new Client({ ...config, password: 'postgres' });
      try {
        await client.connect();
        return client;
      } catch (retryErr) {
        return null;
      }
    }
    return null;
  }
}

async function assegurarAdmin() {
  const client = await connectClient();
  if (!client) {
    console.log('⚠️ No s\'ha pogut connectar a PostgreSQL directament. Spring Boot s\'encarregarà d\'inicialitzar l\'usuari.');
    return;
  }

  try {
    const esquema = await client.query("SELECT to_regclass('public.usuaris') AS taula");
    if (!esquema.rows[0].taula) {
      console.log('ℹ️  Encara no hi ha esquema: Flyway el crearà i el perfil dev afegirà l\'administrador.');
      return;
    }

    await client.query(`
      INSERT INTO usuaris (nom, email, password, rol, telefon, bio, verificat)
      VALUES ('Administrador General', 'admin@admin.es', '$2a$10$HGNe3I7XGe.Dzw99EByMFeRwMwGUPy7uzHfjnt8qw5zw.MAzzqd3K', 'ADMIN', '960000000', 'Administrador de la plataforma AVISA', TRUE)
      ON CONFLICT (LOWER(email)) DO UPDATE SET password = '$2a$10$HGNe3I7XGe.Dzw99EByMFeRwMwGUPy7uzHfjnt8qw5zw.MAzzqd3K', rol = 'ADMIN'
    `);
    console.log('✅ Usuari administrador admin@admin.es verificat (password: adminadmin)');

    const resFinal = await client.query("SELECT id, nom, email, password, rol FROM usuaris WHERE LOWER(email) = 'admin@admin.es'");
    console.table(resFinal.rows);
  } catch (err) {
    console.error('❌ Error gestionant l\'usuari administrador:', err.message);
  } finally {
    await client.end().catch(() => {});
  }
}

assegurarAdmin().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});

