from marshmallow import ValidationError
import re, os

from app.services.sql_service import safe_request
from app.schemas.user import user_schema
from app.models.user import User
from app.extensions import db


def is_email_valid(email):
	return re.fullmatch(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,7}", email)

def is_username_valid(username):
	min_len = int(os.getenv("AUTH_MIN_USERNAME_LENGTH", "3"))
	max_len = int(os.getenv("AUTH_MAX_USERNAME_LENGTH", 10))
	return re.fullmatch(rf"^[A-Za-z0-9_-]{{{min_len},{max_len}}}$", username)

def is_password_valid(password):
	min_len = int(os.getenv("AUTH_MIN_PASS_LENGTH"))
	max_len = int(os.getenv("AUTH_MAX_PASS_LENGTH"))
	return re.fullmatch(rf"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{{{min_len},{max_len}}}$", password)

def load_user_payload(payload: dict) -> User:
	if not isinstance(payload, dict):
		raise ValueError("payload must be a JSON object")
	try:
		return user_schema.load(payload)
	except ValidationError as exc:
		raise ValueError(exc.messages) from exc

def does_email_exist(email, exlude_id=None):
	query = db.session.query(User.id).filter_by(email=email)

	if exlude_id is not None:
		query = query.filter(User.id != exlude_id)

	return query.first() is not None

def username_exists(username, exlude_id=None):
	query = db.session.query(User.id).filter_by(username=username)

	if exlude_id is not None:
		query = query.filter(User.id != exlude_id)

	return query.first() is not None
