import { useState } from "react";
import FileUpload from "./components/FileUpload";
import { analyzeFile } from "./api/analyze";

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async (file) => {
    setLoading(true);
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

  const metrics = result?.metrics || result?.analysis || { wordCount: 0, hashtags: 0, links: 0 };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Social Media Content Analyzer</h1>

      <FileUpload onUpload={handleUpload} />

      {loading && <p className="mt-4 animate-pulse">Analyzing...</p>}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-gray-800 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Extracted Text</h2>
            <p className="whitespace-pre-wrap">{result.text}</p>
          </div>

          <div className="p-4 bg-gray-800 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Metrics</h2>
            <ul>
              <li>Word Count: {metrics.wordCount}</li>
              <li>Hashtags: {metrics.hashtags}</li>
              <li>Links: {metrics.links}</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-800 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">AI Suggestions</h2>
            {result.ai ? (
              <p className="whitespace-pre-wrap">{result.ai}</p>
            ) : (
              <p className="text-gray-400">AI suggestions unavailable.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
