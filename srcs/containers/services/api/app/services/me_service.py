import os

from app.services import request_service as rs
from app.models.user import User
from app.extensions import s3

def me(user_id):
	user = User.query.filter_by(user_id=user_id).first()

	if not user:
		return {"message": f"No user found with the id {user_id}."}, 404

	response = rs.make_request(f"/user/email/{user_id}", "GET")

	if response.status_code != 200:
		return response.json(), response.status_code

	profile_picture_url = s3.generate_presigned_url(
		ClientMethod="get_object",
		Params={"Bucket": os.getenv("S3_BUCKET_NAME"), "Key": user.profile_picture_url},
		ExpiresIn = 3600,
	)

	return {
		"message": "success",
		"user_id": user_id,
		"username": user.username,
		"email": response.json()["email"],
		"profile_picture_url": profile_picture_url,
		"created_at": user.created_at.timestamp(),
		"updated_at": user.updated_at.timestamp(),
	}, 200
