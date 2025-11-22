import { useState } from "react";

export default function FileUpload({ onUpload }) {
  const [file, setFile] = useState(null);

  const handleFileSelect = (event) => {
    const nextFile = event.target.files?.[0];
    setFile(nextFile || null);
  };

  const handleUpload = () => {
    if (!file) return;
    onUpload(file);
  };

  return (
    <div className="uploader">
      <label htmlFor="upload-input" className="uploader-label">
        Upload PDF or image
      </label>
      <input
        id="upload-input"
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleFileSelect}
      />
      {file ? (
        <p className="file-name">Selected: {file.name}</p>
      ) : (
        <p className="muted">Supports PDF, JPG, and PNG up to 10 MB.</p>
      )}
      <button
        onClick={handleUpload}
        className="primary-btn"
        disabled={!file}
      >
        Analyze
      </button>
    </div>
  );
}
