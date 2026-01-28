from flask import Blueprint
import jwt
from datetime import datetime, timedelta, timezone
from cryptography.hazmat.primitives.asymmetric import rsa
import hmac

private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key = private_key.public_key()

encoded_jwt = jwt.encode({"some": "payload", "exp": datetime.now(tz=timezone.utc) + timedelta(seconds=5)}, private_key, algorithm="RS256")
print(encoded_jwt, flush=True)

decoded_jwt = jwt.decode(encoded_jwt, public_key, algorithms="RS256")
print(decoded_jwt, flush=True)

# private_key2 = rsa.generate_private_key(public_exponent=65537, key_size=2048)
# public_key2 = private_key2.public_key()

# import time
# time.sleep(5)
# decoded_jwt = jwt.decode(encoded_jwt, public_key2, algorithms="RS256")
print(decoded_jwt, flush=True)
tkn = Blueprint("token", __name__)

# tkn.route("/session_token", methods=["POST"])
# def session_token():
