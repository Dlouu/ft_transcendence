from flask_restx import Namespace, Resource
from flask import request, g
from datetime import datetime, timezone

from app.utils import session_token as st
from app.models.user import User
from app.extensions import db

ns = Namespace("User", description="User endpoints")

@ns.route("/me")
class Me(Resource):
	@ns.jwt_required()
	def get(self):
		print(request.cookies.get("session_token"), flush=True)

		payload = g.token_payload

		user = User.query.filter_by(user_id=payload["user_id"]).first()
		if not user:
			return {"message": "No user found using /me"}, 404

		updated_at = datetime.now(timezone.utc)
		user.updated_at = updated_at

		db.session.commit()

		response = {
			"message": "success",
			"user_id": user.user_id,
			"username": user.username,
			"created_at": user.created_at.timestamp(),
			"updated_at": user.updated_at.timestamp()
		}
		return response, 200
