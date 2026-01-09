const logger = require('../config/logger');

module.exports = (err, req, res, next) => {
    // Esto enviará el detalle automáticamente a logs/error.log
    logger.error(`Mensaje: ${err.message} | Path: ${req.originalUrl} | Stack: ${err.stack}`);

    res.status(err.statusCode || 500).json({
        status: 'error',
        message: 'Error interno del servidor'
    });
};