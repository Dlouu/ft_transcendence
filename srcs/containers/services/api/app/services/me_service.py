from app.models.user import User
from app.services import request_service as rs

def me(user_id):
	user = User.query.filter_by(user_id=user_id).first()

	if not user:
		return {"message": f"No user found with the id {user_id}."}, 404

	response = rs.make_request(f"http://auth:5055/user/email/{user_id}", "GET")

	if response.status_code != 200:
		return response.json(), response.status_code

	return {
		"message": "success",
		"user_id": user_id,
		"username": user.username,
		"email": response.json()["email"],
		"created_at": user.created_at.timestamp(),
		"updated_at": user.updated_at.timestamp(),
	}, 200
