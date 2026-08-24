import { useState } from "react";

function Upload({ onDocumentLoaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload() {
    if (!file) {
      setError("Please select a PDF.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data = await response.json();

      onDocumentLoaded(data);
    } catch (err) {
      setError(
        err.message || "Upload failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="upload"
      aria-labelledby="upload-title"
    >
      <h2 id="upload-title">
        Upload a document
      </h2>

      <label htmlFor="pdf-upload">
        Choose a PDF file
      </label>

      <input
        id="pdf-upload"
        type="file"
        accept=".pdf,application/pdf"
        onChange={(event) => {
          setFile(event.target.files[0]);
          setError("");
        }}
      />

      {file && (
        <p aria-live="polite">
          Selected file: {file.name}
        </p>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={loading || !file}
      >
        {loading
          ? "Analyzing document..."
          : "Analyze Document"}
      </button>

      {error && (
        <p
          className="error"
          role="alert"
        >
          {error}
        </p>
      )}
    </section>
  );
}

export default Upload;