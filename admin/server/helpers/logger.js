const winston = require("winston");
const path = require("path");

const { isSecondaryOmb } = require("./env");
const { isValidString } = require("./validator");

var PROJECT_ROOT = path.join(__dirname, "..");

const options = {
  file: {
    level: "debug",
    filename: isSecondaryOmb() ? "./logs/omb.log" : "./logs/app.log",
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  console: {
    level: "debug",
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

function getRequestLogFormatter() {
  const { combine, timestamp, json, printf } = winston.format;

  return combine(
    timestamp() /*,
        json() */,
    printf((info) => {
      sMsg = info.timestamp + " " + info.level + ": " + info.message;
      if (isValidString(info.method)) {
        sMsg +=
          " " + info.method + " " + info.host + " " + info.url + " " + info.status + " " + info.contentLength + " " + info.responseTime;
      }
      if (isValidString(info.body)) {
        sMsg += "\n" + info.body;
      }
      return sMsg;
    })
  );
}

const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  transports: [
    new winston.transports.File(options.file),
    // new winston.transports.Console(options.console),
  ],
  format: getRequestLogFormatter(),
  exitOnError: false,
});

// this allows winston to handle output from express' morgan middleware
logger.stream = {
  write: function (message) {
    logger.info(message);
  },
};

// A custom logger interface that wraps winston, making it easy to instrument
// code and still possible to replace winston in the future.

module.exports.debug = module.exports.log = function () {
  logger.debug.apply(logger, formatLogArguments(arguments));
};

module.exports.info = function () {
  logger.info.apply(logger, formatLogArguments(arguments));
};

module.exports.warn = function () {
  logger.warn.apply(logger, formatLogArguments(arguments));
};

module.exports.error = function () {
  logger.error.apply(logger, formatLogArguments(arguments));
};

module.exports.stream = logger.stream;

/**
 * Attempts to add file and line number info to the given log arguments.
 */
function formatLogArguments(args) {
  args = Array.prototype.slice.call(args);

  var stackInfo = getStackInfo(1);

  if (stackInfo) {
    // get file path relative to project root
    var calleeStr = "(" + stackInfo.relativePath + ":" + stackInfo.line + ")";

    if (typeof args[0] === "string") {
      args[0] = calleeStr + " " + args[0];
    } else {
      args.unshift(calleeStr);
    }
  }

  return args;
}

/**
 * Parses and returns info about the call stack at the given index.
 */
function getStackInfo(stackIndex) {
  // get call stack, and analyze it
  // get all file, method, and line numbers
  var stacklist = new Error().stack.split("\n").slice(3);

  // stack trace format:
  // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
  // do not remove the regex expresses to outside of this method (due to a BUG in node.js)
  var stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi;
  var stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi;

  var s = stacklist[stackIndex] || stacklist[0];
  var sp = stackReg.exec(s) || stackReg2.exec(s);

  if (sp && sp.length === 5) {
    return {
      method: sp[1],
      relativePath: path.relative(PROJECT_ROOT, sp[2]),
      line: sp[3],
      pos: sp[4],
      file: path.basename(sp[2]),
      stack: stacklist.join("\n"),
    };
  }
}

// module.exports = logger;
