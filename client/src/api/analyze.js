import axios from "axios";

// Point to the backend analyze endpoint (match server port)
const API_URL = "http://localhost:3000/analyze";

export const analyzeFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(API_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
