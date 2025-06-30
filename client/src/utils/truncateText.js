// src/utils/truncateText.js
const truncateText = (text, length) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export default truncateText;  // Default export