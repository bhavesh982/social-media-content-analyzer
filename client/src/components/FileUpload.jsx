import { useState } from "react";

export default function FileUpload({ onUpload }) {
  const [file, setFile] = useState(null);

  const handleFileSelect = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (file) onUpload(file);
  };

  return (
    <div className="p-4 border rounded-xl bg-gray-800 text-white shadow-md">
      <input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleFileSelect}
        className="mb-3"
      />
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700"
      >
        Analyze
      </button>
    </div>
  );
}
