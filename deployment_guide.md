# 🚀 Guía de Despliegue - Sistema de Rifas Semanales

Esta guía te ayudará a poner tu aplicación en línea para que tus clientes puedan empezar a comprar números.

## 1. Preparación del Entorno
He configurado el proyecto para que sea fácil de configurar mediante variables de entorno. 

1.  Copia el archivo `.env.example` y renómbralo a `.env`.
2.  Edita los valores en el `.env`:
    *   `DATABASE_URL`: Déjalo como está para SQLite o cámbialo si usas PostgreSQL.
    *   `JWT_SECRET`: Pon una clave larga y segura.
    *   `NEXT_PUBLIC_ADMIN_WHATSAPP`: Tu número de WhatsApp.
    *   `NEXT_PUBLIC_NEQUI`: Tu número de Nequi.
    *   `NEXT_PUBLIC_BANCOLOMBIA_AHORROS`: Tu cuenta de Bancolombia.

## 2. Opciones de Hosting

### Opción A: Railway (Recomendado para SQLite)
Railway es excelente porque permite tener un disco persistente para que tu base de datos SQLite no se borre.
1.  Sube tu código a un repositorio de GitHub (privado).
2.  Crea un nuevo proyecto en [Railway.app](https://railway.app/).
3.  Conecta tu repositorio.
4.  En la pestaña **Variables**, añade todas las variables de tu archivo `.env`.
5.  Railway detectará automáticamente que es un proyecto de Next.js y lo desplegará.

### Opción B: Vercel (Gratis, pero requiere Base de Datos externa)
Vercel es el mejor para Next.js, pero **no soporta SQLite** de forma persistente. Si usas Vercel:
1.  Crea una base de datos PostgreSQL gratis (puedes usar **Supabase** o **Neon.tech**).
2.  Copia la URL de conexión que te den y ponla en la variable `DATABASE_URL` de Vercel.
3.  Cambia el `provider` en `prisma/schema.prisma` de `"sqlite"` a `"postgresql"`.
4.  Ejecuta `npx prisma db push` para crear las tablas en la nueva base de datos.

### Opción C: VPS (DigitalOcean, Linode, AWS)
Si tienes un servidor propio:
1.  Instala Node.js (v20 o v22).
2.  Clona el repositorio.
3.  Crea el archivo `.env`.
4.  Ejecuta:
    ```bash
    npm install
    npx prisma db push
    npm run build
    npm run start
    ```
5.  Usa un gestor de procesos como **PM2** para que la app no se apague.

## 3. Comandos Importantes
Cada vez que hagas cambios en el archivo `schema.prisma`, debes ejecutar:
*   `npx prisma generate`: Para actualizar las herramientas de código.
*   `npx prisma db push`: Para actualizar la base de datos sin borrar los datos existentes.

## 4. Consideraciones Finales
*   **Seguridad**: Asegúrate de que el archivo `.env` nunca se suba a un repositorio público.
*   **Backup**: Si usas SQLite, descarga periódicamente el archivo `dev.db` para tener copia de seguridad de tus ventas.

## 5. Acceso Administrativo
Por defecto, las credenciales son:
*   **WhatsApp / Usuario**: `admin`
*   **Cédula / Contraseña**: `admin`

*⚠️ Importante: Una vez desplegado, puedes cambiar estas credenciales directamente en el código (`src/app/actions/auth.ts`) para mayor seguridad.*
