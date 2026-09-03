from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import shutil

from app.parser import extract_document_from_pdf
from app.analyzer import analyze_pdf
from app.chat import chat_with_document, ChatRequest
from app.explore import (
    explore_visual,
    ask_about_visual,
    ExploreRequest,
    AskRequest,
)

app = FastAPI(
    title="Drishti-Scribe API",
    description="Backend for accessible document understanding",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@app.get("/")
def root():
    return {"message": "Drishti-Scribe API is running"}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    analysis = analyze_pdf(str(file_path))

    return {
        "filename": file.filename,
        "pages": analysis.model_dump()["pages"],
    }


@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        response = chat_with_document(request)
        return response
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/explore-visual")
async def explore_endpoint(request: ExploreRequest):
    try:
        response = explore_visual(request)
        return response
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ask-about-visual")
async def ask_endpoint(request: AskRequest):
    try:
        response = ask_about_visual(request)
        return response
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
