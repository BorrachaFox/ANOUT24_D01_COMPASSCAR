const newCarYear = new Date().getFullYear() + 1;

const isValidYear = (year, maxCarAge = 10) => {
  const minValidCarYear = newCarYear - maxCarAge;
  if (year < minValidCarYear || year > newCarYear) return false;

  return true;
};

const invalidYearMessage = (maxCarAge = 10) => {
  const minValidCarYear = newCarYear - maxCarAge;
  return `year must be between ${minValidCarYear} and ${newCarYear}`;
};

module.exports = {
  isValidYear,
  invalidYearMessage,
};
