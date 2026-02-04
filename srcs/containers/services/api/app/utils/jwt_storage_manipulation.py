import jwt
from app.extensions import cache_token

def add_token(token, public):
	cache_token[token] = public

def delete_token(token):
	cache_token.pop(token, None)

def is_token_stored(token):
	return token in cache_token

def decode_token(token):
	return jwt.decode(token, cache_token[token], algorithms="RS256")
