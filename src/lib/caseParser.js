const Utils = require('./utils');

class CaseParser {
  constructor(name, parser) {
    this._name = this._validateName(name);
    this._map = null;
    this._function = null;
    this._parserType = this._validateParserType(parser);

    if (this._parserType.map) {
      this._map = parser;
    } else {
      this._function = parser;
    }
  }

  parse(value) {
    let result;
    if (this.is.map) {
      const extend = Utils.isObject(value) && typeof value.raw !== 'undefined';
      const useValue = extend ? value.raw : value;
      if (this._map[useValue]) {
        if (extend) {
          result = Object.assign({}, value, this._map[useValue]);
        } else {
          result = Object.assign({ raw: useValue }, this._map[useValue]);
        }
      }
    } else {
      result = this._function(value);
    }

    return result || value;
  }

  get is() {
    return this._parserType;
  }

  get name() {
    return this._name;
  }

  _validateName(name) {
    if (typeof name !== 'string') {
      throw new Error('The \'name\' can only be a \'string\'');
    }

    return name;
  }

  _validateParserType(parser) {
    const result = {
      map: false,
      function: false,
    };
    const isObject = Utils.isObject(parser);
    if (isObject) {
      const mapKeys = Object.keys(parser);
      if (mapKeys.length) {
        result.map = true;
      } else {
        throw new Error(
          `'${this._name}': the parser is empty. It should include at least one item to map`
        );
      }
    } else if (typeof parser === 'function') {
      result.function = true;
    } else {
      throw new TypeError(
        `'${this._name}': the 'parser' parameter can only be a 'string' ` +
        'or a \'function\''
      );
    }

    return result;
  }
}

module.exports = CaseParser;
