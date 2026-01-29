from app.extensions import db
from app.models.refresh_tokens import RefreshToken
from marshmallow import fields, Schema

class RefreshTokenSchema(Schema):
	user_id = fields.Integer(required=True)
	last_token = fields.String(required=False)
	active_token = fields.String(required=True)

refresh_token_schema = RefreshTokenSchema()
