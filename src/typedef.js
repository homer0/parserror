/**
 * @external Class
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
 */

/**
 * @typedef {import('./caseParser')} CaseParser
 * @typedef {import('./errorCase')} ErrorCase
 * @typedef {import('./formattedError')} FormattedError
 * @typedef {import('./parserror')} Parserrror
 * @typedef {import('./scope')} Scope
 * @typedef {import('./utils')} Utils
 */

/**
 * A simple object to check what kind of parser it's.
 *
 * @typedef {Object} CaseParserType
 * @property {boolean} map      Whether or not the parser is an `object` map.
 * @property {boolean} function Whether or not the parser is a `function`.
 */

/**
 * A function that generates a formatted message for an error.
 *
 * @callback ErrorCaseMessage
 * @returns {string}
 */

/**
 * @typedef {CaseParser|Object.<string,string>|Function} ParserLike
 */

/**
 * @typedef {string|RegExp|ErrorCaseDefinition} Condition
 */

/**
 * @callback InstructionFn
 * @param {*} value The value captured from the error that needs to formatted.
 * @returns {*}
 */

/**
 * @typedef {string|InstructionFn} Instruction
 */

/**
 * @typedef {Array<Instruction|Instruction[]>} InstructionList
 * @typedef {InstructionList|Object.<string,InstructionList>} InstructionListLike
 */

/**
 * The required properties to create a new {@link ErrorCase}.
 *
 * @typedef {Object} ErrorCaseDefinition
 * @property {string} name
 * The name of the case.
 * @property {ErrorCaseDefinition|string} message
 * The formatted message or the `function` that generates one.
 * @property {RegExp|string} condition
 * A `string` or a expression to match against an error that could be parsed.
 * @property {?Object.<string,ParserLike>} parsers
 * A map of reusable parsers. Each parser can be an `object` map, a `function` or an instance
 * of {@link CaseParser}.
 * @property {?InstructionListLike} parse
 * A list of parsers the case should use on extracted parameters. Each item of the list can be
 * either the name of a parser defined on `parsers`, the name of a parser on the scope, a
 * `function` to parse a value, or an `array` of all the thing previously mentioned.
 * @property {?boolean} useOriginal
 * Whether or not the case should use the original message when matched.
 */

/**
 * The options to customize how the class behaves.
 *
 * @typedef {Object} ErrorCaseOptions
 * @property {Class<CaseParser>}     CaseParserClass     The class to be used to create a parser.
 * @property {Class<FormattedError>} FormattedErrorClass The class to be used to create a custom
 *                                                       error after a message is parsed.
 */

/**
 * The options to customize how the class behaves.
 *
 * @typedef {Object} ParserrorOptions
 * @property {Class<CaseParser>}     CaseParserClass        The class that will be used to create
 *                                                          parsers. It will also be sent down to
 *                                                          every case that gets created, on its
 *                                                          `option` parameter.
 * @property {Class<ErrorCase>}      ErrorCaseClass         The class that will be used to create
 *                                                          cases.
 * @property {Class<FormattedError>} FormattedErrorClass    The class that will be used to create
 *                                                          formatted errors. It will also be sent
 *                                                          down to every case that gets created,
 *                                                          on its `options` parameter.
 * @property {Class<Scope>}          ScopeClass             The class that will be used to create
 *                                                          scopes.
 * @property {string[]}              errorContextProperties A list of properties the class will try
 *                                                          to find on given errors in order to use
 *                                                          as context information for
 *                                                          {@link ErrorCase} and
 *                                                          {@link FormattedError}.
 */

/**
 * An object with a signature similar to an {@link Error} that {@link Parserror} can parse.
 *
 * @typedef {Object} ParserrorErrorObject
 * @property {string} message The error message.
 */

/**
 * The options that can be used to customize how {@link Parserror#parse} works.
 *
 * @typedef {Object} ParserrorParseOptions
 * @property {string[]} cases    A list of specific cases it should validated against.
 * @property {string[]} scopes   A list of specific scopes it should use to valdiate the error.
 * @property {?string}  fallback A fallback message in case the error can't be parsed.
 *                               If not specified, the returned error will maintain the original
 *                               message.
 */

/**
 * A pre configured parser to format errors with specific cases and/or scopes.
 *
 * @callback ParserrorWrapper
 * @param {Error|string|ParserrorErrorObject} error
 * The error to parse.
 * @param {?string} [fallback=null]
 * A fallback message in case the error can't be parsed. If not specified, the returned
 * error will maintain the original message.
 * @returns {FormattedError}
 */
