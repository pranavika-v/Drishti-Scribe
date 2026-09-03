function BookmarkPanel({ bookmarks, documentData, onNavigate, onRemove }) {
  return (
    <section className="bookmark-panel" aria-label="Bookmarks">
      <h2 className="bookmark-title">Bookmarks</h2>

      {bookmarks.length === 0 ? (
        <p className="bookmark-empty">No bookmarks yet. Bookmark elements to quickly return to them.</p>
      ) : (
        <ul className="bookmark-list">
          {bookmarks.map((bm, i) => {
            const page = documentData?.pages?.[bm.pageIndex];
            const element = page?.elements?.[bm.elementIndex];
            return (
              <li key={i} className="bookmark-item">
                <button
                  type="button"
                  className="bookmark-link"
                  onClick={() => onNavigate(bm.pageIndex, bm.elementIndex)}
                >
                  <span className="bookmark-page">Page {page?.page || "?"}</span>
                  <span className="bookmark-element">
                    {element?.text || element?.type || "Element"}
                  </span>
                </button>
                <button
                  type="button"
                  className="bookmark-remove"
                  onClick={() => onRemove(i)}
                  aria-label="Remove bookmark"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default BookmarkPanel;
