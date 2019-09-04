jest.unmock('/src/utils');

require('jasmine-expect');
const Utils = require('/src/utils');

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
      expect(result).toBeRegExp();
      expect(result.ignoreCase).toBeTrue();
      expect(result.global).toBeTrue();
      expect(result.multiline).toBeFalse();
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
      expect(result).toBeRegExp();
      expect(result.ignoreCase).toBeTrue();
      expect(result.global).toBeTrue();
      expect(result.multiline).toBeTrue();
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
      expect(Utils.isObject({})).toBeTrue();
      expect(Utils.isObject(new Error())).toBeFalse();
      expect(Utils.isObject([])).toBeFalse();
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
});
