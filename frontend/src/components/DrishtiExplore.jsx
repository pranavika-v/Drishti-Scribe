import { useState } from "react";
import { exploreVisual, askAboutVisual } from "../services/api";
import { speak } from "../services/speech";

const EXPLORATION_OPTIONS = [
  { id: "overview", label: "Overview" },
  { id: "structure", label: "Structure / Axes" },
  { id: "trend", label: "Main Trend" },
  { id: "highestValue", label: "Highest Point" },
  { id: "lowestValue", label: "Lowest Point" },
  { id: "keyValues", label: "Key Values" },
  { id: "comparison", label: "Compare Values" },
  { id: "insights", label: "Key Insights" },
  { id: "simpleExplanation", label: "Explain Simply" },
];

const VISUAL_ICONS = {
  chart: "📊",
  image: "🖼",
  diagram: "📐",
  flowchart: "🔀",
  table: "📋",
  other: "📄",
};

const MODE_LABELS = { quick: "Quick", detailed: "Detailed", simple: "Simple" };

function DrishtiExplore({
  element,
  filename,
  documentContext,
  pageContext,
  speechRate,
  speechVoice,
  onVisualExplored,
}) {
  const [explorationType, setExplorationType] = useState(null);
  const [explanationMode, setExplanationMode] = useState("detailed");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState([]);

  const isVisual = ["chart", "image", "diagram", "flowchart", "table"].includes(
    element?.type
  );

  async function handleExplore(type) {
    if (!filename || !element) return;
    setExplorationType(type);
    setLoading(true);
    setError("");
    setAnswer("");
    setFollowUpQuestions([]);

    try {
      const result = await exploreVisual(
        filename,
        element,
        type,
        explanationMode,
        documentContext,
        pageContext
      );
      setAnswer(result.answer || "No response available.");
      if (result.suggestedQuestions?.length) {
        setFollowUpQuestions(result.suggestedQuestions);
      }
      onVisualExplored?.(element.id);
    } catch (err) {
      setError(err.message || "Unable to analyze this visual.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAsk(e) {
    e?.preventDefault();
    if (!question.trim() || loading) return;

    setLoading(true);
    setError("");
    setAnswer("");
    setExplorationType("custom");

    try {
      const result = await askAboutVisual(
        filename,
        element,
        question.trim(),
        documentContext,
        pageContext
      );
      setAnswer(result.answer || "No response available.");
      if (result.suggestedQuestions?.length) {
        setFollowUpQuestions(result.suggestedQuestions);
      }
      onVisualExplored?.(element.id);
    } catch (err) {
      setError(err.message || "Unable to get an answer.");
    } finally {
      setLoading(false);
    }
  }

  function handleListen() {
    if (answer) speak(answer, speechRate, speechVoice);
  }

  function handleVoiceInput() {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      setError("Voice input is not supported in this browser.");
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    setError("");

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setError("Voice input failed. Please try again.");
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  }

  if (!isVisual) return null;

  const icon = VISUAL_ICONS[element.type] || "📄";

  return (
    <aside className="drishti-explore" aria-label="Drishti Explore">
      <div className="drishti-explore-header">
        <h2 className="drishti-explore-title">
          <span className="visual-icon" aria-hidden="true">
            {icon}
          </span>
          Drishti Explore
        </h2>
        <p className="visual-element-title">
          {element.text || element.type}
        </p>
      </div>

      <div
        className="explanation-modes"
        role="group"
        aria-label="Explanation mode"
      >
        {Object.entries(MODE_LABELS).map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            className={`mode-btn ${explanationMode === mode ? "active" : ""}`}
            onClick={() => setExplanationMode(mode)}
            aria-pressed={explanationMode === mode}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="explore-prompt">
        Choose what you want to understand:
      </p>

      <div className="exploration-options">
        {EXPLORATION_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`explore-btn ${
              explorationType === opt.id ? "active" : ""
            }`}
            onClick={() => handleExplore(opt.id)}
            disabled={loading}
            aria-pressed={explorationType === opt.id}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="explore-loading" aria-live="polite">
          <div className="loading-spinner" aria-hidden="true" />
          <p>
            {explorationType === "custom"
              ? "Answering your question..."
              : "Analyzing this visual..."}
          </p>
        </div>
      )}

      {error && (
        <div className="explore-error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            onClick={() =>
              explorationType === "custom"
                ? handleAsk()
                : handleExplore(explorationType)
            }
          >
            Try Again
          </button>
        </div>
      )}

      {answer && !loading && !error && (
        <div className="explore-answer" aria-live="polite">
          <div className="answer-header">
            <h3 className="answer-label">AI Insight</h3>
            <button
              type="button"
              className="listen-btn"
              onClick={handleListen}
              aria-label="Listen to this response"
            >
              🔊 Listen
            </button>
          </div>
          <p className="answer-text">{answer}</p>

          {followUpQuestions.length > 0 && (
            <div className="follow-up-section">
              <p className="follow-up-label">You may also ask:</p>
              <ul className="follow-up-list">
                {followUpQuestions.map((q, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      className="follow-up-btn"
                      onClick={() => {
                        setQuestion(q);
                        handleAsk();
                      }}
                    >
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="voice-question-section">
        <form onSubmit={handleAsk} className="voice-question-form">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about this visual..."
            disabled={loading}
            aria-label="Ask a question about this visual"
          />
          <button
            type="button"
            className={`mic-btn ${isListening ? "listening" : ""}`}
            onClick={handleVoiceInput}
            disabled={loading}
            aria-label={
              isListening ? "Listening..." : "Ask with voice"
            }
          >
            {isListening ? "🔴" : "🎤"}
          </button>
          <button type="submit" disabled={loading || !question.trim()}>
            Ask
          </button>
        </form>
      </div>
    </aside>
  );
}

export default DrishtiExplore;
