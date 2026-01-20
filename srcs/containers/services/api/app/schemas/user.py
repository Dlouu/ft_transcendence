from app.extensions import ma, db
from app.models.user import User
from marshmallow import fields

class UserSchema(ma.SQLAlchemyAutoSchema):
	email = fields.Email(required=True)
	class Meta:
		model = User
		load_instance = True
		sqla_session = db.session
		load_only = ("id")

user_schema = UserSchema()
users_schema = UserSchema(many=True)

class UserLoginSchema(ma.SQLAlchemyAutoSchema):
	email = fields.Email(required=True)
	password = fields.String(required=True, load_only=True)

user_login_schema = UserLoginSchema()
