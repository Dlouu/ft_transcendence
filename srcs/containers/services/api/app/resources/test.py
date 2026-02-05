from flask_restx import Resource, Namespace, fields
from flask import request
import requests


ns = Namespace("tests", description="Use this to make some test on services.")

test_model = ns.model("Test", {
	"haha": fields.String()
})

@ns.route("/test")
class Test(Resource):
	@ns.expect(test_model)
	def post(self):
		dct = dict(request.headers)
		for k, v in dct.items():
			print(k, " --- ", v, flush=True)
		print(request.remote_addr, flush=True)
		print(request.remote_user, flush=True)
		return {}, 200
	def get(self):
		dct = dict(request.headers)
		for k, v in dct.items():
			print(k, " --- ", v, flush=True)
		print(request.remote_addr, flush=True)
		print(request.remote_user, flush=True)
		return {}, 200

jwt_test = ns.model("JWTTest", {
	"jwt": fields.String()
})

@ns.route("/test_jwt")
class TestJWT(Resource):
	@ns.expect(jwt_test)
	@ns.doc(security="BearerAuth")
	@ns.jwt_required()
	def post(self):
		return {"message": "success"}, 200


@ns.route("/test_refresh_token")
class TestRefreshToken(Resource):
	def get(self):
		response = requests.get(
			"http://auth:5001/token_handler/test_refresh_token",
			headers=request.headers,
			timeout=5
		)
		return response.status_code
