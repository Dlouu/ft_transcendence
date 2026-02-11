from flask_restx import Resource, Namespace, fields
from flask import request, g
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

@ns.route("/test_jwt")
class TestJWT(Resource):
	@ns.doc(security="BearerAuth")
	@ns.jwt_required()
	def get(self):
		return {"message": "success", "data": [g.token_payload]}, 200
