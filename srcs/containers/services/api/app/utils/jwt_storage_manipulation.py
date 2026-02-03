import jwt

cache_token = {}

def add_token(token, public):
	print("New token stored", flush=True)
	print("TOKEN:", token, flush=True)
	print("PUBLIC:", public, flush=True)
	cache_token[token] = public

def delete_token(token):
	cache_token.pop(token, None)

def is_token_stored(token):
	return token in cache_token

def decode_token(token):
	print("Decode: ", token, cache_token[token], flush=True)
	return jwt.decode(token, cache_token[token], algorithms="RS256")
