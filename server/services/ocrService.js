import Tesseract from "tesseract.js";

export const extractImage = async (path) => {
	const result = await Tesseract.recognize(path, "eng");
	return result.data.text;
};

export default { extractImage };
