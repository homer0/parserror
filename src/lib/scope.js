const CaseParser = require('./caseParser');
const ErrorCase = require('./errorCase');

class Scope {
  constructor(name) {
    this._name = name;
    this._cases = [];
    this._parsers = {};
  }

  addCase(theCase) {
    this._validateCase(theCase);
    if (this.hasCase(theCase.name)) {
      throw new Error(
        `The name '${theCase.name}' is already being used on the ` +
        `scope '${this._name}'`
      );
    }

    this._cases.push(theCase);
    return this;
  }

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
        `'${this._name}'`
      );
    }

    return this;
  }

  getCase(name, failWithError = true) {
    const theCase = this._cases.find((item) => item.name === name);
    if (!theCase && failWithError) {
      throw new Error(
        `The case '${name}' doesn't exist on the scope ` +
        `'${this._name}'`
      );
    }

    return theCase || null;
  }

  hasCase(name) {
    return this.getCase(name, false) !== null;
  }

  addParser(parser) {
    this._validateParser(parser);
    if (this.hasParser(parser.name)) {
      throw new Error(
        `The name '${parser.name}' is already being used on the ` +
        `scope '${this._name}'`
      );
    }

    this._parsers[parser.name] = parser;
    return this;
  }

  removeParser(parser) {
    let name;
    if (typeof parser === 'string') {
      name = parser;
    } else {
      this._validateParser(parser);
      ({ name } = parser);
    }

    if (this._parsers[name]) {
      const newParsers = Object.assign({}, this._parsers);
      delete newParsers[name];
      this._parsers = newParsers;
    } else {
      throw new Error(
        `The parser '${name}' doesn't exist on the scope ` +
        `'${this._name}'`
      );
    }

    return this;
  }

  getParser(name, failWithError = true) {
    const parser = this._parsers[name];
    if (!parser && failWithError) {
      throw new Error(
        `The parser '${name}' doesn't exist on the scope ` +
        `'${this._name}'`
      );
    }

    return parser || null;
  }

  hasParser(name) {
    return this.getParser(name, false) !== null;
  }

  _validateCase(theCase) {
    if (!(theCase instanceof ErrorCase)) {
      throw new TypeError('The received case is not an instance of \'ErrorCase\'');
    }
  }

  _validateParser(parser) {
    if (!(parser instanceof CaseParser)) {
      throw new TypeError('The received parsed is not an instance of \'ErrorCase\'');
    }
  }
}

module.exports = Scope;
