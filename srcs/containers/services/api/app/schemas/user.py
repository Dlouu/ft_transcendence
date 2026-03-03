from app.extensions import ma, db
from app.models.user import User
from app.models.game_stats import GameStats
from marshmallow import fields, Schema

class UserSchema(ma.SQLAlchemyAutoSchema):
	username = fields.String(required=True)
	user_id = fields.Integer(required=True)
	profile_picture_url = fields.String(required=True)
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

class DeleteAccountSchema(Schema):
	password = fields.String(required=True)

delete_account_schema = DeleteAccountSchema()

class DeleteCardImageSchema(Schema):
	card_id = fields.Integer(required=True)

delete_card_image_schema = DeleteCardImageSchema()

class GameStatsSchema(ma.SQLAlchemyAutoSchema):
	class Meta:
		model = GameStats
		load_instance = True
		sqla_session = db.session

	winrate = fields.Float()

	games_played = fields.Integer()
	games_won = fields.Integer()
	nbr_uno = fields.Integer()
	nbr_uwu = fields.Integer()
	nbr_4cards = fields.Integer()
	nbr_drew = fields.Integer()
	biggest_hand = fields.Integer()

	created_at = fields.DateTime(dump_only=True)
	updated_at = fields.DateTime(dump_only=True)