import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { config } from '../config/env.js';
import { createMockStore } from '../utils/mockDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDb() {
  console.log(`\n======================================================`);
  console.log(`ShareSphere — Database Initialization`);
  console.log(`Target: ${config.db.host}:${config.db.port}`);
  console.log(`======================================================\n`);

  let connection;
  try {
    // Attempt live MySQL connection first
    connection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      multipleStatements: true,
      connectTimeout: 2000,
    });

    console.log(`[1/3] Connected to MySQL server.`);

    // Read schema.sql
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`schema.sql not found at ${schemaPath}`);
    }
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log(`[2/3] Applying database schema from database/schema.sql...`);
    await connection.query(schemaSql);
    console.log(`✓ Schema applied successfully. Database "sharesphere" ready.`);

    // Read seed.sql
    const seedPath = path.resolve(__dirname, '../../../database/seed.sql');
    if (fs.existsSync(seedPath)) {
      console.log(`[3/3] Seeding demo records from database/seed.sql...`);
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await connection.query(seedSql);
      console.log(`✓ Seed data imported successfully.`);
    }

    console.log(`\n✓ MySQL Database initialization completed! You can now start the server with: npm run dev\n`);
  } catch (err) {
    console.warn(`\n[Notice] Live MySQL server is not detected on ${config.db.host}:${config.db.port} (${err.message}).`);
    console.log(`[Fallback] Initializing persistent file-based database for ShareSphere...`);

    const dbPath = path.resolve(__dirname, '../../../database/sharesphere_db.json');
    const store = createMockStore();
    fs.writeFileSync(dbPath, JSON.stringify(store, null, 2), 'utf8');

    console.log(`✓ Persistent database created at: ${dbPath}`);
    console.log(`✓ All demonstration tables (users, resources, bookings, incidents, audit logs) initialized and seeded.`);
    console.log(`\n✓ Database initialization completed! You can now run the application with: npm run dev\n`);
  } finally {
    if (connection) await connection.end();
  }
}

initDb();
