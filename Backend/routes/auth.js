const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config(); 

// --- CONFIGURACIÓN DE SEGURIDAD ---
const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const GOOGLE_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
// ---------------------------------

router.post('/register', async (req, res) => {
    // 1. Recibir datos del body
    const { email, username, password, 'g-recaptcha-response': token } = req.body; 

    // 2. Verificación básica de campos
    if (!email || !password || !username) {
        return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    if (!token) {
        return res.status(400).json({ error: 'Por favor, completa el reCAPTCHA.' });
    }

    try {
        // 3. Verificación con Google
        // Para v2 se recomienda usar URLSearchParams o enviar como x-www-form-urlencoded
        const params = new URLSearchParams();
        params.append('secret', SECRET_KEY);
        params.append('response', token);
        if (req.ip) params.append('remoteip', req.ip);

        const verificationResponse = await axios.post(GOOGLE_VERIFY_URL, params);
        const data = verificationResponse.data;

        // 4. Evaluar si Google valida el captcha
        if (!data.success) {
            console.warn(`Bloqueo de Registro: reCAPTCHA inválido para el email: ${email}`); 
            return res.status(403).json({ 
                error: 'La verificación de reCAPTCHA ha fallado. Inténtalo de nuevo.',
                details: data['error-codes'] // Útil para debug, quitar en producción
            });
        }

        // --- CONTINUAR CON EL REGISTRO ---
        
        // 5. Lógica de Negocio (Base de Datos)
        // Aquí es donde harías el: const hashedPassword = await bcrypt.hash(password, 10);
        // Y luego el: await User.create({ email, username, password: hashedPassword });

        console.log(`Usuario verificado correctamente: ${email}`);

        res.json({ 
            message: 'Registro exitoso. Verificación de seguridad pasada.',
            success: true 
        });

    } catch (error) {
        console.error('Error en el servidor durante el registro:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al procesar el registro.' });
    }
});

module.exports = router;