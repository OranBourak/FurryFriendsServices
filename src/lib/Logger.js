
const chalk = require("chalk");

/**
 * @class Logging
 * @classdesc Provides methods for logging messages with severity levels and color-coding.
 */
class Logger {
    /**
     * Logs an informational message.
     * Alias for `Logging.info()`.
     *
     * @static
     * @param {string|Object} args - The message or object to log.
     * @example
     * @return {undefined}
     * Logging.log("This is an informational message.");
     */
    static log = (args) => this.info(args);

    /**
     * Logs an informational message.
     *
     * @static
     * @param {string|Object} args - The message or object to log.
     * @return {undefined}
     * @example
     * Logging.info("This is an informational message.");
     */
    static info = (args) =>
        console.log(
            chalk.blue(`[${new Date().toLocaleString()}] [INFO]`),
            typeof args === "string" ? chalk.blueBright(args) : args,
        );

    /**
     * Logs a warning message.
     *
     * @static
     * @param {string|Object} args - The message or object to log.
     * @return {undefined}
     * @example
     * Logging.warn("This is a warning message.");
     */
    static warn = (args) =>
        console.log(
            chalk.yellow(`[${new Date().toLocaleString()}] [WARN]`),
            typeof args === "string" ? chalk.yellowBright(args) : args,
        );

    /**
     * Logs an error message.
     *
     * @static
     * @param {string|Object} args - The message or object to log.
     * @return {undefined}
     * @example
     * Logging.error("This is an error message.");
     */
    static error = (args) =>
        console.log(
            chalk.red(`[${new Date().toLocaleString()}] [ERROR]`),
            typeof args === "string" ? chalk.redBright(args) : args,
        );
}

module.exports = Logger;
