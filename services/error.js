const Logger = require('./logger');
const logger = new Logger();
class Error {
  constructor() {
    this.ErrorTypes = [
      "Async Server Process Error"
    ];
  }
  throw(err) {
    throw new Error(err);
  }
  logError(code, err) {
    let type = this.ErrorTypes[code];
    logger.error(`${type} - ${err}`);
    console.error(type, err);
  }
}
module.exports = new Error()