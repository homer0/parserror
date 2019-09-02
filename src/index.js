class ErrorsTransformer {
  constructor() {
    this._globalScopeName = 'global';
    this._scopes = {};
    this._parsers = {};

    this._addScope(this._globalScopeName);
  }

  addCase(definition, scope = null) {
    this._validateCaseDefinitionMissingProperties(definition);
    const useScope = definition.scope || scope || this._globalScopeName;
    this._validateDuplicatedCaseDefinition(useScope, definition);
    const useCondition = this._validateCaseDefinitionCondition(definition);
    this._validateCaseDefinitionParsers(definition);
    this._validateCaseDefinitionParseInstructions(useScope, definition);

    this._addScope(useScope).cases[definition.name] = Object.assign({}, definition, {
      condition: useCondition,
      scope: useScope,
    });

    return this;
  }

  addCases(definitions, scope = null) {
    this._ensureArray(definitions).forEach((definition) => {
      this.addCase(definition, scope);
    });

    return this;
  }

  getCase(name, scope = null) {
    let useScope;
    if (scope) {
      if (this._scopes[scope]) {
        useScope = scope;
      } else {
        throw new Error(`The scope '${scope}' doesn't exist`);
      }
    } else {
      useScope = this._globalScopeName;
    }

    const theCase = this._scopes[useScope].cases[name];
    if (!theCase) {
      throw new Error(`The case '${name}' doesn't exist on the scope '${useScope}'`);
    }

    return theCase;
  }

  removeCase(name, scope = null) {
    const useName = this._isObject(name) ? name.name : name;
    const theCase = this.getCase(useName, scope);
    delete this._scopes[theCase.scope].cases[useName];
  }

  addScope(name, cases, options = {}) {
    const useOptions = Object.assign(
      {
        overwrite: false,
        removeCasesFromGlobalScope: false,
      },
      options
    );

    let deleteFirst = false;
    if (this._scopes[name]) {
      if (useOptions.overwrite) {
        deleteFirst = true;
      } else {
        throw new Error(
          `The scope '${name}' already exists. You can use 'removeScope' to remove ` +
          'it first, or set the \'overwrite\' option to \'true\''
        );
      }
    }

    const newCases = this._ensureArray(cases).map((caseName) => {
      let result;
      if (typeof caseName === 'string') {
        result = this.getCase(caseName);
      } else if (this._isObject(caseName)) {
        const newCaseScope = caseName.scope || null;
        if (newCaseScope === name) {
          throw new Error(
            'You cant set the \'scope\' property of a definition for a scope ' +
            `that is currently being created ('${name}')`
          );
        }

        const newCaseName = caseName.name;
        this.addCase(caseName);
        result = this.getCase(newCaseName, newCaseScope);
      } else {
        throw new Error(
          `When creating a new scope ('${name}'), you can only send names of existing cases ` +
          '(\'string\') or definitions to create new ones (\'object\')'
        );
      }

      return Object.assign({}, result, {
        scope: name,
      });
    });

    if (deleteFirst) {
      this.removeScope(name);
    }

    if (useOptions.removeCasesFromGlobalScope) {
      newCases.forEach((theCase) => {
        this.removeCase(theCase.name);
      });
    }

    this._addScope(name).cases.push(...newCases);

    return this;
  }

  removeScope(name) {
    if (name === this._globalScopeName) {
      throw new Error('You can\'t overwrite the global scope');
    }

    delete this._scopes[name];
  }

  _validateCaseDefinitionMissingProperties(definition) {
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

  _validateDuplicatedCaseDefinition(scope, definition) {
    if (this._scopes[scope] && this._scopes[scope].cases[definition.name]) {
      throw new Error(`The name '${definition.name}' is already used on the scope '${scope}'`);
    }
  }

  _validateCaseDefinitionCondition(definition) {
    let result;
    const { condition } = definition;
    if (typeof condition === 'string') {
      result = new RegExp(this._escapeForRegExp(condition));
    } else if (condition instanceof RegExp) {
      result = condition;
    } else {
      throw new Error(
        `The condition type for '${definition.name}' is invalid. ` +
        'It can only be \'string\' or \'RegExp\''
      );
    }

    return result;
  }

  _validateCaseDefinitionParsers(definition) {
    const { parsers } = definition;
    if (parsers) {
      if (!this._isObject(parsers)) {
        throw new Error('The \'parsers\' property can only be an \'object\'');
      }

      Object.keys(parsers)
      .forEach((name) => this._validateParser(name, parsers[name]));
    }
  }

  _validateParser(name, parser) {
    const isObject = this._isObject(parser);
    if (!isObject && typeof parser !== 'function') {
      throw new Error(
        `The type of the '${name}' parser is invalid. ` +
        'It can only be a \'function\' or an \'object\''
      );
    } else if (isObject) {
      const mapKeys = Object.keys(parser);
      if (!mapKeys.length) {
        throw new Error(
          `The '${name}' parser is empty. ` +
          'It should include at least one object to map'
        );
      }
    }

    return true;
  }

  _validateCaseDefinitionParseInstructions(scope, definition) {
    if (definition.parse && !Array.isArray(definition.parse)) {
      throw new Error('The \'parse\' property can only be an \'array\'');
    } else if (definition.parse) {
      const missingParser = this._findMissingParser(
        scope,
        definition.parse,
        definition.parsers
      );

      if (missingParser) {
        throw new Error(`The parser '${missingParser}' couldn't be found`);
      }
    }
  }

  _findMissingParser(scope, parseInstructions, parsers = {}) {
    let missingSubParser;
    const missingParser = parseInstructions.find((instruction) => {
      let result = true;
      const type = typeof instruction;
      if (type === 'function') {
        result = false;
      } else if (type === 'string') {
        if (parsers[instruction]) {
          result = false;
        } else if (
          this._scopes[scope] &&
          this._scopes[scope].parsers[instruction]
        ) {
          result = false;
        }
      } else if (Array.isArray(instruction)) {
        const missingSub = this._findMissingParser(scope, instruction, parsers);
        if (missingSub) {
          missingSubParser = missingSub;
        } else {
          result = false;
        }
      }

      return result;
    });

    return missingSubParser || missingParser || null;
  }

  _addScope(name) {
    if (!this._scopes[name]) {
      this._scopes[name] = {
        cases: {},
        parsers: {},
      };
    }

    return this._scopes[name];
  }

  _escapeForRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  _isObject(target) {
    return typeof target === 'object' && !Array.isArray(target);
  }

  _ensureArray(target) {
    return Array.isArray(target) ? target : [target];
  }
}

module.exports = ErrorsTransformer;
