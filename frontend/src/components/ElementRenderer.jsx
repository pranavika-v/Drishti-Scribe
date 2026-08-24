function ElementRenderer({ element }) {
  if (!element) {
    return null;
  }

  const type = element.type || "paragraph";

  switch (type) {
    case "heading":
      return (
        <section className="document-heading">
          <p className="element-type">Heading</p>
          <h2>{element.text || "Untitled heading"}</h2>

          {element.description && (
            <p>{element.description}</p>
          )}
        </section>
      );

    case "paragraph":
      return (
        <section className="document-paragraph">
          <p className="element-type">Paragraph</p>
          <p>{element.text || ""}</p>

          {element.description && (
            <p className="element-description">
              {element.description}
            </p>
          )}
        </section>
      );

    case "chart":
      return (
        <section
          className="document-chart"
          aria-label="Chart"
        >
          <p className="element-type">Chart</p>

          <h2>
            {element.text || "Chart"}
          </h2>

          <p>
            {element.description ||
              "No chart description available."}
          </p>
        </section>
      );

    case "flowchart":
      return (
        <section
          className="document-flowchart"
          aria-label="Flowchart"
        >
          <p className="element-type">
            Flowchart
          </p>

          <h2>
            {element.text || "Flowchart"}
          </h2>

          <p>
            {element.description ||
              "No flowchart description available."}
          </p>
        </section>
      );

    default:
      return (
        <section className="document-element">
          <p className="element-type">
            {type}
          </p>

          <h2>
            {element.text || "Untitled"}
          </h2>

          {element.description && (
            <p>{element.description}</p>
          )}
        </section>
      );
  }
}

export default ElementRenderer;