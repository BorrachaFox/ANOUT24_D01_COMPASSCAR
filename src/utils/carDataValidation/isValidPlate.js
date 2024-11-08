const { isCharNumber, isCharUpperLetter } = require('../charValidation');

// ABC-1234 || XYZ-1J00
const isValidPlate = (plate) => {
  if (!plate) return false;

  const plateLength = plate.length;

  if (plateLength !== 8) return false;
  if (plate[3] !== '-') return false;

  const [firstPart, secondPart] = plate.split('-');

  if (firstPart.length !== 3) return false;
  if (secondPart.length !== 4) return false;

  if (!firstPart.split('').every(isCharUpperLetter)) return false;

  if (!isCharNumber(secondPart[0])) return false;
  if (!(isCharNumber(secondPart[1]) || isCharUpperLetter(secondPart[1]))) {
    return false;
  }
  if (!isCharNumber(secondPart[2])) return false;
  if (!isCharNumber(secondPart[3])) return false;

  return true;
};

module.exports = {
  isValidPlate,
};
