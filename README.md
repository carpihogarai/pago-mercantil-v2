# Pago Mercantil v2

Este proyecto implementa una pasarela de pago para Mercantil Banco, enfocada en la integración de **Pago Móvil C2P**.
La solución está compuesta por un backend en Flask que se comunica con el sandbox de Mercantil y un frontend moderno con Next.js y TailwindCSS.

## Funcionalidades

- **Pago Móvil C2P**: Realiza el cifrado AES-128-ECB de los datos sensibles (cédula, teléfono, clave de compra) y se comunica con el endpoint de sandbox de Mercantil.
- **Interfaz simple y responsive**: formulario HTML/CSS sin dependencias complejas, adaptado a todo tipo de pantallas.
- **Colección Postman**: peticiones preparadas para probar los distintos endpoints de la API.
- **Ejemplos de cifrado**: scripts en Java, .NET, PHP y Node.js para generar valores cifrados según la especificación de Mercantil Banco.

## Estructura del repositorio

```
├── backend_flask/        # API Flask + cifrado AES + configuración (.env)
├── frontend_nextjs/      # Frontend Next.js con formulario C2P responsive
├── encrypt-examples/     # Ejemplos de encriptado/desencriptado en varios lenguajes
└── postman-project/      # Colección Postman para pruebas de API
```

## Requisitos

- Python 3.8+ (backend)
- Node.js 14+ (frontend)
- Credenciales de sandbox de Mercantil Banco (MERCHANT_ID, TERMINAL_ID, CIPHER_KEY, IBM_CLIENT_ID, C2P_URL, DESTINATION_ID, DESTINATION_PHONE, DESTINATION_BANK_CODE)

## Instalación y ejecución

### 1. Backend (Flask)

1.  **Navega a la carpeta del backend:** `cd backend_flask`
2.  **Crea un entorno virtual:** `python -m venv venv`
3.  **Activa el entorno:**
    -   Windows: `.\venv\Scripts\Activate.ps1`
    -   macOS/Linux: `source venv/bin/activate`
4.  **Instala las dependencias:** `pip install -r requirements.txt`
5.  **Configura tus credenciales:** Copia el archivo `.env.example` a un nuevo archivo llamado `.env` y verifica que los valores sean correctos.
6.  **Ejecuta la API:** `flask run`

La API quedará disponible en `http://localhost:5000`.

### 2. Frontend (Next.js)

```bash
cd frontend_nextjs
npm install
npm run dev
``` 

Abre http://localhost:3000 en tu navegador para ver el formulario de pago. Si el pago es exitoso, serás redirigido a una página con el recibo.

## Despliegue en Producción

Este proyecto está configurado para desplegar el backend Flask en Railway y el frontend Next.js en Vercel.

### Opción 1: Despliegue Separado (Recomendado para Producción)

Para un despliegue en producción, se recomienda usar Railway para el backend Flask y Vercel para el frontend Next.js.

**Ver la guía completa en [DEPLOYMENT.md](./DEPLOYMENT.md)**

### Opción 2: Despliegue Monorepo en Vercel (Solo para Desarrollo)

Si deseas desplegar todo en Vercel (solo para desarrollo/pruebas):

1.  **Sube tu repositorio a GitHub, GitLab o Bitbucket.**
2.  **Importa el proyecto en Vercel.** Vercel detectará automáticamente la configuración del monorepo gracias al archivo `vercel.json`.
3.  **Configura las variables de entorno.** En el panel de tu proyecto en Vercel, ve a `Settings -> Environment Variables` y añade las mismas credenciales que tienes en tu archivo `backend_flask/.env`. Asegúrate de que Vercel esté configurado para usar el "Root Directory" en la raíz del proyecto, no dentro de `frontend_nextjs`.
    -   `MERCHANT_ID` 
    -   `TERMINAL_ID`
    -   `CIPHER_KEY`
    -   `IBM_CLIENT_ID`
    -   `C2P_URL`
    -   `DESTINATION_ID`
    -   `DESTINATION_PHONE`
    -   `DESTINATION_BANK_CODE`
4.  **Despliega.** Vercel construirá tanto el frontend como el backend y los desplegará en una URL de producción.

**Nota**: El backend Flask en Vercel tiene limitaciones y no es recomendado para producción.

## Uso con Postman

Importa `postman-project/API-PAYMENT.postman_collection.json` y configura el header `X-IBM-Client-ID`.
Actualiza los cuerpos de las peticiones con los campos cifrados (puedes apoyarte en los ejemplos de `encrypt-examples/`) y envía las solicitudes al endpoint correspondiente.

## Ejemplos de cifrado
Consulta la carpeta `encrypt-examples/` para ver scripts de encriptado y desencriptado en Java, .NET, PHP y Node.js, compatibles con la especificación de Mercantil Banco.

---

**¡Listo!** Ya tienes un entorno completo para probar la integración C2P con Mercantil Banco en su entorno de pruebas (sandbox).