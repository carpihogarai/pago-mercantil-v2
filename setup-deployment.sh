#!/bin/bash

echo "🚀 Configuración de Despliegue Separado - Railway + Vercel"
echo "=================================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "backend_flask/app.py" ] || [ ! -f "frontend_nextjs/package.json" ]; then
    echo "❌ Error: No se encontraron los archivos necesarios."
    echo "Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

echo "✅ Estructura del proyecto verificada"

# Crear archivo .env.example para el backend si no existe
if [ ! -f "backend_flask/.env.example" ]; then
    echo "📝 Creando archivo .env.example para el backend..."
    cat > backend_flask/.env.example << EOF
# Credenciales de Mercantil Banco (Sandbox)
MERCHANT_ID=tu_merchant_id
TERMINAL_ID=tu_terminal_id
CIPHER_KEY=tu_cipher_key_de_25_caracteres
IBM_CLIENT_ID=tu_ibm_client_id
C2P_URL=https://sandbox.mercantilbanco.com/api/v1/c2p/payment
DESTINATION_ID=tu_destination_id
DESTINATION_PHONE=tu_destination_phone
DESTINATION_BANK_CODE=tu_bank_code
EOF
    echo "✅ Archivo .env.example creado en backend_flask/"
fi

# Verificar que los archivos de configuración existen
echo "🔍 Verificando archivos de configuración..."

files_to_check=(
    "backend_flask/railway.json"
    "backend_flask/Procfile"
    "vercel.json"
    "DEPLOYMENT.md"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file existe"
    else
        echo "❌ $file no encontrado"
    fi
done

echo ""
echo "📋 Próximos pasos:"
echo "=================="
echo ""
echo "1. 🚂 Desplegar Backend en Railway:"
echo "   - Ve a https://railway.app"
echo "   - Conecta tu repositorio de GitHub"
echo "   - Configura el Root Directory como: backend_flask"
echo "   - Agrega las variables de entorno desde backend_flask/.env.example"
echo ""
echo "2. 🌐 Desplegar Frontend en Vercel:"
echo "   - Ve a https://vercel.com"
echo "   - Importa tu repositorio"
echo "   - Configura el Root Directory como: frontend_nextjs"
echo "   - Agrega la variable: NEXT_PUBLIC_API_URL=https://tu-backend-railway.railway.app"
echo ""
echo "3. 📖 Lee la guía completa en DEPLOYMENT.md"
echo ""
echo "🎉 ¡Configuración completada!"
