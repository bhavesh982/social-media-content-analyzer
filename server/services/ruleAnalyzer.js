function analyzeText(text) {
	return {
		wordCount: text.split(/\s+/).filter(Boolean).length,
		hashtags: (text.match(/#/g) || []).length,
		links: (text.match(/https?:\/\/\S+/g) || []).length,
	};
}

module.exports = { analyzeText };
