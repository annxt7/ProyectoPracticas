const winston = require('winston');

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json() // Formato JSON es mejor para archivos
);

const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        // 1. ARCHIVO SOLO PARA ERRORES
        // Aquí solo se guardará lo que mandes con logger.error()
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error' 
        }),

        // 2. ARCHIVO PARA TODO EL HISTORIAL
        // Guarda info, warn y error juntos
        new winston.transports.File({ 
            filename: 'logs/combined.log' 
        })
    ]
});

// 3. SALIDA POR CONSOLA (Para ver en tiempo real mientras programas)
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

module.exports = logger;