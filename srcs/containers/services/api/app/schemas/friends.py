from app.extensions import ma, db
from app.models.Friends import Friends
from marshmallow import fields, Schema

class FriendsSchema(ma.SQLAlchemyAutoSchema):
	class Meta:
		model = Friends
		load_instance = True

	requester_id = fields.Integer(required=True)
	accepter_id = fields.Integer(required=True)
	status = fields.String()
