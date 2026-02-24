from app.extensions import ma, db
from app.models.Friends import Friends
from marshmallow import fields, Schema

#(serialization, talks to API, converts data to json)

class FriendsSchema(ma.SQLAlchemyAutoSchema):
	class Meta:
		model = Friends
		load_instance = True

	requester_id = fields.Integer(required=True)
	accepter_id = fields.Integer(required=True)

	status = fields.String()

	created_at = fields.DateTime(dump_only=True)
	updated_at = fields.DateTime(dump_only=True)

