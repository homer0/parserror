const CaseParser = require('./caseParser');
const ErrorCase = require('./errorCase');
const FormattedError = require('./formattedError');
const Scope = require('./scope');
const Utils = require('./utils');

/**
 * @typedef {Object} ParserrorOptions
 * @description The options to customize how the class behaves.
 * @property {Class<CaseParser>}     CaseParserClass        The class that will be used to create
 *                                                          parsers. It will also be sent down to
 *                                                          every case that gets created, on its
 *                                                          `option` parameter.
 * @property {Class<ErrorCase>}      ErrorCaseClass         The class that will be used to create
 *                                                          cases.
 * @property {Class<FormattedError>} FormattedErrorClass    The class that will be used to create
 *                                                          formatted errors. It will also be sent
 *                                                          down to every case that gets created,
 *                                                          on its `options` parameter.
 * @property {Class<Scope>}          ScopeClass             The class that will be used to create
 *                                                          scopes.
 * @property {Array<String>}         errorContextProperties A list of properties the class will try
 *                                                          to find on given errors in order to use
 *                                                          as context information for
 *                                                          {@link ErrorCase} and
 *                                                          {@link FormattedError}.
 */

/**
 * @typdef {Object} ParserrorErrorObject
 * @description An object with a signature similar to an {@link Error} that {@link Parserror}
 *              can parse.
 * @property {String} message The error message.
 */

/**
 * @typedef {Object} ParserrorParseOptions
 * @description The options that can be used to customize how {@link Parserror#parse} works.
 * @property {Array<String>} cases    A list of specific cases it should validated
 *                                    against.
 * @property {Array<String>} scopes   A list of specific scopes it should use to
 *                                    valdiate the error.
 * @property {?String}       fallback A fallback message in case the error is can't be
 *                                    parsed. If not specified, the returned error will
 *                                    maintain the original message.
 */

/**
 * @typedef {function} ParserrorWrapper
 * @description A pre configured parser to format errors with specific cases and/or scopes.
 * @param {Error|String|ParserrorErrorObject} error
 * The error to parse.
 * @param {?String} [fallback=null]
 * A fallback message in case the error is can't be parsed. If not specified, the
 * returned error will maintain the original message.
 * @return {FormattedError}
 */

/**
 * The main class of the library. It allows you to create cases, parsers and scopes.
 */
class Parserror {
  /**
   * Create a new instance of {@link Parserror}.
   * @param {ParserrorOptions} [options] The options to customize how the class behaves.
   * @return {Parserror}
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
     * @type {ParserrorOptions}
     * @access protected
     * @ignore
     */
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
    /**
     * The name of the global scope where the cases and parsers are added by default.
     * @type {String}
     * @access protected
     * @ignore
     */
    this._globalScopeName = 'global';
    /**
     * A dictionary with the available scopes.
     * @type {Object}
     * @access protected
     * @ignore
     */
    this._scopes = {};

    this.addScope(this._globalScopeName);
  }
  /**
   * Add a new error case.
   * @param {ErrorCaseDefinition} definition The case definition settings.
   * @param {?String}             scope      The name of the scope where the case should be added.
   *                                         If not defined, it will be added to the global scope.
   * @return {Parserror} For chaining purposes.
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
   * @param {Array<ErrorCaseDefinition>} definitions The cases' definitions.
   * @param {?String}                    scope       The name of the scope where the cases should
   *                                                 be added. If not defined, they will be added
   *                                                 to the global scope.
   * @return {Parserror} For chaining purposes.
   */
  addCases(definitions, scope = null) {
    Utils.ensureArray(definitions).forEach((definition) => {
      this.addCase(definition, scope);
    });

    return this;
  }
  /**
   * Adds a reusable parser.
   * @param {String}           name   The name of the parser.
   * @param {Object|Function}  parser The parser function or map (see {@link CaseParser}).
   * @param {?String}          scope  The name of the scope where the parser should be added. If
   *                                  not defined, it will be added to the global scope.
   * @return {Parserror} For chaining purposes.
   */
  addParser(name, parser, scope = null) {
    const scopeName = scope || this._globalScopeName;
    const useScope = this.getScope(scopeName);
    const { CaseParserClass } = this._options;
    useScope.addParser(new CaseParserClass(name, parser));
    return this;
  }
  /**
   * Gets a scope by its name.
   * @param {String} name          The name of the scope.
   * @param {[type]} [create=true] If `true` and the scope doesn't exist, it will try to create it.
   * @return {Scope}
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
   * Creates a new scope.
   * @param {String}                      name              The name of the scope.
   * @param {Array<ErrorCaseDefinition>}  cases             A list of cases' defintions to add.
   * @param {Boolean}                     [overwrite=false] If there's a scope with the same name
   *                                                        already, using this flag allows you to
   *                                                        overwrite it.
   * @return {Parserror} For chaining purposes.
   * @throws {Error} If `overwrite` is `false` and there's already a scope with the same name.
   */
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

    const { ScopeClass } = this._options;
    this._scopes[name] = new ScopeClass(name);

    if (cases.length) {
      this.addCases(cases, name);
    }

    return this;
  }
  /**
   * Removes a scope.
   * @param {String} name The name of the scope to remove.
   * @throws {Error} If you try to remove the global scope.
   */
  removeScope(name) {
    if (name === this._globalScopeName) {
      throw new Error('You can\'t delete the global scope');
    }

    delete this._scopes[name];
  }
  /**
   * Parses and formats an error.
   * @param {Error|String|ParserrorErrorObject} error
   * The error to parse.
   * @param {ParserrorParseOptions} [options={}]
   * Options to customize how the parsing is done.
   * @return {FormattedError}
   * @throws {TypeError} If `error` is not an {@link Error}, a string or a
   *                     {@link ParserrorErrorObject}.
   */
  parse(error, options = {}) {
    const useOptions = Object.assign(
      {
        cases: [],
        scopes: [],
        fallback: null,
      },
      options
    );

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
        '\'message\' property\''
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
   * Creates a wrapper: a pre configured parser to format errors with specific cases and/or
   * scopes.
   * @param {Array<String>} cases  A list of cases' names.
   * @param {Array<String>} scopes A list of scopes' names.
   * @return {ParserrorWrapper}
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
   * @param {Array<String>} scopes A list of scopes' names.
   * @return {ParserrorWrapper}
   */
  wrapForScopes(scopes, fallback = null) {
    return (error, fallbackMessage = null) => this.parse(error, {
      scopes,
      fallback: fallbackMessage || fallback,
    });
  }
  /**
   * The name of the global scope.
   * @type {String}
   */
  get globalScopeName() {
    return this._globalScopeName;
  }
  /**
   * Validates an object to ensure it can be used as {@link ParserrorParseOptions}.
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
  /**
   * Tries to find a property inside an error to be used as context information for the parsers.
   * @param {Error|ParserrorErrorObject} error The error where the method will look for the
   *                                           property.
   * @return {?Object}
   * @access protected
   * @ignore
   */
  _searchForContext(error) {
    const useProperty = this._options.errorContextProperties
    .find((property) => typeof error[property] !== 'undefined');

    return useProperty ? error[useProperty] : null;
  }
}

module.exports = Parserror;
