const Utils = require('./utils');
const CaseParser = require('./caseParser');
const FormattedError = require('./formattedError');

class ErrorCase {
  constructor(definition, options = {}) {
    this._options = Object.assign(
      {
        CaseParserClass: CaseParser,
        FormattedErrorClass: FormattedError,
      },
      options
    );

    this._validateMissingProperties(definition);

    this._name = definition.name;
    this._message = this._validateMessage(definition.message);
    this._condition = this._validateCondition(definition.condition);
    this._parsers = this._validateParsers(definition.parsers);
    this._parse = this._validateParseInstructions(definition.parse);
    this._parseGroups = Utils.isObject(this._parse);
  }

  process(errorMessage, scopes = [], context = null) {
    let result;
    if (errorMessage.match(this._condition)) {
      result = this._process(errorMessage, scopes, context);
    } else {
      result = null;
    }

    return result;
  }

  get name() {
    return this._name;
  }

  _process(errorMessage, scopes, context) {
    let result;
    const extracted = this._extractParameters(errorMessage);
    if (extracted.groups) {
      if (this._parseGroups) {
        result = this._processGroups(extracted.groups, scopes, context);
      } else {
        throw new Error(
          `The condition for the case '${this._name}' returned groups, but the 'parse' ` +
          'instructions were set on an \'array\' format'
        );
      }
    } else if (extracted.matches.length) {
      if (this._parseGroups) {
        throw new Error(
          `The condition for the case '${this._name}' didn't return groups, but the 'parse' ` +
          'instructions were set on an \'object\' format'
        );
      } else {
        result = this._processList(extracted.matches, scopes, context);
      }
    } else {
      result = this._createError(this._message(), [], context);
    }

    return result;
  }

  _processGroups(groups, scopes, context) {
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

  _processList(list, scopes, context) {
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

  _createError(message, params, context) {
    const { FormattedErrorClass } = this._options;
    return new FormattedErrorClass(message, params, context);
  }

  _validateMissingProperties(definition) {
    const missing = [
      'name',
      'condition',
      'message',
    ]
    .find((property) => typeof definition[property] === 'undefined');
    if (missing) {
      throw new Error(`The '${missing}' property is required on a case definition`);
    }
  }

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
