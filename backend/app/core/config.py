import os
from pathlib import Path
from typing import List, Union
from pydantic import BaseModel, Field, field_validator

# Función auxiliar para cargar archivo .env manualmente si python-dotenv no está instalado
def load_env_file(dotenv_path: str = ".env"):
    p = Path(dotenv_path)
    if not p.is_file():
        return
    with open(p, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, val = line.split("=", 1)
            key = key.strip()
            val = val.strip().strip("'\"")
            if key not in os.environ:
                os.environ[key] = val

# Cargar .env si existe
load_env_file()

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
    
    class Settings(BaseSettings):
        ENVIRONMENT: str = Field(default="development")
        API_PORT: int = Field(default=8000)
        API_HOST: str = Field(default="0.0.0.0")
        
        # CORS
        CORS_ORIGINS: Union[str, List[str]] = Field(default="http://localhost:4200,http://127.0.0.1:4200")
        
        # SQL Server Database Configuration
        DB_SERVER: str = Field(default="host.docker.internal")
        DB_PORT: int = Field(default=1433)
        DB_NAME: str = Field(default="MeteoWankaDB")
        DB_USER: str = Field(default="")
        DB_PASSWORD: str = Field(default="")
        DB_DRIVER: str = Field(default="ODBC Driver 18 for SQL Server")
        DB_ENCRYPT: str = Field(default="yes")  # yes | no
        DB_TRUST_SERVER_CERTIFICATE: str = Field(default="yes")  # yes | no
        DB_CONNECTION_TIMEOUT: int = Field(default=15)
        DB_TRUSTED_CONNECTION: str = Field(default="no")  # yes | no
        
        # Open-Meteo API
        OPEN_METEO_BASE_URL: str = Field(default="https://api.open-meteo.com/v1/forecast")
        
        model_config = SettingsConfigDict(
            env_file=".env",
            env_file_encoding="utf-8",
            extra="ignore"
        )

        @field_validator("DB_USER", mode="before")
        @classmethod
        def strip_db_user(cls, value: str) -> str:
            return value.strip()
        
        @property
        def cors_origins_list(self) -> List[str]:
            if isinstance(self.CORS_ORIGINS, list):
                return self.CORS_ORIGINS
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

        @property
        def odbc_connection_str(self) -> str:
            driver_str = f"{{{self.DB_DRIVER}}}" if not self.DB_DRIVER.startswith("{") else self.DB_DRIVER
            
            server_str = self.DB_SERVER
            if self.DB_PORT and "," not in server_str and "\\" not in server_str:
                server_str = f"{self.DB_SERVER},{self.DB_PORT}"
                
            parts = [
                f"DRIVER={driver_str}",
                f"SERVER={server_str}",
                f"DATABASE={self.DB_NAME}",
                f"Encrypt={self.DB_ENCRYPT}",
                f"TrustServerCertificate={self.DB_TRUST_SERVER_CERTIFICATE}",
                f"Connection Timeout={self.DB_CONNECTION_TIMEOUT}"
            ]
            
            if self.DB_TRUSTED_CONNECTION.lower() in ("yes", "true", "1"):
                parts.append("Trusted_Connection=yes")
            elif self.DB_USER:
                parts.append(f"UID={self.DB_USER}")
                parts.append(f"PWD={self.DB_PASSWORD}")
                
            return ";".join(parts) + ";"

    settings = Settings()

except ImportError:
    # Fallback sin pydantic-settings
    class FallbackSettings(BaseModel):
        ENVIRONMENT: str = Field(default_factory=lambda: os.getenv("ENVIRONMENT", "development"))
        API_PORT: int = Field(default_factory=lambda: int(os.getenv("API_PORT", "8000")))
        API_HOST: str = Field(default_factory=lambda: os.getenv("API_HOST", "0.0.0.0"))
        
        CORS_ORIGINS: str = Field(default_factory=lambda: os.getenv("CORS_ORIGINS", "http://localhost:4200,http://127.0.0.1:4200"))
        
        DB_SERVER: str = Field(default_factory=lambda: os.getenv("DB_SERVER", "host.docker.internal"))
        DB_PORT: int = Field(default_factory=lambda: int(os.getenv("DB_PORT", "1433")))
        DB_NAME: str = Field(default_factory=lambda: os.getenv("DB_NAME", "MeteoWankaDB"))
        DB_USER: str = Field(default_factory=lambda: os.getenv("DB_USER", "").strip())
        DB_PASSWORD: str = Field(default_factory=lambda: os.getenv("DB_PASSWORD", ""))
        DB_DRIVER: str = Field(default_factory=lambda: os.getenv("DB_DRIVER", "ODBC Driver 18 for SQL Server"))
        DB_ENCRYPT: str = Field(default_factory=lambda: os.getenv("DB_ENCRYPT", "yes"))
        DB_TRUST_SERVER_CERTIFICATE: str = Field(default_factory=lambda: os.getenv("DB_TRUST_SERVER_CERTIFICATE", "yes"))
        DB_CONNECTION_TIMEOUT: int = Field(default_factory=lambda: int(os.getenv("DB_CONNECTION_TIMEOUT", "15")))
        DB_TRUSTED_CONNECTION: str = Field(default_factory=lambda: os.getenv("DB_TRUSTED_CONNECTION", "no"))
        
        OPEN_METEO_BASE_URL: str = Field(default_factory=lambda: os.getenv("OPEN_METEO_BASE_URL", "https://api.open-meteo.com/v1/forecast"))

        @field_validator("DB_USER", mode="before")
        @classmethod
        def strip_db_user(cls, value: str) -> str:
            return value.strip()
        
        @property
        def cors_origins_list(self) -> List[str]:
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

        @property
        def odbc_connection_str(self) -> str:
            driver_str = f"{{{self.DB_DRIVER}}}" if not self.DB_DRIVER.startswith("{") else self.DB_DRIVER
            
            server_str = self.DB_SERVER
            if self.DB_PORT and "," not in server_str and "\\" not in server_str:
                server_str = f"{self.DB_SERVER},{self.DB_PORT}"
                
            parts = [
                f"DRIVER={driver_str}",
                f"SERVER={server_str}",
                f"DATABASE={self.DB_NAME}",
                f"Encrypt={self.DB_ENCRYPT}",
                f"TrustServerCertificate={self.DB_TRUST_SERVER_CERTIFICATE}",
                f"Connection Timeout={self.DB_CONNECTION_TIMEOUT}"
            ]
            
            if self.DB_TRUSTED_CONNECTION.lower() in ("yes", "true", "1"):
                parts.append("Trusted_Connection=yes")
            elif self.DB_USER:
                parts.append(f"UID={self.DB_USER}")
                parts.append(f"PWD={self.DB_PASSWORD}")
                
            return ";".join(parts) + ";"

    settings = FallbackSettings()
