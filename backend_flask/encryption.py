import base64
import hashlib
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

def derive_aes_key_from_long_key(long_key: str) -> bytes:
    """
    Deriva una clave AES-128 válida (16 bytes) a partir de una clave larga usando SHA-256.
    """
    sha256 = hashlib.sha256(long_key.encode('utf-8')).digest()
    return sha256[:16]

def encrypt_aes_128_ecb(key: str, data: str) -> str:
    """
    Cifra los datos usando AES-128-ECB con padding PKCS7 y devuelve una cadena en base64.
    """
    key_bytes = derive_aes_key_from_long_key(key)
    data_bytes = data.encode('utf-8')
    cipher = AES.new(key_bytes, AES.MODE_ECB)
    padded_data = pad(data_bytes, AES.block_size)
    encrypted_bytes = cipher.encrypt(padded_data)
    return base64.b64encode(encrypted_bytes).decode('utf-8')
