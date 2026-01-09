const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(403).json({ error: "Acceso denegado: Token requerido" });
  }

  // Estándar estricto: Se espera "Bearer <token>"
  const token = authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(403).json({ error: "Formato de token inválido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    // Si falla, es porque el token realmente no sirve. No intentamos arreglarlo.
    logger.error(`Error JWT: ${error.message}`);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

module.exports = { verifyToken };