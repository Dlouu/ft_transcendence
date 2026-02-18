from app.extensions import ma, db
from app.models.friends import Friends
from marshmallow import fields, Schema

class FriendsSchema(ma.SQLAlchemyAutoSchema):
	user_id = fields.Integer(required=True, nullable=False)
	username = fields.String(required=True)

	profile_picture_url = fields.String(nullable=False)
	is_active = fields.Boolean(nullable=False)

	friend_id = fields.Integer()
	status = fields.String()