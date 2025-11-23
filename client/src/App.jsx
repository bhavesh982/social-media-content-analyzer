import { useState } from "react";
import FileUpload from "./components/FileUpload";
import Dashboard from "./components/Dashboard";
import LoadingSkeleton from "./components/LoadingSkeleton";
import { analyzeFile } from "./api/analyze";
import "./App.css"; // Ensure you have your main styles imported

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async (file) => {
    setLoading(true);
    setResult(null); // Clear previous results
    try {
      const response = await analyzeFile(file);
      setResult(response);
    } catch (err) {
      console.error(err);
      alert("An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  // Helper: Calculate metrics locally if backend doesn't provide them
  const getMetrics = () => {
    if (!result) return { wordCount: 0, hashtags: 0, links: 0 };
    
    // If backend already calculated metrics, use them
    if (result.metrics) return result.metrics;

    // Otherwise, calculate from the extracted text
    const text = result.extractedText || result.text || "";
    return {
      wordCount: text.split(/\s+/).filter(Boolean).length,
      hashtags: (text.match(/#[a-z0-9_]+/gi) || []).length,
      links: (text.match(/https?:\/\/[^\s]+/gi) || []).length,
    };
  };

  const metrics = getMetrics();
  
  // Extract the AI data based on the controller structure
  const structuredAI = result?.ai;       // Structured JSON from server
  const rawAI = result?.aiRaw;           // Original string fallback
  const aiModel = result?.aiModel;       // Model identifier

  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">Analyzer Mode</p>
        <h1>Social Media Content Analyzer</h1>
        <p className="muted">
          Upload PDFs or screenshots and get instant KPIs, sentiment, and optimized recommendations — no scrolling through walls of text.
        </p>
      </header>

      <section className="panel-grid">
        {/* Panel 1: Upload */}
        <div className="panel">
          <h2>1. Ingest Content</h2>
          <FileUpload onUpload={handleUpload} />
        </div>

        {/* Panel 2: Metrics */}
        <div className="panel metrics-panel">
          <h2>2. Quick Metrics</h2>
          <ul>
            <li>
              <span className="label">Word Count:</span>
              <strong>{metrics.wordCount}</strong>
            </li>
            <li>
              <span className="label">Hashtags:</span>
              <strong>{metrics.hashtags}</strong>
            </li>
            <li>
              <span className="label">Links:</span>
              <strong>{metrics.links}</strong>
            </li>
          </ul>
        </div>
      </section>

      {/* Loading State */}
      {loading && <LoadingSkeleton />}

      {/* Results State */}
      {result && (
        <section className="results-grid">
          
          {/* Left Column: Extracted Text */}
          <div className="panel extracted-panel">
            <div className="card-header">
              <h2>Extracted Text</h2>
              <span className="badge badge-neutral">OCR + PDF</span>
            </div>
            <div className="text-block">
              {result.extractedText || result.text || 'No text detected.'}
            </div>
          </div>

          {/* Right Column: AI Dashboard */}
          <div className="panel ai-panel">
            <div className="card-header">
              <h2>Gemini Insights</h2>
              <span className="badge badge-primary">AI Analysis</span>
            </div>
            
            {/* THIS IS THE FIX: Pass both structured data and raw fallback */}
            <Dashboard 
              data={structuredAI} 
              rawFallback={rawAI}
              model={aiModel}
            />
            
          </div>
        </section>
      )}
    </div>
  );
}

export default App;