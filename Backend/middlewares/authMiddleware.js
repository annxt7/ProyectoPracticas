const jwt = require('jsonwebtoken');
const logger = require('../config/logger'); // Importamos tu nuevo logger

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    
    logger.warn(`Intento de acceso sin token desde IP: ${req.ip}`);
    return res.status(403).json({ error: "Acceso denegado: Token requerido" });
  }

  const token = authHeader.split(' ')[1]; 

  if (!token) {
    logger.warn(`Formato de token inválido desde IP: ${req.ip}`);
    return res.status(403).json({ error: "Formato de token inválido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    // Si el token está manipulado o expirado, lo registramos como error para seguimiento
    logger.error(`Error de autenticación JWT: ${error.message} | IP: ${req.ip}`);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

module.exports = { verifyToken };