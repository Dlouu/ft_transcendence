import os

from app.services import request_service as rs
from app.models.user import User
from app.extensions import s3
from app.services import s3_bucket_service as s3s

def me(user_id):
	user = User.query.filter_by(user_id=user_id).first()

	if not user:
		return {"message": f"No user found with the id {user_id}."}, 404

	response = rs.make_request(f"/user/email/{user_id}", "GET")

	if response.status_code != 200:
		return response.json(), response.status_code

	profile_picture_url = s3s.get_resource_url(user.profile_picture_url)
	print(user.profile_picture_url, flush=True)
	return {
		"message": "success",
		"user_id": user_id,
		"username": user.username,
		"email": response.json()["email"],
		"profile_picture_url": profile_picture_url,
		"created_at": user.created_at.timestamp(),
		"updated_at": user.updated_at.timestamp(),
	}, 200
