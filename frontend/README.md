# METEO WANKA 1.1 - Frontend

Plataforma web de asistencia agroclimática orientada a los agricultores del **Valle del Mantaro, Junín, Perú** (Huancayo, Concepción, Jauja, Chupaca y distritos agrícolas).

Desarrollada con **Angular (Standalone Architecture)**, **TypeScript**, **Bootstrap 5**, **Bootstrap Icons** y diseño UI/UX rural contemporáneo.

---

## 🌾 Identidad Visual y Paleta Cromática

Diseño contemporáneo andino, cálido, limpio y sin elementos visuales sobrecargados:

- **Verde campo (`#355C43`)**: Identidad principal, cabeceras, botones de acción primaria y elementos activos.
- **Verde salvia (`#91A58B` / `#E7EDE6`)**: Superficies secundarias, bordes sutiles y tarjetas informativas.
- **Crema natural (`#F5F1E7` / `#FAF7F0`)**: Fondo cálido general y paneles de lectura descansada.
- **Tierra (`#B77B52`)**: Destacados agrícolas, alertas moderadas y llamadas a la acción secundaria.
- **Grafito (`#303630`)**: Tipografía de alto contraste y legibilidad óptima para luz solar en campo.

---

## 📂 Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config/
│   │   │   │   └── api.config.ts           # URL base centralizada de FastAPI
│   │   │   ├── models/                     # Interfaces TypeScript
│   │   │   │   ├── alert.model.ts          # Modelo de alertas y riesgos
│   │   │   │   ├── crop.model.ts           # Modelo de fichas agroclimáticas
│   │   │   │   ├── locality.model.ts       # Modelo de localidades del Mantaro
│   │   │   │   ├── recommendation.model.ts # Modelo de recomendaciones agronómicas
│   │   │   │   └── weather.model.ts        # Modelo meteorológico y pronóstico
│   │   │   └── services/                   # Servicios Angular (gestión de estado y datos)
│   │   │       ├── alert.service.ts        # API de alertas y bitácora
│   │   │       ├── crop.service.ts         # Catálogo técnico de muestra
│   │   │       ├── locality.service.ts     # API de localidades y selector reactivo
│   │   │       ├── recommendation.service.ts # Recomendaciones locales de muestra
│   │   │       └── weather.service.ts      # API de clima actual y pronóstico
│   │   ├── features/                       # Módulos de página independientes
│   │   │   ├── inicio/                     # Clima actual, métricas, pronóstico y recomendación
│   │   │   ├── alertas/                    # Listado, tarjetas de riesgo y filtros por tipo
│   │   │   ├── bitacora/                   # Historial tabular, filtros y modal de consulta
│   │   │   ├── cultivos/                   # Fichas técnicas (Papa, Maíz, Trigo, Haba)
│   │   │   └── admin/                      # Operaciones administrativas disponibles en la API
│   │   ├── shared/                         # Componentes reutilizables
│   │   │   └── components/
│   │   │       ├── navbar/                 # Barra superior con selector de localidad y marca
│   │   │       ├── footer/                 # Pie de página institucional del proyecto
│   │   │       ├── risk-badge/             # Badge semántico según nivel de riesgo
│   │   │       └── alert-type-badge/       # Badge con icono según tipo de alerta
│   │   ├── app.ts                          # Componente raíz
│   │   ├── app.html                        # Layout principal
│   │   ├── app.routes.ts                   # Configuración de rutas (lazy loading)
│   │   └── app.config.ts                   # Proveedores (Router, HttpClient)
│   ├── styles.css                          # Sistema de diseño CSS, variables y tipografías
│   └── index.html                          # HTML base con fuentes y meta descriptivo
├── angular.json
├── package.json
└── tsconfig.json
```

---

## 🚀 Comandos para Ejecutar el Proyecto

### 1. Iniciar FastAPI en Docker

Desde PowerShell, en la raíz del proyecto:

```powershell
cd .\backend
docker build -t meteo-wanka-backend .
docker run --rm -p 8000:8000 --env-file .env meteo-wanka-backend
```

El contenedor requiere `backend\.env` con la configuración local de SQL Server. La documentación FastAPI estará en [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Iniciar Angular

En otra terminal, desde la raíz:

```powershell
cd .\frontend
npm install
npm.cmd start
```

La aplicación estará disponible en [http://localhost:4200/](http://localhost:4200/). La URL de la API está centralizada en `src/app/core/config/api.config.ts` como `http://localhost:8000/api`.

### 3. Compilar para Producción

```powershell
npm.cmd run build
```

Los archivos optimizados se generan en `dist/meteo-wanka/`.

## Datos integrados y límites actuales

`provideHttpClient()` está configurado en `src/app/app.config.ts`. FastAPI permite solicitudes desde `http://localhost:4200`.

| Endpoint FastAPI | Integración frontend |
|---|---|
| `GET /api/localidades` | Selector y vistas de localidades; solo se muestran campos que devuelve la API. |
| `GET /api/localidades/{id_localidad}` | Consulta de localidad por ID. |
| `POST /api/localidades` | Registro de nombre, provincia y altitud. |
| `GET /api/alertas` | Listado y filtrado de alertas. |
| `POST /api/alertas` | Registro con localidad, tipo, riesgo y descripción. |
| `PATCH /api/alertas/{id_alerta}/estado` | Cambiar estado entre activa y atendida. |
| `GET /api/bitacora` | Historial de alertas y recomendaciones disponible en el backend. |
| `GET /api/clima/consultar/{id_localidad}` | Clima actual y pronóstico. Este endpoint también evalúa reglas y puede registrar alertas y recomendaciones en la base de datos. |

Las recomendaciones destacadas y las fichas de cultivos continúan con datos locales de muestra: no existe un endpoint GET compatible para consultarlas; el POST de recomendaciones requiere un `id_alerta` que el formulario actual no maneja. La API tampoco ofrece actualización/eliminación de localidades ni eliminación/edición general de alertas; esas acciones no se simulan en el panel.
