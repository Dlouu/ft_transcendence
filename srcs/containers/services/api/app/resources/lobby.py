from flask_restx import Namespace, Resource, fields

from app.services.request_service import make_request

ns = Namespace("Lobby", description="Lobby endpoints")

@ns.route("/ping")
class Ping(Resource):
	def get(self):
		response = make_request("/pong", method="GET", service="lobby:5002")
		return response.json(), response.status_code

@ns.route("/create_lobby")
class CreateLobby(Resource):
	@ns.jwt_required()
	def get(self):
		response = make_request("/create_lobby", method="POST", service="lobby:5002")
		return response.json(), response.status_code

@ns.route("/join_lobby")
class JoinLobby(Resource):
	@ns.jwt_required()
	def get(self):
		response = make_request("/join_lobby", method="POST", service="lobby:5002")
		return response.json(), response.status_code

@ns.route("/leave_lobby")
class LeaveLobby(Resource):
	@ns.jwt_required()
	def get(self):
		response = make_request("/leave_lobby", method="POST", service="lobby:5002")
		return response.json(), response.status_code

