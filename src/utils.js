/**
 * A collection of generic utilities.
 */
class Utils {
  /**
   * Copies a regular expression and, if specified, inject extra flags.
   *
   * @param {RegExp} expression       The expression to copy.
   * @param {string} [injectFlags=''] Extra flags to add to the new expression. For example 'ig'.
   * @returns {RegExp}
   * @static
   */
  static copyRegExp(expression, injectFlags = '') {
    const baseFlags = injectFlags.split('').map((flag) => flag.toLowerCase());
    const flagsAndProps = [
      {
        property: 'global',
        flag: 'g',
      },
      {
        property: 'ignoreCase',
        flag: 'i',
      },
      {
        property: 'multiline',
        flag: 'm',
      },
    ];

    const flags = flagsAndProps.reduce(
      (currentFlags, info) => (
        expression[info.property] && !currentFlags.includes(info.flag) ?
          [...currentFlags, info.flag] :
          currentFlags
      ),
      baseFlags,
    );

    return new RegExp(expression.source, flags.join(''));
  }
  /**
   * Ensures a given value is wrapped on an `array`.
   *
   * @param {T|T[]} target The target to validate and, if necessary, wrap.
   * @returns {T[]}
   * @template T
   * @static
   */
  static ensureArray(target) {
    return Array.isArray(target) ? target : [target];
  }
  /**
   * Escapes a string to be used on `new RegExp(...)`.
   *
   * @param {string} text The text to escape.
   * @returns {string}
   * @static
   */
  static escapeForRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }
  /**
   * This is a simple wrapper for `RegExp.exec`. The reason for this wrapper is that it allows
   * me to mock it on the tests and add support for named groups, something that is not yet
   * available on the target version this project is for.
   *
   * @param {RegExp} expression The regular expression to execute.
   * @param {string} text       The target text where the expression will be executed.
   * @returns {?Array}
   * @static
   */
  static execRegExp(expression, text) {
    return expression.exec(text);
  }
  /**
   * Generates a unique random string.
   *
   * @param {number} length The required length of the string.
   * @returns {string}
   * @static
   */
  static getRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZabcdefghijklmnñopqrstuvwxyz0123456789';
    return (new Array(length))
    .fill('')
    .reduce((acc) => acc + chars.charAt(Math.floor(Math.random() * chars.length)), '');
  }
  /**
   * Checks whether a target is a literal `object` or not.
   *
   * @param {*} target The target to validate.
   * @returns {boolean}
   * @static
   */
  static isObject(target) {
    return Object.getPrototypeOf(target).constructor.name === 'Object';
  }
}

module.exports = Utils;
