from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://vivarq:vivarq_dev@localhost:5432/vivarq_home"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Upload Post (Instagram publishing)
    UPLOADPOST_API_KEY: str = ""
    UPLOADPOST_USER: str = "vivaring"

    class Config:
        env_file = ".env"


settings = Settings()
