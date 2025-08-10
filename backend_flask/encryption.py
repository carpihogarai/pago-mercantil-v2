import base64
import hashlib
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

def encrypt_aes_128_ecb(key_bytes: bytes, data: str) -> str:
    """
    Cifra los datos usando AES-128-ECB con padding PKCS7 y devuelve una cadena en base64.

    Args:
        key_bytes (bytes): La clave de cifrado. DEBE ser un objeto de 16 bytes.
        data (str): El texto plano a cifrar.

    Returns:
        str: El texto cifrado y codificado en base64.
    """
    # La clave ya debe venir procesada como un objeto de 16 bytes.
    # Se valida que la clave sea del tipo y longitud correctos.
    if not isinstance(key_bytes, bytes) or len(key_bytes) != 16:
        # Este error es más claro y apunta al problema real si algo sale mal.
        raise TypeError(f"La clave de cifrado debe ser un objeto de 16 bytes, pero se recibió un objeto de tipo {type(key_bytes).__name__} con longitud {len(key_bytes)}.")

    data_bytes = data.encode('utf-8')
    cipher = AES.new(key_bytes, AES.MODE_ECB)
    padded_data = pad(data_bytes, AES.block_size)
    encrypted_bytes = cipher.encrypt(padded_data)
    return base64.b64encode(encrypted_bytes).decode('utf-8')