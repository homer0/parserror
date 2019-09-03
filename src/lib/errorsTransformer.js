const CaseParser = require('./caseParser');
const ErrorCase = require('./errorCase');
const FormattedError = require('./formattedError');
const Scope = require('./scope');
const Utils = require('./utils');

class ErrorsTransformer {
  constructor(options) {
    this._options = Object.assign(
      {
        CaseParserClass: CaseParser,
        ErrorCaseClass: ErrorCase,
        FormattedErrorClass: FormattedError,
        ScopeClass: Scope,
        errorContextProperties: ['context', 'response', 'data'],
      },
      options
    );
    this._globalScopeName = 'global';
    this._scopes = {};

    this._addScope(this._globalScopeName);
  }

  addCase(definition, scope = null) {
    const scopeName = definition.scope || scope || this._globalScopeName;
    const useScope = this.getScope(scopeName);
    const { ErrorCaseClass } = this._options;
    useScope.addCase(new ErrorCaseClass(definition, useScope));
    return this;
  }

  addCases(definitions, scope = null) {
    Utils.ensureArray(definitions).forEach((definition) => {
      this.addCase(definition, scope);
    });

    return this;
  }

  getScope(name, create = true) {
    let scope = this._scopes[name];
    if (!scope) {
      if (create) {
        this.addScope(name);
        scope = this._scopes[name];
      } else {
        throw new Error(`The scope '${scope}' doesn't exist`);
      }
    }

    return scope || null;
  }

  addScope(name, cases = [], overwrite = false) {
    if (this._scopes[name]) {
      if (overwrite) {
        this.removeScope(name);
      } else {
        throw new Error(
          `The scope '${name}' already exists. You can use 'removeScope' ` +
          'to remove it first, or set the \'overwrite\' parameter to \'true\''
        );
      }
    }

    this._addScope(name);
    if (cases.length) {
      this.addCases(cases, name);
    }

    return this;
  }

  removeScope(name) {
    if (name === this._globalScopeName) {
      throw new Error('You can\'t delete the global scope');
    }

    delete this._scopes[name];
  }

  addParser(name, parser, scope = null) {
    const scopeName = scope || this._globalScopeName;
    const useScope = this.getScope(scopeName);
    const { CaseParserClass } = this._options;
    useScope.addParser(new CaseParserClass(name, parser));
    return this;
  }

  transform(error, options = {}) {
    const useOptions = Object.assign(
      {
        cases: [],
        scopes: [],
      },
      options
    );

    if (!Array.isArray(useOptions.cases)) {
      throw new TypeError('The \'cases\' option can only be an \'array\'');
    } else if (!Array.isArray(useOptions.scopes)) {
      throw new TypeError('The \'scopes\' option can only be an \'array\'');
    }

    if (!useOptions.scopes.includes(this._globalScopeName)) {
      useOptions.scopes.push(this._globalScopeName);
    }

    let context;
    let message;
    if (typeof error === 'string') {
      message = error;
      context = null;
    } else if (
      error instanceof Error ||
      (
        Utils.isObject(error) &&
        typeof error.message === 'string'
      )
    ) {
      ({ message } = error);
      context = this._searchForContext(error);
    } else {
      throw new TypeError(
        '\'transform\' can only handle error messages (\'string\'), ' +
        'native errors (\'Error\') or literal objects (\'object\') with a ' +
        '\'message\' property\''
      );
    }

    const scopesCases = useOptions.scopes
    .map((scope) => scope.getCases())
    .reduce((newList, cases) => [...newList, ...cases], []);

    const cases = [
      ...options.cases,
      ...scopesCases,
    ];

    let newError;
    cases.some((theCase) => {
      newError = theCase.process(message, useOptions.scopes, context);
      return newError;
    });

    let result;
    if (newError) {
      result = newError;
    } else {
      const { FormattedErrorClass } = this._options;
      result = new FormattedErrorClass(message, {}, { original: true });
    }

    return result;
  }

  createTransformer(cases, scopes = []) {
    const useCases = Utils.ensureArray(cases);
    return (error) => this.transform(error, ({
      cases: useCases,
      scopes,
    }));
  }

  createTransformerWithScopes(scopes) {
    const useScopes = Utils.ensureArray(scopes);
    return (error) => this.transform(error, {
      scopes: useScopes,
    });
  }

  _addScope(name) {
    if (!this._scopes[name]) {
      const { ScopeClass } = this._options;
      this._scopes[name] = new ScopeClass(name);
    }

    return this._scopes[name];
  }

  _searchForContext(error) {
    const useProperty = this._options.errorContextProperties
    .find((property) => typeof error[property] !== 'undefined');

    return useProperty ? error[useProperty] : null;
  }
}

module.exports = ErrorsTransformer;
