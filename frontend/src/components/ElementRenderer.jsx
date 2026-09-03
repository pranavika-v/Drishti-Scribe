function ElementRenderer({
  element,
  chartDataIndex,
  onPreviousChartData,
  onNextChartData,
  onBookmark,
  isBookmarked,
}) {
  if (!element) return null;

  const type = element.type || "paragraph";

  const BookmarkButton = () => (
    <button
      type="button"
      className={`bookmark-toggle ${isBookmarked ? "active" : ""}`}
      onClick={onBookmark}
      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this element"}
      aria-pressed={isBookmarked}
    >
      {isBookmarked ? "🔖" : "🏷"}
    </button>
  );

  switch (type) {
    case "heading":
      return (
        <section className="document-heading">
          <div className="element-header-row">
            <p className="element-type">Heading</p>
            <BookmarkButton />
          </div>
          <h2>{element.text || "Untitled heading"}</h2>
          {element.description && <p>{element.description}</p>}
        </section>
      );

    case "paragraph":
      return (
        <section className="document-paragraph">
          <div className="element-header-row">
            <p className="element-type">Paragraph</p>
            <BookmarkButton />
          </div>
          <p>{element.text || ""}</p>
          {element.description && (
            <p className="element-description">{element.description}</p>
          )}
        </section>
      );

    case "chart": {
      const chartData = element.data || [];
      const currentDataPoint = chartData[chartDataIndex] || null;

      return (
        <section className="document-chart" aria-label="Chart">
          <div className="element-header-row">
            <p className="element-type">Chart</p>
            <BookmarkButton />
          </div>
          <h2>{element.text || "Chart"}</h2>
          <p>{element.description || "No chart description available."}</p>
          {element.chart_type && <p>Chart type: {element.chart_type}</p>}

          {chartData.length > 0 && (
            <section className="current-chart-data" aria-live="polite">
              <p>
                Data point {chartDataIndex + 1} of {chartData.length}
              </p>
              {currentDataPoint && (
                <p>
                  <strong>{currentDataPoint.label}</strong>: {currentDataPoint.value}
                </p>
              )}
            </section>
          )}

          {chartData.length > 0 && (
            <div className="chart-navigation">
              <button
                type="button"
                onClick={onPreviousChartData}
                disabled={chartDataIndex === 0}
              >
                Previous data point
              </button>
              <button
                type="button"
                onClick={onNextChartData}
                disabled={chartDataIndex >= chartData.length - 1}
              >
                Next data point
              </button>
            </div>
          )}

          {chartData.length > 0 && (
            <ul className="chart-data">
              {chartData.map((item, index) => (
                <li
                  key={index}
                  aria-current={index === chartDataIndex ? "true" : undefined}
                >
                  {item.label}: {item.value}
                </li>
              ))}
            </ul>
          )}
        </section>
      );
    }

    case "flowchart":
      return (
        <section className="document-flowchart" aria-label="Flowchart">
          <div className="element-header-row">
            <p className="element-type">Flowchart</p>
            <BookmarkButton />
          </div>
          <h2>{element.text || "Flowchart"}</h2>
          <p>{element.description || "No flowchart description available."}</p>
        </section>
      );

    case "table":
      return (
        <section className="document-table" aria-label="Table">
          <div className="element-header-row">
            <p className="element-type">Table</p>
            <BookmarkButton />
          </div>
          <h2>{element.text || "Table"}</h2>
          <p>{element.description || "No table description available."}</p>
        </section>
      );

    case "image":
      return (
        <section className="document-image" aria-label="Image">
          <div className="element-header-row">
            <p className="element-type">Image</p>
            <BookmarkButton />
          </div>
          <h2>{element.text || "Image"}</h2>
          <p>{element.description || "No image description available."}</p>
        </section>
      );

    case "diagram":
      return (
        <section className="document-diagram" aria-label="Diagram">
          <div className="element-header-row">
            <p className="element-type">Diagram</p>
            <BookmarkButton />
          </div>
          <h2>{element.text || "Diagram"}</h2>
          <p>{element.description || "No diagram description available."}</p>
        </section>
      );

    default:
      return (
        <section className="document-element">
          <div className="element-header-row">
            <p className="element-type">{type}</p>
            <BookmarkButton />
          </div>
          <h2>{element.text || "Untitled"}</h2>
          {element.description && <p>{element.description}</p>}
        </section>
      );
  }
}

export default ElementRenderer;
