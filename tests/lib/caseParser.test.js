jest.unmock('/src/lib/caseParser');

require('jasmine-expect');
const CaseParser = require('/src/lib/caseParser');
const Utils = require('/src/lib/utils');

describe('case-parser', () => {
  beforeEach(() => {
    Utils.isObject.mockReset();
  });

  describe('constructor', () => {
    it('should throw an error when instantiated without a name', () => {
      // Given/When/Then
      expect(() => new CaseParser()).toThrow(/The 'name' can only be a 'string'/i);
    });

    it('should throw an error when instantiated with an invalid parser', () => {
      // Given/When/Then
      expect(() => new CaseParser('myParser'))
      .toThrow(/'\w+': the 'parser' parameter can only be a 'string' or a 'function'/i);
    });

    it('should throw an error when instantiated with an empty object as parser', () => {
      // Given
      Utils.isObject.mockImplementationOnce(() => true);
      // When/Then
      expect(() => new CaseParser('myParser', {}))
      .toThrow(/'\w+': the parser is empty\. It should include at least one item to map/i);
    });

    it('should be instantiated', () => {
      // Given
      const name = 'myParser';
      let sut = null;
      // When
      sut = new CaseParser(name, () => {});
      // Then
      expect(sut).toBeInstanceOf(CaseParser);
      expect(sut.name).toBe(name);
    });
  });

  describe('parse:map', () => {
    it('shouldn\'t do anything when the value doesn\'t match its keys', () => {
      // Given
      Utils.isObject.mockImplementationOnce(() => true);
      const parser = {
        name: {
          full: 'Rosario',
        },
      };
      const value = 'age';
      let sut = null;
      let result = null;
      // When
      sut = new CaseParser('myParser', parser);
      result = sut.parse(value);
      // Then
      expect(result).toBe(value);
    });

    it('should replace a value when it matches one of its keys', () => {
      // Given
      Utils.isObject.mockImplementationOnce(() => true);
      const value = 'name';
      const parser = {
        [value]: {
          full: 'Rosario',
        },
      };
      let sut = null;
      let result = null;
      // When
      sut = new CaseParser('myParser', parser);
      result = sut.parse(value);
      // Then
      expect(result).toEqual(Object.assign({ raw: value }, parser[value]));
    });

    it('should extend an already mapped value', () => {
      // Given
      Utils.isObject.mockImplementationOnce(() => true);
      Utils.isObject.mockImplementationOnce(() => true);
      const value = {
        raw: 'name',
        full: 'Rosario',
      };
      const parser = {
        [value.raw]: {
          nickname: 'Charo',
        },
      };
      let sut = null;
      let result = null;
      // When
      sut = new CaseParser('myParser', parser);
      result = sut.parse(value);
      // Then
      expect(result).toEqual(Object.assign({}, value, parser[value.raw]));
    });
  });

  describe('parse:function', () => {
    it('should replace a value', () => {
      // Given
      const value = 'name';
      const parsed = 'Pilar';
      const parser = jest.fn(() => parsed);
      let sut = null;
      let result = null;
      // When
      sut = new CaseParser('myParser', parser);
      result = sut.parse(value);
      // Then
      expect(result).toEqual(parsed);
      expect(parser).toHaveBeenCalledTimes(1);
      expect(parser).toHaveBeenCalledWith(value);
    });
  });
});
