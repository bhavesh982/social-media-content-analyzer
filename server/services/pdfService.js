import pdf from "pdf-parse";

export const extractPDF = async (buffer) => {
	const data = await pdf(buffer);
	return data.text;
};

export default { extractPDF };
