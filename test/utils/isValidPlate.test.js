const {
  isValidPlate,
} = require('../../src/utils/carDataValidation/isValidPlate');

describe('When validating a plate', () => {
  test('should return true for a valid plate format (ABC-1234)', () => {
    const result = isValidPlate('ABC-1234');
    expect(result).toBe(true);
  });

  test('should return true for a valid plate format (ABC-1J34)', () => {
    const result = isValidPlate('ABC-1J34');
    expect(result).toBe(true);
  });

  test('should return false for a plate with letters in wrong format (ABC1234)', () => {
    const result = isValidPlate('ABC1234');
    expect(result).toBe(false);
  });

  test('should return false for a plate with letters in wrong format (-ABC1234)', () => {
    const result = isValidPlate('-ABC1234');
    expect(result).toBe(false);
  });

  test('should return false for a plate with special characters (AB$-1234)', () => {
    const result = isValidPlate('AB$-1234');
    expect(result).toBe(false);
  });

  test('should return false for a plate in lowercase (abc-1a34)', () => {
    const result = isValidPlate('abc-1a34');
    expect(result).toBe(false);
  });

  test('should return false for empty plate', () => {
    const result = isValidPlate('');
    expect(result).toBe(false);
  });
});
