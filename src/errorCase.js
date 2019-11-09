const Utils = require('./utils');
const CaseParser = require('./caseParser');
const FormattedError = require('./formattedError');

/**
 * @type {function} ErrorCaseMessage
 * @description A function that generates a formatted message for an error.
 * @return {String}
 */

/**
 * @typedef {Object} ErrorCaseDefinition
 * @description The required properties to create a new {@link ErrorCase}.
 * @property {String} name
 * The name of the case.
 * @property {ErrorCaseDefinition|String} message
 * The formatted message or the `function` that generates one.
 * @property {RegExp|String} condition
 * A `string` or a expression to match against an error that could be parsed.
 * @property {?Object} parsers
 * A map of reusable parsers. Each parser can be an `object` map, a `function` or an instance of
 * {@link CaseParser}.
 * @property {?Array} parse
 * A list of parsers the case should use on extracted parameters. Each item of the list can be
 * either the name of a parser defined on `parsers`, the name of a parser on the scope, a
 * `function` to parse a value, or an `array` of all the thing previously mentioned.
 * @property {?Boolean} useOriginal
 * Whether or not the case should use the original message when matched.
 */

/**
 * @typedef {Object} ErrorCaseOptions
 * @description The options to customize how the class behaves.
 * @property {Class<CaseParser>}     CaseParserClass     The class to be used to create a parser.
 * @property {Class<FormattedError>} FormattedErrorClass The class to be used to create a custom
 *                                                       error after a message is parsed.
 */

/**
 * The core object of Parserror. A case is like a "service" that validates if an error message
 * matches its `condition` and, if defined, runs multiple parsers in order to generate a new
 * error.
 */
class ErrorCase {
  /**
   * @param {ErrorCaseDefinition} definition   The case definition settings.
   * @param {ErrorCaseOptions}    [options={}] The options to customize how the class behaves.
   * @throws {Error}     If the definition is missing the `name`, the `condition` or the `message`.
   * @throws {TypeError} If the definition `message` is not a string nor a function.
   * @throws {TypeError} If the definition `condition` is not a RegExp nor a string.
   * @throws {TypeError} If the definition includes `parsers` and it's not an object.
   * @throws {TypeError} If a parser is not an object, a function or an instance of
   *                     {@link CaseParserClass}.
   * @throws {TypeError} If the definition includes `parse` and it's not an `array` nor an object.
   * @throws {TypeError} If the definition includes `parse` and an item is not an `array`, a
   *                     function or an object.
   */
  constructor(definition, options = {}) {
    /**
     * The options to customize how the class behaves.
     * @type {ErrorCaseOptions}
     * @access protected
     * @ignore
     */
    this._options = Object.assign(
      {
        CaseParserClass: CaseParser,
        FormattedErrorClass: FormattedError,
      },
      options
    );

    this._validateMissingProperties(definition);
    /**
     * The case name.
     * @type {String}
     * @access protected
     * @ignore
     */
    this._name = this._validateName(definition.name);
    /**
     * Whether or not the case should use the original message when matched.
     * @type {Boolean}
     * @access protected
     * @ignore
     */
    this._useOriginal = !!definition.useOriginal;
    /**
     * The function that generates the formatted message. If the case should use the original
     * message, then the property will be `null`.
     * @type {?ErrorCaseMessage}
     * @access protected
     * @ignore
     */
    this._message = this._useOriginal ? null : this._validateMessage(definition.message);
    /**
     * The expression to validate if an error matches the case.
     * @type {RegExp}
     * @access protected
     * @ignore
     */
    this._condition = this._validateCondition(definition.condition);
    /**
     * An object with all the parsers the case can make use of.
     * @type {Object}
     * @access protected
     * @ignore
     */
    this._parsers = this._validateParsers(definition.parsers);
    /**
     * A list of the parse instructions the case can use on extracted parameters.
     * @type {Array}
     * @access protected
     * @ignore
     */
    this._parse = this._validateParseInstructions(definition.parse);
    /**
     * A flag to know whether the parse instructions where defined as an object (`true`) or
     * an array (`false`). This is for when the condition uses named groups to extract
     * parameters.
     * @type {Boolean}
     * @access protected
     * @ignore
     */
    this._parseAsGroups = Utils.isObject(this._parse);
  }
  /**
   * Validates an error message against the case condition and if it matches, it parses it in
   * order to return a formatted error.
   * @param {String}       errorMessage   The error message to validate and, possibly, parse.
   * @param {Array<Scope>} [scopes=[]]    A list of scopes from where the case can try to find
   *                                      reusable parsers.
   * @param {?Object}      [context=null] Custom context information about the error that can be
   *                                      sent to the formatted error.
   * @return {?FormattedError} If the condition doesn't match, it will return `null`.
   * @throws {Error} If the condition matches, parameters are extracted as named groups but the
   *                 case's `parse` instructions were defined as an array.
   * @throws {Error} If the condition matches, parameters are extracted as a list but the case's
   *                 `parse` instructions were defined as an object.
   * @throws {Error} If the condition matches, one of the parsers the case wants to use is
   *                 suppoused to be on one of the scopes but it can't be found.
   * @throws {Error} If the condition has a mix of named and unnamed groups.
   */
  parse(errorMessage, scopes = [], context = null) {
    let result;
    if (errorMessage.match(this._condition)) {
      result = this._useOriginal ?
        this._createError(errorMessage, [], Object.assign({}, context, { original: true })) :
        this._parseError(errorMessage, scopes, context);
    } else {
      result = null;
    }

    return result;
  }
  /**
   * The case name.
   * @type {String}
   */
  get name() {
    return this._name;
  }
  /**
   * The actual method that parses an error message once it matches the case condition.
   * @param {String}       errorMessage The error message to validate and, possibly, parse.
   * @param {Array<Scope>} scopes       A list of scopes from where the case can try to find
   *                                    reusable parsers.
   * @param {?Object}      context      Custom context information about the error that can be sent
   *                                    to the formatted error.
   * @return {FormattedError}
   * @throws {Error} If the parameters are extracted as named groups but the case's `parse`
   *                 instructions were defined as an array.
   * @throws {Error} If the parameters are extracted as a list but the case's `parse` instructions
   *                 were defined as an object.
   * @throws {Error} If the condition has a mix of named and unnamed groups.
   * @access protected
   * @ignore
   */
  _parseError(errorMessage, scopes, context) {
    let result;
    const extracted = this._extractParameters(errorMessage);
    if (extracted.groups) {
      if (this._parseAsGroups) {
        result = this._parseGroups(extracted.groups, scopes, context);
      } else {
        throw new Error(
          `The condition for the case '${this._name}' returned groups, but the 'parse' ` +
          'instructions were set on an \'array\' format'
        );
      }
    } else if (extracted.matches.length) {
      if (this._parseAsGroups) {
        throw new Error(
          `The condition for the case '${this._name}' didn't return groups, but the 'parse' ` +
          'instructions were set on an \'object\' format'
        );
      } else {
        result = this._parseList(extracted.matches, scopes, context);
      }
    } else {
      result = this._createError(this._message(), [], context);
    }

    return result;
  }
  /**
   * Parses named groups extracted from the case condition expression.
   * @param {Object}       groups  The named groups.
   * @param {Array<Scope>} scopes  A list of scopes from where the case can try to find
   *                               reusable parsers.
   * @param {?Object}      context Custom context information about the error that can be sent
   *                               to the formatted error.
   *
   * @return {Object} The new parameters, also named.
   * @access protected
   * @ignore
   */
  _parseGroups(groups, scopes, context) {
    const params = Object.keys(groups).reduce(
      (newParams, name) => {
        const value = groups[name];
        const parsers = this._parse[name];
        let newValue;
        if (parsers) {
          newValue = parsers.reduce(
            (currentValue, parser) => this._parseValue(parser, currentValue, scopes),
            value
          );
        } else {
          newValue = value;
        }

        return Object.assign({}, newParams, {
          [name]: newValue,
        });
      },
      {}
    );

    const message = this._message(params);
    return this._createError(message, params, context);
  }
  /**
   * Parses a list of parameters extracted from the case condition expression.
   * @param {Array<String>}  list   The list of parameters to parse.
   * @param {Array<Scope>}   scopes A list of scopes from where the case can try to find
   *                                reusable parsers.
   * @param {?Object}      context  Custom context information about the error that can be sent
   *                                to the formatted error.
   *
   * @return {Array}
   * @access protected
   * @ignore
   */
  _parseList(list, scopes, context) {
    const params = list.map((value, index) => {
      const parsers = this._parse[index];
      let newValue;
      if (parsers) {
        newValue = parsers.reduce(
          (currentValue, parser) => this._parseValue(parser, currentValue, scopes),
          value
        );
      } else {
        newValue = value;
      }

      return newValue;
    });

    const message = this._message(...params);
    return this._createError(message, params, context);
  }
  /**
   * Parses a single value using a given parser. The reason this is wrapped in a method is
   * because this functionality is independant of the type of parameters extracted (named or
   * unnamed groups).
   * @param {String|CaseParser} parser The name of a parser the needs to be found on the scopes or
   *                                   an actual parser to format the value.
   * @param {*}                 value  The value to parse.
   * @param {Array<Scope>}      scopes A list of scopes where parsers can be found.
   * @return {*} The parsed value.
   * @throws {Error} If the parser is a `string` and a parser with that name can't be found in any
   *                 of the scopes.
   * @access protected
   * @ignore
   */
  _parseValue(parser, value, scopes) {
    let result;
    if (typeof parser === 'string') {
      let scopeParser;
      scopes.some((scope) => {
        scopeParser = scope.getParser(parser, false);
        return scopeParser;
      });

      if (scopeParser) {
        result = scopeParser.parse(value);
      } else {
        throw new Error(
          `No parser with the name of '${parser}' could be found for the ` +
          `case '${this._name}'`
        );
      }
    } else {
      result = parser.parse(value);
    }

    return result;
  }
  /**
   * Creates a new instance of the {@link FormattedError} using the class sent on the case's
   * `constructor` options.
   * @param {String}       message  The error message.
   * @param {Object|Array} params   The parsed parameters Parserror found. When parsing a
   *                                case that uses named groups, the parameters are stored
   *                                on an `object`; otherwise, they'll be an `array`.
   * @param {?Object}      context  Any extra context information for the error.
   * @return {FormattedError}
   * @access protected
   * @ignore
   */
  _createError(message, params, context) {
    const { FormattedErrorClass } = this._options;
    return new FormattedErrorClass(message, params, context);
  }
  /**
   * Validates if one on the case's definition required properties is missing.
   * @param {ErrorCaseDefinition} definition The case definition settings.
   * @throws {Error} If one of the properties is missing.
   * @access protected
   * @ignore
   */
  _validateMissingProperties(definition) {
    const missing = [
      'name',
      'condition',
      'message',
    ]
    .find((property) => typeof definition[property] === 'undefined');
    if (missing && (missing !== 'message' || !definition.useOriginal)) {
      throw new Error(`The '${missing}' property is required on a case definition`);
    }
  }
  /**
   * Validates that the name the class intends to use is a `string`.
   * @param {String} name The name to validate.
   * @return {String}
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
   * Validates whether something can be used as the case's message.
   * @param {String|ErrorCaseMessage} message The value intended to be the case's message.
   * @return {ErrorCaseMessage}
   * @throws {Error} If the message is not a `function` nor a `string`.
   * @access protected
   * @ignore
   */
  _validateMessage(message) {
    let result;
    const type = typeof message;
    if (type === 'string') {
      result = () => message;
    } else if (type === 'function') {
      result = message;
    } else {
      throw new TypeError(
        `'${this._name}': 'message' can only be a 'string' or a 'function'`
      );
    }

    return result;
  }
  /**
   * Validates whether something can be used as the case's condition.
   * @param {String|RegExp} condition The value intended to be the case's condition.
   * @return {RegExp}
   * @throws {Error} If the condition is not a `string` nor a `RegExp`.
   * @access protected
   * @ignore
   */
  _validateCondition(condition) {
    let result;
    if (typeof condition === 'string') {
      result = new RegExp(Utils.escapeForRegExp(condition));
    } else if (condition instanceof RegExp) {
      result = condition;
    } else {
      throw new TypeError(
        `'${this._name}': 'condition' can only be a 'string' or a 'RegExp'`
      );
    }

    return result;
  }
  /**
   * Validates a dictionary of parsers so it can be used by the case.
   * @param {?Object} parsers A dictionary of reusable parsers.
   * @return {Object}
   * @throws {Error} If `parsers` is not an object.
   * @throws {Error} If a a value insde a parser is not an instance of {@link CaseParserClass},
   *                 an `object` nor a `function`.
   * @access protected
   * @ignore
   */
  _validateParsers(parsers) {
    let result;
    if (parsers) {
      if (!Utils.isObject(parsers)) {
        throw new TypeError(`'${this._name}': 'parsers' can only be an 'object'`);
      }

      const { CaseParserClass } = this._options;
      result = Object.keys(parsers).reduce(
        (newParsers, name) => Object.assign({}, newParsers, {
          [name]: this._validateParser(name, parsers[name], CaseParserClass),
        }),
        {}
      );
    } else {
      result = {};
    }

    return result;
  }
  /**
   * Validates and normalizes a parser intended to be used in the case.
   * @param {String}                          name             The name of the parser.
   * @param {CaseParserClass|Object|Function} parser           The parser definition.
   * @param {Class<CaseParser>}               CaseParserClass  To compare if the parser definition
   *                                                           is `instaceof`.
   * @return {CaseParserClass}
   * @throws {Error} If the `parser` is not an instance of {@link CaseParserClass}, an `object`
   *                 nor a `function`.
   * @access protected
   * @ignore
   */
  _validateParser(name, parser, CaseParserClass) {
    let result;
    if (parser instanceof CaseParserClass) {
      result = parser;
    } else {
      const isObject = Utils.isObject(parser);
      if (isObject || typeof parser === 'function') {
        result = new CaseParserClass(name, parser);
      } else {
        throw new TypeError(
          `'${this._name}' - '${name}': a parser can only be a 'function' or an 'object'`
        );
      }
    }

    return result;
  }
  /**
   * Validates and normalizes the parse instructions for the case.
   * @param {?Array|?Object} parse The list/map of instructions to validate.
   * @return {Array|Object}
   * @throws {Error} If the instructions are not an `array` nor an `object`.
   * @throws {Error} If an instruction is not a `function`, a `string` or an `array`.
   * @access protected
   * @ignore
   */
  _validateParseInstructions(parse) {
    let result;
    if (parse) {
      const { CaseParserClass } = this._options;
      if (Array.isArray(parse)) {
        result = parse.map((instruction, index) => Utils.ensureArray(
          this._validateParseInstruction(
            `${this._name}-parser-${index}`,
            instruction,
            CaseParserClass
          )
        ));
      } else if (Utils.isObject(parse)) {
        result = Object.keys(parse).reduce(
          (newParse, parameterName) => Object.assign({}, newParse, {
            [parameterName]: Utils.ensureArray(
              this._validateParseInstruction(
                `${this._name}-parser-${parameterName}`,
                parse[parameterName],
                CaseParserClass
              )
            ),
          }),
          {}
        );
      } else {
        throw new TypeError(
          `'${this._name}': 'parse' can only be an 'array' or an 'object'`
        );
      }
    } else {
      result = [];
    }

    return result;
  }
  /**
   * Validates and normalizes a single parse instruction.
   * @param {String}                id              The ID of the instruction. Internally generated
   *                                                by the case in order to have some reference
   *                                                for error messages.
   * @param {function|String|Array} instruction     The instruction to validate.
   * @param {Class<CaseParser>}     CaseParserClass The class used to create new parsers. If the
   *                                                instruction is a function, it will be converted
   *                                                into a parser.
   * @return {function|String|Array}
   * @throws {Error} If the instruction is not a `function`, a `string` or an `array`.
   * @access protected
   * @ignore
   */
  _validateParseInstruction(id, instruction, CaseParserClass) {
    let result;
    const type = typeof instruction;
    if (type === 'function') {
      result = new CaseParserClass(id, instruction);
    } else if (type === 'string') {
      if (this._parsers[instruction]) {
        result = this._parsers[instruction];
      } else {
        result = instruction;
      }
    } else if (Array.isArray(instruction)) {
      result = instruction.map((item, index) => this._validateParseInstruction(
        `${id}-sub-${index}`,
        item,
        CaseParserClass
      ));
    } else {
      throw new TypeError(
        `'${this._name}': a 'parse' instruction can only be ` +
        'an \'array\', a \'function\' or a \'string\''
      );
    }

    return result;
  }
  /**
   * Extracts the parameters from an error message using the case condition.
   * @param {String} errorMessage The message from where the parameters will be extracted.
   * @return {Object}           Only one of the properties will be returned
   * @property {?Array} matches If the expression extracted unnamed groups, this will be a list of
   *                            them.
   * @property {?Object} groups If the expression extracted named groups, this will be the
   *                            dictionary with them.
   * @throws {Error} If there's a mix of named and unnamed groups on the condition.
   * @access protected
   * @ignore
   */
  _extractParameters(errorMessage) {
    const match = Utils.execRegExp(this._condition, errorMessage);
    let result;
    const matches = match.slice().filter((item) => typeof item !== 'undefined');
    matches.shift();
    if (match.groups) {
      const groups = Object.assign({}, match.groups);
      const groupsLength = Object.keys(groups).length;
      if (groupsLength) {
        if (groupsLength !== matches.length) {
          throw new Error(
            `The condition for the case '${this._name}' is trying to extract parameters as ` +
            'named and unnamed groups, only one method is allowed'
          );
        } else {
          result = { groups };
        }
      } else {
        result = { matches };
      }
    } else {
      result = { matches };
    }

    return result;
  }
}

module.exports = ErrorCase;
