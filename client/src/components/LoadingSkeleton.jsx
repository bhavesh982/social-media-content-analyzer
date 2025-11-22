export default function LoadingSkeleton() {
  return (
    <div className="loader-panel" aria-live="polite" aria-busy>
      <div className="spinner" />
      <div className="skeleton-grid">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="skeleton-card">
            <div className="skeleton-bar" />
            <div className="skeleton-bar short" />
            <div className="skeleton-pill" />
          </div>
        ))}
      </div>
      <p className="muted">Crunching PDF text with OCR + Gemini insights…</p>
    </div>
  );
}
