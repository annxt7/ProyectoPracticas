const { body, validationResult } = require('express-validator');

const registerValidator = [
 //Usuario
  body('username')
    .trim() 
    .notEmpty().withMessage('El nombre de usuario es obligatorio')
    .isLength({ min: 4 }).withMessage('El usuario debe tener al menos 4 caracteres')
    .escape(), 

  // Email
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(), 

  // Password (Mínimo 8 chars + 1 número)
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener mínimo 8 caracteres')
    .matches(/\d/).withMessage('La contraseña debe contener al menos un número'),

  // Confirmar Password
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),

  // 
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    next();
  }
];

module.exports = { registerValidator };