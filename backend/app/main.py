import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import localidades, clima, alertas, recomendaciones, bitacora

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("meteo_wanka.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Iniciando aplicación METEO WANKA 1.1 Backend...")
    logger.info(f"Modo: {settings.ENVIRONMENT} | DB Server: {settings.DB_SERVER}:{settings.DB_PORT}")
    yield
    logger.info("Deteniendo aplicación METEO WANKA 1.1 Backend...")


app = FastAPI(
    title="METEO WANKA 1.1 - Backend API",
    description="Sistema Agroclimático y de Alertas Tempranas para el Valle del Mantaro",
    version="1.1.0",
    lifespan=lifespan
)

# Configuración de CORS para integración con Angular
app.add_middleware(
    CORSMiddleware,
    allow_origins=list({
        *settings.cors_origins_list,
        "http://localhost:4200",
    }),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de Routers con prefijo unificado /api
app.include_router(localidades.router, prefix="/api")
app.include_router(clima.router, prefix="/api")
app.include_router(alertas.router, prefix="/api")
app.include_router(recomendaciones.router, prefix="/api")
app.include_router(bitacora.router, prefix="/api")


@app.get("/", tags=["Health"])
def root():
    return {
        "app": "METEO WANKA 1.1",
        "status": "online",
        "version": "1.1.0",
        "docs_url": "/docs"
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "database_target": f"{settings.DB_SERVER}:{settings.DB_PORT}/{settings.DB_NAME}"
    }
