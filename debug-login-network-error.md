# Debug Session: login-network-error

- Status: OPEN
- Symptom: `Network Error` al intentar iniciar sesion en `http://localhost:3000/auth/iniciar-sesion`
- Scope: frontend + conectividad hacia backend/auth
- Rule: no modificar logica de negocio antes de recolectar evidencia runtime

## Hypotheses

1. El frontend apunta a un `NEXT_PUBLIC_API_URL` incorrecto o vacio y Axios no llega al backend.
2. El backend no esta levantado en `localhost:3001` o el endpoint `/api/auth/iniciar-sesion` falla antes de responder.
3. Hay un problema de CORS / credenciales (`withCredentials`) y el navegador corta la peticion como error de red.
4. El backend responde sobre otra ruta o puerto distinto al configurado por el frontend.
5. La peticion sale, pero un error TLS / proxy / timeout de Axios la convierte en `Network Error`.

## Plan

1. Confirmar configuracion actual de frontend y backend sin tocar logica.
2. Instrumentar el punto de login del frontend para capturar destino, payload seguro y detalles del error.
3. Reproducir el fallo con el backend/frontend en ejecucion.
4. Analizar evidencia y aplicar el fix minimo.
5. Verificar con evidencia post-fix.
