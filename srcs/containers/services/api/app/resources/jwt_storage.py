import jwt

cache_token = {}

def add_token(token, payload):
	cache_token[token] = payload

def delete_token(token):
	cache_token[token] = None

def is_token_stored(token):
	return token in cache_token

def decode_token(token):
	return jwt.decode(token, cache_token[token], algorithms="RS256")
