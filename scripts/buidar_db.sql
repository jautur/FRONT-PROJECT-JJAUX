-- ==============================================================================
-- Script SQL: Buidar la Base de Dades jjaux_db (PostgreSQL)
-- Plataforma AVISA / JJAUX
-- Buida totes les taules de l'esquema de V1__esquema_inicial.sql.
-- Manté únicament els 3 usuaris base: admin, cli i pro (els mateixos de DevUsersSeeder).
-- L'esquema el crea Flyway en arrancar el backend; aquest script no el modifica.
-- ==============================================================================

BEGIN;

TRUNCATE TABLE
    sollicituds_cancellacio,
    avisos,
    tasques,
    pressupostos,
    publicacions,
    blacklist_telefons,
    usuaris
CASCADE;

-- Les contrasenyes van amb hash BCrypt (la base no n'accepta en clar): adminadmin, clicli i propro.
INSERT INTO usuaris (nom, email, password, rol, telefon, verificat) VALUES
    ('Administrador General', 'admin@admin.es', '$2a$10$HGNe3I7XGe.Dzw99EByMFeRwMwGUPy7uzHfjnt8qw5zw.MAzzqd3K', 'ADMIN', '960000000', TRUE),
    ('cli', 'cli', '$2a$10$MZIblNQyKxURCF9s6VNjheFZOhxFpFUVyh1a3ut/5XrCycDMOn1Eq', 'CLIENT', '600111222', FALSE),
    ('pro', 'pro', '$2a$10$JTBioMAwGTTt0iZrt0Wu4u6UbJGvBtf4ayviXGNc0mqB.lBHJiNgu', 'PROFESSIONAL', '600333444', TRUE);

COMMIT;
