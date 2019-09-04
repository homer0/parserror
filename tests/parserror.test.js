jest.unmock('/src/parserror');

require('jasmine-expect');
const CaseParser = require('/src/caseParser');
const ErrorCase = require('/src/errorCase');
const Parserror = require('/src/parserror');
const FormattedError = require('/src/formattedError');
const Scope = require('/src/scope');
const Utils = require('/src/utils');

describe('Parserror', () => {
  beforeEach(() => {
    CaseParser.mockReset();
    ErrorCase.mockReset();
    Scope.mockReset();
    Utils.ensureArray.mockReset();
    Utils.isObject.mockReset();
  });

  describe('constructor', () => {
    it('should be instantiated and create the global scope', () => {
      // Given
      let sut = null;
      let result = null;
      // When
      sut = new Parserror();
      result = sut.getScope(sut.globalScopeName);
      // Then
      expect(sut).toBeInstanceOf(Parserror);
      expect(sut.globalScopeName).toBe('global');
      expect(result).toBeInstanceOf(Scope);
      expect(Scope).toHaveBeenCalledTimes(1);
      expect(Scope).toHaveBeenCalledWith(sut.globalScopeName);
    });

    it('should create a instance using the static method `new`', () => {
      // Given
      let sut = null;
      let result = null;
      // When
      sut = Parserror.new();
      result = sut.getScope(sut.globalScopeName);
      // Then
      expect(sut).toBeInstanceOf(Parserror);
      expect(sut.globalScopeName).toBe('global');
      expect(result).toBeInstanceOf(Scope);
      expect(Scope).toHaveBeenCalledTimes(1);
      expect(Scope).toHaveBeenCalledWith(sut.globalScopeName);
    });
  });

  describe('addCase', () => {
    it('should add a new case', () => {
      // Given
      const caseDefinition = {
        name: 'Rosario',
      };
      const caseInstance = {
        name: 'Pilar',
      };
      ErrorCase.mockImplementationOnce(() => caseInstance);
      let sut = null;
      let globalScope = null;
      let result = null;
      // When
      sut = new Parserror({
        ErrorCaseClass: ErrorCase,
      });
      globalScope = sut.getScope(sut.globalScopeName);
      result = sut.addCase(caseDefinition);
      // Then
      expect(result).toBe(sut);
      expect(ErrorCase).toHaveBeenCalledTimes(1);
      expect(ErrorCase).toHaveBeenCalledWith(caseDefinition, {
        CaseParserClass: CaseParser,
        FormattedErrorClass: FormattedError,
      });
      expect(globalScope.addCase).toHaveBeenCalledTimes(1);
      expect(globalScope.addCase).toHaveBeenCalledWith(caseInstance);
    });

    it('should add a new case to a custom scope', () => {
      // Given
      const scopeName = 'myScope';
      const caseDefinition = {
        name: 'Rosario',
      };
      const caseInstance = {
        name: 'Pilar',
      };
      ErrorCase.mockImplementationOnce(() => caseInstance);
      let sut = null;
      let customScope = null;
      let result = null;
      // When
      sut = new Parserror({
        ErrorCaseClass: ErrorCase,
      });
      customScope = sut.getScope(scopeName);
      result = sut.addCase(caseDefinition, scopeName);
      // Then
      expect(result).toBe(sut);
      expect(ErrorCase).toHaveBeenCalledTimes(1);
      expect(ErrorCase).toHaveBeenCalledWith(caseDefinition, {
        CaseParserClass: CaseParser,
        FormattedErrorClass: FormattedError,
      });
      expect(customScope.addCase).toHaveBeenCalledTimes(1);
      expect(customScope.addCase).toHaveBeenCalledWith(caseInstance);
    });

    it('should add a new case to a custom scope (using the definition)', () => {
      // Given
      const scopeName = 'myScope';
      const caseDefinition = {
        name: 'Rosario',
        scope: scopeName,
      };
      const caseInstance = {
        name: 'Pilar',
      };
      ErrorCase.mockImplementationOnce(() => caseInstance);
      let sut = null;
      let customScope = null;
      let result = null;
      // When
      sut = new Parserror({
        ErrorCaseClass: ErrorCase,
      });
      customScope = sut.getScope(scopeName);
      result = sut.addCase(caseDefinition);
      // Then
      expect(result).toBe(sut);
      expect(ErrorCase).toHaveBeenCalledTimes(1);
      expect(ErrorCase).toHaveBeenCalledWith(caseDefinition, {
        CaseParserClass: CaseParser,
        FormattedErrorClass: FormattedError,
      });
      expect(customScope.addCase).toHaveBeenCalledTimes(1);
      expect(customScope.addCase).toHaveBeenCalledWith(caseInstance);
    });
  });

  describe('addCases', () => {
    it('should add multiple cases at once', () => {
      // Given
      const caseOneDefinition = {
        name: 'Rosario',
      };
      const caseOneInstance = {
        name: 'Charo',
      };
      const caseTwoDefinition = {
        name: 'Pilar',
      };
      const caseTwoInstance = {
        name: 'Pili',
      };
      ErrorCase.mockImplementationOnce(() => caseOneInstance);
      ErrorCase.mockImplementationOnce(() => caseTwoInstance);
      Utils.ensureArray.mockImplementationOnce((list) => list);
      let sut = null;
      let globalScope = null;
      let result = null;
      // When
      sut = new Parserror({
        ErrorCaseClass: ErrorCase,
      });
      globalScope = sut.getScope(sut.globalScopeName);
      result = sut.addCases([
        caseOneDefinition,
        caseTwoDefinition,
      ]);
      // Then
      expect(result).toBe(sut);
      expect(ErrorCase).toHaveBeenCalledTimes(2);
      expect(ErrorCase).toHaveBeenCalledWith(caseOneDefinition, {
        CaseParserClass: CaseParser,
        FormattedErrorClass: FormattedError,
      });
      expect(ErrorCase).toHaveBeenCalledWith(caseTwoDefinition, {
        CaseParserClass: CaseParser,
        FormattedErrorClass: FormattedError,
      });
      expect(globalScope.addCase).toHaveBeenCalledTimes(2);
      expect(globalScope.addCase).toHaveBeenCalledWith(caseOneInstance);
      expect(globalScope.addCase).toHaveBeenCalledWith(caseTwoInstance);
    });

    it('should add a new case to a custom scope', () => {
      // Given
      const scopeName = 'myScope';
      const caseOneDefinition = {
        name: 'Rosario',
      };
      const caseOneInstance = {
        name: 'Charo',
      };
      const caseTwoDefinition = {
        name: 'Pilar',
      };
      const caseTwoInstance = {
        name: 'Pili',
      };
      ErrorCase.mockImplementationOnce(() => caseOneInstance);
      ErrorCase.mockImplementationOnce(() => caseTwoInstance);
      Utils.ensureArray.mockImplementationOnce((list) => list);
      let sut = null;
      let customScope = null;
      let result = null;
      // When
      sut = new Parserror({
        ErrorCaseClass: ErrorCase,
      });
      customScope = sut.getScope(scopeName);
      result = sut.addCases(
        [
          caseOneDefinition,
          caseTwoDefinition,
        ],
        scopeName
      );
      // Then
      expect(result).toBe(sut);
      expect(ErrorCase).toHaveBeenCalledTimes(2);
      expect(ErrorCase).toHaveBeenCalledWith(caseOneDefinition, {
        CaseParserClass: CaseParser,
        FormattedErrorClass: FormattedError,
      });
      expect(ErrorCase).toHaveBeenCalledWith(caseTwoDefinition, {
        CaseParserClass: CaseParser,
        FormattedErrorClass: FormattedError,
      });
      expect(customScope.addCase).toHaveBeenCalledTimes(2);
      expect(customScope.addCase).toHaveBeenCalledWith(caseOneInstance);
      expect(customScope.addCase).toHaveBeenCalledWith(caseTwoInstance);
    });
  });

  describe('addParser', () => {
    it('should add a parser to the global scope', () => {
      // Given
      const name = 'Rosario';
      const parser = 'parserFnOrMap';
      const parserInstance = {
        name: 'Pilar',
      };
      CaseParser.mockImplementationOnce(() => parserInstance);
      let sut = null;
      let globalScope = null;
      let result = null;
      // When
      sut = new Parserror({
        CaseParserClass: CaseParser,
      });
      globalScope = sut.getScope(sut.globalScopeName);
      result = sut.addParser(name, parser);
      // Then
      expect(result).toBe(sut);
      expect(CaseParser).toHaveBeenCalledTimes(1);
      expect(CaseParser).toHaveBeenCalledWith(name, parser);
      expect(globalScope.addParser).toHaveBeenCalledTimes(1);
      expect(globalScope.addParser).toHaveBeenCalledWith(parserInstance);
    });

    it('should add a parser to a custom scope', () => {
      // Given
      const scopeName = 'myScope';
      const name = 'Rosario';
      const parser = 'parserFnOrMap';
      const parserInstance = {
        name: 'Pilar',
      };
      CaseParser.mockImplementationOnce(() => parserInstance);
      let sut = null;
      let customScope = null;
      let result = null;
      // When
      sut = new Parserror({
        CaseParserClass: CaseParser,
      });
      customScope = sut.getScope(scopeName);
      result = sut.addParser(name, parser, scopeName);
      // Then
      expect(result).toBe(sut);
      expect(CaseParser).toHaveBeenCalledTimes(1);
      expect(CaseParser).toHaveBeenCalledWith(name, parser);
      expect(customScope.addParser).toHaveBeenCalledTimes(1);
      expect(customScope.addParser).toHaveBeenCalledWith(parserInstance);
    });
  });

  describe('scopes', () => {
    it('should throw an error when trying to access a scope that doesn\'t exist', () => {
      // Given/When/Then
      expect(() => (new Parserror()).getScope('something', false))
      .toThrow(/The scope '\w+' doesn't exist/i);
    });

    it('should throw an error when trying to add a scope that already exists', () => {
      // Given
      let sut = null;
      // When/Then
      sut = new Parserror();
      expect(() => sut.addScope(sut.globalScopeName))
      .toThrow(
        /The scope '\w+' already exists\. You can use 'removeScope' to remove it first, or set the 'overwrite' parameter to 'true'/i
      );
    });

    it('should throw an error when trying to remove the global scope', () => {
      // Given
      let sut = null;
      // When/Then
      sut = new Parserror();
      expect(() => sut.removeScope(sut.globalScopeName))
      .toThrow(/You can't delete the global scope/i);
    });

    it('should create a scope if it doesn\'t exist when trying to access it', () => {
      // Given
      const scopeName = 'myScope';
      Scope.mockImplementationOnce((name) => ({ name }));
      Scope.mockImplementationOnce((name) => ({ name }));
      let sut = null;
      let result = null;
      // When
      sut = new Parserror();
      result = sut.getScope(scopeName);
      // Then
      expect(result).toEqual(({
        name: scopeName,
      }));
      expect(Scope).toHaveBeenCalledTimes(2);
      expect(Scope).toHaveBeenCalledWith(sut.globalScopeName);
      expect(Scope).toHaveBeenCalledWith(scopeName);
    });

    it('shouldn\'t create the same scope twice when trying to access it', () => {
      // Given
      const scopeName = 'myScope';
      Scope.mockImplementationOnce((name) => ({ name }));
      Scope.mockImplementationOnce((name) => ({ name }));
      let sut = null;
      let result = null;
      // When
      sut = new Parserror();
      sut.getScope(scopeName);
      result = sut.getScope(scopeName);
      // Then
      expect(result).toEqual(({
        name: scopeName,
      }));
      expect(Scope).toHaveBeenCalledTimes(2);
      expect(Scope).toHaveBeenCalledWith(sut.globalScopeName);
      expect(Scope).toHaveBeenCalledWith(scopeName);
    });

    it('should create a scope', () => {
      // Given
      const scopeName = 'myScope';
      let sut = null;
      let result = null;
      // When
      sut = new Parserror();
      result = sut.addScope(scopeName);
      // Then
      expect(result).toBe(sut);
      expect(Scope).toHaveBeenCalledTimes(2);
      expect(Scope).toHaveBeenCalledWith(sut.globalScopeName);
      expect(Scope).toHaveBeenCalledWith(scopeName);
    });

    it('should create a scope with cases', () => {
      // Given
      Utils.ensureArray.mockImplementationOnce((list) => list);
      const scopeName = 'myScope';
      const caseDefinition = {
        name: 'Rosario',
        scope: scopeName,
      };
      const caseInstance = {
        name: 'Pilar',
      };
      ErrorCase.mockImplementationOnce(() => caseInstance);
      let sut = null;
      let result = null;
      let savedScope = null;
      // When
      sut = new Parserror({
        ErrorCaseClass: ErrorCase,
      });
      result = sut.addScope(scopeName, [caseDefinition]);
      savedScope = sut.getScope(scopeName);
      // Then
      expect(result).toBe(sut);
      expect(Scope).toHaveBeenCalledTimes(2);
      expect(Scope).toHaveBeenCalledWith(sut.globalScopeName);
      expect(Scope).toHaveBeenCalledWith(scopeName);
      expect(ErrorCase).toHaveBeenCalledTimes(1);
      expect(ErrorCase).toHaveBeenCalledWith(caseDefinition, {
        CaseParserClass: CaseParser,
        FormattedErrorClass: FormattedError,
      });
      expect(savedScope.addCase).toHaveBeenCalledTimes(1);
      expect(savedScope.addCase).toHaveBeenCalledWith(caseInstance);
    });

    it('should create a scope by overwriting an existing one', () => {
      // Given
      const scopeName = 'myScope';
      let sut = null;
      let result = null;
      // When
      sut = new Parserror();
      sut.addScope(scopeName);
      result = sut.addScope(scopeName, [], true);
      // Then
      expect(result).toBe(sut);
      expect(Scope).toHaveBeenCalledTimes(3);
      expect(Scope).toHaveBeenCalledWith(sut.globalScopeName);
      expect(Scope).toHaveBeenCalledWith(scopeName);
      expect(Scope).toHaveBeenCalledWith(scopeName);
    });
  });

  describe('parse', () => {
    it('should throw an error if the received error is not a string or an object', () => {
      // Given/When/Then
      expect(() => (new Parserror()).parse([]))
      .toThrow(
        /'parse' can only handle error messages \('string'\), native errors \('Error'\) or literal objects \('object'\) with a 'message' property/i
      );
    });

    it('should throw an error if the `cases` option is not an array', () => {
      // Given/When/Then
      expect(() => (new Parserror()).parse('something', { cases: 'nop' }))
      .toThrow(/The 'cases' option can only be an 'array'/i);
    });

    it('should throw an error if the `scopes` option is not an array', () => {
      // Given/When/Then
      expect(() => (new Parserror()).parse('something', { scopes: 'nop' }))
      .toThrow(/The 'scopes' option can only be an 'array'/i);
    });

    it('should parse an error (string)', () => {
      // Given
      const formatted = 'new error';
      const theCase = {
        parse: jest.fn(() => formatted),
      };
      const scopeInstance = {
        getCases: jest.fn(() => [theCase]),
      };
      Scope.mockImplementationOnce(() => scopeInstance);
      const error = 'original error';
      let sut = null;
      let result = null;
      // When
      sut = new Parserror();
      result = sut.parse(error);
      // Then
      expect(result).toBe(formatted);
      expect(scopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(theCase.parse).toHaveBeenCalledTimes(1);
      expect(theCase.parse).toHaveBeenCalledWith(
        error,
        [scopeInstance],
        null
      );
    });

    it('should parse an error (Error)', () => {
      // Given
      const formatted = 'new error';
      const theCase = {
        parse: jest.fn(() => formatted),
      };
      const scopeInstance = {
        getCases: jest.fn(() => [theCase]),
      };
      Scope.mockImplementationOnce(() => scopeInstance);
      const errorMessage = 'original error';
      const error = new Error(errorMessage);
      let sut = null;
      let result = null;
      // When
      sut = new Parserror();
      result = sut.parse(error);
      // Then
      expect(result).toBe(formatted);
      expect(scopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(theCase.parse).toHaveBeenCalledTimes(1);
      expect(theCase.parse).toHaveBeenCalledWith(
        errorMessage,
        [scopeInstance],
        null
      );
    });

    it('should parse an error (Object)', () => {
      // Given
      Utils.isObject.mockImplementationOnce(() => true);
      const formatted = 'new error';
      const theCase = {
        parse: jest.fn(() => formatted),
      };
      const scopeInstance = {
        getCases: jest.fn(() => [theCase]),
      };
      Scope.mockImplementationOnce(() => scopeInstance);
      const errorMessage = 'original error';
      const error = {
        message: errorMessage,
      };
      let sut = null;
      let result = null;
      // When
      sut = new Parserror();
      result = sut.parse(error);
      // Then
      expect(result).toBe(formatted);
      expect(scopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(theCase.parse).toHaveBeenCalledTimes(1);
      expect(theCase.parse).toHaveBeenCalledWith(
        errorMessage,
        [scopeInstance],
        null
      );
    });

    it('should parse an error with custom scopes', () => {
      // Given
      const globalScopeCase = {
        parse: jest.fn(),
      };
      const globalScopeInstance = {
        getCases: jest.fn(() => [globalScopeCase]),
      };
      const customScopeName = 'customScope';
      const formatted = 'new error';
      const customScopeCase = {
        parse: jest.fn(() => formatted),
      };
      const customScopeInstance = {
        getCases: jest.fn(() => [customScopeCase]),
      };
      Scope.mockImplementationOnce(() => globalScopeInstance);
      Scope.mockImplementationOnce(() => customScopeInstance);
      const error = 'original error';
      let sut = null;
      let result = null;
      // When
      sut = new Parserror();
      sut.addScope(customScopeName);
      result = sut.parse(error, {
        scopes: [sut.globalScopeName, customScopeName],
      });
      // Then
      expect(result).toBe(formatted);
      expect(globalScopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(globalScopeCase.parse).toHaveBeenCalledTimes(1);
      expect(globalScopeCase.parse).toHaveBeenCalledWith(
        error,
        [globalScopeInstance, customScopeInstance],
        null
      );
      expect(customScopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(customScopeCase.parse).toHaveBeenCalledTimes(1);
      expect(customScopeCase.parse).toHaveBeenCalledWith(
        error,
        [globalScopeInstance, customScopeInstance],
        null
      );
    });

    it('should parse an error with custom scopes and cases', () => {
      // Given
      const globalScopeCaseName = 'someCase';
      const globalScopeCase = {
        parse: jest.fn(),
      };
      const globalScopeInstance = {
        getCase: jest.fn(() => globalScopeCase),
      };
      const customScopeName = 'customScope';
      const formatted = 'new error';
      const customScopeCase = {
        parse: jest.fn(() => formatted),
      };
      const customScopeInstance = {
        getCases: jest.fn(() => [customScopeCase]),
      };
      Scope.mockImplementationOnce(() => globalScopeInstance);
      Scope.mockImplementationOnce(() => customScopeInstance);
      const error = 'original error';
      let sut = null;
      let result = null;
      // When
      sut = new Parserror();
      sut.addScope(customScopeName);
      result = sut.parse(error, {
        scopes: [customScopeName],
        cases: [globalScopeCaseName],
      });
      // Then
      expect(result).toBe(formatted);
      expect(globalScopeInstance.getCase).toHaveBeenCalledTimes(1);
      expect(globalScopeInstance.getCase).toHaveBeenCalledWith(globalScopeCaseName);
      expect(globalScopeCase.parse).toHaveBeenCalledTimes(1);
      expect(globalScopeCase.parse).toHaveBeenCalledWith(
        error,
        [customScopeInstance, globalScopeInstance],
        null
      );
      expect(customScopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(customScopeCase.parse).toHaveBeenCalledTimes(1);
      expect(customScopeCase.parse).toHaveBeenCalledWith(
        error,
        [customScopeInstance, globalScopeInstance],
        null
      );
    });

    it('shouldn\'t use the cases option if the global scope is included', () => {
      // Given
      const globalScopeCaseName = 'someCase';
      const globalScopeCase = {
        parse: jest.fn(),
      };
      const globalScopeInstance = {
        getCase: jest.fn(),
        getCases: jest.fn(() => [globalScopeCase]),
      };
      const customScopeName = 'customScope';
      const formatted = 'new error';
      const customScopeCase = {
        parse: jest.fn(() => formatted),
      };
      const customScopeInstance = {
        getCases: jest.fn(() => [customScopeCase]),
      };
      Scope.mockImplementationOnce(() => globalScopeInstance);
      Scope.mockImplementationOnce(() => customScopeInstance);
      const error = 'original error';
      let sut = null;
      let result = null;
      // When
      sut = new Parserror();
      sut.addScope(customScopeName);
      result = sut.parse(error, {
        scopes: [sut.globalScopeName, customScopeName],
        cases: [globalScopeCaseName],
      });
      // Then
      expect(result).toBe(formatted);
      expect(globalScopeInstance.getCase).toHaveBeenCalledTimes(0);
      expect(globalScopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(globalScopeCase.parse).toHaveBeenCalledTimes(1);
      expect(globalScopeCase.parse).toHaveBeenCalledWith(
        error,
        [globalScopeInstance, customScopeInstance],
        null
      );
      expect(customScopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(customScopeCase.parse).toHaveBeenCalledTimes(1);
      expect(customScopeCase.parse).toHaveBeenCalledWith(
        error,
        [globalScopeInstance, customScopeInstance],
        null
      );
    });

    it('should parse an error with context information', () => {
      // Given
      Utils.isObject.mockImplementationOnce(() => true);
      const formatted = 'new error';
      const theCase = {
        parse: jest.fn(() => formatted),
      };
      const scopeInstance = {
        getCases: jest.fn(() => [theCase]),
      };
      Scope.mockImplementationOnce(() => scopeInstance);
      const errorMessage = 'original error';
      const errorContext = 'context';
      const error = {
        message: errorMessage,
        context: errorContext,
      };
      let sut = null;
      let result = null;
      // When
      sut = new Parserror();
      result = sut.parse(error);
      // Then
      expect(result).toBe(formatted);
      expect(scopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(theCase.parse).toHaveBeenCalledTimes(1);
      expect(theCase.parse).toHaveBeenCalledWith(
        errorMessage,
        [scopeInstance],
        errorContext
      );
    });

    it('should fail to parse an error message and return the original', () => {
      // Given
      Utils.isObject.mockImplementationOnce(() => true);
      const scopeInstance = {
        getCases: jest.fn(() => []),
      };
      Scope.mockImplementationOnce(() => scopeInstance);
      const errorInstance = {
        name: 'error-instance',
      };
      FormattedError.mockImplementationOnce(() => errorInstance);
      const error = 'original error';
      let sut = null;
      let result = null;
      // When
      sut = new Parserror();
      result = sut.parse(error);
      // Then
      expect(result).toEqual(errorInstance);
      expect(scopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(FormattedError).toHaveBeenCalledTimes(1);
      expect(FormattedError).toHaveBeenCalledWith(
        error,
        {},
        { original: true }
      );
    });
  });

  describe('wrap', () => {
    it('should create a wrapped parser for the global cases', () => {
      // Given
      const formatted = 'new error';
      const theCase = {
        parse: jest.fn(() => formatted),
      };
      const scopeInstance = {
        getCases: jest.fn(() => [theCase]),
      };
      Scope.mockImplementationOnce(() => scopeInstance);
      const error = 'original error';
      let sut = null;
      let parser = null;
      let result = null;
      // When
      sut = new Parserror();
      parser = sut.wrap();
      result = parser(error);
      // Then
      expect(parser).toBeFunction();
      expect(result).toBe(formatted);
      expect(scopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(theCase.parse).toHaveBeenCalledTimes(1);
      expect(theCase.parse).toHaveBeenCalledWith(
        error,
        [scopeInstance],
        null
      );
    });

    it('should create a wrapped parser for a global case', () => {
      // Given
      const formatted = 'new error';
      const theCaseName = 'myCase';
      const theCase = {
        parse: jest.fn(() => formatted),
      };
      const scopeInstance = {
        getCase: jest.fn(() => theCase),
      };
      Scope.mockImplementationOnce(() => scopeInstance);
      const error = 'original error';
      let sut = null;
      let parser = null;
      let result = null;
      // When
      sut = new Parserror();
      parser = sut.wrap([theCaseName]);
      result = parser(error);
      // Then
      expect(parser).toBeFunction();
      expect(result).toBe(formatted);
      expect(scopeInstance.getCase).toHaveBeenCalledTimes(1);
      expect(scopeInstance.getCase).toHaveBeenCalledWith(theCaseName);
      expect(theCase.parse).toHaveBeenCalledTimes(1);
      expect(theCase.parse).toHaveBeenCalledWith(
        error,
        [scopeInstance],
        null
      );
    });

    it('should create a wrapped parser with cases and scopes', () => {
      // Given
      const globalScopeCaseName = 'someCase';
      const globalScopeCase = {
        parse: jest.fn(),
      };
      const globalScopeInstance = {
        getCase: jest.fn(() => globalScopeCase),
      };
      const customScopeName = 'customScope';
      const formatted = 'new error';
      const customScopeCase = {
        parse: jest.fn(() => formatted),
      };
      const customScopeInstance = {
        getCases: jest.fn(() => [customScopeCase]),
      };
      Scope.mockImplementationOnce(() => globalScopeInstance);
      Scope.mockImplementationOnce(() => customScopeInstance);
      const error = 'original error';
      let sut = null;
      let parser = null;
      let result = null;
      // When
      sut = new Parserror();
      sut.addScope(customScopeName);
      parser = sut.wrap([globalScopeCaseName], [customScopeName]);
      result = parser(error);
      // Then
      expect(parser).toBeFunction();
      expect(result).toBe(formatted);
      expect(globalScopeInstance.getCase).toHaveBeenCalledTimes(1);
      expect(globalScopeInstance.getCase).toHaveBeenCalledWith(globalScopeCaseName);
      expect(globalScopeCase.parse).toHaveBeenCalledTimes(1);
      expect(globalScopeCase.parse).toHaveBeenCalledWith(
        error,
        [customScopeInstance, globalScopeInstance],
        null
      );
      expect(customScopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(customScopeCase.parse).toHaveBeenCalledTimes(1);
      expect(customScopeCase.parse).toHaveBeenCalledWith(
        error,
        [customScopeInstance, globalScopeInstance],
        null
      );
    });
  });

  describe('wrapForScopes', () => {
    it('should create a wrapped parser for an specific scope', () => {
      // Given
      const globalScopeCase = {
        parse: jest.fn(),
      };
      const globalScopeInstance = {
        getCases: jest.fn(() => [globalScopeCase]),
      };
      const customScopeName = 'customScope';
      const formatted = 'new error';
      const customScopeCase = {
        parse: jest.fn(() => formatted),
      };
      const customScopeInstance = {
        getCases: jest.fn(() => [customScopeCase]),
      };
      Scope.mockImplementationOnce(() => globalScopeInstance);
      Scope.mockImplementationOnce(() => customScopeInstance);
      const error = 'original error';
      let sut = null;
      let parser = null;
      let result = null;
      // When
      sut = new Parserror();
      sut.addScope(customScopeName);
      parser = sut.wrapForScopes([customScopeName]);
      result = parser(error);
      // Then
      expect(parser).toBeFunction();
      expect(result).toBe(formatted);
      expect(globalScopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(globalScopeCase.parse).toHaveBeenCalledTimes(0);
      expect(customScopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(customScopeCase.parse).toHaveBeenCalledTimes(1);
      expect(customScopeCase.parse).toHaveBeenCalledWith(
        error,
        [customScopeInstance, globalScopeInstance],
        null
      );
    });
  });
});
