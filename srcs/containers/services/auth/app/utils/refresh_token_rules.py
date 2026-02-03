import string, secrets, random, hashlib

available_data = {
	"User-Agent": lambda req: req.headers["User-Agent"],
	"Accept": lambda req: req.headers["Accept"],
	"remote_addr": lambda req: req.remote_addr,
}

def random_string(length=32):
	chars = string.ascii_letters + string.digits
	return "".join(secrets.choice(chars) for _ in range(length))

def insert_in_string(base, insert, seed):
	rng = random.Random(seed)
	result = list(base)

	for c in insert:
		pos = rng.randint(0, len(result))
		result.insert(pos, c)

	return "".join(result)

def mix_string(s, seed):
	chars = list(s)
	rng = random.Random(seed)
	rng.shuffle(chars)
	return "".join(chars)

MAX_RANGE = 4
def generate_refresh_token_rules():
	rules = ""

	for x in range(0, MAX_RANGE):
		rules += list(available_data.keys())[secrets.randbelow(len(available_data))] + ("" if x + 1 == MAX_RANGE else "+")

	rules += "|" + random_string() + "|" + str(secrets.randbelow(500)) + "|" + str(secrets.randbelow(500))

	return (rules)

def generate_refresh_token_from_rules(request, rules):
	splitted_rules = rules.split("|")
	data = splitted_rules[0].split("+")

	token = "".join(available_data[k](request) for k in data)
	token = insert_in_string(token, splitted_rules[1], int(splitted_rules[2]))
	token = mix_string(token, int(splitted_rules[3]))
	return hashlib.sha256(token.encode()).hexdigest()

from app.schemas.refresh_tokens import refresh_token_schema, refresh_token_rules_schema
from app.models.refresh_tokens import RefreshToken

# def is_refresh_token_exist(user_id):
# 	tokens = RefreshToken.query.filter_by(user_id=user_id).all()

# 	if not tokens:
# 		return False

# 	for token in tokens:
# 		pass

# def store_refresh_token_and_rules(user_id, token, rules):
# 	payload = {"user_id": user_id, "last_token"}
