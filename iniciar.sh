#!/bin/bash
# ============================================================
# LlevaloPe - Script de Inicio Rápido
# ============================================================

echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║   🛒  LlevaloPe - Plataforma E-Commerce   ║"
echo "║       Tu Tienda Online, Sin Límites        ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}▶ Verificando dependencias...${NC}"

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Instálalo desde https://docker.com"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado."
    exit 1
fi

echo -e "${GREEN}✅ Docker disponible${NC}"

# Crear .env si no existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creando archivo .env...${NC}"
    cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=5432
DB_NAME=llevalope
DB_USER=postgres
DB_PASSWORD=sa
JWT_SECRET=llevalope_jwt_secret_super_seguro_2024
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=LlevaloPe
EOF
fi

echo -e "${BLUE}▶ Levantando servicios con Docker Compose...${NC}"
docker-compose down --remove-orphans 2>/dev/null
docker-compose up -d --build

echo ""
echo -e "${YELLOW}⏳ Esperando que los servicios inicien (30 segundos)...${NC}"
sleep 30

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅  LlevaloPe iniciado exitosamente!      ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  🌐 Tienda Online:    ${BLUE}http://localhost:3000${NC}"
echo -e "  ⚙️  Panel Admin:     ${BLUE}http://localhost:3000/admin${NC}"
echo -e "  🔌 API Backend:     ${BLUE}http://localhost:3001/api${NC}"
echo -e "  🗄️  Base de Datos:  ${BLUE}localhost:5432${NC}"
echo ""
echo -e "  📧 Admin:  admin@llevalope.pe"
echo -e "  🔑 Pass:   Admin123!"
echo ""
echo -e "  Para detener: ${YELLOW}docker-compose down${NC}"
echo ""
