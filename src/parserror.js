const CaseParser = require('./caseParser');
const ErrorCase = require('./errorCase');
const FormattedError = require('./formattedError');
const Scope = require('./scope');
const Utils = require('./utils');

/**
 * The main class of the library. It allows you to create cases, parsers and scopes.
 */
class Parserror {
  /**
   * Create a new instance of {@link Parserror}.
   *
   * @param {ParserrorOptions} [options] The options to customize how the class behaves.
   * @returns {Parserror}
   */
  static new(options) {
    return new Parserror(options);
  }
  /**
   * @param {ParserrorOptions} [options={}] The options to customize how the class behaves.
   */
  constructor(options = {}) {
    /**
     * The options to customize how the class behaves.
     *
     * @type {ParserrorOptions}
     * @access protected
     * @ignore
     */
    this._options = {
      CaseParserClass: CaseParser,
      ErrorCaseClass: ErrorCase,
      FormattedErrorClass: FormattedError,
      ScopeClass: Scope,
      errorContextProperties: ['context', 'response', 'data'],
      ...options,
    };
    /**
     * The name of the global scope where the cases and parsers are added by default.
     *
     * @type {string}
     * @access protected
     * @ignore
     */
    this._globalScopeName = 'global';
    /**
     * A dictionary with the available scopes.
     *
     * @type {Object}
     * @access protected
     * @ignore
     */
    this._scopes = {};

    this.addScope(this._globalScopeName);
  }
  /**
   * Add a new error case.
   *
   * @param {ErrorCaseDefinition} definition   The case definition settings.
   * @param {?string}             [scope=null] The name of the scope where the case should be added.
   *                                           If not defined, it will be added to the global scope.
   * @returns {Parserror} For chaining purposes.
   */
  addCase(definition, scope = null) {
    const scopeName = definition.scope || scope || this._globalScopeName;
    const useScope = this.getScope(scopeName);
    const {
      ErrorCaseClass,
      CaseParserClass,
      FormattedErrorClass,
    } = this._options;

    useScope.addCase(new ErrorCaseClass(definition, {
      CaseParserClass,
      FormattedErrorClass,
    }));

    return this;
  }
  /**
   * Adds a list of error cases.
   *
   * @param {Array<ErrorCaseDefinition>} definitions  The cases' definitions.
   * @param {?string}                    [scope=null] The name of the scope where the cases should
   *                                                  be added. If not defined, they will be added
   *                                                  to the global scope.
   * @returns {Parserror} For chaining purposes.
   */
  addCases(definitions, scope = null) {
    Utils.ensureArray(definitions).forEach((definition) => {
      this.addCase(definition, scope);
    });

    return this;
  }
  /**
   * Adds a reusable parser.
   *
   * @param {string}           name   The name of the parser.
   * @param {Object|Function}  parser The parser function or map (see {@link CaseParser}).
   * @param {?string}          scope  The name of the scope where the parser should be added. If
   *                                  not defined, it will be added to the global scope.
   * @returns {Parserror} For chaining purposes.
   */
  addParser(name, parser, scope = null) {
    const scopeName = scope || this._globalScopeName;
    const useScope = this.getScope(scopeName);
    const { CaseParserClass } = this._options;
    useScope.addParser(new CaseParserClass(name, parser));
    return this;
  }
  /**
   * Creates a new scope.
   *
   * @param {string} name
   * The name of the scope.
   * @param {Array<ErrorCaseDefinition>} [cases=[]]
   * A list of cases' defintions to add.
   * @param {Array<string|RegExp|ErrorCaseDefinition>} [allowedOriginals=[]]
   * a list of conditions/definitions for cases that allow original messages to be matched. To
   * better understand how this work, please read the description of
   * {@link Parserror#allowOriginal}.
   * @param {boolean} [overwrite=false]
   * If there's a scope with the same name already, using this flag allows you to overwrite it.
   * @returns {Parserror} For chaining purposes.
   * @throws {Error} If `overwrite` is `false` and there's already a scope with the same name.
   */
  addScope(name, cases = [], allowedOriginals = [], overwrite = false) {
    if (this._scopes[name]) {
      if (overwrite) {
        this.removeScope(name);
      } else {
        throw new Error(
          `The scope '${name}' already exists. You can use 'removeScope' ` +
          'to remove it first, or set the \'overwrite\' parameter to \'true\'',
        );
      }
    }

    const { ScopeClass } = this._options;
    this._scopes[name] = new ScopeClass(name);

    if (cases.length) {
      this.addCases(cases, name);
    }

    if (allowedOriginals.length) {
      this.allowOriginals(allowedOriginals, name);
    }

    return this;
  }
  /**
   * Allows a specific error message to be matched. The idea is for this feature to be used with
   * fallback messages: If you want a message to be used as it is but at the same time you want
   * to use a fallback message, you would use this method; the original message won't be
   * discarded and you still have the fallback for messages that don't have a match.
   *
   * @param {string|RegExp|ErrorCaseDefinition} condition
   * Internally, this method will generate a new {@link ErrorCase}, so this parameter can be a
   * string or a regular expression to match the error message, or an actual case definition.
   * By default, the created case will have a random string as a name, but you can use a case
   * definition to specify the name you want.
   * @param {?string} [scope=null]
   * The name of the scope where the case should be added. If not defined, it will be added to
   * the global scope.
   * @returns {Parserror} For chaining purposes.
   */
  allowOriginal(condition, scope = null) {
    let definition;
    if (typeof condition === 'string' || condition instanceof RegExp) {
      definition = {};
      definition.condition = condition;
    } else {
      definition = condition;
    }

    if (!definition.name) {
      const nameLength = 20;
      definition.name = Utils.getRandomString(nameLength);
    }

    definition.useOriginal = true;
    return this.addCase(definition, scope);
  }
  /**
   * Allows for multiple error messages to be matched. This is the "bulk alias" of
   * {@link Parserror#allowOriginal}, so please read the documentation of that method to better
   * understand in which case you would want to allow original messages.
   *
   * @param {Array<string|RegExp|ErrorCaseDefinition>} conditions
   * The list of conditions/definitions for the cases that will match the messages.
   * @param {?string} [scope=null] The name of the scope where the cases should be added. If not
   * defined, they will be added to the global scope.
   * @returns {Parserror} For chaining purposes.
   */
  allowOriginals(conditions, scope = null) {
    Utils.ensureArray(conditions).forEach((condition) => {
      this.allowOriginal(condition, scope);
    });

    return this;
  }
  /**
   * Gets a scope by its name.
   *
   * @param {string}  name          The name of the scope.
   * @param {boolean} [create=true] If `true` and the scope doesn't exist, it will try to create it.
   * @returns {Scope}
   * @throws {Error} If `create` is `false` and the scope doesn't exist.
   */
  getScope(name, create = true) {
    let scope = this._scopes[name];
    if (!scope) {
      if (create) {
        this.addScope(name);
        scope = this._scopes[name];
      } else {
        throw new Error(`The scope '${name}' doesn't exist`);
      }
    }

    return scope;
  }
  /**
   * Parses and formats an error.
   *
   * @param {Error|string|ParserrorErrorObject} error
   * The error to parse.
   * @param {ParserrorParseOptions} [options={}]
   * Options to customize how the parsing is done.
   * @returns {FormattedError}
   * @throws {TypeError} If `error` is not an {@link Error}, a string or a
   *                     {@link ParserrorErrorObject}.
   */
  parse(error, options = {}) {
    const useOptions = {
      cases: [],
      scopes: [],
      fallback: null,
      ...options,
    };

    this._validateParseOptions(useOptions);

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
        '\'parse\' can only handle error messages (\'string\'), ' +
        'native errors (\'Error\') or literal objects (\'object\') with a ' +
        '\'message\' property\'',
      );
    }

    const globalScope = this.getScope(this._globalScopeName);
    let includesGlobalScope = useOptions.scopes.includes(this._globalScopeName);
    let useCases;
    if (useOptions.cases.length) {
      if (includesGlobalScope) {
        useCases = [];
      } else {
        useCases = useOptions.cases.map((name) => globalScope.getCase(name));
      }
    } else {
      if (!includesGlobalScope) {
        includesGlobalScope = true;
        useOptions.scopes.push(this._globalScopeName);
      }

      useCases = [];
    }

    const scopes = useOptions.scopes.map((scope) => this.getScope(scope));

    const scopesCases = scopes
    .map((scope) => scope.getCases())
    .reduce((newList, cases) => [...newList, ...cases], []);

    const cases = [
      ...useCases,
      ...scopesCases,
    ];

    const scopesForCases = includesGlobalScope ?
      scopes :
      [...scopes, globalScope];

    let newError;
    cases.some((theCase) => {
      newError = theCase.parse(message, scopesForCases, context);
      return newError;
    });

    let result;
    if (newError) {
      result = newError;
    } else {
      const { FormattedErrorClass } = this._options;
      result = useOptions.fallback ?
        new FormattedErrorClass(useOptions.fallback, {}, { fallback: true }) :
        new FormattedErrorClass(message, {}, { original: true });
    }

    return result;
  }
  /**
   * Removes a scope.
   *
   * @param {string} name The name of the scope to remove.
   * @throws {Error} If you try to remove the global scope.
   */
  removeScope(name) {
    if (name === this._globalScopeName) {
      throw new Error('You can\'t delete the global scope');
    }

    delete this._scopes[name];
  }
  /**
   * Creates a wrapper: a pre configured parser to format errors with specific cases and/or
   * scopes.
   *
   * @param {Array<string>} cases           A list of cases' names.
   * @param {Array<string>} scopes          A list of scopes' names.
   * @param {?string}       [fallback=null] A fallback message in case the error can't be parsed.
   *                                        If not specified, the returned error will maintain the
   *                                        original message.
   * @returns {ParserrorWrapper}
   */
  wrap(cases = [], scopes = [], fallback = null) {
    return (error, fallbackMessage = null) => this.parse(error, ({
      cases,
      scopes,
      fallback: fallbackMessage || fallback,
    }));
  }
  /**
   * Creates a wrapper for specific scopes. A wrapper is a pre configured parser to format errors
   * with specific cases and/or scopes.
   *
   * @param {Array<string>} scopes          A list of scopes' names.
   * @param {?string}       [fallback=null] A fallback message in case the error can't be parsed.
   *                                        If not specified, the returned error will maintain the
   *                                        original message.
   * @returns {ParserrorWrapper}
   */
  wrapForScopes(scopes, fallback = null) {
    return (error, fallbackMessage = null) => this.parse(error, {
      scopes,
      fallback: fallbackMessage || fallback,
    });
  }
  /**
   * The name of the global scope.
   *
   * @type {string}
   */
  get globalScopeName() {
    return this._globalScopeName;
  }
  /**
   * Tries to find a property inside an error to be used as context information for the parsers.
   *
   * @param {Error|ParserrorErrorObject} error The error where the method will look for the
   *                                           property.
   * @returns {?Object}
   * @access protected
   * @ignore
   */
  _searchForContext(error) {
    const useProperty = this._options.errorContextProperties
    .find((property) => typeof error[property] !== 'undefined');

    return useProperty ? error[useProperty] : null;
  }
  /**
   * Validates an object to ensure it can be used as {@link ParserrorParseOptions}.
   *
   * @param {Object} options The object to validate.
   * @throws {TypeError} If the `cases` property is not an `array`.
   * @throws {TypeError} If the `scopes` property is not an `array`.
   * @access protected
   * @ignore
   */
  _validateParseOptions(options) {
    if (!Array.isArray(options.cases)) {
      throw new TypeError('The \'cases\' option can only be an \'array\'');
    } else if (!Array.isArray(options.scopes)) {
      throw new TypeError('The \'scopes\' option can only be an \'array\'');
    }
  }
}

module.exports = Parserror;
