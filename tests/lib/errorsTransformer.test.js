jest.unmock('/src/lib/errorsTransformer');

require('jasmine-expect');
const CaseParser = require('/src/lib/caseParser');
const ErrorCase = require('/src/lib/errorCase');
const ErrorsTransformer = require('/src/lib/errorsTransformer');
const FormattedError = require('/src/lib/formattedError');
const Scope = require('/src/lib/scope');
const Utils = require('/src/lib/utils');

describe('lib/ErrorsTransformer', () => {
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
      sut = new ErrorsTransformer();
      result = sut.getScope(sut.globalScopeName);
      // Then
      expect(sut).toBeInstanceOf(ErrorsTransformer);
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
      sut = new ErrorsTransformer({
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
      sut = new ErrorsTransformer({
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
      sut = new ErrorsTransformer({
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
      sut = new ErrorsTransformer({
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
      sut = new ErrorsTransformer({
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
      sut = new ErrorsTransformer({
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
      sut = new ErrorsTransformer({
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
      expect(() => (new ErrorsTransformer()).getScope('something', false))
      .toThrow(/The scope '\w+' doesn't exist/i);
    });

    it('should throw an error when trying to add a scope that already exists', () => {
      // Given
      let sut = null;
      // When/Then
      sut = new ErrorsTransformer();
      expect(() => sut.addScope(sut.globalScopeName))
      .toThrow(
        /The scope '\w+' already exists\. You can use 'removeScope' to remove it first, or set the 'overwrite' parameter to 'true'/i
      );
    });

    it('should throw an error when trying to remove the global scope', () => {
      // Given
      let sut = null;
      // When/Then
      sut = new ErrorsTransformer();
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
      sut = new ErrorsTransformer();
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
      sut = new ErrorsTransformer();
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
      sut = new ErrorsTransformer();
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
      sut = new ErrorsTransformer({
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
      sut = new ErrorsTransformer();
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

  describe('transform', () => {
    it('should throw an error if the received error is not a string or an object', () => {
      // Given/When/Then
      expect(() => (new ErrorsTransformer()).transform([]))
      .toThrow(
        /'transform' can only handle error messages \('string'\), native errors \('Error'\) or literal objects \('object'\) with a 'message' property/i
      );
    });

    it('should throw an error if the `cases` option is not an array', () => {
      // Given/When/Then
      expect(() => (new ErrorsTransformer()).transform('something', { cases: 'nop' }))
      .toThrow(/The 'cases' option can only be an 'array'/i);
    });

    it('should throw an error if the `scopes` option is not an array', () => {
      // Given/When/Then
      expect(() => (new ErrorsTransformer()).transform('something', { scopes: 'nop' }))
      .toThrow(/The 'scopes' option can only be an 'array'/i);
    });

    it('should transform an error (string)', () => {
      // Given
      const formatted = 'new error';
      const theCase = {
        process: jest.fn(() => formatted),
      };
      const scopeInstance = {
        getCases: jest.fn(() => [theCase]),
      };
      Scope.mockImplementationOnce(() => scopeInstance);
      const error = 'original error';
      let sut = null;
      let result = null;
      // When
      sut = new ErrorsTransformer();
      result = sut.transform(error);
      // Then
      expect(result).toBe(formatted);
      expect(scopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(theCase.process).toHaveBeenCalledTimes(1);
      expect(theCase.process).toHaveBeenCalledWith(
        error,
        [scopeInstance],
        null
      );
    });

    it('should transform an error (Error)', () => {
      // Given
      const formatted = 'new error';
      const theCase = {
        process: jest.fn(() => formatted),
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
      sut = new ErrorsTransformer();
      result = sut.transform(error);
      // Then
      expect(result).toBe(formatted);
      expect(scopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(theCase.process).toHaveBeenCalledTimes(1);
      expect(theCase.process).toHaveBeenCalledWith(
        errorMessage,
        [scopeInstance],
        null
      );
    });

    it('should transform an error (Object)', () => {
      // Given
      Utils.isObject.mockImplementationOnce(() => true);
      const formatted = 'new error';
      const theCase = {
        process: jest.fn(() => formatted),
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
      sut = new ErrorsTransformer();
      result = sut.transform(error);
      // Then
      expect(result).toBe(formatted);
      expect(scopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(theCase.process).toHaveBeenCalledTimes(1);
      expect(theCase.process).toHaveBeenCalledWith(
        errorMessage,
        [scopeInstance],
        null
      );
    });

    it('should transform an error with custom scopes', () => {
      // Given
      const globalScopeCase = {
        process: jest.fn(),
      };
      const globalScopeInstance = {
        getCases: jest.fn(() => [globalScopeCase]),
      };
      const customScopeName = 'customScope';
      const formatted = 'new error';
      const customScopeCase = {
        process: jest.fn(() => formatted),
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
      sut = new ErrorsTransformer();
      sut.addScope(customScopeName);
      result = sut.transform(error, {
        scopes: [sut.globalScopeName, customScopeName],
      });
      // Then
      expect(result).toBe(formatted);
      expect(globalScopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(globalScopeCase.process).toHaveBeenCalledTimes(1);
      expect(globalScopeCase.process).toHaveBeenCalledWith(
        error,
        [globalScopeInstance, customScopeInstance],
        null
      );
      expect(customScopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(customScopeCase.process).toHaveBeenCalledTimes(1);
      expect(customScopeCase.process).toHaveBeenCalledWith(
        error,
        [globalScopeInstance, customScopeInstance],
        null
      );
    });

    it('should transform an error with custom scopes and cases', () => {
      // Given
      const globalScopeCaseName = 'someCase';
      const globalScopeCase = {
        process: jest.fn(),
      };
      const globalScopeInstance = {
        getCase: jest.fn(() => globalScopeCase),
      };
      const customScopeName = 'customScope';
      const formatted = 'new error';
      const customScopeCase = {
        process: jest.fn(() => formatted),
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
      sut = new ErrorsTransformer();
      sut.addScope(customScopeName);
      result = sut.transform(error, {
        scopes: [customScopeName],
        cases: [globalScopeCaseName],
      });
      // Then
      expect(result).toBe(formatted);
      expect(globalScopeInstance.getCase).toHaveBeenCalledTimes(1);
      expect(globalScopeInstance.getCase).toHaveBeenCalledWith(globalScopeCaseName);
      expect(globalScopeCase.process).toHaveBeenCalledTimes(1);
      expect(globalScopeCase.process).toHaveBeenCalledWith(
        error,
        [customScopeInstance, globalScopeInstance],
        null
      );
      expect(customScopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(customScopeCase.process).toHaveBeenCalledTimes(1);
      expect(customScopeCase.process).toHaveBeenCalledWith(
        error,
        [customScopeInstance, globalScopeInstance],
        null
      );
    });

    it('shouldn\'t use the cases option if the global scope is included', () => {
      // Given
      const globalScopeCaseName = 'someCase';
      const globalScopeCase = {
        process: jest.fn(),
      };
      const globalScopeInstance = {
        getCase: jest.fn(),
        getCases: jest.fn(() => [globalScopeCase]),
      };
      const customScopeName = 'customScope';
      const formatted = 'new error';
      const customScopeCase = {
        process: jest.fn(() => formatted),
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
      sut = new ErrorsTransformer();
      sut.addScope(customScopeName);
      result = sut.transform(error, {
        scopes: [sut.globalScopeName, customScopeName],
        cases: [globalScopeCaseName],
      });
      // Then
      expect(result).toBe(formatted);
      expect(globalScopeInstance.getCase).toHaveBeenCalledTimes(0);
      expect(globalScopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(globalScopeCase.process).toHaveBeenCalledTimes(1);
      expect(globalScopeCase.process).toHaveBeenCalledWith(
        error,
        [globalScopeInstance, customScopeInstance],
        null
      );
      expect(customScopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(customScopeCase.process).toHaveBeenCalledTimes(1);
      expect(customScopeCase.process).toHaveBeenCalledWith(
        error,
        [globalScopeInstance, customScopeInstance],
        null
      );
    });

    it('should transform an error with context information', () => {
      // Given
      Utils.isObject.mockImplementationOnce(() => true);
      const formatted = 'new error';
      const theCase = {
        process: jest.fn(() => formatted),
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
      sut = new ErrorsTransformer();
      result = sut.transform(error);
      // Then
      expect(result).toBe(formatted);
      expect(scopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(theCase.process).toHaveBeenCalledTimes(1);
      expect(theCase.process).toHaveBeenCalledWith(
        errorMessage,
        [scopeInstance],
        errorContext
      );
    });

    it('should fail to transform an error message and return the original', () => {
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
      sut = new ErrorsTransformer();
      result = sut.transform(error);
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

  describe('createTransformer', () => {
    it('should create a transfomer for the global cases', () => {
      // Given
      const formatted = 'new error';
      const theCase = {
        process: jest.fn(() => formatted),
      };
      const scopeInstance = {
        getCases: jest.fn(() => [theCase]),
      };
      Scope.mockImplementationOnce(() => scopeInstance);
      const error = 'original error';
      let sut = null;
      let transformer = null;
      let result = null;
      // When
      sut = new ErrorsTransformer();
      transformer = sut.createTransformer();
      result = transformer(error);
      // Then
      expect(transformer).toBeFunction();
      expect(result).toBe(formatted);
      expect(scopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(theCase.process).toHaveBeenCalledTimes(1);
      expect(theCase.process).toHaveBeenCalledWith(
        error,
        [scopeInstance],
        null
      );
    });

    it('should create a transfomer for a global case', () => {
      // Given
      const formatted = 'new error';
      const theCaseName = 'myCase';
      const theCase = {
        process: jest.fn(() => formatted),
      };
      const scopeInstance = {
        getCase: jest.fn(() => theCase),
      };
      Scope.mockImplementationOnce(() => scopeInstance);
      const error = 'original error';
      let sut = null;
      let transformer = null;
      let result = null;
      // When
      sut = new ErrorsTransformer();
      transformer = sut.createTransformer([theCaseName]);
      result = transformer(error);
      // Then
      expect(transformer).toBeFunction();
      expect(result).toBe(formatted);
      expect(scopeInstance.getCase).toHaveBeenCalledTimes(1);
      expect(scopeInstance.getCase).toHaveBeenCalledWith(theCaseName);
      expect(theCase.process).toHaveBeenCalledTimes(1);
      expect(theCase.process).toHaveBeenCalledWith(
        error,
        [scopeInstance],
        null
      );
    });

    it('should create a transformer with cases and scopes', () => {
      // Given
      const globalScopeCaseName = 'someCase';
      const globalScopeCase = {
        process: jest.fn(),
      };
      const globalScopeInstance = {
        getCase: jest.fn(() => globalScopeCase),
      };
      const customScopeName = 'customScope';
      const formatted = 'new error';
      const customScopeCase = {
        process: jest.fn(() => formatted),
      };
      const customScopeInstance = {
        getCases: jest.fn(() => [customScopeCase]),
      };
      Scope.mockImplementationOnce(() => globalScopeInstance);
      Scope.mockImplementationOnce(() => customScopeInstance);
      const error = 'original error';
      let sut = null;
      let transformer = null;
      let result = null;
      // When
      sut = new ErrorsTransformer();
      sut.addScope(customScopeName);
      transformer = sut.createTransformer([globalScopeCaseName], [customScopeName]);
      result = transformer(error);
      // Then
      expect(transformer).toBeFunction();
      expect(result).toBe(formatted);
      expect(globalScopeInstance.getCase).toHaveBeenCalledTimes(1);
      expect(globalScopeInstance.getCase).toHaveBeenCalledWith(globalScopeCaseName);
      expect(globalScopeCase.process).toHaveBeenCalledTimes(1);
      expect(globalScopeCase.process).toHaveBeenCalledWith(
        error,
        [customScopeInstance, globalScopeInstance],
        null
      );
      expect(customScopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(customScopeCase.process).toHaveBeenCalledTimes(1);
      expect(customScopeCase.process).toHaveBeenCalledWith(
        error,
        [customScopeInstance, globalScopeInstance],
        null
      );
    });
  });

  describe('createTransformerWithScopes', () => {
    it('should create a transformer for an specific scope', () => {
      // Given
      const globalScopeCase = {
        process: jest.fn(),
      };
      const globalScopeInstance = {
        getCases: jest.fn(() => [globalScopeCase]),
      };
      const customScopeName = 'customScope';
      const formatted = 'new error';
      const customScopeCase = {
        process: jest.fn(() => formatted),
      };
      const customScopeInstance = {
        getCases: jest.fn(() => [customScopeCase]),
      };
      Scope.mockImplementationOnce(() => globalScopeInstance);
      Scope.mockImplementationOnce(() => customScopeInstance);
      const error = 'original error';
      let sut = null;
      let transformer = null;
      let result = null;
      // When
      sut = new ErrorsTransformer();
      sut.addScope(customScopeName);
      transformer = sut.createTransformerWithScopes([customScopeName]);
      result = transformer(error);
      // Then
      expect(transformer).toBeFunction();
      expect(result).toBe(formatted);
      expect(globalScopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(globalScopeCase.process).toHaveBeenCalledTimes(0);
      expect(customScopeInstance.getCases).toHaveBeenCalledTimes(1);
      expect(customScopeCase.process).toHaveBeenCalledTimes(1);
      expect(customScopeCase.process).toHaveBeenCalledWith(
        error,
        [customScopeInstance, globalScopeInstance],
        null
      );
    });
  });
});
