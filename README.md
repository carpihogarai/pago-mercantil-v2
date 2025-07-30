# Pago Mercantil v2

Este proyecto implementa una pasarela de pago para Mercantil Banco, con integración C2P (Pago móvil) y un stub para pagos con tarjeta.
La solución está compuesta por un backend en Flask que se comunica con el sandbox de Mercantil Banco, y un frontend ligero con Next.js con un formulario HTML/CSS responsive.

## Funcionalidades

- **Pago móvil C2P**: cifrado AES-128-ECB de datos sensibles (cédula, teléfono, two‑factor) y envío al endpoint sandbox de Mercantil Banco.
- **Stub de pago con tarjeta**: punto de partida para integrar la API de pagos con tarjeta de Mercantil (pendiente de implementación real).
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
- Credenciales de sandbox de Mercantil Banco (MERCHANT_ID, TERMINAL_ID, CIPHER_KEY, IBM_CLIENT_ID, C2P_URL)

## Instalación y ejecución

### 1. Backend (Flask)

```bash
cd backend_flask
# Activar virtualenv (Windows PowerShell):
.\venv\Scripts\Activate.ps1
# o Linux/macOS:
source venv/bin/activate

# Instalar dependencias (opcional si ya están en venv):
pip install flask flask-cors python-dotenv requests pycryptodome

# Configurar credenciales en backend_flask/.env:
# MERCHANT_ID, TERMINAL_ID, CIPHER_KEY, IBM_CLIENT_ID, C2P_URL

# Ejecutar la API:
flask run --host=0.0.0.0 --port=5000
```

La API quedará disponible en http://localhost:5000

### 2. Frontend (Next.js)

```bash
cd frontend_nextjs
npm install
npm run dev
```

Abre http://localhost:3000 en tu navegador para ver el formulario.

## Despliegue en Vercel

Este proyecto está configurado para un despliegue sencillo en Vercel como un monorepo.

1.  **Sube tu repositorio a GitHub, GitLab o Bitbucket.**
2.  **Importa el proyecto en Vercel.** Vercel detectará automáticamente la configuración del monorepo gracias al archivo `vercel.json`.
3.  **Configura las variables de entorno.** En el panel de tu proyecto en Vercel, ve a `Settings -> Environment Variables` y añade las mismas credenciales que tienes en tu archivo `backend_flask/.env`:
    -   `MERCHANT_ID`
    -   `TERMINAL_ID`
    -   `CIPHER_KEY`
    -   `IBM_CLIENT_ID`
    -   `C2P_URL`
4.  **Despliega.** Vercel construirá tanto el frontend como el backend y los desplegará en una URL de producción.

## Uso con Postman

Importa `postman-project/API-PAYMENT.postman_collection.json` y configura el header `X-IBM-Client-ID`.
Actualiza los cuerpos de las peticiones con los campos cifrados (puedes apoyarte en los ejemplos de `encrypt-examples/`) y envía las solicitudes al endpoint correspondiente.

## Ejemplos de cifrado

Consulta la carpeta `encrypt-examples/` para ver scripts de encriptado y desencriptado en Java, .NET, PHP y Node.js, compatibles con la especificación de Mercantil Banco.

---

**¡Listo!** Ya tienes un entorno completo para probar la integración C2P con Mercantil Banco en sandbox y un punto de partida para pagos con tarjeta.