from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import hashlib
import requests
import sys
import logging
import uuid
import sqlite3
import json
from encryption import encrypt_aes_128_ecb

# --- Configuración Centralizada ---
load_dotenv()

class ConfigError(Exception):
    """Excepción para errores de configuración."""
    pass

class AppConfig:
    REQUIRED_VARS = [
        'MERCHANT_ID', 'TERMINAL_ID', 'CIPHER_KEY', 'IBM_CLIENT_ID',
        'C2P_URL', 'DESTINATION_ID', 'DESTINATION_PHONE', 'DESTINATION_BANK_CODE'
    ]

    def __init__(self):
        self._load_config()
        self._validate_config()
        self.encryption_key = self._transform_secret_key(self.cipher_key)

    def _load_config(self):
        self.merchant_id = os.getenv('MERCHANT_ID')
        self.terminal_id = os.getenv('TERMINAL_ID')
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
        return hashlib.sha256(raw_key.encode('utf-8')).digest()[:16]

# --- Inicialización y Configuración ---
app = Flask(__name__)

# Configuración de CORS robusta
origins = [
    "https://pago-mercantil-v2-xi.vercel.app",
    "https://trends172.com",
    "https://www.trends172.com",
    "http://localhost:3000" # Para desarrollo local
]
CORS(app, origins=origins, methods=["GET", "POST", "OPTIONS"], allow_headers=["Content-Type"], supports_credentials=True)

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')

DATABASE_FILE = 'transactions.db'

def init_db():
    try:
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS transactions (
                id TEXT PRIMARY KEY,
                status TEXT NOT NULL,
                request_data TEXT NOT NULL,
                bank_response TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute("PRAGMA table_info(transactions)")
        columns = [column[1] for column in cursor.fetchall()]
        if 'origin' not in columns:
            cursor.execute("ALTER TABLE transactions ADD COLUMN origin TEXT DEFAULT 'unknown'")
            app.logger.info("Columna 'origin' añadida a la tabla de transacciones.")
        if 'checkout_data' not in columns:
            cursor.execute("ALTER TABLE transactions ADD COLUMN checkout_data TEXT DEFAULT '''{}'''")
            app.logger.info("Columna 'checkout_data' añadida a la tabla de transacciones.")

        conn.commit()
        conn.close()
        app.logger.info("Base de datos inicializada y verificada correctamente.")
    except sqlite3.Error as e:
        app.logger.critical(f"ERROR FATAL DE BASE DE DATOS: {e}")
        sys.exit(1)

config = None
try:
    config = AppConfig()
except ConfigError as e:
    logging.critical(f"ERROR FATAL DE CONFIGURACIÓN: {e}")
    sys.exit(1)

init_db()

# --- Funciones Auxiliares y Rutas ---

def _validate_payment_request(data):
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

def _parse_bank_error(error_data):
    if isinstance(error_data, dict):
        if "code" in error_data and error_data["code"] == 99999:
            return "Error interno del banco (código 99999). Verifique la configuración o contacte a soporte."
        if "message" in error_data:
            return error_data["message"]
        if "error" in error_data and isinstance(error_data["error"], str):
            return error_data["error"]
        if "detail" in error_data:
            return error_data["detail"]
        if "errors" in error_data and isinstance(error_data["errors"], list) and error_data["errors"]:
            first_error = error_data["errors"][0]
            if isinstance(first_error, str):
                return first_error
            if isinstance(first_error, dict) and "message" in first_error:
                return first_error["message"]
    return f"Error no especificado del banco. Por favor, contacte a soporte."

@app.route("/api/create-c2p-payment", methods=["POST"])
def create_c2p_payment():
    data = request.get_json()
    app.logger.info(f"Solicitud de pago recibida: {data}")

    error_response, status_code = _validate_payment_request(data)
    if error_response:
        app.logger.warning(f"Validación de solicitud fallida: {error_response}")
        return jsonify(error_response), status_code

    try:
        payload = _build_mercantil_payload(data, config)
        headers = {"Content-Type": "application/json", "X-IBM-Client-Id": config.ibm_client_id}
        
        app.logger.info(f"Enviando petición C2P a {config.c2p_url} con payload: {payload}")
        response = requests.post(config.c2p_url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        response_data = response.json()
        app.logger.info(f"Respuesta del banco recibida: {response_data}")
        
        internal_transaction_id = str(uuid.uuid4())
        origin = data.get('origin', 'unknown')
        checkout_data = json.dumps(data.get('checkoutData', {}))

        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO transactions (id, status, request_data, bank_response, origin, checkout_data) VALUES (?, ?, ?, ?, ?, ?)",
            (internal_transaction_id, "completed", json.dumps(data), json.dumps(response_data), origin, checkout_data)
        )
        conn.commit()
        conn.close()
        app.logger.info(f"Transacción guardada en DB. ID: {internal_transaction_id}, Origen: {origin}")

        return jsonify({
            "status": "success",
            "transactionId": internal_transaction_id,
            "bankData": response_data
        })

    except requests.exceptions.RequestException as e:
        user_friendly_error = "No se pudo comunicar con el servicio de pago. Intente de nuevo más tarde."
        status_code = 503

        if e.response is not None:
            status_code = e.response.status_code
            try:
                bank_error_details = e.response.json()
                app.logger.error(f"Respuesta del banco (HTTP {status_code}): {bank_error_details}")
                user_friendly_error = _parse_bank_error(bank_error_details)
            except ValueError:
                app.logger.error(f"Respuesta del banco (HTTP {status_code}): {e.response.text}")
                user_friendly_error = "El servicio de pago devolvió una respuesta inesperada."
        app.logger.error(f"Error en la petición al banco: {e}", exc_info=True)
        return jsonify({"error": user_friendly_error}), status_code

    except sqlite3.Error as db_error:
        app.logger.error(f"Error al guardar en la base de datos: {db_error}", exc_info=True)
        return jsonify({"error": "Error crítico al guardar la transacción."}), 500

    except Exception as e:
        app.logger.critical(f"Error inesperado en create_c2p_payment: {e}", exc_info=True)
        return jsonify({"error": "Ocurrió un error inesperado. Por favor, intente de nuevo más tarde."}), 500

@app.route("/api/payment-details/<string:transaction_id>", methods=['GET'])
def get_payment_details(transaction_id):
    app.logger.info(f"Buscando detalles para la transacción ID: {transaction_id}")
    try:
        conn = sqlite3.connect(DATABASE_FILE)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM transactions WHERE id = ?", (transaction_id,))
        record = cursor.fetchone()
        conn.close()

        if not record:
            app.logger.warning(f"Transacción no encontrada en DB: {transaction_id}")
            return jsonify({"error": "Transacción no encontrada o no válida."}), 404

        transaction = {
            "internalId": record["id"],
            "status": record["status"],
            "requestData": json.loads(record["request_data"]),
            "bankResponse": json.loads(record["bank_response"]),
            "origin": record["origin"],
            "checkoutData": json.loads(record["checkout_data"] or '''{}''')
        }
        
        app.logger.info(f"Transacción encontrada: {transaction}")
        return jsonify(transaction)
    except (sqlite3.Error, json.JSONDecodeError) as e:
        app.logger.error(f"Error al consultar la transacción ({transaction_id}): {e}")
        return jsonify({"error": "Error interno al leer los datos de la transacción."}), 500

@app.route('/api', methods=['GET'])
def health_check():
    """
    Endpoint de chequeo de salud para verificar que la API está activa.
    """
    app.logger.info("Health check solicitado.")
    return jsonify({
        "status": "ok",
        "message": "API de Pagos C2P está en funcionamiento."
    }), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)