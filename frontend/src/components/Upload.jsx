import { useState, useRef } from "react";
import { uploadDocument } from "../services/api";

const PROCESSING_STEPS = [
  "Uploading document...",
  "Extracting content...",
  "Understanding document structure...",
  "Identifying visual elements...",
  "Building Accessibility Map...",
  "Preparing your accessible reader...",
];

function Upload({ onDocumentLoaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const inputRef = useRef(null);

  async function handleUpload() {
    if (!file) {
      setError("Please select a PDF.");
      return;
    }

    setLoading(true);
    setError("");

    const stepInterval = setInterval(() => {
      setProgressStep((prev) =>
        Math.min(prev + 1, PROCESSING_STEPS.length - 1)
      );
    }, 1500);

    try {
      const data = await uploadDocument(file);
      clearInterval(stepInterval);
      onDocumentLoaded(data);
    } catch (err) {
      clearInterval(stepInterval);
      setError(err.message || "Upload failed.");
    } finally {
      setLoading(false);
      setProgressStep(0);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setError("");
    } else {
      setError("Please drop a PDF file.");
    }
  }

  return (
    <section
      className={`upload ${loading ? "uploading" : ""}`}
      aria-labelledby="upload-title"
    >
      <div className="upload-hero">
        <h1 id="upload-title" className="upload-title">
          Drishti-Scribe
        </h1>
        <p className="upload-tagline">
          Understand Every Document. Explore Every Insight.
        </p>
      </div>

      {!loading && (
        <>
          <div
            className={`drop-zone ${dragOver ? "drag-over" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex="0"
            aria-label="Drop a PDF here or click to browse"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
          >
            <div className="drop-zone-icon" aria-hidden="true">
              📄
            </div>
            <p className="drop-zone-text">
              Drag and drop a PDF here, or click to browse
            </p>
            <p className="drop-zone-hint">Supports PDF files</p>
          </div>

          <input
            ref={inputRef}
            id="pdf-upload"
            type="file"
            accept=".pdf,application/pdf"
            onChange={(event) => {
              setFile(event.target.files[0]);
              setError("");
            }}
            style={{ display: "none" }}
          />

          {file && (
            <p className="selected-file" aria-live="polite">
              Selected: {file.name}
            </p>
          )}

          <button
            type="button"
            className="upload-btn"
            onClick={handleUpload}
            disabled={loading || !file}
          >
            {loading ? "Analyzing..." : "Analyze Document"}
          </button>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </>
      )}

      {loading && (
        <div className="processing-status" aria-live="polite">
          <div className="processing-spinner" aria-hidden="true" />
          <p className="processing-step">
            {PROCESSING_STEPS[progressStep]}
          </p>
          <div className="processing-progress">
            <div
              className="processing-progress-bar"
              style={{
                width: `${((progressStep + 1) / PROCESSING_STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default Upload;
