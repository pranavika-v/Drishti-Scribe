import { useEffect, useState, useCallback } from "react";
import Upload from "./components/Upload";
import Reader from "./components/Reader";
import Controls from "./components/Controls";
import Chat from "./components/Chat";
import DrishtiExplore from "./components/DrishtiExplore";
import DocumentMap from "./components/DocumentMap";
import WhatDidIMiss from "./components/WhatDidIMiss";
import Settings from "./components/Settings";
import BookmarkPanel from "./components/BookmarkPanel";
import { speak, stopSpeaking, getVoices, onVoicesChanged } from "./services/speech";
import { loadState, saveState } from "./services/storage";
import "./index.css";

const VISUAL_TYPES = ["chart", "image", "diagram", "flowchart", "table"];

const DEFAULT_SETTINGS = {
  fontSize: "medium",
  speechRate: 1,
  autoRead: false,
  highContrast: false,
};

function App() {
  const [documentData, setDocumentData] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentElementIndex, setCurrentElementIndex] = useState(0);
  const [chartDataIndex, setChartDataIndex] = useState(0);
  const [viewMode, setViewMode] = useState("reader");

  // Tracking state
  const [visitedElements, setVisitedElements] = useState(new Set());
  const [exploredVisuals, setExploredVisuals] = useState(new Set());
  const [bookmarks, setBookmarks] = useState([]);
  const [explorationHistory, setExplorationHistory] = useState([]);

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [showMissed, setShowMissed] = useState(false);
  const [speechVoice, setSpeechVoice] = useState("");

  // Settings
  const [settings, setSettings] = useState(() => {
    const saved = loadState();
    return saved?.settings || DEFAULT_SETTINGS;
  });

  // Persist settings
  useEffect(() => {
    saveState({ settings });
  }, [settings]);

  // Track visited elements
  useEffect(() => {
    if (!documentData) return;
    const page = documentData.pages?.[currentPageIndex];
    const element = page?.elements?.[currentElementIndex];
    if (!element) return;

    const key = `${page.page}_${element.id}`;
    setVisitedElements((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, [documentData, currentPageIndex, currentElementIndex]);

  function handleDocumentLoaded(data) {
    setDocumentData(data);
    setCurrentPageIndex(0);
    setCurrentElementIndex(0);
    setChartDataIndex(0);
    setVisitedElements(new Set());
    setExploredVisuals(new Set());
    setExplorationHistory([]);
    setBookmarks([]);
    setShowMissed(false);
  }

  function handleNext() {
    if (!documentData) return;

    const pages = documentData.pages || [];
    const currentPage = pages[currentPageIndex];
    const elements = currentPage?.elements || [];
    const currentElement = elements[currentElementIndex];

    if (
      currentElement?.type === "chart" &&
      currentElement.data &&
      currentElement.data.length > 0 &&
      chartDataIndex < currentElement.data.length - 1
    ) {
      setChartDataIndex((i) => i + 1);
      return;
    }

    if (currentElementIndex < elements.length - 1) {
      setCurrentElementIndex((i) => i + 1);
      setChartDataIndex(0);
      return;
    }

    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex((i) => i + 1);
      setCurrentElementIndex(0);
      setChartDataIndex(0);
    }
  }

  function handlePrevious() {
    if (!documentData) return;

    const pages = documentData.pages || [];
    const currentPage = pages[currentPageIndex];
    const elements = currentPage?.elements || [];
    const currentElement = elements[currentElementIndex];

    if (
      currentElement?.type === "chart" &&
      currentElement.data &&
      currentElement.data.length > 0 &&
      chartDataIndex > 0
    ) {
      setChartDataIndex((i) => i - 1);
      return;
    }

    if (currentElementIndex > 0) {
      const prevIdx = currentElementIndex - 1;
      const prevEl = elements[prevIdx];
      setCurrentElementIndex(prevIdx);
      if (prevEl?.type === "chart" && prevEl.data?.length > 0) {
        setChartDataIndex(prevEl.data.length - 1);
      } else {
        setChartDataIndex(0);
      }
      return;
    }

    if (currentPageIndex > 0) {
      const prevPageIdx = currentPageIndex - 1;
      const prevPage = pages[prevPageIdx];
      const prevElements = prevPage?.elements || [];
      const lastIdx = Math.max(prevElements.length - 1, 0);
      setCurrentPageIndex(prevPageIdx);
      setCurrentElementIndex(lastIdx);
      const lastEl = prevElements[lastIdx];
      if (lastEl?.type === "chart" && lastEl.data?.length > 0) {
        setChartDataIndex(lastEl.data.length - 1);
      } else {
        setChartDataIndex(0);
      }
    }
  }

  function getCurrentSpeechText() {
    if (!documentData) return "";
    const pages = documentData.pages || [];
    const page = pages[currentPageIndex];
    const elements = page?.elements || [];
    const element = elements[currentElementIndex];
    if (!element) return "";

    if (element.type === "chart" && element.data?.length > 0) {
      const dp = element.data[chartDataIndex];
      if (!dp) {
        return [`${element.chart_type || "chart"} chart`, element.text, element.description]
          .filter(Boolean).join(". ");
      }
      return [
        `${element.chart_type || "chart"} chart`,
        element.text,
        element.description,
        `Data point ${chartDataIndex + 1} of ${element.data.length}`,
        `${dp.label}: ${dp.value}`,
      ].filter(Boolean).join(". ");
    }

    return [element.type, element.text, element.description].filter(Boolean).join(". ");
  }

  const navigateTo = useCallback((pIdx, eIdx) => {
    setCurrentPageIndex(pIdx);
    setCurrentElementIndex(eIdx);
    setChartDataIndex(0);
    setShowMissed(false);
  }, []);

  function handlePreviousChartData() {
    setChartDataIndex((i) => Math.max(i - 1, 0));
  }

  function handleNextChartData() {
    const page = documentData?.pages?.[currentPageIndex];
    const element = page?.elements?.[currentElementIndex];
    if (element?.type !== "chart" || !element.data?.length) return;
    setChartDataIndex((i) => Math.min(i + 1, element.data.length - 1));
  }

  function handleBookmark() {
    if (!documentData) return;
    const page = documentData.pages?.[currentPageIndex];
    const element = page?.elements?.[currentElementIndex];
    if (!element) return;

    const bm = { pageIndex: currentPageIndex, elementIndex: currentElementIndex };
    const exists = bookmarks.some(
      (b) => b.pageIndex === bm.pageIndex && b.elementIndex === bm.elementIndex
    );
    if (exists) {
      setBookmarks((prev) =>
        prev.filter(
          (b) => !(b.pageIndex === bm.pageIndex && b.elementIndex === bm.elementIndex)
        )
      );
    } else {
      setBookmarks((prev) => [...prev, bm]);
    }
  }

  function isCurrentBookmarked() {
    return bookmarks.some(
      (b) => b.pageIndex === currentPageIndex && b.elementIndex === currentElementIndex
    );
  }

  function handleRemoveBookmark(idx) {
    setBookmarks((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleVisualExplored(elementId) {
    if (!elementId) return;
    const page = documentData?.pages?.[currentPageIndex];
    if (!page) return;
    const key = `${page.page}_${elementId}`;
    setExploredVisuals((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    setExplorationHistory((prev) => [...prev, { elementId, time: Date.now() }]);
  }

  function handleExploreWithAI(elementIdx) {
    navigateTo(currentPageIndex, elementIdx);
  }

  // Auto-read on element change
  useEffect(() => {
    if (!documentData || !settings.autoRead) return;
    const text = getCurrentSpeechText();
    if (text) speak(text, settings.speechRate, speechVoice);
  }, [currentPageIndex, currentElementIndex, chartDataIndex]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(event) {
      if (!documentData) return;
      const tagName = event.target.tagName.toLowerCase();
      if (tagName === "input" || tagName === "textarea" || tagName === "select") return;

      if (event.key === "ArrowRight" || event.key.toLowerCase() === "n") {
        event.preventDefault();
        handleNext();
      }
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "p") {
        event.preventDefault();
        handlePrevious();
      }
      if (event.key === "PageDown" && currentPageIndex < (documentData.pages?.length || 0) - 1) {
        event.preventDefault();
        navigateTo(currentPageIndex + 1, 0);
      }
      if (event.key === "PageUp" && currentPageIndex > 0) {
        event.preventDefault();
        navigateTo(currentPageIndex - 1, 0);
      }
      if (event.key === "Escape") {
        stopSpeaking();
      }
      if (event.key === " ") {
        event.preventDefault();
        const text = getCurrentSpeechText();
        if (text) speak(text, settings.speechRate, speechVoice);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [documentData, currentPageIndex, currentElementIndex, chartDataIndex, settings, speechVoice]);

  // Load voice preference
  useEffect(() => {
    function loadVoices() {
      const voices = getVoices();
      if (voices.length > 0 && !speechVoice) {
        const preferred =
          voices.find((v) => v.lang.startsWith("en") && /natural|neural|premium|google/i.test(v.name)) ||
          voices.find((v) => v.lang.startsWith("en")) ||
          voices[0];
        setSpeechVoice(preferred.name);
      }
    }
    loadVoices();
    const cleanup = onVoicesChanged(loadVoices);
    return () => { cleanup(); stopSpeaking(); };
  }, [speechVoice]);

  const currentElement =
    documentData?.pages?.[currentPageIndex]?.elements?.[currentElementIndex];
  const isVisualElement = currentElement && VISUAL_TYPES.includes(currentElement.type);

  // Reading progress
  const totalElements = documentData?.pages?.reduce(
    (sum, p) => sum + (p.elements?.length || 0), 0
  ) || 0;
  const visitedCount = visitedElements.size;
  const progressPct = totalElements > 0 ? Math.round((visitedCount / totalElements) * 100) : 0;

  // Document stats
  const docStats = documentData ? {
    pages: documentData.pages?.length || 0,
    charts: 0,
    images: 0,
    tables: 0,
  } : null;

  if (docStats) {
    documentData.pages?.forEach((p) => {
      p.elements?.forEach((el) => {
        if (el.type === "chart") docStats.charts++;
        if (el.type === "image") docStats.images++;
        if (el.type === "table") docStats.tables++;
      });
    });
  }

  // Apply font size and high contrast
  const appClassName = `app ${settings.highContrast ? "high-contrast" : ""} font-${settings.fontSize}`;

  return (
    <div className={appClassName}>
      <header className="app-header">
        <h1 className="app-logo">Drishti-Scribe</h1>
        {documentData && (
          <div className="header-controls">
            <div className="reading-progress" aria-label={`Reading progress: ${progressPct}%`}>
              <div className="progress-bar" style={{ width: `${progressPct}%` }} />
              <span className="progress-text">{progressPct}%</span>
            </div>
            <button
              type="button"
              className="header-btn"
              onClick={() => setShowMap((v) => !v)}
              aria-pressed={showMap}
            >
              ☰ Map
            </button>
            <button
              type="button"
              className="header-btn"
              onClick={() => setShowBookmarks((v) => !v)}
              aria-pressed={showBookmarks}
            >
              🔖 ({bookmarks.length})
            </button>
            <button
              type="button"
              className="header-btn"
              onClick={() => setShowMissed((v) => !v)}
              aria-pressed={showMissed}
            >
              ? Missed
            </button>
            <button
              type="button"
              className="header-btn"
              onClick={() => setShowSettings((v) => !v)}
              aria-pressed={showSettings}
            >
              ⚙ Settings
            </button>
          </div>
        )}
      </header>

      {!documentData ? (
        <Upload onDocumentLoaded={handleDocumentLoaded} />
      ) : (
        <>
          <div className="mode-toggle">
            <button
              onClick={() => setViewMode("reader")}
              aria-pressed={viewMode === "reader"}
              className={viewMode === "reader" ? "active" : ""}
            >
              Document Reader
            </button>
            <button
              onClick={() => setViewMode("chat")}
              aria-pressed={viewMode === "chat"}
              className={viewMode === "chat" ? "active" : ""}
            >
              Ask Questions (Chat)
            </button>
          </div>

          {viewMode === "reader" ? (
            <div className="reader-layout">
              <div className={`left-panel ${showMap ? "" : "hidden"}`}>
                <DocumentMap
                  documentData={documentData}
                  currentPageIndex={currentPageIndex}
                  currentElementIndex={currentElementIndex}
                  onNavigate={navigateTo}
                />
              </div>

              <div className="center-panel">
                <Reader
                  documentData={documentData}
                  currentPageIndex={currentPageIndex}
                  currentElementIndex={currentElementIndex}
                  chartDataIndex={chartDataIndex}
                  onPreviousChartData={handlePreviousChartData}
                  onNextChartData={handleNextChartData}
                  onBookmark={handleBookmark}
                  isBookmarked={isCurrentBookmarked()}
                />
                <Controls
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  speechText={getCurrentSpeechText()}
                  speechRate={settings.speechRate}
                  speechVoice={speechVoice}
                  onSpeechVoiceChange={setSpeechVoice}
                />
              </div>

              <div className="right-panel">
                {isVisualElement ? (
                  <DrishtiExplore
                    element={currentElement}
                    filename={documentData.filename}
                    documentContext={`Document: ${documentData.filename}`}
                    pageContext={`Page ${currentPageIndex + 1}`}
                    speechRate={settings.speechRate}
                    speechVoice={speechVoice}
                    onVisualExplored={handleVisualExplored}
                  />
                ) : (
                  <div className="explore-placeholder">
                    <p>Navigate to a visual element (chart, image, diagram, or table) to explore it with Drishti Explore.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Chat filename={documentData.filename} />
          )}

          {showSettings && (
            <div className="modal-overlay" onClick={() => setShowSettings(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <Settings settings={settings} onChange={setSettings} />
                <button type="button" onClick={() => setShowSettings(false)}>Close</button>
              </div>
            </div>
          )}

          {showBookmarks && (
            <div className="modal-overlay" onClick={() => setShowBookmarks(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <BookmarkPanel
                  bookmarks={bookmarks}
                  documentData={documentData}
                  onNavigate={navigateTo}
                  onRemove={handleRemoveBookmark}
                />
                <button type="button" onClick={() => setShowBookmarks(false)}>Close</button>
              </div>
            </div>
          )}

          {showMissed && (
            <div className="modal-overlay" onClick={() => setShowMissed(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <WhatDidIMiss
                  documentData={documentData}
                  currentPageIndex={currentPageIndex}
                  visitedElements={visitedElements}
                  exploredVisuals={exploredVisuals}
                  onNavigate={navigateTo}
                  onExploreWithAI={handleExploreWithAI}
                />
                <button type="button" onClick={() => setShowMissed(false)}>Close</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
