function Settings({ settings, onChange }) {
  function update(key, value) {
    onChange({ ...settings, [key]: value });
  }

  return (
    <section className="settings-panel" aria-label="Reader Settings">
      <h2 className="settings-title">Settings</h2>

      <div className="setting-group">
        <label className="setting-label">Font Size</label>
        <div className="setting-buttons">
          {["small", "medium", "large", "xlarge"].map((size) => (
            <button
              key={size}
              type="button"
              className={`setting-btn ${settings.fontSize === size ? "active" : ""}`}
              onClick={() => update("fontSize", size)}
              aria-pressed={settings.fontSize === size}
            >
              {size === "xlarge" ? "Extra Large" : size.charAt(0).toUpperCase() + size.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="setting-group">
        <label className="setting-label">Speech Speed</label>
        <div className="setting-buttons">
          {[0.75, 1, 1.25, 1.5].map((speed) => (
            <button
              key={speed}
              type="button"
              className={`setting-btn ${settings.speechRate === speed ? "active" : ""}`}
              onClick={() => update("speechRate", speed)}
              aria-pressed={settings.speechRate === speed}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      <div className="setting-group">
        <label className="setting-label">Auto-Read</label>
        <div className="setting-buttons">
          <button
            type="button"
            className={`setting-btn ${settings.autoRead ? "active" : ""}`}
            onClick={() => update("autoRead", !settings.autoRead)}
            aria-pressed={settings.autoRead}
          >
            {settings.autoRead ? "On" : "Off"}
          </button>
        </div>
      </div>

      <div className="setting-group">
        <label className="setting-label">High Contrast</label>
        <div className="setting-buttons">
          <button
            type="button"
            className={`setting-btn ${settings.highContrast ? "active" : ""}`}
            onClick={() => update("highContrast", !settings.highContrast)}
            aria-pressed={settings.highContrast}
          >
            {settings.highContrast ? "On" : "Off"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default Settings;
