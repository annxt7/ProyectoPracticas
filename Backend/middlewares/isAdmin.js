

module.exports = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: "Acceso denegado: Se requieren permisos de administrador" });
  }
};