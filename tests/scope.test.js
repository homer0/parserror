jest.unmock('/src/scope');
jest.unmock('/src/errorCase');
jest.unmock('/src/caseParser');

require('jasmine-expect');
const Scope = require('/src/scope');
const ErrorCase = require('/src/errorCase');
const CaseParser = require('/src/caseParser');

describe('lib/Scope', () => {
  describe('constructor', () => {
    it('should throw an error when instantiated without a name', () => {
      // Given/When/Then
      expect(() => new Scope()).toThrow(/The 'name' can only be a 'string'/i);
    });

    it('should be instantiated', () => {
      // Given
      const name = 'myScope';
      let sut = null;
      // When
      sut = new Scope(name);
      // Then
      expect(sut).toBeInstanceOf(Scope);
      expect(sut.name).toBe(name);
    });
  });

  describe('cases', () => {
    it('should throw an error when trying to add a case that doesn\'t extend `ErrorCase`', () => {
      // Given/When/Then
      expect(() => (new Scope('myScope')).addCase({}))
      .toThrow(/The received case is not an instance of 'ErrorCase'/i);
    });

    it('should throw an error when trying to add a case with an already used name', () => {
      // Given
      class MyCase extends ErrorCase {}
      const myCase = new MyCase({
        name: 'name',
        condition: 'condition',
        message: 'message',
      });
      let sut = null;
      // When/Then
      sut = new Scope('myScope');
      sut.addCase(myCase);
      expect(() => sut.addCase(myCase))
      .toThrow(/The case name '\w+' is already being used on the scope '\w+'/);
    });

    it('should throw an error when trying to access a case that is not registered', () => {
      // Given/When/Then
      expect(() => (new Scope('myScope')).getCase('nop'))
      .toThrow(/The case '\w+' doesn't exist on the scope '\w+'/i);
    });

    it('should throw an error when trying to remove a case that is not registered', () => {
      // Given/When/Then
      expect(() => (new Scope('myScope')).removeCase('nop'))
      .toThrow(/The case '\w+' doesn't exist on the scope '\w+'/i);
    });

    it('should return a saved case', () => {
      // Given
      class MyCase extends ErrorCase {}
      const myCase = new MyCase({
        name: 'name',
        condition: 'condition',
        message: 'message',
      });
      let sut = null;
      let result = null;
      // When
      sut = new Scope('myScope');
      sut.addCase(myCase);
      result = sut.getCase(myCase.name);
      // Then
      expect(result).toBe(myCase);
    });

    it('should remove a saved case by its name', () => {
      // Given
      class MyCase extends ErrorCase {}
      const myCase = new MyCase({
        name: 'name',
        condition: 'condition',
        message: 'message',
      });
      let sut = null;
      let resultBeforeRemove = null;
      let resultAfterRemove = null;
      // When
      sut = new Scope('myScope');
      sut.addCase(myCase);
      resultBeforeRemove = sut.getCase(myCase.name);
      sut.removeCase(myCase.name);
      resultAfterRemove = sut.getCase(myCase.name, false);
      // Then
      expect(resultBeforeRemove).toBe(myCase);
      expect(resultAfterRemove).toBeNull();
    });

    it('should remove a saved case by its reference', () => {
      // Given
      class MyCase extends ErrorCase {}
      const myCase = new MyCase({
        name: 'name',
        condition: 'condition',
        message: 'message',
      });
      let sut = null;
      let resultBeforeRemove = null;
      let resultAfterRemove = null;
      // When
      sut = new Scope('myScope');
      sut.addCase(myCase);
      resultBeforeRemove = sut.getCase(myCase.name);
      sut.removeCase(myCase);
      resultAfterRemove = sut.getCase(myCase.name, false);
      // Then
      expect(resultBeforeRemove).toBe(myCase);
      expect(resultAfterRemove).toBeNull();
    });
  });

  describe('parsers', () => {
    it('should throw an error when trying to add a parser that doesn\'t extend `CaseParser`', () => {
      // Given/When/Then
      expect(() => (new Scope('myScope')).addParser({}))
      .toThrow(/The received parser is not an instance of 'CaseParser'/i);
    });

    it('should throw an error when trying to add a parser with an already used name', () => {
      // Given
      class MyParser extends CaseParser {}
      const myParser = new MyParser('name', () => {});
      let sut = null;
      // When/Then
      sut = new Scope('myScope');
      sut.addParser(myParser);
      expect(() => sut.addParser(myParser))
      .toThrow(/The parser name '\w+' is already being used on the scope '\w+'/);
    });

    it('should throw an error when trying to access a parser that is not registered', () => {
      // Given/When/Then
      expect(() => (new Scope('myScope')).getParser('nop'))
      .toThrow(/The parser '\w+' doesn't exist on the scope '\w+'/i);
    });

    it('should throw an error when trying to remove a parser that is not registered', () => {
      // Given/When/Then
      expect(() => (new Scope('myScope')).removeParser('nop'))
      .toThrow(/The parser '\w+' doesn't exist on the scope '\w+'/i);
    });

    it('should return a saved case', () => {
      // Given
      class MyParser extends CaseParser {}
      const myParser = new MyParser('name', () => {});
      let sut = null;
      let result = null;
      // When
      sut = new Scope('myScope');
      sut.addParser(myParser);
      result = sut.getParser(myParser.name);
      // Then
      expect(result).toBe(myParser);
    });

    it('should remove a saved case by its name', () => {
      // Given
      class MyParser extends CaseParser {}
      const myParser = new MyParser('name', () => {});
      let sut = null;
      let resultBeforeRemove = null;
      let resultAfterRemove = null;
      // When
      sut = new Scope('myScope');
      sut.addParser(myParser);
      resultBeforeRemove = sut.getParser(myParser.name);
      sut.removeParser(myParser.name);
      resultAfterRemove = sut.getParser(myParser.name, false);
      // Then
      expect(resultBeforeRemove).toBe(myParser);
      expect(resultAfterRemove).toBeNull();
    });

    it('should remove a saved case by its reference', () => {
      // Given
      class MyParser extends CaseParser {}
      const myParser = new MyParser('name', () => {});
      let sut = null;
      let resultBeforeRemove = null;
      let resultAfterRemove = null;
      // When
      sut = new Scope('myScope');
      sut.addParser(myParser);
      resultBeforeRemove = sut.getParser(myParser.name);
      sut.removeParser(myParser);
      resultAfterRemove = sut.getParser(myParser.name, false);
      // Then
      expect(resultBeforeRemove).toBe(myParser);
      expect(resultAfterRemove).toBeNull();
    });
  });
});
