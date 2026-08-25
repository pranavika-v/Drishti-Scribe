import { useEffect, useState } from "react";
import Upload from "./components/Upload";
import Reader from "./components/Reader";
import Controls from "./components/Controls";
import "./index.css";

function App() {
  const [documentData, setDocumentData] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentElementIndex, setCurrentElementIndex] = useState(0);
  const [chartDataIndex, setChartDataIndex] = useState(0);

  function handleDocumentLoaded(data) {
    setDocumentData(data);
    setCurrentPageIndex(0);
    setCurrentElementIndex(0);
    setChartDataIndex(0);
  }

  function handleNext() {
    if (!documentData) return;

    const pages = documentData.pages || [];
    const currentPage = pages[currentPageIndex];
    const elements = currentPage?.elements || [];
    const currentElement = elements[currentElementIndex];

    // If currently inside a chart,
    // move through its data points first.
    if (
      currentElement?.type === "chart" &&
      currentElement.data &&
      currentElement.data.length > 0 &&
      chartDataIndex < currentElement.data.length - 1
    ) {
      setChartDataIndex((index) => index + 1);
      return;
    }

    // Move to the next document element.
    if (currentElementIndex < elements.length - 1) {
      setCurrentElementIndex((index) => index + 1);
      setChartDataIndex(0);
      return;
    }

    // Move to the next page.
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex((index) => index + 1);
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

    // If currently inside a chart,
    // move backwards through its data points first.
    if (
      currentElement?.type === "chart" &&
      currentElement.data &&
      currentElement.data.length > 0 &&
      chartDataIndex > 0
    ) {
      setChartDataIndex((index) => index - 1);
      return;
    }

    // Move to the previous document element.
    if (currentElementIndex > 0) {
      const previousElementIndex =
        currentElementIndex - 1;

      const previousElement =
        elements[previousElementIndex];

      setCurrentElementIndex(previousElementIndex);

      // If previous element is a chart,
      // start at its last data point.
      if (
        previousElement?.type === "chart" &&
        previousElement.data &&
        previousElement.data.length > 0
      ) {
        setChartDataIndex(
          previousElement.data.length - 1
        );
      } else {
        setChartDataIndex(0);
      }

      return;
    }

    // Move to the previous page.
    if (currentPageIndex > 0) {
      const previousPageIndex =
        currentPageIndex - 1;

      const previousPage =
        pages[previousPageIndex];

      const previousElements =
        previousPage?.elements || [];

      setCurrentPageIndex(previousPageIndex);

      const lastElementIndex =
        Math.max(previousElements.length - 1, 0);

      setCurrentElementIndex(lastElementIndex);

      const lastElement =
        previousElements[lastElementIndex];

      // If the last element on the previous page
      // is a chart, start at its last data point.
      if (
        lastElement?.type === "chart" &&
        lastElement.data &&
        lastElement.data.length > 0
      ) {
        setChartDataIndex(
          lastElement.data.length - 1
        );
      } else {
        setChartDataIndex(0);
      }
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

    // Special handling for charts.
    if (
      element.type === "chart" &&
      element.data &&
      element.data.length > 0
    ) {
      const values = element.data;

      const currentDataPoint =
        values[chartDataIndex];

      if (!currentDataPoint) {
        return [
          `${element.chart_type || "chart"} chart`,
          element.text,
          element.description,
        ]
          .filter(Boolean)
          .join(". ");
      }

      return [
        `${element.chart_type || "chart"} chart`,
        element.text,
        element.description,
        `Data point ${
          chartDataIndex + 1
        } of ${values.length}`,
        `${currentDataPoint.label}: ${currentDataPoint.value}`,
      ]
        .filter(Boolean)
        .join(". ");
    }

    // Default speech for all other elements.
    return [
      element.type,
      element.text,
      element.description,
    ]
      .filter(Boolean)
      .join(". ");
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (!documentData) {
        return;
      }

      const tagName =
        event.target.tagName.toLowerCase();

      // Don't intercept typing inside form controls.
      if (
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select"
      ) {
        return;
      }

      if (
        event.key === "ArrowRight" ||
        event.key.toLowerCase() === "n"
      ) {
        event.preventDefault();
        handleNext();
      }

      if (
        event.key === "ArrowLeft" ||
        event.key.toLowerCase() === "p"
      ) {
        event.preventDefault();
        handlePrevious();
      }

      if (event.key === "Escape") {
        window.speechSynthesis.cancel();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    documentData,
    currentPageIndex,
    currentElementIndex,
    chartDataIndex,
  ]);

  function handlePreviousChartData() {
    if (!documentData) return;

    setChartDataIndex((index) =>
      Math.max(index - 1, 0)
    );
  }

  function handleNextChartData() {
    if (!documentData) return;

    const page =
      documentData.pages?.[currentPageIndex];

    const element =
      page?.elements?.[currentElementIndex];

    if (
      element?.type !== "chart" ||
      !element.data ||
      element.data.length === 0
    ) {
      return;
    }

    setChartDataIndex((index) =>
      Math.min(
        index + 1,
        element.data.length - 1
      )
    );
  }

  return (
    <div className="app">
      <h1>Drishti-Scribe</h1>

      <p className="keyboard-help">
        Keyboard shortcuts: Left Arrow or P for
        previous, Right Arrow or N for next,
        Escape to stop speech.
      </p>

      <Upload
        onDocumentLoaded={handleDocumentLoaded}
      />

      {documentData && (
        <>
          <Reader
            documentData={documentData}
            currentPageIndex={currentPageIndex}
            currentElementIndex={currentElementIndex}
            chartDataIndex={chartDataIndex}
            onPreviousChartData={
              handlePreviousChartData
            }
            onNextChartData={
              handleNextChartData
            }
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