jest.unmock('../src/formattedError');

const FormattedError = require('../src/formattedError');

const originalCaptureStackTrace = Error.captureStackTrace;

describe('FormattedError', () => {
  afterEach(() => {
    Error.captureStackTrace = originalCaptureStackTrace;
  });

  it('should be instantiated', () => {
    // Given
    const message = 'Something went wrong!';
    let sut = null;
    // When
    sut = new FormattedError(message);
    // Then
    expect(sut).toBeInstanceOf(FormattedError);
    expect(sut).toBeInstanceOf(Error);
    expect(sut.message).toBe(message);
    expect(sut.params).toEqual({});
    expect(sut.context).toEqual({});
  });

  it('should be instantiated with paramters', () => {
    // Given
    const message = 'Something went wrong!';
    const paramters = {
      age: 3,
      name: 'Rosario',
      status: 500,
    };
    let sut = null;
    // When
    sut = new FormattedError(message, paramters);
    // Then
    expect(sut).toBeInstanceOf(FormattedError);
    expect(sut.message).toBe(message);
    expect(sut.params).toEqual(paramters);
    expect(sut.context).toEqual({});
  });

  it('should be instantiated with context information', () => {
    // Given
    const message = 'Something went wrong!';
    const context = {
      age: 3,
      name: 'Rosario',
      status: 500,
    };
    let sut = null;
    // When
    sut = new FormattedError(message, {}, context);
    // Then
    expect(sut).toBeInstanceOf(FormattedError);
    expect(sut.message).toBe(message);
    expect(sut.params).toEqual({});
    expect(sut.context).toEqual(context);
  });

  it('should use `captureStackTrace` when avaiable', () => {
    // Given
    const captureStackTrace = jest.fn();
    Error.captureStackTrace = captureStackTrace;
    let sut = null;
    // When
    sut = new FormattedError('With stack trace');
    Error.captureStackTrace = null;
    // eslint-disable-next-line no-new
    new FormattedError('Without stack trace');
    // Then
    expect(captureStackTrace).toHaveBeenCalledTimes(1);
    expect(captureStackTrace).toHaveBeenCalledWith(sut, sut.constructor);
  });
});
