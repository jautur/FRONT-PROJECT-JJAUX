#!/usr/bin/env bash

# ==============================================================================
# Script de desplegament ràpid en local per al projecte JJAUX / AVISA
# Inicia:
#   1. PostgreSQL (Port 5432 / Base de dades jjaux_db)
#   2. Backend Spring Boot (Port 8080)
#   3. Frontend Angular (Port 4300)
#   4. Obertura automàtica al navegador web
# ==============================================================================

set -e

# Perfil del backend: dev crea els usuaris de prova (admin, cli i pro) si no existeixen.
# Per a les dades de demostració: SPRING_PROFILES_ACTIVE=demo ./desplegar.sh
export SPRING_PROFILES_ACTIVE="${SPRING_PROFILES_ACTIVE:-dev}"

# Secret de signatura dels tokens JWT: mai al repositori. Ve de l'entorn o del fitxer local ~/.avisa/jwt_secret
# (fora dels repositoris). Sense secret el backend no arrenca. Per crear-lo: vegeu docs/configuracio.md del back.
if [ -z "${AVISA_JWT_SECRET:-}" ] && [ -f "$HOME/.avisa/jwt_secret" ]; then
    AVISA_JWT_SECRET="$(tr -d '\r\n' < "$HOME/.avisa/jwt_secret")"
fi
if [ -z "${AVISA_JWT_SECRET:-}" ]; then
    echo "ERROR: falta AVISA_JWT_SECRET. Crea'l amb: mkdir -p ~/.avisa && openssl rand -base64 48 > ~/.avisa/jwt_secret"
    exit 1
fi
export AVISA_JWT_SECRET

# Paràmetres opcionals:
#   --rebuild, -f, --force: Recompila backend i frontend forçosament
#   --no-browser:           No obre el navegador web automàticament
FORCE_REBUILD=false
OPEN_BROWSER=true

for arg in "$@"; do
    case "$arg" in
        --rebuild|-f|--force)
            FORCE_REBUILD=true
            ;;
        --no-browser)
            OPEN_BROWSER=false
            ;;
    esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -d "${SCRIPT_DIR}/../../BACK-PROJECT-JJAUX" ]; then
    FRONT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
    BACK_DIR="$(cd "${SCRIPT_DIR}/../../BACK-PROJECT-JJAUX" && pwd)"
elif [ -d "${SCRIPT_DIR}/../BACK-PROJECT-JJAUX" ]; then
    FRONT_DIR="${SCRIPT_DIR}"
    BACK_DIR="$(cd "${SCRIPT_DIR}/../BACK-PROJECT-JJAUX" && pwd)"
elif [ -d "${SCRIPT_DIR}/../FRONT-PROJECT-JJAUX" ]; then
    FRONT_DIR="$(cd "${SCRIPT_DIR}/../FRONT-PROJECT-JJAUX" && pwd)"
    BACK_DIR="${SCRIPT_DIR}"
elif [ -d "${SCRIPT_DIR}/FRONT-PROJECT-JJAUX" ] && [ -d "${SCRIPT_DIR}/BACK-PROJECT-JJAUX" ]; then
    FRONT_DIR="$(cd "${SCRIPT_DIR}/FRONT-PROJECT-JJAUX" && pwd)"
    BACK_DIR="$(cd "${SCRIPT_DIR}/BACK-PROJECT-JJAUX" && pwd)"
else
    FRONT_DIR="/home/jautursis/Escriptori/FRONT-PROJECT-JJAUX"
    BACK_DIR="/home/jautursis/Escriptori/BACK-PROJECT-JJAUX"
fi

# Ubicacions de PostgreSQL (prioritzant ubicació persistent de l'usuari)
if [ -d "$HOME/.local/share/jjaux/pg" ]; then
    PG_DIR="$HOME/.local/share/jjaux/pg"
elif [ -d "/home/jautursis/.gemini/antigravity/brain/ac12e9c2-506a-4129-bb08-8c851cfd0667/scratch/pg" ]; then
    PG_DIR="/home/jautursis/.gemini/antigravity/brain/ac12e9c2-506a-4129-bb08-8c851cfd0667/scratch/pg"
else
    PG_DIR=""
fi

if [ -n "${PG_DIR}" ]; then
    PG_BIN="${PG_DIR}/node_modules/@embedded-postgres/linux-x64/native/bin"
    PG_LIB="${PG_DIR}/node_modules/@embedded-postgres/linux-x64/native/lib"
    PG_DATA="${PG_DIR}/data"
fi

echo "=========================================================="
echo "          INICIANT DESPLEGAMENT LOCAL JJAUX / AVISA"
echo "=========================================================="

# ------------------------------------------------------------------------------
# 1. Base de dades PostgreSQL (Port 5432)
# ------------------------------------------------------------------------------
echo -e "\n[1/3] Comprovant PostgreSQL..."
is_pg_running() {
    nc -z 127.0.0.1 5432 2>/dev/null || node -e "const net = require('net'); const s = net.connect(5432, '127.0.0.1', () => { s.destroy(); process.exit(0); }); s.on('error', () => process.exit(1));" 2>/dev/null
}

if is_pg_running; then
    echo "  -> PostgreSQL ja està en marxa al port 5432."
else
    echo "  -> Engegant servidor PostgreSQL..."
    if [ -n "${PG_DIR}" ] && [ -d "${PG_DATA}" ] && [ -x "${PG_BIN}/pg_ctl" ]; then
        LD_LIBRARY_PATH="${PG_LIB}" "${PG_BIN}/pg_ctl" -D "${PG_DATA}" -l "${PG_DIR}/postgres.log" -o "-p 5432" start || true
    elif command -v pg_ctlcluster >/dev/null 2>&1; then
        sudo service postgresql start 2>/dev/null || pg_ctlcluster 16 main start 2>/dev/null || true
    elif command -v systemctl >/dev/null 2>&1; then
        systemctl start postgresql 2>/dev/null || true
    fi

    echo -n "  -> Esperant que PostgreSQL estigui llest..."
    for i in {1..15}; do
        if is_pg_running; then
            echo " Llest!"
            break
        fi
        echo -n "."
        sleep 1
    done

    if ! is_pg_running; then
        echo " [AVÍS] No s'ha pogut verificar PostgreSQL al port 5432."
    fi
fi

# Inicialització de taules i dades si cal
if [ -n "${PG_DIR}" ] && [ -f "${PG_DIR}/init_db.js" ]; then
    (cd "${PG_DIR}" && node init_db.js >/dev/null 2>&1 || true)
fi

# Assegurar usuari administrador (admin@admin.es / adminadmin)
echo "  -> Verificant usuari administrador (admin@admin.es)..."
if [ -f "${FRONT_DIR}/scripts/assegurar_admin.js" ]; then
    node "${FRONT_DIR}/scripts/assegurar_admin.js" || true
elif [ -f "${FRONT_DIR}/assegurar_admin.js" ]; then
    node "${FRONT_DIR}/assegurar_admin.js" || true
elif [ -f "${BACK_DIR}/assegurar_admin.js" ]; then
    node "${BACK_DIR}/assegurar_admin.js" || true
fi

# ------------------------------------------------------------------------------
# 2. Backend Spring Boot (Port 8080)
# ------------------------------------------------------------------------------
echo -e "\n[2/3] Comprovant Backend Spring Boot..."
JAR_FILE="${BACK_DIR}/target/jjaux-back-0.0.1-SNAPSHOT.jar"
REBUILD_BACKEND=false

if [ "$FORCE_REBUILD" = "true" ] || [ ! -f "${JAR_FILE}" ]; then
    REBUILD_BACKEND=true
elif [ -n "$(find "${BACK_DIR}/src" "${BACK_DIR}/pom.xml" -newer "${JAR_FILE}" 2>/dev/null | head -n 1)" ]; then
    echo "  -> Canvis detectats al codi font del Backend."
    REBUILD_BACKEND=true
fi

if [ "$REBUILD_BACKEND" = "true" ]; then
    echo "  -> Aturant backend anterior per recompilar..."
    if [ -f "${BACK_DIR}/backend.pid" ]; then
        kill $(cat "${BACK_DIR}/backend.pid") 2>/dev/null || true
        rm -f "${BACK_DIR}/backend.pid"
    fi
    fuser -k 8080/tcp 2>/dev/null || true

    echo "  -> Compilant el backend amb Maven..."
    cd "${BACK_DIR}"
    if [ -x "./mvnw" ]; then
        ./mvnw clean package -DskipTests
    elif command -v mvn >/dev/null 2>&1; then
        mvn clean package -DskipTests
    elif [ -x "/home/jautursis/.m2/wrapper/dists/apache-maven-3.9.16/56ba1f9f/bin/mvn" ]; then
        /home/jautursis/.m2/wrapper/dists/apache-maven-3.9.16/56ba1f9f/bin/mvn clean package -DskipTests
    fi
fi

is_backend_running() {
    curl -s http://localhost:8080/api/dashboard >/dev/null 2>&1 || nc -z 127.0.0.1 8080 2>/dev/null
}

if [ "$REBUILD_BACKEND" = "false" ] && is_backend_running; then
    echo "  -> Backend ja està responent a http://localhost:8080"
else
    echo "  -> Engegant Spring Boot en segon pla..."
    fuser -k 8080/tcp 2>/dev/null || true
    cd "${BACK_DIR}"
    setsid nohup java -jar "${JAR_FILE}" > "${BACK_DIR}/backend.log" 2>&1 < /dev/null &
    BACKEND_PID=$!
    disown $BACKEND_PID 2>/dev/null || true
    echo $BACKEND_PID > "${BACK_DIR}/backend.pid"

    echo -n "  -> Esperant que el backend estigui llest..."
    for i in {1..40}; do
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
echo -e "\n[3/3] Comprovant Frontend Angular (Port 4300)..."
DIST_INDEX="${FRONT_DIR}/dist/front-project-jjaux-1/browser/index.html"
REBUILD_FRONTEND=false

if [ "$FORCE_REBUILD" = "true" ] || [ ! -f "${DIST_INDEX}" ]; then
    REBUILD_FRONTEND=true
elif [ -n "$(find "${FRONT_DIR}/src" "${FRONT_DIR}/package.json" -newer "${DIST_INDEX}" 2>/dev/null | head -n 1)" ]; then
    echo "  -> Canvis detectats al codi del Frontend."
    REBUILD_FRONTEND=true
fi

if [ "$REBUILD_FRONTEND" = "true" ]; then
    echo "  -> Aturant frontend anterior per recompilar..."
    if [ -f "${FRONT_DIR}/frontend.pid" ]; then
        kill $(cat "${FRONT_DIR}/frontend.pid") 2>/dev/null || true
        rm -f "${FRONT_DIR}/frontend.pid"
    fi
    fuser -k 4300/tcp 2>/dev/null || true

    echo "  -> Compilant aplicació Angular per a producció..."
    cd "${FRONT_DIR}" && npm run build
fi

is_frontend_running() {
    curl -s -o /dev/null http://localhost:4300 2>/dev/null || nc -z 127.0.0.1 4300 2>/dev/null
}

if [ "$REBUILD_FRONTEND" = "false" ] && is_frontend_running; then
    echo "  -> Frontend ja està servint a http://localhost:4300"
else
    echo "  -> Engegant servidor web del Frontend..."
    fuser -k 4300/tcp 2>/dev/null || true
    cd "${FRONT_DIR}"
    setsid nohup node serve.js > "${FRONT_DIR}/frontend.log" 2>&1 < /dev/null &
    FRONT_PID=$!
    disown $FRONT_PID 2>/dev/null || true
    echo $FRONT_PID > "${FRONT_DIR}/frontend.pid"

    echo -n "  -> Esperant que el frontend estigui llest..."
    for i in {1..10}; do
        if is_frontend_running; then
            echo " Llest!"
            break
        fi
        echo -n "."
        sleep 1
    done
fi

# ------------------------------------------------------------------------------
# 4. Obrir al navegador web
# ------------------------------------------------------------------------------
WEB_URL="http://localhost:4300/inici"
if [ "$OPEN_BROWSER" = "true" ]; then
    echo -e "\n  -> Obrint aplicació web al navegador..."
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "${WEB_URL}" >/dev/null 2>&1 || true
    elif command -v sensible-browser >/dev/null 2>&1; then
        sensible-browser "${WEB_URL}" >/dev/null 2>&1 || true
    fi
fi

echo "=========================================================="
echo "           DESPLEGAMENT WEB COMPLETAT AMB ÈXIT!"
echo "=========================================================="
echo " - Base de dades: PostgreSQL a localhost:5432 (BD: jjaux_db)"
echo " - API Backend:   http://localhost:8080/api"
echo " - Aplicació Web: http://localhost:4300/inici"
echo " - Usuari Admin:  admin@admin.es / adminadmin"
echo "=========================================================="
echo "Per aturar tots els serveis: ./aturar.sh"
echo "Per forçar reconstrucció:   ./desplegar.sh --rebuild"
echo "=========================================================="
