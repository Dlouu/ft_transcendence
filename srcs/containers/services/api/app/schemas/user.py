from app.extensions import ma, db
from app.models.user import User
from marshmallow import fields, Schema

class UserSchema(ma.SQLAlchemyAutoSchema):
	username = fields.String(required=True)
	user_id = fields.Integer(required=True)
	class Meta:
		model = User
		load_instance = True
		sqla_session = db.session
		load_only = ("id")

user_schema = UserSchema()
users_schema = UserSchema(many=True)

class UserRegistrationSchema(Schema):
	email = fields.String(required=True)
	username = fields.String(required=True)
	password = fields.String(required=True, load_only=True)

user_registration_schema = UserRegistrationSchema()

class UserLoginSchema(Schema):
	login_email = fields.String(required=True)
	password = fields.String(required=True, load_only=True)

user_login_schema = UserLoginSchema()

class UserUpdateSchema(Schema):
	email = fields.String(required=False)
	username = fields.String(required=False)

user_update_schema = UserUpdateSchema()

class PasswordUpdateSchema(Schema):
	password = fields.String(required=True)
	new_password = fields.String(required=True)

password_update_schema = PasswordUpdateSchema()

