const VISUAL_ICONS = {
  chart: "📊",
  image: "🖼",
  diagram: "📐",
  flowchart: "🔀",
  table: "📋",
  other: "📄",
};

function DocumentMap({
  documentData,
  currentPageIndex,
  currentElementIndex,
  onNavigate,
}) {
  const pages = documentData?.pages || [];

  return (
    <nav className="document-map" aria-label="Document Map">
      <h2 className="map-title">Document Map</h2>
      <ul className="map-list">
        {pages.map((page, pIdx) => {
          const elements = page.elements || [];
          const isCurrentPage = pIdx === currentPageIndex;

          return (
            <li
              key={pIdx}
              className={`map-page ${isCurrentPage ? "current" : ""}`}
            >
              <button
                type="button"
                className="map-page-btn"
                onClick={() => onNavigate(pIdx, 0)}
                aria-current={isCurrentPage ? "page" : undefined}
              >
                Page {page.page}
                {elements[0]?.type === "heading" && elements[0]?.text
                  ? ` — ${elements[0].text}`
                  : ""}
              </button>

              {isCurrentPage && elements.length > 0 && (
                <ul className="map-elements">
                  {elements.map((el, eIdx) => {
                    const icon = VISUAL_ICONS[el.type] || "📄";
                    const isCurrent = eIdx === currentElementIndex;
                    return (
                      <li key={eIdx}>
                        <button
                          type="button"
                          className={`map-element-btn ${isCurrent ? "current" : ""}`}
                          onClick={() => onNavigate(pIdx, eIdx)}
                          aria-current={isCurrent ? "true" : undefined}
                        >
                          <span aria-hidden="true">{icon}</span>{" "}
                          {el.text || el.type}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default DocumentMap;
