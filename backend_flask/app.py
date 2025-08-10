from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import hashlib
import requests
import sys
import logging
from encryption import encrypt_aes_128_ecb

# --- Configuración Centralizada ---
# Cargar variables de entorno una sola vez al iniciar la app.
load_dotenv()

class ConfigError(Exception):
    """Excepción para errores de configuración."""
    pass

class AppConfig:
    """
    Clase para cargar y validar la configuración desde variables de entorno.
    """
    REQUIRED_VARS = [
        'MERCHANT_ID', 'TERMINAL_ID', 'CIPHER_KEY', 'IBM_CLIENT_ID',
        'C2P_URL', 'DESTINATION_ID', 'DESTINATION_PHONE', 'DESTINATION_BANK_CODE'
    ]

    def __init__(self):
        self._load_config()
        self._validate_config()
        # La clave de cifrado de 16 bytes se deriva de la CIPHER_KEY del .env
        self.encryption_key = self._transform_secret_key(self.cipher_key)

    def _load_config(self):
        self.merchant_id = os.getenv('MERCHANT_ID')
        self.terminal_id = os.getenv('TERMINAL_ID')
        # Carga la clave de 25 caracteres del .env
        self.cipher_key = os.getenv('CIPHER_KEY')
        self.ibm_client_id = os.getenv('IBM_CLIENT_ID')
        self.c2p_url = os.getenv('C2P_URL')
        self.destination_id = os.getenv('DESTINATION_ID')
        self.destination_bank_code = os.getenv('DESTINATION_BANK_CODE')
        self.destination_phone = os.getenv('DESTINATION_PHONE')

    def _validate_config(self):
        for var in self.REQUIRED_VARS:
            if not getattr(self, var.lower(), None):
                raise ConfigError(f"Error de configuración: Falta la variable de entorno obligatoria: {var}")

    @staticmethod
    def _transform_secret_key(raw_key):
        """
        Transforma la clave secreta a una clave de cifrado AES-128 válida (SHA-256 -> 16 bytes).
        """
        return hashlib.sha256(raw_key.encode('utf-8')).digest()[:16]

# --- Inicialización de la App y Configuración ---
app = Flask(__name__)
CORS(app)

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')

config = None
try:
    config = AppConfig()
except ConfigError as e:
    # La aplicación no debe iniciar si la configuración es inválida.
    logging.critical(f"ERROR FATAL DE CONFIGURACIÓN: {e}")
    logging.critical("La aplicación se detendrá. Revisa tu archivo .env y asegúrate de que todas las variables requeridas estén presentes.")
    sys.exit(1)

# --- Rutas de la API ---
@app.route("/")
def index():
    return "API Mercantil Flask"

@app.route("/api")
def api_index():
    return "API Mercantil Flask is running."

def _validate_payment_request(data):
    """Valida los datos de entrada para la solicitud de pago."""
    if not data:
        return {"error": "No se recibieron datos"}, 400

    required_fields = ["c2pPhone", "purchaseKey", "amount"]
    missing_fields = [field for field in required_fields if not (field in data and data[field])]
    if missing_fields:
        return {"error": f"Faltan campos requeridos: {', '.join(missing_fields)}"}, 400

    try:
        float(data['amount'])
    except (ValueError, TypeError):
        return {"error": "El campo 'amount' debe ser un número válido."}, 400

    return None, None

def _build_mercantil_payload(data, app_config):
    """Construye el payload para la API de Mercantil, incluyendo el cifrado."""
    encrypted_dest_id = encrypt_aes_128_ecb(app_config.encryption_key, app_config.destination_id)
    encrypted_origin_phone = encrypt_aes_128_ecb(app_config.encryption_key, data['c2pPhone'])
    encrypted_purchase_key = encrypt_aes_128_ecb(app_config.encryption_key, data['purchaseKey'])

    return {
        "merchant_id": app_config.merchant_id,
        "terminal_id": app_config.terminal_id,
        "c2p_payment": {
            "amount": float(data['amount']),
            "destination_id": encrypted_dest_id,
            "destination_phone": app_config.destination_phone,
            "destination_bank_code": app_config.destination_bank_code,
            "origin_phone": encrypted_origin_phone,
            "purchase_key": encrypted_purchase_key,
            "currency": "VES",
            "description": "Pago de prueba C2P"
        }
    }

@app.route("/api/create-c2p-payment", methods=["POST"])
def create_c2p_payment():
    """
    Endpoint para iniciar un pago móvil C2P.
    """
    if not config:
        app.logger.error("La aplicación no está configurada correctamente.")
        return jsonify({"error": "Error de configuración del servidor."}), 500

    # 2. Validar datos de entrada del frontend
    data = request.get_json()
    error_response, status_code = _validate_payment_request(data)
    if error_response:
        return jsonify(error_response), status_code

    try:
        # 2. Construir el payload para la API de Mercantil
        payload = _build_mercantil_payload(data, config)

        headers = {
            "Content-Type": "application/json",
            "X-IBM-Client-Id": config.ibm_client_id
        }

        # 3. Realizar la petición al sandbox de Mercantil
        app.logger.info(f"Enviando petición C2P a {config.c2p_url}")
        response = requests.post(config.c2p_url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()  # Lanza una excepción para códigos de error HTTP (4xx o 5xx)

        response_data = response.json()
        app.logger.info(f"Respuesta exitosa del banco: {response_data}")

        # La respuesta de éxito del sandbox suele tener un 'message'
        success_message = response_data.get("message", "Pago procesado exitosamente.")
        return jsonify({"message": success_message, "data": response_data})

    except requests.exceptions.RequestException as e:
        # Captura errores de conexión, timeouts, y respuestas HTTP con error (4xx, 5xx)
        error_message = f"Error de comunicación con el banco: {e}"
        app.logger.error(error_message)

        # Intenta obtener y registrar la respuesta detallada del banco si existe
        if e.response is not None:
            try:
                bank_error_details = e.response.json()
                app.logger.error(f"Respuesta del banco (HTTP {e.response.status_code}): {bank_error_details}")
            except ValueError:
                # Si la respuesta no es JSON, muestra el texto plano
                app.logger.error(f"Respuesta del banco (HTTP {e.response.status_code}): {e.response.text}")

        # Devuelve un error genérico al frontend, pero con los detalles en el log del servidor
        return jsonify({"error": "No se pudo comunicar con el servicio de pago. Revisa los logs del servidor para más detalles."}), 503

# Configuración para Railway
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
