from marshmallow import Schema, fields

class PlayerSchema(Schema):
	user_id = fields.String(required=True)
	win_game = fields.Boolean(required=True)
	nbr_uno = fields.Integer(required=True)
	nbr_uwu = fields.Integer(required=True)
	nbr_4cards = fields.Integer(required=True)
	nbr_drew = fields.Integer(required=True)
	biggest_hand = fields.Integer(required=True)

class GameSchema(Schema):
	players = fields.List(
		fields.Nested(PlayerSchema),
		required=True
	)

game_schema = GameSchema()

