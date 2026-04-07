# Tribe 
Una aplicación Full-Stack para entusiastas que desean organizar, valorar y compartir sus colecciones personales de forma segura.

1. Tecnologías
Divide las tecnologías por carpetas para demostrar orden.

Frontend: React 19, Vite, Tailwind CSS 4, DaisyUI, React Hook Form, Zod.

Backend: Node.js (Express 5), MySQL, JSON Web Tokens (JWT), Bcrypt, Cloudinary (Gestión de imágenes).

2. Características Principales

Autenticación Segura: Login con JWT y Google OAuth.

Gestión de Media: Subida y optimización de imágenes mediante Cloudinary.

Seguridad: Protección contra ataques de fuerza bruta y cabeceras seguras (Helmet, HPP).

Diseño Moderno: Interfaz responsiva y animada.

3. Estructura del Proyecto
Explica brevemente tu organización de carpetas para que nadie se pierda:

```
├── Frontend/      # Aplicación cliente (React + Vite)
├── Backend/       # API REST (Node + Express + MySQL)
└── README.md      # Documentación principal
```

4. Guía de Instalación 

Los pasos necesarios para su instalación son:

Clonar el repo: git clone.

Configurar Backend:

Entrar en /Backend y hacer npm install.

Crear un archivo .env con las credenciales de MySQL y Cloudinary.

Configurar Frontend:

Entrar en /Frontend y hacer npm install.

npm run dev.

5. Variables de Entorno (Template)
Las claves que se necesitan para que la app funcione son:. 

DB_USER= user
DB_PSS= pss
DB_NAME=name
PORT=3000
RECAPTCHA_SECRET_KEY= clave_secreta
CLOUDINARY_URL=cloudinary_url
JWT_SECRET= jwt_secret

6. Despliegue
Este proyecto cuenta con un flujo de **CI/CD** automático. Cada vez que se hace un push a la rama `develop`, GitHub Actions se conecta al VPS vía SSH, actualiza el código y reinicia los servicios:
1. Actualización de código vía Git.
2. Reinstalación de dependencias (`npm i`).
3. Build del frontend.
4. Reinicio del backend con PM2.

7. Servidor
En el siguiente enlace se encuentra la página web en el que se podrá visualizar la página.
https://axel.informaticamajada.es/

8. Licencia y Propiedad
Propiedad Intelectual de Anyi Yagüe y Axel González. Este proyecto ha sido desarrollado como parte del Proyecto de Prácticas. No se autoriza su uso, copia o distribución por parte de terceros.