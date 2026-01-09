const logger = require('../config/logger');

module.exports = (req, res, next) => {
    // Registramos la entrada de la petición
    logger.info(`Petición entrante: ${req.method} ${req.originalUrl}`);
    next();
};