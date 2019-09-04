class Utils {
  /**
   * Escapes a string to be used on `new RegExp(...)`.
   * @param {string} text The text to escape.
   * @return {string}
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

  static execRegExp(expression, text) {
    return expression.exec(text);
  }

  static isObject(target) {
    return Object.getPrototypeOf(target).constructor.name === 'Object';
  }

  static ensureArray(target) {
    return Array.isArray(target) ? target : [target];
  }
}

module.exports = Utils;
