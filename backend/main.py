from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from backend.routers.api_router import router as api_router
from backend.routers.auth_router import router as auth_router
from backend.routers.widget_router import router as widget_router
import sentry_sdk

sentry_sdk.init(
    dsn="https://65071dd7304618dec6c7dddb302493d8@o4509582716174336.ingest.de.sentry.io/4509582718599248",
    send_default_pii=True,
)

app = FastAPI()

origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(api_router)
app.include_router(auth_router)
app.include_router(widget_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)