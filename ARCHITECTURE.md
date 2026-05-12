# Arquitectura e Infraestructura Recomendada

## Estado actual (base)
El proyecto quedó organizado en capas para facilitar crecimiento:

- `src/config`: configuración centralizada (puerto, auth, storage).
- `src/middleware`: middleware reutilizable (auth token).
- `src/services`: lógica de negocio y acceso a archivos.
- `src/routes`: endpoints agrupados por dominio.
- `src/app.js`: composición de dependencias y registro de rutas.
- `server.js`: punto de entrada (bootstrap).

## Principios para escalar

1. **Separación de responsabilidades**: rutas delgadas, servicios con lógica.
2. **Config por entorno**: usar variables de entorno y defaults seguros para dev.
3. **Evolución de storage**: encapsular acceso en servicios para migrar de filesystem a DB sin romper API.
4. **Seguridad incremental**:
   - Migrar token fijo a JWT con expiración.
   - Hash de contraseñas.
   - Rate limiting en `/api/login`.
5. **Observabilidad**:
   - Logging estructurado (pino/winston).
   - Correlation ID por request.
   - Healthcheck (`/health`).

## Roadmap técnico sugerido

### Fase 1 (rápida, 1-2 días)
- Agregar validación de payloads (zod/joi).
- Normalizar respuestas de error.
- Pruebas de API (supertest + jest/vitest).

### Fase 2 (crecimiento, 3-5 días)
- Persistencia en PostgreSQL (tabla budgets + items).
- Migrations (Prisma/Knex).
- Feature flags para despliegue gradual.

### Fase 3 (producción)
- Dockerfile + compose para local parity.
- CI (lint + test + build).
- Deploy con entornos separados (`dev/staging/prod`).

## Estructura objetivo (mediano plazo)

```
src/
  modules/
    budgets/
      budget.controller.js
      budget.service.js
      budget.repository.js
      budget.schema.js
  shared/
    middleware/
    errors/
    logger/
  config/
```

