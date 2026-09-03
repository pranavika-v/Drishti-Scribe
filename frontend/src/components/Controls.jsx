import { useEffect, useState } from "react";
import { speak, stopSpeaking, getVoices, onVoicesChanged } from "../services/speech";

function Controls({
  onPrevious,
  onNext,
  speechText,
  speechRate = 1,
  speechVoice = "",
  onSpeechVoiceChange,
}) {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    function loadVoices() {
      const availableVoices = getVoices();
      setVoices(availableVoices);
    }
    loadVoices();
    const cleanup = onVoicesChanged(loadVoices);
    return () => { cleanup(); stopSpeaking(); };
  }, []);

  function handlePlay() {
    if (!speechText) return;
    stopSpeaking();
    const utterance = speak(speechText, speechRate, speechVoice);
    if (utterance) {
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
    }
  }

  function handleStop() {
    stopSpeaking();
    setSpeaking(false);
  }

  function handleVoiceChange(event) {
    stopSpeaking();
    setSpeaking(false);
    onSpeechVoiceChange?.(event.target.value);
  }

  return (
    <nav className="controls" aria-label="Document controls">
      <button type="button" onClick={onPrevious} aria-label="Go to previous document element">
        ◀ Previous
      </button>
      <button type="button" onClick={onNext} aria-label="Go to next document element">
        Next ▶
      </button>
      <button
        type="button"
        onClick={handlePlay}
        aria-label={speaking ? "Document element is currently being read" : "Read current document element aloud"}
        aria-pressed={speaking}
      >
        {speaking ? "⏸ Speaking..." : "▶ Play"}
      </button>
      <button type="button" onClick={handleStop} aria-label="Stop speech">
        ⏹ Stop
      </button>
      <label className="control-label">
        Voice:
        <select value={speechVoice} onChange={handleVoiceChange} disabled={voices.length === 0}>
          {voices.length === 0 ? (
            <option value="">Default voice</option>
          ) : (
            voices.map((voice) => (
              <option key={`${voice.name}-${voice.lang}`} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))
          )}
        </select>
      </label>
      <label className="control-label">
        Speed: {speechRate.toFixed(2)}x
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.25"
          value={speechRate}
          onChange={(e) => {
            if (speaking) { stopSpeaking(); setSpeaking(false); }
          }}
          aria-label="Speech speed"
        />
      </label>
    </nav>
  );
}

export default Controls;
