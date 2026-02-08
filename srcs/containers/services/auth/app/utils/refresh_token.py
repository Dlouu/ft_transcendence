import string, secrets, random, hashlib, os

from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import joinedload

from app.extensions import db
from app.schemas.refresh_tokens import refresh_token_schema, refresh_token_rules_schema
from app.models.refresh_tokens import RefreshToken

available_data = {
	"User-Agent": lambda req: req.headers["User-Agent"],
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
	"""
	Generate a string representing the rules to build a user refresh token.

	return:
		A string used to construct a refresh token (example: User-Agent+remote_addr|glti5032nshxa432f|51|185)
	"""
	rules = ""

	for x in range(0, MAX_RANGE):
		rules += list(available_data.keys())[secrets.randbelow(len(available_data))] + ("" if x + 1 == MAX_RANGE else "+")

	rules += "|" + random_string() + "|" + str(secrets.randbelow(500)) + "|" + str(secrets.randbelow(500))

	return (rules)

def generate_refresh_token_from_rules(request, rules):
	"""
	Construct a refresh token using data inside a request and the given rules, this function dont check any data type,
	make sure to make all the necessary check before using this.

	param:
		request: request object
		rule: a string representing the rules to build the refresh token, this string should be created using
			the function generate_refresh_token_rules().

	return :
		a hashed string.

	"""
	splitted_rules = rules.split("|")
	data = splitted_rules[0].split("+")

	token = "".join(available_data[k](request) for k in data)
	token = insert_in_string(token, splitted_rules[1], int(splitted_rules[2]))
	token = mix_string(token, int(splitted_rules[3]))
	return hashlib.sha256(token.encode()).hexdigest()

def initialize_new_refresh_token(user_id, request):
	"""
	Using a user id and a request object, this function generate rules and a refresh token then store them in a database.
	This function dont check the validy of his arguments so make sure to make these verification before using this.

	param:
		user_id: the id of the user.
		request: request object.

	return:
		False if something wrong happened, otherwise True + the refresh token id to make it easier to find in the database.
	"""
	rules = generate_refresh_token_rules()
	token = generate_refresh_token_from_rules(request, rules)

	token_payload = {"user_id": user_id, "active_token": token, "expire_date": datetime.now(timezone.utc) + timedelta(seconds=int(os.getenv("REFRESH_TOKEN_EXPIRATION", "86400")))}
	token_rules_payload = {"active_token_rules": rules}
	try:
		refresh_token = refresh_token_schema.load(token_payload)
		refresh_token.rules = refresh_token_rules_schema.load(token_rules_payload)
		db.session.add(refresh_token)
		db.session.commit()
	except Exception as e:
		db.session.rollback()
		print(e, flush=True)
		print("Undefined exception have been raised in 'initialize_new_refresh_token', resolve this or handle this behavior.", flush=True)
		return False
	return True, refresh_token.id

def generate_new_active_refresh_token(request, tid):
	"""
	Generate a new refresh token for an EXISTING token id in the database.
	This function dont check the validy of his arguments so make sure to make these verification before using this.


	param:
		request: request object
		tid: refresh token id

	return:
		False if the tid does not exist, else True.
	"""
	row = RefreshToken.query.filter_by(id=tid).first()

	if not row:
		return False

	rules = generate_refresh_token_rules()
	row.active_token = generate_refresh_token_from_rules(request, rules)
	row.expire_date = datetime.now(timezone.utc) + timedelta(seconds=30)
	row.rules.active_token_rules = rules;

	db.session.commit()
	return True

def does_refresh_token_exist(user_id, request):
	"""
	Check if a user_id own a certain refresh token bases on the request object.
	This function dont check the validy of his arguments so make sure to make these verification before using this.

	param:
		user_id: the user id
		request: request object

	return:
		False if refresh token generated using the request object do not match any token in the dabase.
		If a token exist the function return:
			- a bool: does the token exist?
			- a bool: Is it the last token? If this one is True that mean that the user no longer have an active refresh token,
					so it is necessary to generate a new one.
			- an integer: the token id, it is the primary key of the token in the database.
	"""
	query = RefreshToken.query.options(joinedload(RefreshToken.rules)).filter_by(user_id=user_id)

	for row in query.yield_per(50):
		if row.active_token and row.active_token == generate_refresh_token_from_rules(request, row.rules.active_token_rules):
			return True, False, row.id
		elif row.last_token and row.last_token == generate_refresh_token_from_rules(request, row.rules.last_token_rules):
			return True, True, row.id

	return False
