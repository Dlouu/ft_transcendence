from flask_restx import Resource, Namespace, fields
from flask import request, g
import requests

ns = Namespace("tests", description="Use this to make some test on services.")

@ns.route("/test_jwt")
class TestJWT(Resource):
	@ns.doc(security="BearerAuth")
	@ns.jwt_required()
	def get(self):
		if not g.token_payload:
			return {"message": "Unable to validate the token."}, 401

		return {"message": "success", "data": [g.token_payload]}, 200
