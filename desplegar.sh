#!/usr/bin/env bash

# ==============================================================================
# Script de desplegament ràpid en local per al projecte JJAUX
# Inicia:
#   1. PostgreSQL (Port 5432 / Base de dades jjaux_db)
#   2. Backend Spring Boot (Port 8080)
#   3. Frontend Angular (Port 4300)
# ==============================================================================

set -e

PROJECT_DIR="/home/jautursis/Escriptori"
FRONT_DIR="${PROJECT_DIR}/FRONT-PROJECT-JJAUX"
BACK_DIR="${PROJECT_DIR}/BACK-PROJECT-JJAUX"
PG_DIR="/home/jautursis/.gemini/antigravity/brain/ac12e9c2-506a-4129-bb08-8c851cfd0667/scratch/pg"
MAVEN_BIN="/home/jautursis/.m2/wrapper/dists/apache-maven-3.9.16/56ba1f9f/bin/mvn"
PG_BIN="${PG_DIR}/node_modules/@embedded-postgres/linux-x64/native/bin"
PG_LIB="${PG_DIR}/node_modules/@embedded-postgres/linux-x64/native/lib"
PG_DATA="${PG_DIR}/data"

echo "=========================================================="
echo "          INICIANT DESPLEGAMENT LOCAL JJAUX"
echo "=========================================================="

# ------------------------------------------------------------------------------
# 1. Base de dades PostgreSQL (Port 5432)
# ------------------------------------------------------------------------------
echo -e "\n[1/3] Comprovant PostgreSQL..."
if nc -z 127.0.0.1 5432 2>/dev/null || node -e "const net = require('net'); const s = net.connect(5432, '127.0.0.1', () => { process.exit(0); }); s.on('error', () => process.exit(1));" 2>/dev/null; then
    echo "  -> PostgreSQL ja està en marxa al port 5432."
else
    echo "  -> Engegant servidor PostgreSQL..."
    LD_LIBRARY_PATH="${PG_LIB}" "${PG_BIN}/pg_ctl" -D "${PG_DATA}" -l "${PG_DIR}/postgres.log" -o "-p 5432" start || true
    sleep 2
fi

# Inicialització de taules i dades si cal
echo "  -> Verificant esquema i dades a jjaux_db..."
cd "${PG_DIR}" && node init_db.js >/dev/null 2>&1 || true

# ------------------------------------------------------------------------------
# 2. Backend Spring Boot (Port 8080)
# ------------------------------------------------------------------------------
echo -e "\n[2/3] Comprovant Backend Spring Boot..."
if nc -z 127.0.0.1 8080 2>/dev/null || curl -s -o /dev/null http://localhost:8080/api/dashboard 2>/dev/null; then
    echo "  -> Backend ja està responent a http://localhost:8080"
else
    JAR_FILE="${BACK_DIR}/target/jjaux-back-0.0.1-SNAPSHOT.jar"
    if [ ! -f "${JAR_FILE}" ]; then
        echo "  -> Compilant el backend amb Maven..."
        cd "${BACK_DIR}"
        "${MAVEN_BIN}" clean package -DskipTests
    fi

    echo "  -> Engegant Spring Boot en segon pla..."
    nohup java -jar "${JAR_FILE}" > "${BACK_DIR}/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "${BACK_DIR}/backend.pid"

    echo -n "  -> Esperant que el backend estigui llest..."
    for i in {1..30}; do
        if curl -s http://localhost:8080/api/dashboard >/dev/null 2>&1; then
            echo " Llest!"
            break
        fi
        echo -n "."
        sleep 1
    done
fi

# ------------------------------------------------------------------------------
# 3. Frontend Angular (Port 4300)
# ------------------------------------------------------------------------------
echo -e "\n[3/3] Comprovant Frontend Angular..."
if nc -z 127.0.0.1 4300 2>/dev/null || curl -s -o /dev/null http://localhost:4300 2>/dev/null; then
    echo "  -> Frontend ja està servint a http://localhost:4300"
else
    if [ ! -d "${FRONT_DIR}/dist/front-project-jjaux-1/browser" ]; then
        echo "  -> Compilant aplicació Angular..."
        cd "${FRONT_DIR}" && npm run build
    fi

    echo "  -> Engegant servidor web del Frontend..."
    cd "${FRONT_DIR}"
    nohup node serve.js > "${FRONT_DIR}/frontend.log" 2>&1 &
    FRONT_PID=$!
    echo $FRONT_PID > "${FRONT_DIR}/frontend.pid"
    sleep 1
fi

echo "=========================================================="
echo "           DESPLEGAMENT COMPLETAT AMB ÈXIT!"
echo "=========================================================="
echo " - Base de dades: PostgreSQL a localhost:5432 (BD: jjaux_db)"
echo " - API Backend:   http://localhost:8080/api"
echo " - Aplicació Web: http://localhost:4300"
echo "=========================================================="
echo "Per aturar tots els serveis: ./aturar.sh"
echo "=========================================================="

