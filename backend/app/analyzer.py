import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel


load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is not set")

client = genai.Client(api_key=api_key)


class ChartData(BaseModel):
    label: str
    value: float


class Element(BaseModel):
    id: str | None = None
    
    type: str
    text: str
    description: str

    chart_type: str | None = None
    data: list[ChartData] | None = None

class Page(BaseModel):
    page: int
    elements: list[Element]


class DocumentAnalysis(BaseModel):
    pages: list[Page]


def analyze_pdf(file_path: str):
    pdf_path = Path(file_path)

    uploaded_file = client.files.upload(file=pdf_path)

    prompt = """
Analyze this PDF for an accessibility system.

For every page, identify the major meaningful elements.

Possible element types include:
heading, paragraph, table, chart, diagram, flowchart, image, other.

For every element:
- type: what kind of element it is
- text: its title or important textual content
- description: a concise description suitable for text-to-speech

For charts, describe important values and trends.
For tables, preserve important information.
For diagrams and flowcharts, describe relationships, sequence, and decisions.
Do not omit important visual information.

For charts, provide structured chart information.

If an element is a chart:
- Set type to "chart".
- Set chart_type to one of: "bar", "line", "pie", "donut", or "unknown".
- Extract the chart title into text.
- Provide a concise accessibility-oriented description.
- Extract every clearly readable data point into the data array.
- Each data item must contain a label and numeric value.
- Do not invent values that are not visible in the document.
- If chart values cannot be reliably read, use an empty data array.
- For non-chart elements, set chart_type to null and data to null.

For flowcharts:
- Set type to "flowchart".
- Describe the sequence of steps and decision branches clearly.
- Do not invent steps that are not visible.
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=[
            uploaded_file,
            prompt
        ],
        config={
            "response_mime_type": "application/json",
            "response_schema": DocumentAnalysis,
        },
    )

    analysis = DocumentAnalysis.model_validate_json(response.text)

    for page in analysis.pages:
        for index, element in enumerate(page.elements, start=1):
            element.id = f"p{page.page}_e{index}"

    return analysis