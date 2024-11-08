const isCharNumber = (char) => {
  if (typeof char === 'string') {
    const asciiCode = char.charCodeAt(0);
    if (asciiCode >= 48 && asciiCode <= 57) return true;
  }
  return false;
};

const isCharUpperLetter = (char) => {
  if (typeof char === 'string') {
    const asciiCode = char.charCodeAt(0);
    if (asciiCode >= 65 && asciiCode <= 90) {
      return true;
    }
  }

  return false;
};

module.exports = {
  isCharNumber,
  isCharUpperLetter,
};
