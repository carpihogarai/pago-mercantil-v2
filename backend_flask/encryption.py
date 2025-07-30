import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

def encrypt_aes_128_ecb(key: str, data: str) -> str:
    """
    Cifra los datos usando AES-128-ECB con padding PKCS7 y devuelve una cadena en base64.

    Args:
        key (str): La clave de cifrado de 16 bytes (para AES-128).
        data (str): El texto plano a cifrar.

    Returns:
        str: El texto cifrado y codificado en base64.
    """
    key_bytes = key.encode('utf-8')
    data_bytes = data.encode('utf-8')
    cipher = AES.new(key_bytes, AES.MODE_ECB)
    padded_data = pad(data_bytes, AES.block_size)
    encrypted_bytes = cipher.encrypt(padded_data)
    return base64.b64encode(encrypted_bytes).decode('utf-8')