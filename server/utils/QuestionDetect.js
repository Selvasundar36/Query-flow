const isQuestion = (text) => {
  if (!text) return false;

  const questionWords = [
    "how",
    "what",
    "why",
    "when",
    "where",
    "who",
    "can",
    "does",
    "do",
    "is",
    "are",
    "should",
    "will",
    "explain",
    "more"
  ];

  const lower = text.toLowerCase().trim();

  return (
    lower.endsWith("?") ||
    questionWords.some(word => lower.startsWith(word + " "))
  );
};

module.exports = isQuestion;
