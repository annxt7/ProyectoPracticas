const logger = require('../config/logger');

module.exports = (req, res, next) => {

    logger.info(`Petición entrante: ${req.method} ${req.originalUrl}`);
    next();
};