jest.unmock('/src/index');

require('jasmine-expect');
const ErrorsTransformer = require('/src/index');

describe('errors-transformer', () => {
  it('should be instantiated', () => {
    // Given
    let sut = null;
    // When
    sut = new ErrorsTransformer();
    // Then
    expect(sut).toBeInstanceOf(ErrorsTransformer);
  });

  describe('addCase', () => {
    it('should throw an error when a required property is missing', () => {
      // Given
      let sut = null;
      // When/Then
      sut = new ErrorsTransformer();
      expect(() => sut.addCase({})).toThrow(/The 'name' property is required/i);
    });

    it('should throw an error when `condition` is not a string nor a regex', () => {
      // Given
      const definition = {
        name: 'my-case',
        condition: [],
        message: 'my-message',
      };
      let sut = null;
      // When/Then
      sut = new ErrorsTransformer();
      expect(() => sut.addCase(definition)).toThrow(/It can only be 'string' or 'RegExp'/i);
    });

    it('should throw an error when `parsers` is not an object', () => {
      // Given
      const definition = {
        name: 'my-case',
        condition: 'something',
        message: 'my-message',
        parsers: [],
      };
      let sut = null;
      // When/Then
      sut = new ErrorsTransformer();
      expect(() => sut.addCase(definition))
      .toThrow(/The 'parsers' property can only be an 'object'/i);
    });

    it('should throw an error when a parser is not an object nor a function', () => {
      // Given
      const definition = {
        name: 'my-case',
        condition: 'something',
        message: 'my-message',
        parsers: {
          myParser: 'x',
        },
      };
      let sut = null;
      // When/Then
      sut = new ErrorsTransformer();
      expect(() => sut.addCase(definition))
      .toThrow(/It can only be a 'function' or an 'object'/i);
    });

    it('should throw an error when a parser is an empty object', () => {
      // Given
      const definition = {
        name: 'my-case',
        condition: 'something',
        message: 'my-message',
        parsers: {
          myParser: {},
        },
      };
      let sut = null;
      // When/Then
      sut = new ErrorsTransformer();
      expect(() => sut.addCase(definition))
      .toThrow(/It should include at least one object to map/i);
    });

    it('should throw an error when `parse` is not an array', () => {
      // Given
      const definition = {
        name: 'my-case',
        condition: 'something',
        message: 'my-message',
        parse: 'x',
        parsers: {
          myParser: {
            x: 'y',
          },
        },
      };
      let sut = null;
      // When/Then
      sut = new ErrorsTransformer();
      expect(() => sut.addCase(definition))
      .toThrow(/The 'parse' property can only be an 'array'/i);
    });

    it('should throw an error when `parse` includes an invalid parser', () => {
      // Given
      const definition = {
        name: 'my-case',
        condition: 'something',
        message: 'my-message',
        parse: ['invalid'],
        parsers: {
          myParser: {
            x: 'y',
          },
        },
      };
      let sut = null;
      // When/Then
      sut = new ErrorsTransformer();
      expect(() => sut.addCase(definition))
      .toThrow(/The parser 'invalid' couldn't be found/i);
    });

    it('should throw an error when there\'s a case with the same name on the same scope', () => {
      // Given
      const definition = {
        name: 'my-case',
        condition: 'something',
        message: 'my-message',
      };
      let sut = null;
      // When/Then
      sut = new ErrorsTransformer();
      sut.addCase(definition);
      expect(() => sut.addCase(definition))
      .toThrow(/is already used/i);
    });

    it('should add a case to the global scope', () => {
      // Given
      const definition = {
        name: 'my-case',
        condition: 'something',
        message: 'my-message',
      };
      let sut = null;
      let result = null;
      // When
      sut = new ErrorsTransformer();
      sut.addCase(definition);
      result = sut.getCase(definition.name);
      // Then
      expect(result).toEqual({
        name: definition.name,
        condition: expect.any(RegExp),
        message: definition.message,
        scope: 'global',
      });
    });

    it('should add a case to a custom scope', () => {
      // Given
      const definition = {
        name: 'my-case',
        condition: /something/i,
        message: 'my-message',
        scope: 'my-scope',
      };
      let sut = null;
      let result = null;
      // When
      sut = new ErrorsTransformer();
      sut.addCase(definition);
      result = sut.getCase(definition.name, definition.scope);
      // Then
      expect(result).toEqual(definition);
    });

    it('should add a case to the global scope with a custom parser', () => {
      // Given
      const definition = {
        name: 'my-case',
        condition: /column (\w+) is unique/,
        message: (field) => `The ${field} property is unique`,
        parse: ['field'],
        parsers: {
          field: {
            id: {
              label: 'identifier',
            },
          },
        },
      };
      let sut = null;
      let result = null;
      // When
      sut = new ErrorsTransformer();
      sut.addCase(definition);
      result = sut.getCase(definition.name);
      // Then
      expect(result).toEqual({
        name: definition.name,
        condition: expect.any(RegExp),
        message: definition.message,
        scope: 'global',
        parse: definition.parse,
        parsers: definition.parsers,
      });
    });
  });

  describe('addCases', () => {
    it('should add multiple cases at once', () => {
      const definitionOne = {
        name: 'my-case',
        condition: 'something',
        message: 'my-message',
      };
      const definitionTwo = {
        name: 'my-other-case',
        condition: 'something-else',
        message: 'my-other-message',
        scope: 'my-scope',
      };
      let sut = null;
      let resultOne = null;
      let resultTwo = null;
      // When
      sut = new ErrorsTransformer();
      sut.addCases([definitionOne, definitionTwo]);
      resultOne = sut.getCase(definitionOne.name, definitionOne.scope);
      resultTwo = sut.getCase(definitionTwo.name, definitionTwo.scope);
      // Then
      expect(resultOne).toEqual({
        name: definitionOne.name,
        condition: expect.any(RegExp),
        message: definitionOne.message,
        scope: 'global',
      });
      expect(resultTwo).toEqual({
        name: definitionTwo.name,
        condition: expect.any(RegExp),
        message: definitionTwo.message,
        scope: definitionTwo.scope,
      });
    });

    it('should support addint a single case', () => {
      // Given
      const definition = {
        name: 'my-case',
        condition: 'something',
        message: 'my-message',
      };
      let sut = null;
      let result = null;
      // When
      sut = new ErrorsTransformer();
      sut.addCases(definition);
      result = sut.getCase(definition.name);
      // Then
      expect(result).toEqual({
        name: definition.name,
        condition: expect.any(RegExp),
        message: definition.message,
        scope: 'global',
      });
    });
  });

  describe('getCase', () => {
    it('should throw an error when the case doesn\'t exist', () => {
      // Given
      let sut = null;
      // When/Then
      sut = new ErrorsTransformer();
      expect(() => sut.getCase('some-case')).toThrow(/doesn't exist on the scope/i);
    });

    it('should throw an error when the scope doesn\'t exist', () => {
      // Given
      let sut = null;
      // When/Then
      sut = new ErrorsTransformer();
      expect(() => sut.getCase('some-case', 'some-scope'))
      .toThrow(/the scope 'some-scope' doesn't exist/i);
    });
  });

  describe('removeCase', () => {
    it('should delete a case from the global scope using its name', () => {
      // Given
      const definition = {
        name: 'my-case',
        condition: 'something',
        message: 'my-message',
      };
      let sut = null;
      let result = null;
      // When/Then
      sut = new ErrorsTransformer();
      sut.addCase(definition);
      result = sut.getCase(definition.name);
      sut.removeCase(definition.name);
      expect(() => sut.getCase(definition.name)).toThrow(/doesn't exist on the scope/i);
      // Then
      expect(result).toEqual({
        name: definition.name,
        condition: expect.any(RegExp),
        message: definition.message,
        scope: 'global',
      });
    });

    it('should delete a case from the global scope using the object', () => {
      // Given
      const definition = {
        name: 'my-case',
        condition: 'something',
        message: 'my-message',
      };
      let sut = null;
      let result = null;
      // When/Then
      sut = new ErrorsTransformer();
      sut.addCase(definition);
      result = sut.getCase(definition.name);
      sut.removeCase(result);
      expect(() => sut.getCase(definition.name)).toThrow(/doesn't exist on the scope/i);
      // Then
      expect(result).toEqual({
        name: definition.name,
        condition: expect.any(RegExp),
        message: definition.message,
        scope: 'global',
      });
    });

    it('should delete a case from a custom scope using its name', () => {
      // Given
      const definition = {
        name: 'my-case',
        condition: 'something',
        message: 'my-message',
        scope: 'my-scope',
      };
      let sut = null;
      let result = null;
      // When/Then
      sut = new ErrorsTransformer();
      sut.addCase(definition);
      result = sut.getCase(definition.name, definition.scope);
      sut.removeCase(definition.name, definition.scope);
      expect(() => sut.getCase(definition.name, definition.scope))
      .toThrow(/doesn't exist on the scope/i);
      // Then
      expect(result).toEqual({
        name: definition.name,
        condition: expect.any(RegExp),
        message: definition.message,
        scope: definition.scope,
      });
    });
  });
});
