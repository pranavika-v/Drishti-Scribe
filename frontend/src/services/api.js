const API_BASE = "http://127.0.0.1:8000";

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server returned ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

export async function sendChatMessage(filename, message, history) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, message, history }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  const data = await response.json();
  return data.reply;
}

export async function exploreVisual(
  filename,
  visualElement,
  explorationType,
  explanationMode = "detailed",
  documentContext = "",
  pageContext = ""
) {
  const response = await fetch(`${API_BASE}/explore-visual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename,
      visualElement,
      explorationType,
      explanationMode,
      documentContext,
      pageContext,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to explore visual");
  }

  return response.json();
}

export async function askAboutVisual(
  filename,
  visualElement,
  question,
  documentContext = "",
  pageContext = ""
) {
  const response = await fetch(`${API_BASE}/ask-about-visual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename,
      visualElement,
      question,
      documentContext,
      pageContext,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get answer");
  }

  return response.json();
}
