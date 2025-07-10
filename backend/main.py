from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from routers.api_router import router as api_router
from routers.auth_router import router as auth_router
from routers.widget_router import router as widget_router
import sentry_sdk
from dotenv import load_dotenv
import os

sentry_sdk.init(
    dsn="https://65071dd7304618dec6c7dddb302493d8@o4509582716174336.ingest.de.sentry.io/4509582718599248",
    send_default_pii=True,
)

load_dotenv(override=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS"),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(api_router)
app.include_router(auth_router)
app.include_router(widget_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)