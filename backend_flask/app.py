from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import time
import requests
from encryption import encrypt_aes_128_ecb

# Cargar variables de entorno desde .env
load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route("/")
def index():
    return "API Mercantil Flask"

@app.route("/create-card-payment", methods=["POST"])
def create_card_payment():
    """
    Stub para la creación de un pago con tarjeta.
    En una implementación real, aquí se generaría una sesión de pago
    y se devolvería la URL del iframe del banco.
    """
    # Simula una llamada a la API del banco que toma tiempo
    time.sleep(2)

    # URL de ejemplo para el iframe (esto debería venir del banco)
    # Esta URL es solo un ejemplo y no es funcional.
    payment_url = "https://example.com/payment-iframe"

    return jsonify({"paymentUrl": payment_url})

@app.route("/create-c2p-payment", methods=["POST"])
def create_c2p_payment():
    """
    Endpoint para iniciar un pago móvil C2P con cifrado y llamada real al sandbox.
    """
    # 1. Cargar credenciales de forma segura
    try:
        merchant_id = os.environ['MERCHANT_ID']
        terminal_id = os.environ['TERMINAL_ID']
        cipher_key = os.environ['CIPHER_KEY']
        ibm_client_id = os.environ['IBM_CLIENT_ID']
        c2p_url = os.environ['C2P_URL']
    except KeyError as e:
        print(f"Error: Falta la variable de entorno {e}")
        return jsonify({"error": "Error de configuración del servidor."}), 500

    # 2. Validar datos de entrada del frontend
    data = request.get_json()
    if not data:
        return jsonify({"error": "No se recibieron datos"}), 400

    required_fields = ["telefono", "ci", "banco", "destino", "purchase_key", "amount"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Faltan campos requeridos"}), 400

    try:
        # 3. Cifrar los campos sensibles
        encrypted_phone = encrypt_aes_128_ecb(cipher_key, data['telefono'])
        encrypted_id = encrypt_aes_128_ecb(cipher_key, data['ci'])
        encrypted_purchase_key = encrypt_aes_128_ecb(cipher_key, data['purchase_key'])

        # 4. Construir el payload para la API de Mercantil (alineado con la documentación de Postman)
        payload = {
            "merchant_identify": {
                "merchantId": int(merchant_id),
                "terminalId": terminal_id
            },
            "client_identify": {
                "ipaddress": request.remote_addr,
                "browser_agent": request.headers.get('User-Agent')
            },
            "transaction_c2p": {
                "amount": data['amount'],
                "currency": "ves",
                "destination_bank_id": data['banco'],
                "destination_id": encrypted_id,
                "destination_mobile_number": data['destino'],
                "origin_mobile_number": encrypted_phone,
                "payment_reference": "", # El banco lo genera, se envía vacío
                "trx_type": "compra",
                "payment_method": "c2p",
                "invoice_number": "", # Opcional, se puede generar si es necesario
                "twofactor_auth": encrypted_purchase_key
            }
        }

        headers = {
            "Content-Type": "application/json",
            "X-IBM-Client-Id": ibm_client_id
        }

        # 5. Realizar la petición al sandbox de Mercantil
        response = requests.post(c2p_url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()  # Lanza una excepción para códigos de error HTTP (4xx o 5xx)

        response_data = response.json()
        return jsonify(response_data)

    except requests.exceptions.RequestException as e:
        print(f"Error de conexión con la API de Mercantil: {e}")
        return jsonify({"error": "No se pudo conectar con el servicio de pago."}), 503
    except Exception as e:
        print(f"Error inesperado durante el proceso de pago: {e}")
        return jsonify({"error": "Ocurrió un error interno al procesar el pago."}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)
