@echo off
chcp 65001 > nul
cls

echo.
echo ╔═══════════════════════════════════════════╗
echo ║   🛒  LlevaloPe - Plataforma E-Commerce   ║
echo ║       Tu Tienda Online, Sin Límites        ║
echo ╚═══════════════════════════════════════════╝
echo.

echo [▶] Verificando Docker...
docker --version > nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker no está instalado. Instálalo desde https://docker.com
    pause
    exit /b 1
)

echo [✓] Docker disponible
echo.

echo [▶] Configurando variables de entorno...
if not exist .env (
    copy .env .env.backup > nul 2>&1
)

echo [▶] Levantando servicios...
docker-compose down --remove-orphans 2>nul
docker-compose up -d --build

echo.
echo [⏳] Esperando inicialización (30 segundos)...
timeout /t 30 /nobreak > nul

echo.
echo ╔═══════════════════════════════════════════╗
echo ║  ✅  LlevaloPe iniciado exitosamente!      ║
echo ╚═══════════════════════════════════════════╝
echo.
echo  Tienda Online:  http://localhost:3000
echo  Panel Admin:    http://localhost:3000/admin
echo  API Backend:    http://localhost:3001/api
echo  Base de Datos:  localhost:5432
echo.
echo  Admin:   admin@llevalope.pe
echo  Pass:    Admin123!
echo.
echo  Para detener: docker-compose down
echo.
pause
