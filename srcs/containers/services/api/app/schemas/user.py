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

class UserUpdateSchema(Schema):
	is_active = fields.Boolean(required=True)
	updated_at = fields.DateTime(required=True)

user_update_schema = UserUpdateSchema()

class UserLoginSchema(Schema):
	email = fields.Email(required=True)
	username = fields.String(required=True)
	password = fields.String(required=True, load_only=True)

user_login_schema = UserLoginSchema()
