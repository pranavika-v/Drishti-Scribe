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


class ExploreRequest(BaseModel):
    filename: str
    visualElement: dict
    explorationType: str
    explanationMode: str = "detailed"
    documentContext: str = ""
    pageContext: str = ""


class AskRequest(BaseModel):
    filename: str
    visualElement: dict
    question: str
    documentContext: str = ""
    pageContext: str = ""


EXPLORATION_PROMPTS = {
    "overview": "Provide a clear overview of what this visual represents. What is its subject and purpose?",
    "structure": "Describe the structure of this visual. What are its axes, labels, sections, or layout?",
    "trend": "Identify and explain the main trend shown in this visual. Is it increasing, decreasing, or stable?",
    "highestValue": "Identify the highest value or peak point in this visual. What is it and what does it mean?",
    "lowestValue": "Identify the lowest value or minimum point in this visual. What is it and what does it mean?",
    "keyValues": "List and explain the key values or data points visible in this visual.",
    "comparison": "Compare the most important values or categories in this visual. What are the differences?",
    "insights": "What are the key insights or takeaways from this visual? What should the user understand?",
    "simpleExplanation": "Explain this visual in simple, easy-to-understand language as if speaking to someone with no background knowledge.",
}

MODE_INSTRUCTIONS = {
    "quick": "Keep your answer brief — 2 to 3 sentences maximum.",
    "detailed": "Provide a thorough but clear answer — aim for 4 to 6 sentences.",
    "simple": "Use plain, everyday language. Avoid jargon. Explain as if speaking to a beginner.",
}


def _build_visual_description(visual_element: dict) -> str:
    parts = []
    if visual_element.get("type"):
        parts.append(f"Visual type: {visual_element['type']}")
    if visual_element.get("text"):
        parts.append(f"Title: {visual_element['text']}")
    if visual_element.get("description"):
        parts.append(f"Description: {visual_element['description']}")
    if visual_element.get("chart_type"):
        parts.append(f"Chart type: {visual_element['chart_type']}")
    if visual_element.get("data"):
        data_str = ", ".join(
            f"{d.get('label', '?')}: {d.get('value', '?')}"
            for d in visual_element["data"]
        )
        parts.append(f"Data points: {data_str}")
    return "\n".join(parts)


def explore_visual(request: ExploreRequest):
    file_path = Path("uploads") / request.filename
    if not file_path.exists():
        raise FileNotFoundError(f"Document {request.filename} not found.")

    uploaded_file = client.files.upload(file=file_path)

    exploration_prompt = EXPLORATION_PROMPTS.get(
        request.explorationType, EXPLORATION_PROMPTS["overview"]
    )
    mode_instruction = MODE_INSTRUCTIONS.get(request.explanationMode, MODE_INSTRUCTIONS["detailed"])

    visual_desc = _build_visual_description(request.visualElement)

    system_instruction = (
        "You are an accessibility assistant helping a visually impaired user explore "
        "a visual element inside a PDF document. The user cannot see the visual, so your "
        "description must convey all meaningful information through text alone."
    )

    prompt = f"""You are helping a visually impaired user explore a visual element in a document.

Here is what the system knows about this visual element:
{visual_desc}

The user wants to explore: {request.explorationType}
{exploration_prompt}

{mode_instruction}

If the document is available, refer to it for additional context.

Provide your answer as plain text. Do not use markdown formatting."""

    contents = [
        {"role": "user", "parts": [uploaded_file, prompt]},
    ]

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=contents,
        config={"system_instruction": system_instruction},
    )

    return {
        "answer": response.text,
        "keyInsights": [],
        "suggestedQuestions": [],
    }


def ask_about_visual(request: AskRequest):
    file_path = Path("uploads") / request.filename
    if not file_path.exists():
        raise FileNotFoundError(f"Document {request.filename} not found.")

    uploaded_file = client.files.upload(file=file_path)

    visual_desc = _build_visual_description(request.visualElement)

    system_instruction = (
        "You are an accessibility assistant helping a visually impaired user ask "
        "questions about a specific visual element in a PDF document. The user cannot "
        "see the visual. Answer their question based on the visual element and the document."
    )

    prompt = f"""The user is currently focused on this visual element:
{visual_desc}

The user asks: {request.question}

Answer concisely and clearly. Refer to the document for context if needed.
Provide your answer as plain text without markdown formatting."""

    contents = [
        {"role": "user", "parts": [uploaded_file, prompt]},
    ]

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=contents,
        config={"system_instruction": system_instruction},
    )

    return {
        "answer": response.text,
        "suggestedQuestions": [],
    }
