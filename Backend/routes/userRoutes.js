const express = require("express");
const router = express.Router();
const userController = require('../controllers/userController');
const { registerValidator } = require("../middlewares/userValidations");
const { verifyToken } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 * - name: Auth
 * description: Endpoints de autenticación, registro y recuperación de contraseñas
 * - name: Usuarios
 * description: Endpoints para la gestión de perfiles, seguidores y feed
 */

// ==========================================
// GET
// ==========================================

/**
 * @swagger
 * /api/users/feed/activity:
 * get:
 * summary: Obtener el feed de actividad del usuario
 * tags: [Usuarios]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Feed de actividad cargado correctamente
 */
router.get("/feed/activity", verifyToken, userController.getActivityFeed);

/**
 * @swagger
 * /api/users/followers/{id}:
 * get:
 * summary: Obtener los seguidores de un usuario
 * tags: [Usuarios]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Lista de seguidores
 */
router.get("/followers/:id", verifyToken, userController.getFollowers);

/**
 * @swagger
 * /api/users/following/{id}:
 * get:
 * summary: Obtener los usuarios a los que sigue un usuario
 * tags: [Usuarios]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Lista de seguidos
 */
router.get("/following/:id", verifyToken, userController.getFollowing);

/**
 * @swagger
 * /api/users/follow-stats/{id}:
 * get:
 * summary: Obtener estadísticas de seguidores/seguidos de un usuario
 * tags: [Usuarios]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Estadísticas obtenidas correctamente
 */
router.get("/follow-stats/:id", verifyToken, userController.getFollowStats);


// ==========================================
// POST / DELETE
// ==========================================

/**
 * @swagger
 * /api/users/register:
 * post:
 * summary: Registrar un nuevo usuario
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - username
 * - email
 * - password
 * - g-recaptcha-response
 * properties:
 * username:
 * type: string
 * email:
 * type: string
 * password:
 * type: string
 * g-recaptcha-response:
 * type: string
 * description: Token de Google reCAPTCHA
 * responses:
 * 201:
 * description: Usuario registrado exitosamente
 * 400:
 * description: Faltan datos o captcha requerido
 * 403:
 * description: Captcha fallido
 * 409:
 * description: Usuario o email ya existen
 */
router.post("/register", registerValidator, userController.createUser);

/**
 * @swagger
 * /api/users/google:
 * post:
 * summary: Iniciar sesión o registrarse con Google
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - token
 * properties:
 * token:
 * type: string
 * description: Token de autenticación de Google
 * responses:
 * 200:
 * description: Autenticación exitosa
 */
router.post("/google", userController.googleLogin);

/**
 * @swagger
 * /api/users/login:
 * post:
 * summary: Iniciar sesión con email o usuario
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - identifier
 * - password
 * properties:
 * identifier:
 * type: string
 * description: Email o nombre de usuario
 * password:
 * type: string
 * responses:
 * 200:
 * description: Login exitoso
 * 401:
 * description: Credenciales inválidas
 */
router.post("/login", userController.login);

/**
 * @swagger
 * /api/users/forgot-password:
 * post:
 * summary: Solicitar reseteo de contraseña
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * email:
 * type: string
 * responses:
 * 200:
 * description: Solicitud enviada al administrador
 */
router.post("/forgot-password", userController.requestPasswordReset);

/**
 * @swagger
 * /api/users/follow/{id}:
 * post:
 * summary: Seguir a un usuario
 * tags: [Usuarios]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: ID del usuario a seguir
 * responses:
 * 200:
 * description: Ahora sigues a este usuario
 */
router.post("/follow/:id", verifyToken, userController.followUser);

/**
 * @swagger
 * /api/users/reset-password:
 * post:
 * summary: Resetear contraseña con código de validación
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * - code
 * - newPassword
 * properties:
 * email:
 * type: string
 * code:
 * type: string
 * newPassword:
 * type: string
 * responses:
 * 200:
 * description: Contraseña actualizada con éxito
 * 400:
 * description: Código o email incorrectos
 */
router.post("/reset-password", userController.resetPassword);

/**
 * @swagger
 * /api/users/unfollow/{id}:
 * delete:
 * summary: Dejar de seguir a un usuario
 * tags: [Usuarios]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: ID del usuario a dejar de seguir
 * responses:
 * 200:
 * description: Has dejado de seguir a este usuario
 */
router.delete("/unfollow/:id", verifyToken, userController.unfollowUser);

// ==========================================
// PUTS
// ==========================================

/**
 * @swagger
 * /api/users/complete-profile:
 * put:
 * summary: Completar perfil (Onboarding)
 * tags: [Usuarios]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * userId:
 * type: string
 * avatarUrl:
 * type: string
 * interests:
 * type: array
 * items:
 * type: string
 * responses:
 * 200:
 * description: Perfil completado con éxito
 */
router.put("/complete-profile", verifyToken, userController.completeProfile);

/**
 * @swagger
 * /api/users/change-password:
 * put:
 * summary: Cambiar la contraseña estando logueado
 * tags: [Auth]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * currentPassword:
 * type: string
 * newPassword:
 * type: string
 * responses:
 * 200:
 * description: Contraseña actualizada correctamente
 * 401:
 * description: Contraseña actual incorrecta
 */
router.put("/change-password", verifyToken, userController.changePassword);

/**
 * @swagger
 * /api/users/update-profile:
 * put:
 * summary: Actualizar datos del perfil
 * tags: [Usuarios]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: false
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * bio:
 * type: string
 * avatarUrl:
 * type: string
 * bannerUrl:
 * type: string
 * responses:
 * 200:
 * description: Perfil actualizado
 * 400:
 * description: Nada que actualizar
 */
router.put("/update-profile", verifyToken, userController.updateProfile);

// ==========================================
// GET 
// ==========================================

/**
 * @swagger
 * /api/users/me:
 * get:
 * summary: Obtener el perfil del usuario autenticado
 * tags: [Usuarios]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Perfil obtenido
 * 404:
 * description: Usuario no encontrado
 */
router.get("/me", verifyToken, userController.getMe);

/**
 * @swagger
 * /api/users/{id}:
 * get:
 * summary: Obtener el perfil público de un usuario por su ID
 * tags: [Usuarios]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Perfil obtenido
 * 404:
 * description: Usuario no encontrado
 */
router.get("/:id", verifyToken, userController.getUserById);

module.exports = router;