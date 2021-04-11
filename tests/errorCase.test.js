/* eslint-disable max-classes-per-file */
jest.unmock('../src/errorCase');

const CaseParser = require('../src/caseParser');
const ErrorCase = require('../src/errorCase');
const FormattedError = require('../src/formattedError');
const Utils = require('../src/utils');

describe('ErrorCase', () => {
  beforeEach(() => {
    CaseParser.mockReset();
    FormattedError.mockReset();
    Utils.isObject.mockReset();
    Utils.escapeForRegExp.mockReset();
    Utils.ensureArray.mockReset();
    Utils.execRegExp.mockReset();
  });

  describe('constructor', () => {
    it('should throw an error when a required property is missing', () => {
      // Given/When/Then
      expect(() => new ErrorCase({})).toThrow(/The 'name' property is required/i);
    });

    it('should throw an error when `name` is not a `string`', () => {
      // Given/When/Then
      expect(
        () =>
          new ErrorCase({
            name: [],
            condition: 'condition',
            message: 'message',
          }),
      ).toThrow(/The 'name' can only be a 'string'/i);
    });

    it('should throw an error when `message` is not a `string` nor a `function`', () => {
      // Given/When/Then
      expect(
        () =>
          new ErrorCase({
            name: 'name',
            condition: 'condition',
            message: [],
          }),
      ).toThrow(/'\w+': 'message' can only be a 'string' or a 'function'/i);
    });

    it('should throw an error when `condition` is not a `string` nor a `RegExp`', () => {
      // Given/When/Then
      expect(
        () =>
          new ErrorCase({
            name: 'name',
            condition: [],
            message: 'message',
          }),
      ).toThrow(/'\w+': 'condition' can only be a 'string' or a 'RegExp'/i);
    });

    it('should throw an error when `parsers` is not an `object`', () => {
      // Given/When/Then
      expect(
        () =>
          new ErrorCase({
            name: 'name',
            condition: 'condition',
            message: 'message',
            parsers: 'parsers',
          }),
      ).toThrow(/'\w+': 'parsers' can only be an 'object'/i);
    });

    it('should throw an error when a parser is not a `function` nor an `object`', () => {
      // Given
      Utils.isObject.mockImplementationOnce(() => true);
      Utils.isObject.mockImplementationOnce(() => false);
      const definition = {
        name: 'name',
        condition: 'condition',
        message: 'message',
        parsers: {
          parser: [],
        },
      };
      // When/Then
      expect(() => new ErrorCase(definition)).toThrow(
        /'\w+' - '\w+': a parser can only be a 'function' or an 'object'/i,
      );
      expect(Utils.isObject).toHaveBeenCalledTimes(2);
      expect(Utils.isObject).toHaveBeenCalledWith(definition.parsers);
      expect(Utils.isObject).toHaveBeenCalledWith(definition.parsers.parser);
    });

    it('should throw an error when `parse` is not an `array` nor an `object`', () => {
      // Given/When/Then
      expect(
        () =>
          new ErrorCase({
            name: 'name',
            condition: 'condition',
            message: 'message',
            parse: 'parse',
          }),
      ).toThrow(/'\w+': 'parse' can only be an 'array' or an 'object'/i);
    });

    it('should throw an error when a `parse` instruction is invalid', () => {
      // Given/When/Then
      expect(
        () =>
          new ErrorCase({
            name: 'name',
            condition: 'condition',
            message: 'message',
            parse: [1],
          }),
      ).toThrow(
        /'\w+': a 'parse' instruction can only be an 'array', a 'function' or a 'string'/i,
      );
    });

    it('should create an instance', () => {
      // Given
      Utils.escapeForRegExp.mockImplementationOnce(() => /condition/);
      const definition = {
        name: 'name',
        condition: 'condition',
        message: 'message',
      };
      let sut = null;
      // When
      sut = new ErrorCase(definition);
      // Then
      expect(sut).toBeInstanceOf(ErrorCase);
      expect(sut.name).toBe(definition.name);
    });
  });

  describe('parse:list', () => {
    it("should ignore an error that doesn't match its condition", () => {
      // Given
      Utils.escapeForRegExp.mockImplementationOnce(() => /condition/);
      const definition = {
        name: 'name',
        condition: 'condition',
        message: 'message',
      };
      const error = 'something weird happened!';
      let sut = null;
      let result = null;
      // When
      sut = new ErrorCase(definition);
      result = sut.parse(error);
      // Then
      expect(result).toBeNull();
      expect(Utils.escapeForRegExp).toHaveBeenCalledTimes(1);
      expect(Utils.escapeForRegExp).toHaveBeenCalledWith(definition.condition);
    });

    it('should parse a message', () => {
      // Given
      Utils.execRegExp.mockImplementationOnce((exp, txt) => exp.exec(txt));
      const definition = {
        name: 'name',
        condition: /weird/,
        message: 'message',
      };
      const error = 'something weird happened!';
      let sut = null;
      let result = null;
      // When
      sut = new ErrorCase(definition);
      result = sut.parse(error);
      // Then
      expect(result).toBeInstanceOf(FormattedError);
      expect(FormattedError).toHaveBeenCalledTimes(1);
      expect(FormattedError).toHaveBeenCalledWith(definition.message, [], null);
      expect(Utils.execRegExp).toHaveBeenCalledTimes(1);
      expect(Utils.execRegExp).toHaveBeenCalledWith(definition.condition, error);
    });

    it('should parse a message with a custom error class', () => {
      // Given
      Utils.execRegExp.mockImplementationOnce((exp, txt) => exp.exec(txt));
      const definition = {
        name: 'name',
        condition: /weird/,
        message: 'message',
      };
      const formattedError = jest.fn();
      class FormattedErrorClass {
        constructor(...args) {
          formattedError(...args);
        }
      }
      const options = {
        FormattedErrorClass,
      };
      const error = 'something weird happened!';
      let sut = null;
      let result = null;
      // When
      sut = new ErrorCase(definition, options);
      result = sut.parse(error);
      // Then
      expect(result).toBeInstanceOf(FormattedErrorClass);
      expect(formattedError).toHaveBeenCalledTimes(1);
      expect(formattedError).toHaveBeenCalledWith(definition.message, [], null);
      expect(Utils.execRegExp).toHaveBeenCalledTimes(1);
      expect(Utils.execRegExp).toHaveBeenCalledWith(definition.condition, error);
    });

    it('should parse a message with optional parameters', () => {
      // Given
      Utils.execRegExp.mockImplementationOnce((exp, txt) => exp.exec(txt));
      const formattedMessage = 'nop';
      const definition = {
        name: 'name',
        condition: /something weird happened( with \w+)?/,
        message: jest.fn(() => formattedMessage),
      };
      const error = 'something weird happened';
      let sut = null;
      let result = null;
      // When
      sut = new ErrorCase(definition);
      result = sut.parse(error);
      // Then
      expect(result).toBeInstanceOf(FormattedError);
      expect(definition.message).toHaveBeenCalledTimes(1);
      expect(definition.message).toHaveBeenCalledWith();
      expect(FormattedError).toHaveBeenCalledTimes(1);
      expect(FormattedError).toHaveBeenCalledWith(formattedMessage, [], null);
      expect(Utils.execRegExp).toHaveBeenCalledTimes(1);
      expect(Utils.execRegExp).toHaveBeenCalledWith(definition.condition, error);
    });

    it('should parse a message with parameters', () => {
      // Given
      Utils.execRegExp.mockImplementationOnce((exp, txt) => exp.exec(txt));
      const parameter = 'Batman';
      const definition = {
        name: 'name',
        condition: /something weird happened with (\w+)/,
        message: jest.fn(() => parameter),
      };
      const error = `something weird happened with ${parameter}!`;
      let sut = null;
      let result = null;
      // When
      sut = new ErrorCase(definition);
      result = sut.parse(error);
      // Then
      expect(result).toBeInstanceOf(FormattedError);
      expect(definition.message).toHaveBeenCalledTimes(1);
      expect(definition.message).toHaveBeenCalledWith(parameter);
      expect(FormattedError).toHaveBeenCalledTimes(1);
      expect(FormattedError).toHaveBeenCalledWith(parameter, [parameter], null);
      expect(Utils.execRegExp).toHaveBeenCalledTimes(1);
      expect(Utils.execRegExp).toHaveBeenCalledWith(definition.condition, error);
    });

    it('should parse a message with parameters and context information', () => {
      // Given
      Utils.execRegExp.mockImplementationOnce((exp, txt) => exp.exec(txt));
      const parameter = 'Batman';
      const definition = {
        name: 'name',
        condition: /something weird happened with (\w+)/,
        message: jest.fn(() => parameter),
      };
      const error = `something weird happened with ${parameter}!`;
      const context = 'some context!';
      let sut = null;
      let result = null;
      // When
      sut = new ErrorCase(definition);
      result = sut.parse(error, [], context);
      // Then
      expect(result).toBeInstanceOf(FormattedError);
      expect(definition.message).toHaveBeenCalledTimes(1);
      expect(definition.message).toHaveBeenCalledWith(parameter);
      expect(FormattedError).toHaveBeenCalledTimes(1);
      expect(FormattedError).toHaveBeenCalledWith(parameter, [parameter], context);
      expect(Utils.execRegExp).toHaveBeenCalledTimes(1);
      expect(Utils.execRegExp).toHaveBeenCalledWith(definition.condition, error);
    });

    it('should parse a message with parameters and an `inline` parser', () => {
      // Given
      const parameter = 'Batman';
      const formattedParameter = 'Bruce Wayne';
      Utils.execRegExp.mockImplementationOnce((exp, txt) => exp.exec(txt));
      Utils.ensureArray.mockImplementationOnce((item) => [item]);
      CaseParser.mockImplementationOnce((parserName, parserFn) => ({
        parse: parserFn,
      }));
      const parser = jest.fn(() => formattedParameter);
      // `jest.fn` doesn't return typeof 'function', but 'object'.
      const wrappedParser = (...args) => parser(...args);
      const definition = {
        name: 'name',
        condition: /something weird happened with (\w+)/,
        message: jest.fn((param) => `hello ${param}`),
        parse: [wrappedParser],
      };
      const error = `something weird happened with ${parameter}!`;
      let sut = null;
      let result = null;
      // When
      sut = new ErrorCase(definition);
      result = sut.parse(error);
      // Then
      expect(result).toBeInstanceOf(FormattedError);
      expect(parser).toHaveBeenCalledTimes(1);
      expect(parser).toHaveBeenCalledWith(parameter);
      expect(definition.message).toHaveBeenCalledTimes(1);
      expect(definition.message).toHaveBeenCalledWith(formattedParameter);
      expect(FormattedError).toHaveBeenCalledTimes(1);
      expect(FormattedError).toHaveBeenCalledWith(
        `hello ${formattedParameter}`,
        [formattedParameter],
        null,
      );
      expect(Utils.ensureArray).toHaveBeenCalledTimes(1);
      expect(Utils.ensureArray).toHaveBeenCalledWith({
        parse: wrappedParser,
      });
      expect(Utils.execRegExp).toHaveBeenCalledTimes(1);
      expect(Utils.execRegExp).toHaveBeenCalledWith(definition.condition, error);
    });

    it('should parse a message with parameters and a parser', () => {
      // Given
      const parameter = 'Batman';
      const formattedParameter = 'Bruce Wayne';
      Utils.execRegExp.mockImplementationOnce((exp, txt) => exp.exec(txt));
      Utils.isObject.mockImplementationOnce(() => true);
      Utils.ensureArray.mockImplementationOnce((item) => [item]);
      CaseParser.mockImplementationOnce((parserName, parserFn) => ({
        parse: parserFn,
      }));
      const parser = jest.fn(() => formattedParameter);
      // `jest.fn` doesn't return typeof 'function', but 'object'.
      const wrappedParser = (...args) => parser(...args);
      const definition = {
        name: 'name',
        condition: /something weird happened with (\w+)/,
        message: jest.fn((param) => `hello ${param}`),
        parse: ['myParser'],
        parsers: {
          myParser: wrappedParser,
        },
      };
      const error = `something weird happened with ${parameter}!`;
      let sut = null;
      let result = null;
      // When
      sut = new ErrorCase(definition);
      result = sut.parse(error);
      // Then
      expect(result).toBeInstanceOf(FormattedError);
      expect(parser).toHaveBeenCalledTimes(1);
      expect(parser).toHaveBeenCalledWith(parameter);
      expect(definition.message).toHaveBeenCalledTimes(1);
      expect(definition.message).toHaveBeenCalledWith(formattedParameter);
      expect(FormattedError).toHaveBeenCalledTimes(1);
      expect(FormattedError).toHaveBeenCalledWith(
        `hello ${formattedParameter}`,
        [formattedParameter],
        null,
      );
      expect(Utils.ensureArray).toHaveBeenCalledTimes(1);
      expect(Utils.ensureArray).toHaveBeenCalledWith({
        parse: wrappedParser,
      });
      expect(Utils.execRegExp).toHaveBeenCalledTimes(1);
      expect(Utils.execRegExp).toHaveBeenCalledWith(definition.condition, error);
    });

    it('should parse a message with multiple parameters and parsers', () => {
      // Given
      const parameterOne = 'Batman';
      const formattedParameterOne = 'The dark knight';
      Utils.execRegExp.mockImplementationOnce((exp, txt) => exp.exec(txt));
      Utils.isObject.mockImplementationOnce(() => true);
      Utils.ensureArray.mockImplementationOnce((item) => [item]);
      Utils.ensureArray.mockImplementationOnce((item) => item);
      CaseParser.mockImplementationOnce((parserName, parserFn) => ({
        parse: parserFn,
      }));
      CaseParser.mockImplementationOnce((parserName, parserFn) => ({
        parse: parserFn,
      }));
      CaseParser.mockImplementationOnce((parserName, parserFn) => ({
        parse: parserFn,
      }));
      CaseParser.mockImplementationOnce((parserName, parserFn) => ({
        parse: parserFn,
      }));
      CaseParser.mockImplementationOnce((parserName, parserFn) => ({
        parse: parserFn,
      }));
      const renameParser = jest.fn(() => formattedParameterOne);
      const wrappedRenameParser = (...args) => renameParser(...args);
      const makeNumberParser = jest.fn((n) => Number(n));
      const wrappedMakeNumberParser = (...args) => makeNumberParser(...args);
      const addJasonToddParser = jest.fn((param) => param + 1);
      const wrappedJasonToddParser = (...args) => addJasonToddParser(...args);
      const addTimDrakeParser = jest.fn((param) => param + 1);
      const wrappedTimDrakeParser = (...args) => addTimDrakeParser(...args);
      const addDamianParser = jest.fn((param) => param + 1);
      const wrappedDamianParser = (...args) => addDamianParser(...args);
      // `jest.fn` doesn't return typeof 'function', but 'object'.
      const definition = {
        name: 'name',
        condition: /(\w+) had (\d+) robin/,
        message: jest.fn(
          (name, count) => `Did you know that ${name} actually had ${count} robins?`,
        ),
        parse: [
          'renameParser',
          [
            'makeNumberParser',
            'addJasonToddParser',
            'addTimDrakeParser',
            'addDamianParser',
          ],
        ],
        parsers: {
          renameParser: wrappedRenameParser,
          makeNumberParser: wrappedMakeNumberParser,
          addJasonToddParser: wrappedJasonToddParser,
          addTimDrakeParser: wrappedTimDrakeParser,
          addDamianParser: wrappedDamianParser,
        },
      };
      const error = `WTF? ${parameterOne} had 1 robin!`;
      let sut = null;
      let result = null;
      const expectedParameterTwo = 4; // Grayson, Drake, Todd and Wayne.
      // When
      sut = new ErrorCase(definition);
      result = sut.parse(error);
      // Then
      expect(result).toBeInstanceOf(FormattedError);
      expect(renameParser).toHaveBeenCalledTimes(1);
      expect(renameParser).toHaveBeenCalledWith(parameterOne);
      expect(makeNumberParser).toHaveBeenCalledTimes(1);
      expect(makeNumberParser).toHaveBeenCalledWith('1');
      expect(addJasonToddParser).toHaveBeenCalledTimes(1);
      expect(addJasonToddParser).toHaveBeenCalledWith(1);
      expect(addTimDrakeParser).toHaveBeenCalledTimes(1);
      expect(addTimDrakeParser).toHaveBeenCalledWith(2);
      expect(addDamianParser).toHaveBeenCalledTimes(1);
      expect(addDamianParser).toHaveBeenCalledWith(3);
      expect(definition.message).toHaveBeenCalledTimes(1);
      expect(definition.message).toHaveBeenCalledWith(
        formattedParameterOne,
        expectedParameterTwo,
      );
      expect(FormattedError).toHaveBeenCalledTimes(1);
      expect(FormattedError).toHaveBeenCalledWith(
        `Did you know that ${formattedParameterOne} actually had ${expectedParameterTwo} robins?`,
        [formattedParameterOne, expectedParameterTwo],
        null,
      );
      expect(Utils.ensureArray).toHaveBeenCalledTimes(2);
      expect(Utils.ensureArray).toHaveBeenCalledWith({
        parse: wrappedRenameParser,
      });
      expect(Utils.ensureArray).toHaveBeenCalledWith([
        {
          parse: wrappedMakeNumberParser,
        },
        {
          parse: wrappedJasonToddParser,
        },
        {
          parse: wrappedTimDrakeParser,
        },
        {
          parse: wrappedDamianParser,
        },
      ]);
      expect(Utils.execRegExp).toHaveBeenCalledTimes(1);
      expect(Utils.execRegExp).toHaveBeenCalledWith(definition.condition, error);
    });

    it('should parse a message with parameters and a parser from the scope', () => {
      // Given
      const parameter = 'Batman';
      const formattedParameter = 'Bruce Wayne';
      Utils.execRegExp.mockImplementationOnce((exp, txt) => exp.exec(txt));
      Utils.ensureArray.mockImplementationOnce((item) => [item]);
      CaseParser.mockImplementationOnce((parserName, parserFn) => ({
        parse: parserFn,
      }));
      const parser = jest.fn(() => formattedParameter);
      const parserName = 'myParser';
      const definition = {
        name: 'name',
        condition: /something weird happened with (\w+)/,
        message: jest.fn((param) => `hello ${param}`),
        parse: [parserName],
      };
      const scope = {
        getParser: jest.fn(() => ({
          parse: parser,
        })),
      };
      const scopes = [scope];
      const error = `something weird happened with ${parameter}!`;
      let sut = null;
      let result = null;
      // When
      sut = new ErrorCase(definition);
      result = sut.parse(error, scopes);
      // Then
      expect(result).toBeInstanceOf(FormattedError);
      expect(parser).toHaveBeenCalledTimes(1);
      expect(parser).toHaveBeenCalledWith(parameter);
      expect(definition.message).toHaveBeenCalledTimes(1);
      expect(definition.message).toHaveBeenCalledWith(formattedParameter);
      expect(FormattedError).toHaveBeenCalledTimes(1);
      expect(FormattedError).toHaveBeenCalledWith(
        `hello ${formattedParameter}`,
        [formattedParameter],
        null,
      );
      expect(Utils.ensureArray).toHaveBeenCalledTimes(1);
      expect(Utils.ensureArray).toHaveBeenCalledWith(parserName);
      expect(Utils.execRegExp).toHaveBeenCalledTimes(1);
      expect(Utils.execRegExp).toHaveBeenCalledWith(definition.condition, error);
      expect(scope.getParser).toHaveBeenCalledTimes(1);
      expect(scope.getParser).toHaveBeenCalledWith(parserName, false);
    });

    it('should parse a message with parameters and a parser class', () => {
      // Given
      const parameter = 'Batman';
      const formattedParameter = 'Bruce Wayne';
      Utils.execRegExp.mockImplementationOnce((exp, txt) => exp.exec(txt));
      Utils.isObject.mockImplementationOnce(() => true);
      Utils.ensureArray.mockImplementationOnce((item) => [item]);
      class CaseParserClass {
        constructor(name, parserFn) {
          this.parse = parserFn;
        }
      }
      const parserFn = jest.fn(() => formattedParameter);
      const parserName = 'myParser';
      const parser = new CaseParserClass(parserName, parserFn);
      const definition = {
        name: 'name',
        condition: /something weird happened with (\w+)/,
        message: jest.fn((param) => `hello ${param}`),
        parse: [parserName],
        parsers: {
          [parserName]: parser,
        },
      };
      const options = {
        CaseParserClass,
      };
      const error = `something weird happened with ${parameter}!`;
      let sut = null;
      let result = null;
      // When
      sut = new ErrorCase(definition, options);
      result = sut.parse(error);
      // Then
      expect(result).toBeInstanceOf(FormattedError);
      expect(parserFn).toHaveBeenCalledTimes(1);
      expect(parserFn).toHaveBeenCalledWith(parameter);
      expect(definition.message).toHaveBeenCalledTimes(1);
      expect(definition.message).toHaveBeenCalledWith(formattedParameter);
      expect(FormattedError).toHaveBeenCalledTimes(1);
      expect(FormattedError).toHaveBeenCalledWith(
        `hello ${formattedParameter}`,
        [formattedParameter],
        null,
      );
      expect(Utils.ensureArray).toHaveBeenCalledTimes(1);
      expect(Utils.ensureArray).toHaveBeenCalledWith(parser);
      expect(Utils.execRegExp).toHaveBeenCalledTimes(1);
      expect(Utils.execRegExp).toHaveBeenCalledWith(definition.condition, error);
    });

    it('should throw an error when the parsers are an object', () => {
      // Given
      const parameter = 'Batman';
      const formattedParameter = 'Bruce Wayne';
      Utils.execRegExp.mockImplementationOnce((exp, txt) => exp.exec(txt));
      Utils.isObject.mockImplementationOnce(() => true);
      Utils.isObject.mockImplementationOnce(() => true);
      Utils.isObject.mockImplementationOnce(() => true);
      Utils.isObject.mockImplementationOnce(() => true);
      Utils.ensureArray.mockImplementationOnce((item) => [item]);
      CaseParser.mockImplementationOnce((parserName, parserFn) => ({
        parse: parserFn,
      }));
      const parser = jest.fn(() => formattedParameter);
      // `jest.fn` doesn't return typeof 'function', but 'object'.
      const wrappedParser = (...args) => parser(...args);
      const definition = {
        name: 'name',
        condition: /something weird happened with (\w+)/,
        message: jest.fn((param) => `hello ${param}`),
        parse: {
          myParameter: 'myParser',
        },
        parsers: {
          myParser: wrappedParser,
        },
      };
      const error = `something weird happened with ${parameter}!`;
      let sut = null;
      // When/Then
      sut = new ErrorCase(definition);
      expect(() => sut.parse(error)).toThrow(
        /The condition for the case '\w+' didn't return groups, but the 'parse' instructions were set on an 'object' format/i,
      );
      // Then
      expect(parser).toHaveBeenCalledTimes(0);
      expect(definition.message).toHaveBeenCalledTimes(0);
      expect(FormattedError).toHaveBeenCalledTimes(0);
      expect(Utils.ensureArray).toHaveBeenCalledTimes(1);
      expect(Utils.ensureArray).toHaveBeenCalledWith({
        parse: wrappedParser,
      });
      expect(Utils.execRegExp).toHaveBeenCalledTimes(1);
      expect(Utils.execRegExp).toHaveBeenCalledWith(definition.condition, error);
    });

    it("should throw an error when it can't find a parser on the scope", () => {
      // Given
      const parameter = 'Batman';
      Utils.execRegExp.mockImplementationOnce((exp, txt) => exp.exec(txt));
      Utils.ensureArray.mockImplementationOnce((item) => [item]);
      const parserName = 'myParser';
      const definition = {
        name: 'name',
        condition: /something weird happened with (\w+)/,
        message: jest.fn((param) => `hello ${param}`),
        parse: [parserName],
      };
      const scope = {
        getParser: jest.fn(() => null),
      };
      const scopes = [scope];
      const error = `something weird happened with ${parameter}!`;
      let sut = null;
      // When/Then
      sut = new ErrorCase(definition);
      expect(() => sut.parse(error, scopes)).toThrow(
        /No parser with the name of '\w+' could be found for the case '\w+'/i,
      );
      // Then
      expect(Utils.ensureArray).toHaveBeenCalledTimes(1);
      expect(Utils.ensureArray).toHaveBeenCalledWith(parserName);
      expect(scope.getParser).toHaveBeenCalledTimes(1);
      expect(scope.getParser).toHaveBeenCalledWith(parserName, false);
    });
  });

  describe('parse:groups', () => {
    it('should parse a message with optional groups', () => {
      // Given
      const groups = {};
      const matches = [];
      const matchFilter = jest.fn(() => matches);
      const match = {
        slice: jest.fn(() => ({ filter: matchFilter })),
        groups,
      };
      Utils.execRegExp.mockImplementationOnce(() => match);
      const parameter = 'Batman';
      const formattedMessage = 'nop';
      const definition = {
        name: 'name',
        condition: /something weird happened with (\w+)/,
        message: jest.fn(() => formattedMessage),
      };
      const error = `something weird happened with ${parameter}!`;
      let sut = null;
      let result = null;
      // When
      sut = new ErrorCase(definition);
      result = sut.parse(error);
      // Then
      expect(result).toBeInstanceOf(FormattedError);
      expect(definition.message).toHaveBeenCalledTimes(1);
      expect(definition.message).toHaveBeenCalledWith();
      expect(FormattedError).toHaveBeenCalledTimes(1);
      expect(FormattedError).toHaveBeenCalledWith(formattedMessage, [], null);
      expect(Utils.execRegExp).toHaveBeenCalledTimes(1);
      expect(Utils.execRegExp).toHaveBeenCalledWith(definition.condition, error);
    });

    it('should throw an error when the condition mixes named and unnamed groups', () => {
      // Given
      const groups = {
        one: 'one group is enough to missmatch the length of matches and groups',
      };
      const matches = ['full-match', 'one', 'two'];
      const matchFilter = jest.fn(() => matches);
      const match = {
        slice: jest.fn(() => ({ filter: matchFilter })),
        groups,
      };
      Utils.execRegExp.mockImplementationOnce(() => match);
      const parameter = 'Batman';
      const formattedMessage = 'nop';
      const definition = {
        name: 'name',
        condition: /something weird happened with (\w+)/,
        message: jest.fn(() => formattedMessage),
      };
      const error = `something weird happened with ${parameter}!`;
      let sut = null;
      // When/Then
      sut = new ErrorCase(definition);
      expect(() => sut.parse(error)).toThrow(
        /The condition for the case '\w+' is trying to extract parameters as named and unnamed groups, only one method is allowed/i,
      );
      // Then
      expect(definition.message).toHaveBeenCalledTimes(0);
      expect(FormattedError).toHaveBeenCalledTimes(0);
      expect(Utils.execRegExp).toHaveBeenCalledTimes(1);
      expect(Utils.execRegExp).toHaveBeenCalledWith(definition.condition, error);
    });

    it('should throw an error when the parsers are an array', () => {
      // Given
      const groups = {
        one: 'one',
      };
      const matches = ['full-match', 'one'];
      const matchFilter = jest.fn(() => matches);
      const match = {
        slice: jest.fn(() => ({ filter: matchFilter })),
        groups,
      };
      Utils.execRegExp.mockImplementationOnce(() => match);
      const parameter = 'Batman';
      const formattedMessage = 'nop';
      const definition = {
        name: 'name',
        condition: /something weird happened with (\w+)/,
        message: jest.fn(() => formattedMessage),
      };
      const error = `something weird happened with ${parameter}!`;
      let sut = null;
      // When/Then
      sut = new ErrorCase(definition);
      expect(() => sut.parse(error)).toThrow(
        /The condition for the case '\w+' returned groups, but the 'parse' instructions were set on an 'array' format/i,
      );
      // Then
      expect(definition.message).toHaveBeenCalledTimes(0);
      expect(FormattedError).toHaveBeenCalledTimes(0);
      expect(Utils.execRegExp).toHaveBeenCalledTimes(1);
      expect(Utils.execRegExp).toHaveBeenCalledWith(definition.condition, error);
    });

    it('should parse a message with parameters', () => {
      // Given
      const parameterName = 'name';
      const parameter = 'Batman';
      const groups = {
        [parameterName]: parameter,
      };
      const matches = ['full-match', parameter];
      const matchFilter = jest.fn(() => matches);
      const match = {
        slice: jest.fn(() => ({ filter: matchFilter })),
        groups,
      };
      Utils.execRegExp.mockImplementationOnce(() => match);
      Utils.isObject.mockImplementationOnce(() => true);
      const definition = {
        name: 'name',
        condition: /something weird happened with (\w+)/,
        message: jest.fn((parameters) => parameters[parameterName]),
      };
      const error = `something weird happened with ${parameter}!`;
      let sut = null;
      let result = null;
      // When
      sut = new ErrorCase(definition);
      result = sut.parse(error);
      // Then
      expect(result).toBeInstanceOf(FormattedError);
      expect(definition.message).toHaveBeenCalledTimes(1);
      expect(definition.message).toHaveBeenCalledWith({
        [parameterName]: parameter,
      });
      expect(FormattedError).toHaveBeenCalledTimes(1);
      expect(FormattedError).toHaveBeenCalledWith(
        parameter,
        {
          [parameterName]: parameter,
        },
        null,
      );
      expect(Utils.execRegExp).toHaveBeenCalledTimes(1);
      expect(Utils.execRegExp).toHaveBeenCalledWith(definition.condition, error);
    });

    it('should parse a message with parameters and an `inline` parser', () => {
      // Given
      const parameterName = 'name';
      const parameter = 'Batman';
      const formattedParameter = 'Bruce Wayne';
      const groups = {
        [parameterName]: parameter,
      };
      const matches = ['full-match', parameter];
      const matchFilter = jest.fn(() => matches);
      const match = {
        slice: jest.fn(() => ({ filter: matchFilter })),
        groups,
      };
      Utils.execRegExp.mockImplementationOnce(() => match);
      Utils.isObject.mockImplementationOnce(() => true);
      Utils.isObject.mockImplementationOnce(() => true);
      Utils.ensureArray.mockImplementationOnce((item) => [item]);
      CaseParser.mockImplementationOnce((parserName, parserFn) => ({
        parse: parserFn,
      }));
      const parser = jest.fn(() => formattedParameter);
      // `jest.fn` doesn't return typeof 'function', but 'object'.
      const wrappedParser = (...args) => parser(...args);
      const definition = {
        name: 'name',
        condition: /something weird happened with (\w+)/,
        message: jest.fn((param) => `hello ${param[parameterName]}`),
        parse: {
          [parameterName]: wrappedParser,
        },
      };
      const error = `something weird happened with ${parameter}!`;
      let sut = null;
      let result = null;
      // When
      sut = new ErrorCase(definition);
      result = sut.parse(error);
      // Then
      expect(result).toBeInstanceOf(FormattedError);
      expect(parser).toHaveBeenCalledTimes(1);
      expect(parser).toHaveBeenCalledWith(parameter);
      expect(definition.message).toHaveBeenCalledTimes(1);
      expect(definition.message).toHaveBeenCalledWith({
        [parameterName]: formattedParameter,
      });
      expect(FormattedError).toHaveBeenCalledTimes(1);
      expect(FormattedError).toHaveBeenCalledWith(
        `hello ${formattedParameter}`,
        {
          [parameterName]: formattedParameter,
        },
        null,
      );
      expect(Utils.ensureArray).toHaveBeenCalledTimes(1);
      expect(Utils.ensureArray).toHaveBeenCalledWith({
        parse: wrappedParser,
      });
      expect(Utils.execRegExp).toHaveBeenCalledTimes(1);
      expect(Utils.execRegExp).toHaveBeenCalledWith(definition.condition, error);
    });
  });

  describe('original', () => {
    it('should keep an error original message', () => {
      // Given
      Utils.execRegExp.mockImplementationOnce((exp, txt) => exp.exec(txt));
      const definition = {
        name: 'name',
        condition: /weird/,
        useOriginal: true,
      };
      const error = 'something weird happened!';
      let sut = null;
      let result = null;
      // When
      sut = new ErrorCase(definition);
      result = sut.parse(error);
      // Then
      expect(result).toBeInstanceOf(FormattedError);
      expect(FormattedError).toHaveBeenCalledTimes(1);
      expect(FormattedError).toHaveBeenCalledWith(error, [], {
        original: true,
      });
      expect(Utils.execRegExp).toHaveBeenCalledTimes(0);
    });
  });
});
