from flask_restx import Namespace, Resource, fields
from marshmallow import ValidationError
from flask import request, g

from app.services.request_service import make_request
from app.schemas.user import friend_entry_schema
from app.utils.logger import logger

ns = Namespace("Friends", description="Friends management endpoints.")

def friends_management(req_type):
	try:
		data = friend_entry_schema.load()
	except ValidationError:
		logger.warning("Request validation error.", extra=logger.extra(request=request))
		return {"message": "The body is not valid."}, 400

	request.json["author_id"] = g.token_payload["user_id"]
	request.json["target_id"] = data["user_id"]
	response = make_request(f"/lobby/{req_type}", "POST")
	json_response = response.json()

	if (response.status_code != 200):
		logger.warning(json_response, extra=logger.extra(request=request, response=response, target="auth"))
		return json_response, response.status_code

	return {"message": "success"}, 200

friends_management_model = ns.model("FriendToAddModel", {
	"user_id": fields.Integer(required=True)
})

@ns.route("/add")
class AddFriend(Resource):
	@ns.jwt_required()
	@ns.expect(friends_management_model)
	def post(self):
		return friends_management("add")

@ns.route("/remove")
class RemoveFriend(Resource):
	@ns.jwt_required()
	@ns.expect(friends_management_model)
	def post(self):
		return friends_management("remove")

@ns.route("/request_response")
class RequestResponse(Resource):
	@ns.jwt_required()
	@ns.expect(friends_management_model)
	def post(self):
		return friends_management("request_response")
