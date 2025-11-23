import React from "react";
import "./AnalysisStyles.css";

// Helper to get badge colors
const sentimentMap = {
  positive: "sentiment-positive",
  neutral: "sentiment-neutral",
  negative: "sentiment-negative",
};

export default function Dashboard({ data, rawFallback, model }) {
  let parsedData = null;

  // --- 1. LOGIC: Try to get usable data ---
  try {
    if (data && typeof data === "object") {
      parsedData = data;
    } else if (typeof data === "string") {
      // Attempt to parse if it came in as a string
      const cleanString = data.replace(/```json|```/gi, "").trim();
      parsedData = JSON.parse(cleanString);
    }
  } catch (err) {
    console.warn("Dashboard JSON parse failed, switching to raw view.", err);
    parsedData = null;
  }

  // --- 2. FALLBACK: If JSON failed, show Raw Text ---
  const modelLabel = model ? model.replace(/^models\//i, '') : null;

  if (!parsedData) {
    if (!rawFallback) return null; // Nothing to show
    return (
      <div className="dashboard-container">
        <div className="result-card">
          <h3 className="card-title">Analysis Output (Raw)</h3>
          {modelLabel && (
            <p className="model-chip">AI Model: {modelLabel}</p>
          )}
          <p className="muted" style={{ marginBottom: "10px" }}>
            The AI response was incomplete or invalid JSON. Showing raw text:
          </p>
          <pre className="raw-pre">{rawFallback}</pre>
        </div>
      </div>
    );
  }

  // --- 3. SUCCESS: Render the Dashboard ---
  const sentiment = (parsedData.sentiment || "Neutral").toLowerCase();
  const badgeClass = `sentiment-badge ${sentimentMap[sentiment] || sentimentMap.neutral}`;

  const showRawPanel = Boolean(rawFallback);
  const gridClass = `dashboard-grid${showRawPanel ? " dashboard-grid--split" : ""}`;

  return (
    <div className={gridClass}>
      <div className="dash-stack">
        {modelLabel && (
          <p className="model-chip">AI Model: {modelLabel}</p>
        )}
        {/* Summary */}
        <div className="dash-card summary-card">
          <h3>🚀 Executive Summary</h3>
          <p>{parsedData.summary || "No summary available."}</p>
        </div>

        {/* Metrics Row */}
        <div className="metrics-row">
          <div className="dash-card metric-card">
            <h4>Sentiment</h4>
            <span className={badgeClass}>{parsedData.sentiment || "Neutral"}</span>
          </div>

          <div className="dash-card metric-card">
            <h4>Est. Impact</h4>
            <span className="impact-score">
              {parsedData.engagement_prediction ? `${parsedData.engagement_prediction}%` : "N/A"}
            </span>
          </div>
        </div>

        {/* Hashtags */}
        <div className="dash-card tags-card">
          <h3>#️⃣ Optimized Hashtags</h3>
          <div className="tags-container">
            {Array.isArray(parsedData.hashtags) && parsedData.hashtags.length > 0 ? (
              parsedData.hashtags.map((tag, i) => (
                <span key={i} className="tag-pill">
                  #{tag.replace(/^#/, "")}
                </span>
              ))
            ) : (
              <span className="muted">No hashtags found.</span>
            )}
          </div>
        </div>

        {/* Key Insights */}
        {Array.isArray(parsedData.key_points) && parsedData.key_points.length > 0 && (
          <div className="dash-card list-card">
            <h3>💡 Engagement Suggestions</h3>
            <ul>
              {parsedData.key_points.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {showRawPanel && (
        <div className="dash-card raw-card">
          <h3>🧾 Raw AI Payload</h3>
          <p className="muted" style={{ marginBottom: "10px" }}>
            Direct response from Gemini (before parsing):
          </p>
          <pre className="raw-pre">{rawFallback}</pre>
        </div>
      )}
    </div>
  );
}