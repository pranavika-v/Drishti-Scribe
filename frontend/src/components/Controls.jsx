import { useEffect, useState } from "react";

function Controls({
  onPrevious,
  onNext,
  speechText,
}) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  function handlePlay() {
    if (!speechText) return;

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(speechText);

    utterance.onstart = () => {
      setSpeaking(true);
    };

    utterance.onend = () => {
      setSpeaking(false);
    };

    utterance.onerror = () => {
      setSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }

  function handleStop() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  return (
    <nav
      className="controls"
      aria-label="Document controls"
    >
      <button
        type="button"
        onClick={onPrevious}
        aria-label="Go to previous document element"
      >
        Previous
      </button>

      <button
        type="button"
        onClick={onNext}
        aria-label="Go to next document element"
      >
        Next
      </button>

      <button
        type="button"
        onClick={handlePlay}
        aria-label={
          speaking
            ? "Document element is currently being read"
            : "Read current document element aloud"
        }
        aria-pressed={speaking}
      >
        {speaking ? "Speaking..." : "Play"}
      </button>

      <button
        type="button"
        onClick={handleStop}
        aria-label="Stop speech"
      >
        Stop
      </button>
    </nav>
  );
}

export default Controls;