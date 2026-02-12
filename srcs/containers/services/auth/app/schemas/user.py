from marshmallow import fields, Schema
from marshmallow import EXCLUDE, fields, pre_load
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from app.extensions import db
from app.models.user import User

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

class UserUpdateSchema(Schema):
	email = fields.String(required=False)
	username = fields.String(required=False)
	user_id = fields.Integer(required=True)

user_update_schema = UserUpdateSchema()

class PasswordUpdateSchema(Schema):
	password = fields.String(required=True)
	new_password = fields.String(required=True)
	user_id = fields.Integer(required=True)

password_update_schema = PasswordUpdateSchema()

class DeleteAccountSchema(Schema):
	password = fields.String(required=True)
	user_id = fields.Integer(required=True)

delete_account_schema = DeleteAccountSchema()
