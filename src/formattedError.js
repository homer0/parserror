class FormattedError extends Error {
  constructor(message, params = {}, context = null) {
    super(message);
    this.params = Object.freeze(params);
    this.context = Object.freeze(context || {});

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = FormattedError;
