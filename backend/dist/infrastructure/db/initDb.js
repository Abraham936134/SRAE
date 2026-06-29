"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const neon_1 = __importDefault(require("./neon"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
async function init() {
    console.log('[InitDb] Starting database re-initialization...');
    try {
        // 1. Drop existing incompatible tables
        console.log('[InitDb] Dropping existing public tables if they exist...');
        await (0, neon_1.default) `
      DROP TABLE IF EXISTS 
        calificaciones_criterio, 
        versiones_rubrica, 
        actividades, 
        evaluaciones, 
        niveles, 
        criterios, 
        rubricas_historial,
        rubricas, 
        usuarios 
      CASCADE;
    `;
        console.log('[InitDb] Incompatible tables dropped.');
        // 2. Read schema.sql
        const schemaPath = path_1.default.join(__dirname, 'schema.sql');
        console.log(`[InitDb] Reading schema SQL from: ${schemaPath}`);
        let schemaSql = fs_1.default.readFileSync(schemaPath, 'utf8');
        // Remove single line comments
        schemaSql = schemaSql.replace(/--.*$/gm, '');
        // 3. Split and execute statements
        console.log('[InitDb] Splitting schema.sql statements...');
        const statements = schemaSql
            .split(';')
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
        console.log(`[InitDb] Found ${statements.length} SQL statements to execute.`);
        for (const stmt of statements) {
            console.log(`[InitDb] Executing statement: ${stmt.substring(0, 60).replace(/\n/g, ' ')}...`);
            await (0, neon_1.default)(stmt);
        }
        console.log('[InitDb] Schema successfully applied.');
        // 4. Seed default users
        console.log('[InitDb] Seeding default users...');
        const seedUsers = [
            {
                id: (0, crypto_1.randomUUID)(),
                nombre: 'Administrador General',
                email: 'admin@urp.edu.pe',
                password: 'secret123',
                rol: 'administrador'
            },
            {
                id: (0, crypto_1.randomUUID)(),
                nombre: 'Abraham Alva (Docente)',
                email: 'abraham.alva@urp.edu.pe',
                password: 'secret123',
                rol: 'docente'
            },
            {
                id: (0, crypto_1.randomUUID)(),
                nombre: 'Coordinador de Escuela (Auxiliar)',
                email: 'auxiliar@urp.edu.pe',
                password: 'secret123',
                rol: 'auxiliar'
            }
        ];
        for (const u of seedUsers) {
            const hashedPassword = await bcrypt_1.default.hash(u.password, 10);
            await (0, neon_1.default) `
        INSERT INTO usuarios (id, nombre, email, password, rol)
        VALUES (${u.id}, ${u.nombre}, ${u.email}, ${hashedPassword}, ${u.rol})
      `;
            console.log(`[InitDb] Seeded user: ${u.nombre} (${u.rol})`);
        }
        console.log('[InitDb] Database re-initialization completed successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('[InitDb] Database initialization failed:', error);
        process.exit(1);
    }
}
init();
