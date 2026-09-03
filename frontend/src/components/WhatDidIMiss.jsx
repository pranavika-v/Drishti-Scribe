const VISUAL_TYPES = ["chart", "image", "diagram", "flowchart", "table"];

function WhatDidIMiss({
  documentData,
  currentPageIndex,
  visitedElements,
  exploredVisuals,
  onNavigate,
  onExploreWithAI,
}) {
  const pages = documentData?.pages || [];
  const currentPage = pages[currentPageIndex];
  const elements = currentPage?.elements || [];

  const unexplored = elements.filter((el) => {
    const key = `${currentPage.page}_${el.id}`;
    if (VISUAL_TYPES.includes(el.type)) {
      return !exploredVisuals.has(key);
    }
    return !visitedElements.has(key);
  });

  const explored = elements.filter((el) => {
    const key = `${currentPage.page}_${el.id}`;
    return visitedElements.has(key) || exploredVisuals.has(key);
  });

  if (unexplored.length === 0 && elements.length > 0) {
    return (
      <section className="what-did-i-miss" aria-label="What Did I Miss">
        <h2 className="wdim-title">What Did I Miss?</h2>
        <p className="wdim-complete">
          You have explored all elements on this page. Great job!
        </p>
        <div className="wdim-explored">
          <p className="wdim-summary-label">You have explored:</p>
          <ul className="wdim-explored-list">
            {explored.map((el, i) => (
              <li key={i}>
                ✓ {el.type === "heading" ? el.text : el.type}
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  if (elements.length === 0) return null;

  return (
    <section className="what-did-i-miss" aria-label="What Did I Miss">
      <h2 className="wdim-title">What Did I Miss?</h2>

      {explored.length > 0 && (
        <div className="wdim-explored">
          <p className="wdim-summary-label">You have explored:</p>
          <ul className="wdim-explored-list">
            {explored.map((el, i) => (
              <li key={i}>
                ✓ {el.type === "heading" ? el.text : el.type}
              </li>
            ))}
          </ul>
        </div>
      )}

      {unexplored.length > 0 && (
        <div className="wdim-unexplored">
          <p className="wdim-summary-label">
            You may have missed:
          </p>
          <ul className="wdim-unexplored-list">
            {unexplored.map((el, i) => {
              const elIdx = elements.indexOf(el);
              const icon = VISUAL_TYPES.includes(el.type) ? "📊" : "📄";
              return (
                <li key={i} className="wdim-item">
                  <div className="wdim-item-info">
                    <span aria-hidden="true">{icon}</span>{" "}
                    <strong>{el.text || el.type}</strong>
                    {el.description && (
                      <p className="wdim-item-desc">
                        {el.description.length > 120
                          ? el.description.slice(0, 120) + "..."
                          : el.description}
                      </p>
                    )}
                  </div>
                  <div className="wdim-item-actions">
                    <button
                      type="button"
                      onClick={() =>
                        onNavigate(currentPageIndex, elIdx)
                      }
                    >
                      {VISUAL_TYPES.includes(el.type)
                        ? "Explore Now"
                        : "Go to"}
                    </button>
                    {VISUAL_TYPES.includes(el.type) && (
                      <button
                        type="button"
                        className="wdim-ai-btn"
                        onClick={() => onExploreWithAI(elIdx)}
                      >
                        Explain with AI
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

export default WhatDidIMiss;
