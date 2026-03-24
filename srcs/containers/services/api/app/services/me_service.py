import os

from app.services import request_service as rs
from app.models.user import User
from app.models.card_gallery import CardGallery
from app.extensions import s3
from app.services import s3_bucket_service as s3s

def me(user_id, email=None):
	"""
	This function is used to get all the data needed for the user in the front end.

	param:
		user_id: The user id.

	return:
		dict (body), int (code)
	"""
	user = User.query.filter_by(user_id=user_id).first()

	if not user:
		return {"message": f"No user found with the id {user_id}."}, 404

	if email is None:
		response = rs.make_request(f"/user/email/{user_id}", "GET")

		if response.status_code != 200:
			return response.json(), response.status_code

	try:
		profile_picture_url = s3s.get_resource_url(user.profile_picture_url, -1)
	except Exception as e:
		profile_picture_url = None

	card_back_url = CardGallery.query.filter_by(id=user.card_back_id).first()
	if not card_back_url:
		card_back_url = "default/url"
	else:
		card_back_url = card_back_url.img_url

	return {
		"message": "success",
		"user_id": user_id,
		"username": user.username,
		"email": response.json()["email"] if email is None else email,
		"profile_picture_url": profile_picture_url,
		"card_back_url": card_back_url,
		"created_at": user.created_at.timestamp(),
		"updated_at": user.updated_at.timestamp(),
	}, 200
