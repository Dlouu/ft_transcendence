from flask_restx import Namespace, Resource, fields
from marshmallow import ValidationError
from flask import request

from app.models.gamestats import GameStats
from app.schemas.game import game_schema
from app.utils.logger import logger
from app.models.user import User
from app.extensions import db

ns = Namespace("Game", description="Game endpoints")

stats_fields = ns.model("Player", {
	"user_id": fields.Integer(required=True),
	"win_game": fields.Boolean(required=True),
	"nbr_uno": fields.Integer(required=True),
	"nbr_uwu": fields.Integer(required=True),
	"nbr_4cards": fields.Integer(required=True),
	"nbr_drew": fields.Integer(required=True),
	"biggest_hand": fields.Integer(required=True),
})

stats_model = ns.model("Game", {
	"players": fields.List(
		fields.Nested(stats_fields),
		required=True
	)
})

@ns.route("/stats")
class UpdateStats(Resource):
	@ns.db_health_check()
	@ns.expect(stats_model)
	def post(self):
		try:
			data = game_schema.load(request.json)
		except ValidationError:
			logger.warning("Request validation error.", extra=logger.extra(request=request))
			return {"message": "The body is no valid."}, 400

		for player in data["players"]:
			print(player, flush=True)
			if not User.query.filter_by(user_id=player["user_id"]).first():
				logger.warning("Trying to add game stats to a user ID that does not exist.", extra=logger.extra(user_id=player["user_id"]))
				continue

			gamestats = GameStats.query.filter_by(user_id=player["user_id"]).first()

			if not gamestats:
				gamestats = GameStats(
					games_played = 1,
					games_won = 1 if player["win_game"] else 0,
					games_lose = 1 if not player["win_game"] else 0,
					winrate = 100 if player["win_game"] else 0,
					user_id=player["user_id"],
					nbr_uno=player["nbr_uno"],
					nbr_uwu=player["nbr_uwu"],
					nbr_4cards=player["nbr_4cards"],
					nbr_drew=player["nbr_drew"],
					biggest_hand=player["biggest_hand"]
				)

				db.session.add(gamestats)
			else:
				gamestats.games_played = gamestats.games_played + 1
				gamestats.nbr_uno = gamestats.nbr_uno + player["nbr_uno"]
				gamestats.nbr_uwu = gamestats.nbr_uwu + player["nbr_uwu"]
				gamestats.nbr_4cards = gamestats.nbr_4cards + player["nbr_4cards"]
				gamestats.nbr_drew = gamestats.nbr_drew + player["nbr_drew"]
				gamestats.biggest_hand = player["biggest_hand"]

				if player["win_game"]:
					gamestats.games_won = gamestats.games_won + 1
				else:
					gamestats.games_lose = gamestats.games_lose + 1

				if gamestats.games_lose != 0:
					gamestats.winrate = gamestats.games_won / gamestats.games_played * 100

			db.session.commit()

		return {"message": "success"}, 200


@ns.route("/stats/<int:user_id>")
class GetStats(Resource):
	@ns.jwt_required()
	@ns.db_health_check()
	def get(self, user_id=None):
		gamestats = GameStats.query.filter_by(user_id=user_id).first()

		if not gamestats:
			return {"message": f"Unable to get stats for the ID {user_id}."}, 404

		return {"message": "success", "data": {
			"games_played": gamestats.games_played,
			"games_won": gamestats.games_won,
			"games_lose": gamestats.games_lose,
			"winrate": gamestats.winrate,
			"user_id": gamestats.user_id,
			"nbr_uno": gamestats.nbr_uno,
			"nbr_uwu": gamestats.nbr_uwu,
			"nbr_4cards": gamestats.nbr_4cards,
			"nbr_drew": gamestats.nbr_drew,
			"biggest_hand": gamestats.biggest_hand
		}}, 200
