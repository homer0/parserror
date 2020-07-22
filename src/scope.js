const CaseParser = require('./caseParser.js');
const ErrorCase = require('./errorCase.js');
/**
 * A scope is just a group of cases and parsers Parserror can make use of.
 */
class Scope {
  /**
   * @param {string} name The name of the scope.
   * @throws {TypeError} If the `name` is not a `string`.
   */
  constructor(name) {
    /**
     * The name of the scope.
     *
     * @type {string}
     * @access protected
     * @ignore
     */
    this._name = this._validateName(name);
    /**
     * The list of cases the scope manages.
     *
     * @type {ErrorCase[]}
     * @access protected
     * @ignore
     */
    this._cases = [];
    /**
     * A map of the parsers the scope has.
     *
     * @type {Object.<string,CaseParser>}
     * @access protected
     * @ignore
     */
    this._parsers = {};
  }
  /**
   * Adds a new case to the scope.
   *
   * @param {ErrorCase} theCase The case to add.
   * @returns {Scope} For chaining purposes.
   * @throws {Error} If there's already a case with the same name on the scope.
   * @throws {Error} If `theCase` is not an instance of {@link ErrorCase}.
   */
  addCase(theCase) {
    this._validateCase(theCase);
    if (this.hasCase(theCase.name)) {
      throw new Error(
        `The case name '${theCase.name}' is already being used on the ` +
        `scope '${this._name}'`,
      );
    }

    this._cases.push(theCase);
    return this;
  }
  /**
   * Adds a reusable parser to the scope.
   *
   * @param {CaseParser} parser The parser to add.
   * @returns {Scope} For chaining purposes.
   * @throws {Error} If there's already a parser with the same name on the scope.
   * @throws {Error} If `parser` is not an instance of {@link CaseParser}.
   */
  addParser(parser) {
    this._validateParser(parser);
    if (this.hasParser(parser.name)) {
      throw new Error(
        `The parser name '${parser.name}' is already being used on the ` +
        `scope '${this._name}'`,
      );
    }

    this._parsers[parser.name] = parser;
    return this;
  }
  /**
   * Returns a case by its name.
   *
   * @param {string}  name                 The name of the case.
   * @param {boolean} [failWithError=true] Whether or not the method should throw an error if the
   *                                       case can't be found.
   * @returns {?ErrorCase}
   * @throws {Error} If `failWithError` is `true` and the case can't be found.
   */
  getCase(name, failWithError = true) {
    const theCase = this._cases.find((item) => item.name === name);
    if (!theCase && failWithError) {
      throw new Error(
        `The case '${name}' doesn't exist on the scope ` +
        `'${this._name}'`,
      );
    }

    return theCase || null;
  }
  /**
   * Returns all available cases for this scope.
   *
   * @returns {ErrorCase[]}
   */
  getCases() {
    return this._cases;
  }
  /**
   * Returns a parser by its name.
   *
   * @param {string}  name                 The name of the parser.
   * @param {boolean} [failWithError=true] Whether or not the method should throw an error if the
   *                                       parser can't be found.
   * @returns {?CaseParser}
   * @throws {Error} If `failWithError` is `true` and the parser can't be found.
   */
  getParser(name, failWithError = true) {
    const parser = this._parsers[name];
    if (!parser && failWithError) {
      throw new Error(
        `The parser '${name}' doesn't exist on the scope ` +
        `'${this._name}'`,
      );
    }

    return parser || null;
  }
  /**
   * Checks whether or not there's a case based on its name.
   *
   * @param {string} name The case's name.
   * @returns {boolean}
   */
  hasCase(name) {
    return this.getCase(name, false) !== null;
  }
  /**
   * Checks whether or not there's a parser based on its name.
   *
   * @param {string} name The parser's name.
   * @returns {boolean}
   */
  hasParser(name) {
    return this.getParser(name, false) !== null;
  }
  /**
   * Removes a case from the scope.
   *
   * @param {string|ErrorCase} theCase The name or the reference for the case to remove.
   * @returns {Scope} For chaining purposes.
   * @throws {Error} If the case doesn't exist on the scope.
   * @throws {Error} If `theCase` is a reference but is not an instance of {@link ErrorCase}.
   */
  removeCase(theCase) {
    let name;
    if (typeof theCase === 'string') {
      name = theCase;
    } else {
      this._validateCase(theCase);
      ({ name } = theCase);
    }

    const newCases = this._cases.filter((item) => item.name !== name);
    if (newCases.length !== this._cases.length) {
      this._cases = newCases;
    } else {
      throw new Error(
        `The case '${name}' doesn't exist on the scope ` +
        `'${this._name}'`,
      );
    }

    return this;
  }
  /**
   * Removes a parser from the scope.
   *
   * @param {string|CaseParser} parser The name or the reference for the parser to remove.
   * @returns {Scope} For chaining purposes.
   * @throws {Error} If the parser doesn't exist on the scope.
   * @throws {Error} If `parser` is a reference but is not an instance of {@link CaseParser}.
   */
  removeParser(parser) {
    let name;
    if (typeof parser === 'string') {
      name = parser;
    } else {
      this._validateParser(parser);
      ({ name } = parser);
    }

    if (this._parsers[name]) {
      const newParsers = { ...this._parsers };
      delete newParsers[name];
      this._parsers = newParsers;
    } else {
      throw new Error(
        `The parser '${name}' doesn't exist on the scope ` +
        `'${this._name}'`,
      );
    }

    return this;
  }
  /**
   * The scope's name.
   *
   * @type {string}
   */
  get name() {
    return this._name;
  }
  /**
   * Validates if a case is an instance of {@link ErrorCase}.
   *
   * @param {ErrorCase} theCase The case to validate.
   * @throws {TypeError} If `theCase` is not an instance of {@link ErrorCase}.
   * @access protected
   * @ignore
   */
  _validateCase(theCase) {
    if (!(theCase instanceof ErrorCase)) {
      throw new TypeError('The received case is not an instance of \'ErrorCase\'');
    }
  }
  /**
   * Validates that the name the class intends to use is a `string`.
   *
   * @param {string} name The name to validate.
   * @returns {string}
   * @throws {TypeError} If the `name` is not a string.
   * @access protected
   * @ignore
   */
  _validateName(name) {
    if (typeof name !== 'string') {
      throw new TypeError('The \'name\' can only be a \'string\'');
    }

    return name;
  }
  /**
   * Validates if a parser is an instance of {@link CaseParser}.
   *
   * @param {CaseParser} parser The case to validate.
   * @throws {TypeError} If `parser` is not an instance of {@link CaseParser}.
   * @access protected
   * @ignore
   */
  _validateParser(parser) {
    if (!(parser instanceof CaseParser)) {
      throw new TypeError('The received parser is not an instance of \'CaseParser\'');
    }
  }
}

module.exports = Scope;
