from flask_restx import Namespace, Resource

from app.schemas.game import game_schema

ns = Namespace("Gaame", description="Game endpoints")

@ns.route("update_stats")
class UpdateStats(Resource):
	def post(self):
		pass
