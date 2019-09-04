/**
 * A collection of generic utilities.
 */
class Utils {
  /**
   * Escapes a string to be used on `new RegExp(...)`.
   * @param {string} text The text to escape.
   * @return {string}
   * @static
   */
  static escapeForRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }
  /**
   * Copies a regular expression and, if specified, inject extra flags.
   * @param {RegExp} expression       The expression to copy.
   * @param {string} [injectFlags=''] Extra flags to add to the new expression. For example 'ig'.
   * @return {RegExp}
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
      baseFlags
    );

    return new RegExp(expression.source, flags.join(''));
  }
  /**
   * This is a simple wrapper for `RegExp.exec`. The reason for this wrapper is that it allows
   * me to mock it on the tests and add support for named groups, something that is not yet
   * available on the target version this project is for.
   * @param {RegExp} expression The regular expression to execute.
   * @param {String} text       The target text where the expression will be executed.
   * @return {?Array}
   * @static
   */
  static execRegExp(expression, text) {
    return expression.exec(text);
  }
  /**
   * Checks whether a target is a literal `object` or not.
   * @param {*} target The target to validate.
   * @return {Boolean}
   * @static
   */
  static isObject(target) {
    return Object.getPrototypeOf(target).constructor.name === 'Object';
  }
  /**
   * Ensures a given value is wrapped on an `array`.
   * @param {*} target The target to validate and, if necessary, wrap.
   * @return {Array}
   * @static
   */
  static ensureArray(target) {
    return Array.isArray(target) ? target : [target];
  }
}

module.exports = Utils;
