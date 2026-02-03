from app.extensions import db
from app.models.refresh_tokens import RefreshToken, RefreshTokenRules
from marshmallow import fields, Schema
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema

class RefreshTokenSchema(SQLAlchemyAutoSchema):
	user_id = fields.Integer(required=True)
	last_token = fields.String(required=False, allow_none=True)
	active_token = fields.String(required=True)
	expire_date = fields.DateTime(required=True)

	class Meta:
		model = RefreshToken
		load_instance = True
		sqla_session = db.session

refresh_token_schema = RefreshTokenSchema()


class RefreshTokenRulesSchema(SQLAlchemyAutoSchema):
	token_id = fields.Integer(required=True)
	last_token_rules = fields.String(required=False, allow_none=True)
	active_token_rules = fields.String(required=True)

	class Meta:
		model = RefreshTokenRules
		load_instance = True
		sqla_session = db.session

refresh_token_rules_schema = RefreshTokenRules
