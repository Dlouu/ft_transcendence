from flask_sqlalchemy import SQLAlchemy
from marshmallow import EXCLUDE, ValidationError, fields, pre_load
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from .extensions import db

class User(db.Model):
	__tablename__ = "credentials"

	id = db.Column(db.BigInteger, primary_key=True)
	username = db.Column(db.String(255), nullable=False)
	email = db.Column(db.String(255), unique=True, nullable=False)
	password = db.Column(db.String(255), nullable=False)

class UserSchema(SQLAlchemyAutoSchema):
	username = fields.String(required=True)
	email = fields.Email(required=True)
	password = fields.String(required=True, load_only=True)
	class Meta:
		model = User
		load_instance = True
		sqla_session = db.session
		unknown = EXCLUDE

	@pre_load
	def normalize(self, data, **kwargs):
		if isinstance(data, dict):
			username = data.get("username")
			if isinstance(username, str):
				data["username"] = username.strip()
			email = data.get("email")
			if isinstance(email, str):
				data["email"] = email.strip().lower()
		return data

user_schema = UserSchema()

def load_user_payload(payload: dict) -> User:
	if not isinstance(payload, dict):
		raise ValueError("payload must be a JSON object")
	try:
		return user_schema.load(payload)
	except ValidationError as exc:
		raise ValueError(exc.messages) from exc

def email_exists(email: str) -> bool:
	return db.session.query(User.id)\
		.filter(User.email == email)\
		.first() is not None

def username_exists(username: str) -> bool:
	return db.session.query(User.id)\
		.filter(User.username == username)\
		.first() is not None
