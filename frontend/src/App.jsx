
import { useEffect, useState } from "react";
import Upload from "./components/Upload";
import Reader from "./components/Reader";
import Controls from "./components/Controls";
import "./index.css";

function App() {
  const [documentData, setDocumentData] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentElementIndex, setCurrentElementIndex] = useState(0);

  function handleDocumentLoaded(data) {
    setDocumentData(data);
    setCurrentPageIndex(0);
    setCurrentElementIndex(0);
  }

  function handleNext() {
    if (!documentData) return;

    const pages = documentData.pages || [];
    const currentPage = pages[currentPageIndex];
    const elements = currentPage?.elements || [];

    if (currentElementIndex < elements.length - 1) {
      setCurrentElementIndex((index) => index + 1);
      return;
    }

    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex((index) => index + 1);
      setCurrentElementIndex(0);
    }
  }

  function handlePrevious() {
    if (!documentData) return;

    if (currentElementIndex > 0) {
      setCurrentElementIndex((index) => index - 1);
      return;
    }

    if (currentPageIndex > 0) {
      const previousPageIndex = currentPageIndex - 1;
      const previousPage = documentData.pages[previousPageIndex];
      const previousElements = previousPage?.elements || [];

      setCurrentPageIndex(previousPageIndex);
      setCurrentElementIndex(
        Math.max(previousElements.length - 1, 0)
      );
    }
  }
  function getCurrentSpeechText() {
    if (!documentData) {
      return "";
    }

    const pages = documentData.pages || [];
    const page = pages[currentPageIndex];
    const elements = page?.elements || [];
    const element = elements[currentElementIndex];

    if (!element) {
      return "";
    }

    // Special handling for charts
    if (
      element.type === "chart" &&
      element.data &&
      element.data.length > 0
    ) {
      const values = element.data;

      const highest = values.reduce(
        (max, item) =>
          item.value > max.value ? item : max,
        values[0]
      );

      const lowest = values.reduce(
        (min, item) =>
          item.value < min.value ? item : min,
        values[0]
      );

      const dataText = values
        .map(
          (item) =>
            `${item.label}: ${item.value}`
        )
        .join(", ");

      return [
        `${element.chart_type || "chart"} chart`,
        element.text,
        element.description,
        `The highest value is ${highest.label} at ${highest.value}`,
        `The lowest value is ${lowest.label} at ${lowest.value}`,
        `Data points: ${dataText}`,
      ]
        .filter(Boolean)
        .join(". ");
    }

    // Default speech for all other elements
    return [
      element.type,
      element.text,
      element.description,
    ]
      .filter(Boolean)
      .join(". ");
  }
  return (
    <div className="app">
      <h1>Drishti-Scribe</h1>
      <p className="keyboard-help">
        Keyboard shortcuts: Left Arrow or P for previous,
        Right Arrow or N for next, Escape to stop speech.
      </p>
      

 

      <Upload onDocumentLoaded={handleDocumentLoaded} />

      {documentData && (
        <>
          <Reader
            documentData={documentData}
            currentPageIndex={currentPageIndex}
            currentElementIndex={currentElementIndex}
          />

          <Controls
            onPrevious={handlePrevious}
            onNext={handleNext}
            speechText={getCurrentSpeechText()}
          />
        </>
      )}
    </div>
  );
}

export default App;