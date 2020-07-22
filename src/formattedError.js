/**
 * A custom version of `Error` so the Parserror can store the parsing parameters and some
 * context information.
 *
 * @augments Error
 */
class FormattedError extends Error {
  /**
   * @param {string} message
   * The error message.
   * @param {Object.<string,string>|string[]} [params={}]
   * The parsed parameters Parserror. When parsing a case that uses named groups, the parameters
   * are stored on an `object`; otherwise, they'll be an `array`.
   * @param {?Object} [context=null]
   * Any extra context information for the error.
   */
  constructor(message, params = {}, context = null) {
    super(message);
    /**
     * The parsed parameters Parserror found. When parsing a case that uses named groups, the
     * parameters are stored on an `object`; otherwise, they'll be an `array`.
     *
     * @type {Object.<string,string>|string[]}
     * @todo Remove `Object.freeze`.
     */
    this.params = Object.freeze(params);
    /**
     * Any extra context information for the error.
     *
     * @type {Object}
     * @todo Remove `Object.freeze`.
     */
    this.context = Object.freeze(context || {});

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = FormattedError;
