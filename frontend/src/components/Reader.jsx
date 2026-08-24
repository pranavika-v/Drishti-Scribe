import { useEffect, useRef } from "react";
import ElementRenderer from "./ElementRenderer";

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

      <ElementRenderer element={element} />
    </main>
  );
}

export default Reader;