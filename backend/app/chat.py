import os
from pathlib import Path
from pydantic import BaseModel
from google import genai

from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY is not set")

client = genai.Client(api_key=api_key)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    filename: str
    message: str
    history: list[ChatMessage] = []

def chat_with_document(request: ChatRequest):
    file_path = Path("uploads") / request.filename
    
    if not file_path.exists():
        raise FileNotFoundError(f"Document {request.filename} not found.")

    uploaded_file = client.files.upload(file=file_path)
    
    system_instruction = (
        "You are an accessibility assistant helping a visually impaired user understand a PDF document. "
        "Answer their questions concisely and clearly based on the provided document. "
        "Describe visual elements if they ask about them."
    )

    # Convert history to Gemini format (role must be 'user' or 'model')
    contents = []
    
    # If no history, this is the first message. We attach the file here.
    if not request.history:
        contents.append({
            "role": "user", 
            "parts": [uploaded_file, request.message]
        })
    else:
        # If there is history, the first user message must have the file attached
        first_msg = request.history[0]
        contents.append({
            "role": "user",
            "parts": [uploaded_file, first_msg.content]
        })
        
        # Add the rest of the history
        for msg in request.history[1:]:
            role = "model" if msg.role == "assistant" else msg.role
            contents.append({"role": role, "parts": [msg.content]})
            
        # Add the current message
        contents.append({"role": "user", "parts": [request.message]})

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=contents,
        config={"system_instruction": system_instruction}
    )

    return {"reply": response.text}

