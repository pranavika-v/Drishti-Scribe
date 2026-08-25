import { useEffect, useState } from "react";

function Controls({
  onPrevious,
  onNext,
  speechText,
}) {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [rate, setRate] = useState(1);

  useEffect(() => {
    function loadVoices() {
      const availableVoices =
        window.speechSynthesis.getVoices();

      setVoices(availableVoices);

      if (
        availableVoices.length > 0 &&
        !selectedVoice
      ) {
        const preferredVoice =
          availableVoices.find(
            (voice) =>
              voice.lang.startsWith("en") &&
              /natural|neural|premium|google/i.test(
                voice.name
              )
          ) ||
          availableVoices.find((voice) =>
            voice.lang.startsWith("en")
          ) ||
          availableVoices[0];

        setSelectedVoice(preferredVoice.name);
      }
    }

    loadVoices();

    window.speechSynthesis.addEventListener(
      "voiceschanged",
      loadVoices
    );

    return () => {
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        loadVoices
      );

      window.speechSynthesis.cancel();
    };
  }, [selectedVoice]);

  function handlePlay() {
    if (!speechText) return;

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(speechText);

    const voice = voices.find(
      (item) => item.name === selectedVoice
    );

    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

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

  function handleVoiceChange(event) {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setSelectedVoice(event.target.value);
  }

  function handleRateChange(event) {
    const newRate = Number(event.target.value);

    setRate(newRate);

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
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

      <label>
        Voice:
        <select
          value={selectedVoice}
          onChange={handleVoiceChange}
          disabled={voices.length === 0}
        >
          {voices.length === 0 ? (
            <option value="">
              Default voice
            </option>
          ) : (
            voices.map((voice) => (
              <option
                key={`${voice.name}-${voice.lang}`}
                value={voice.name}
              >
                {voice.name} ({voice.lang})
              </option>
            ))
          )}
        </select>
      </label>

      <label>
        Speed: {rate.toFixed(1)}x
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={rate}
          onChange={handleRateChange}
          aria-label="Speech speed"
        />
      </label>
    </nav>
  );
}

export default Controls;