# Guía de Despliegue Separado - Railway + Vercel

Este proyecto ahora está configurado para desplegar el backend Flask en Railway y el frontend Next.js en Vercel.

## Estructura del Despliegue

- **Backend (Flask)**: Railway - `backend_flask/`
- **Frontend (Next.js)**: Vercel - `frontend_nextjs/`

## Paso 1: Desplegar Backend en Railway

### 1.1 Preparar el repositorio para Railway

1. **Fork o clona este repositorio** en tu cuenta de GitHub
2. **Conecta Railway con tu repositorio**:
   - Ve a [Railway.app](https://railway.app)
   - Crea una nueva cuenta o inicia sesión
   - Haz clic en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Selecciona tu repositorio

### 1.2 Configurar el proyecto en Railway

1. **Selecciona el directorio del backend**:
   - En Railway, ve a "Settings" → "General"
   - En "Root Directory", especifica: `backend_flask`

2. **Configura las variables de entorno**:
   - Ve a "Variables" en Railway
   - Agrega todas las variables necesarias:
   ```
   MERCHANT_ID=tu_merchant_id
   TERMINAL_ID=tu_terminal_id
   CIPHER_KEY=tu_cipher_key
   IBM_CLIENT_ID=tu_ibm_client_id
   C2P_URL=https://sandbox.mercantilbanco.com/api/v1/c2p/payment
   DESTINATION_ID=tu_destination_id
   DESTINATION_PHONE=tu_destination_phone
   DESTINATION_BANK_CODE=tu_bank_code
   ```

3. **Despliega el proyecto**:
   - Railway detectará automáticamente que es una aplicación Python
   - El archivo `railway.json` y `Procfile` configurarán el despliegue
   - La aplicación estará disponible en una URL como: `https://tu-app.railway.app`

## Paso 2: Desplegar Frontend en Vercel

### 2.1 Conectar Vercel con el repositorio

1. **Ve a [Vercel.com](https://vercel.com)**
2. **Importa tu proyecto** desde GitHub
3. **Configura el proyecto**:
   - Framework Preset: Next.js
   - Root Directory: `frontend_nextjs`
   - Build Command: `npm run build` (por defecto)
   - Output Directory: `.next` (por defecto)

### 2.2 Configurar variables de entorno en Vercel

1. **Ve a "Settings" → "Environment Variables"**
2. **Agrega la variable**:
   ```
   NEXT_PUBLIC_API_URL=https://tu-backend-railway.railway.app
   ```
   (Reemplaza con la URL real de tu backend en Railway)

### 2.3 Desplegar

1. **Haz clic en "Deploy"**
2. **Vercel construirá y desplegará** tu frontend
3. **Tu aplicación estará disponible** en una URL como: `https://tu-app.vercel.app`

## Paso 3: Verificar la Integración

### 3.1 Probar el backend

1. **Visita la URL de Railway** + `/api`
2. **Deberías ver**: "API Mercantil Flask is running."

### 3.2 Probar el frontend

1. **Visita la URL de Vercel**
2. **Completa el formulario** de pago C2P
3. **Verifica que se conecte** correctamente al backend

## Configuración de Dominios Personalizados (Opcional)

### Railway (Backend)
- Ve a "Settings" → "Domains"
- Agrega tu dominio personalizado
- Configura los registros DNS según las instrucciones

### Vercel (Frontend)
- Ve a "Settings" → "Domains"
- Agrega tu dominio personalizado
- Vercel configurará automáticamente los registros DNS

## Monitoreo y Logs

### Railway
- **Logs**: Ve a "Deployments" → selecciona un deployment → "View Logs"
- **Métricas**: Disponibles en el dashboard principal

### Vercel
- **Logs**: Ve a "Functions" → selecciona una función → "View Function Logs"
- **Analytics**: Disponible en "Analytics" (requiere plan de pago)

## Troubleshooting

### Problemas Comunes

1. **Error de CORS**:
   - Verifica que el backend tenga CORS configurado correctamente
   - Asegúrate de que `NEXT_PUBLIC_API_URL` esté configurada correctamente

2. **Error de variables de entorno**:
   - Verifica que todas las variables estén configuradas en Railway
   - Revisa los logs del backend para errores de configuración

3. **Error de conexión**:
   - Verifica que la URL del backend sea accesible
   - Prueba hacer una petición directa al endpoint `/api`

### Comandos Útiles

```bash
# Probar el backend localmente
cd backend_flask
python app.py

# Probar el frontend localmente
cd frontend_nextjs
npm run dev
```

## Costos

- **Railway**: Plan gratuito disponible, luego $5/mes por proyecto
- **Vercel**: Plan gratuito disponible, luego $20/mes por proyecto

## Seguridad

- **Variables de entorno**: Nunca commits credenciales en el código
- **HTTPS**: Ambos servicios proporcionan HTTPS automáticamente
- **CORS**: Configurado para permitir solo el frontend autorizado
