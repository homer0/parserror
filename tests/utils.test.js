jest.unmock('../src/utils');

const Utils = require('../src/utils');

describe('Utils', () => {
  describe('escapeForRegExp', () => {
    it('should escape a text to be used inside a RegExp', () => {
      // Given
      const text = 'hello {(world)}';
      let result = null;
      // When
      result = Utils.escapeForRegExp(text);
      // Then
      expect(result).toBe('hello\\ \\{\\(world\\)\\}');
    });
  });

  describe('copyRegExp', () => {
    it('should copy a regular expression', () => {
      // Given
      const text = 'charito';
      const flags = 'ig';
      const expression = new RegExp(text, flags);
      let result = null;
      // When
      result = Utils.copyRegExp(expression);
      // Then
      expect(expression).not.toBe(result);
      expect(result).toBeInstanceOf(RegExp);
      expect(result.ignoreCase).toBe(true);
      expect(result.global).toBe(true);
      expect(result.multiline).toBe(false);
    });

    it('should copy a regular expression and add extra flags', () => {
      // Given
      const text = 'pili';
      const flags = 'i';
      const expression = new RegExp(text, flags);
      const extraFlags = 'gm';
      let result = null;
      // When
      result = Utils.copyRegExp(expression, extraFlags);
      // Then
      expect(expression).not.toBe(result);
      expect(result).toBeInstanceOf(RegExp);
      expect(result.ignoreCase).toBe(true);
      expect(result.global).toBe(true);
      expect(result.multiline).toBe(true);
    });
  });

  describe('execRegExp', () => {
    it('should execute a expression', () => {
      // Given
      const value = 'Goodbye world';
      const expression = {
        exec: jest.fn(() => value),
      };
      const text = 'Hello world';
      let result = null;
      // When
      result = Utils.execRegExp(expression, text);
      // Then
      expect(result).toBe(value);
      expect(expression.exec).toHaveBeenCalledTimes(1);
      expect(expression.exec).toHaveBeenCalledWith(text);
    });
  });

  describe('isObject', () => {
    it('should validate that something is a literal object', () => {
      // Given/When/Then
      expect(Utils.isObject({})).toBe(true);
      expect(Utils.isObject(new Error())).toBe(false);
      expect(Utils.isObject([])).toBe(false);
    });
  });

  describe('ensureArray', () => {
    it('shouldn\'t transform something that is already an array', () => {
      // Given
      const target = ['Rosario'];
      // When/Then
      expect(Utils.ensureArray(target)).toEqual(target);
    });

    it('should wrap non array objects into one', () => {
      // Given
      const target = 'Pilar';
      // When/Then
      expect(Utils.ensureArray(target)).toEqual([target]);
    });
  });

  describe('getRandomString', () => {
    it('should generate unique strings', () => {
      // Given
      const lengths = [4, 8, 15, 16, 23, 42];
      const samples = 5;
      let results = null;
      // When
      results = lengths.map((length) => (
        (new Array(samples))
        .fill('')
        .map(() => Utils.getRandomString(length))
      ));
      // Then
      results.forEach((result, index) => {
        const length = lengths[index];
        result.forEach((string, stringIndex) => {
          expect(string.length).toBe(length);
          if (stringIndex) {
            expect(string).not.toEqual(result[stringIndex - 1]);
          }
        });
      });
    });
  });
});
