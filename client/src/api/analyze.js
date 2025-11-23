import axios from "axios";

// Prefer env override, default to hosted Render API
const API_URL =
  import.meta.env.VITE_API_URL?.trim() ||
  "https://social-media-content-analyzer-er7c.onrender.com/analyze";

export const analyzeFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  // Let the browser set the Content-Type (including boundary).
  const response = await axios.post(API_URL, formData);

  return response.data;
};
