# Tribe 
Una aplicación Full-Stack para aquello/as que desean organizar y compartir sus gustos creando colecciones ya sea un estilo de música, sus películas favoritas, los próximos libros que quieres leer o viendo la de otros para descubir títulos que no conocías.

## 1. Tecnologías 🛠️
Organización por capas para garantizar escalabilidad y orden:

* **Frontend:** React 19, Vite, Tailwind CSS 4, DaisyUI, React Hook Form, Zod.
* **Backend:** Node.js (Express 5), MySQL, JSON Web Tokens (JWT), Bcrypt, Cloudinary (Gestión de imágenes).

## 2. Características Principales ✨
* **Autenticación Segura:** Login con JWT y Google OAuth.
* **Gestión de Media:** Subida y optimización de imágenes mediante Cloudinary.
* **Seguridad:** Protección contra ataques de fuerza bruta y cabeceras seguras (Helmet, HPP).
* **Diseño Moderno:** Interfaz responsiva y animada.

## 3. Estructura del Proyecto 📂
```plaintext
├── Frontend/      # Aplicación cliente (React + Vite)
├── Backend/       # API REST (Node + Express + MySQL)
└── README.md      # Documentación principal
```

## 4. Guía de Instalación ⚙️
Pasos necesarios para el despliegue en entorno local:

1. **Clonar el repositorio:** `git clone https://github.com/annxt7/ProyectoPracticas.git`
2. **Configurar Backend:**
   * Entrar en `/Backend` y ejecutar `npm install`.
   * Crear un archivo `.env` con las credenciales de MySQL y Cloudinary.
3. **Configurar Frontend:**
   * Entrar en `/Frontend` y ejecutar `npm install`.
   * Ejecutar el comando `npm run dev`.

## 5. Variables de Entorno 🔑
Claves necesarias para la correcta inicialización de los servicios:

```env
DB_USER=user
DB_PSS=pss
DB_NAME=name
PORT=3000
RECAPTCHA_SECRET_KEY=clave_secreta
CLOUDINARY_URL=cloudinary_url
JWT_SECRET=jwt_secret
```

## 6. Despliegue (CI/CD) 🔄
Este proyecto cuenta con un flujo de **CI/CD** automático. Al realizar un *push* a la rama `develop`, GitHub Actions se conecta al VPS vía SSH para automatizar las siguientes tareas:

1. Actualización de código vía Git.
2. Reinstalación de dependencias (`npm i`).
3. Generación del Build del frontend.
4. Reinicio del servicio backend gestionado por **PM2**.

## 7. Servidor 🌐
La aplicación está disponible para visualización en el siguiente enlace:  
[https://axel.informaticamajada.es/](https://axel.informaticamajada.es/)

## 8. Licencia y Propiedad 📜
**Propiedad Intelectual de Anyi Yagüe y Axel González.** Este proyecto ha sido desarrollado como parte del Proyecto de Prácticas. Queda **estrictamente prohibida** su reproducción, uso, copia o distribución por parte de terceros sin autorización expresa de los autores.
