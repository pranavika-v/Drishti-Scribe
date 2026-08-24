import { useEffect, useRef } from "react";

function Reader({
  documentData,
  currentPageIndex,
  currentElementIndex,
}) {
  const readerRef = useRef(null);

  const pages = documentData?.pages || [];
  const page = pages[currentPageIndex];
  const elements = page?.elements || [];
  const element = elements[currentElementIndex];

  useEffect(() => {
    if (readerRef.current) {
      readerRef.current.focus();
    }
  }, [currentPageIndex, currentElementIndex]);

  if (!page || !element) {
    return (
      <main
        className="reader"
        tabIndex="-1"
        ref={readerRef}
        aria-live="polite"
      >
        <p>No readable content found.</p>
      </main>
    );
  }

  return (
    <main
      className="reader"
      tabIndex="-1"
      ref={readerRef}
      aria-live="polite"
      aria-label={`Page ${page.page}, element ${
        currentElementIndex + 1
      } of ${elements.length}`}
    >
      <p className="page-indicator">
        Page {page.page} of {pages.length}
      </p>

      <p className="element-indicator">
        Element {currentElementIndex + 1} of {elements.length}
      </p>

      <section
        className="element"
        aria-labelledby="element-title"
      >
        <p className="element-type">
          {element.type || "Element"}
        </p>

        <h2 id="element-title">
          {element.text || "Untitled"}
        </h2>

        <p>
          {element.description ||
            "No description available."}
        </p>
      </section>
    </main>
  );
}

export default Reader;