from flask_restx import Namespace, Resource, fields, reqparse
from werkzeug.datastructures import FileStorage
from marshmallow import ValidationError
from flask import request, g
from uuid import uuid4
from PIL import Image
from io import BytesIO

from app.services import s3_bucket_service as s3s
from app.models.card_gallery import CardGallery
from app.schemas import card_gallery as sc
from app.utils.image_mask import mask
from app.utils.logger import logger
from app.schemas import user as su
from app.models.user import User
from app.extensions import db

ns = Namespace("User", description="User endpoints")

select_card_model = ns.model("UpdatePasswordModel", {
	"image_id": fields.Integer(required=True)
})

@ns.route("/select_card_image")
class SelectCardImage(Resource):
	@ns.jwt_required()
	@ns.s3_bucket_health_check()
	@ns.db_health_check()
	@ns.expect(select_card_model)
	def post(self):
		try:
			data = sc.select_card_image_schema.load(request.json)
		except ValidationError:
			logger.warning("Request validation error.", extra=logger.extra(request=request))
			return {"message": "The body is not valid."}, 400

		user_id = g.token_payload["user_id"]
		card_id = request.json["image_id"]
		extra_logger = logger.extra(request=request, user_id=user_id, target="user_db")

		user = User.query.filter_by(user_id=user_id).first()
		if not user:
			logger.critical("The user id does not exist in the user database",extra=extra_logger)
			return {"message": "The user ID does not exist."}, 401

		card = CardGallery.query.filter_by(id=card_id, user_id=user_id).first()
		if not card:
			logger.critical("No card have been found with the given id.", extra=extra_logger)
			return {"message": f"No card found with the given ID ({card_id})."}, 400

		user.card_back_id = card_id

		db.session.commit()

		return {"message": "success"}, 200

upload_model = reqparse.RequestParser()
upload_model.add_argument(
	"image",
	type=FileStorage,
	location="files",
	required=True,
	help="Image to upload."
)

upload_model.add_argument(
    "image_id",
    type=int,
    location="form",
    required=False,
    help="Card ID"
)

@ns.route("/upload_card_image")
class UploadCardImage(Resource):
	"""
	Allow the user to upload image for his cards.

	API:
		Method: POST
		Endpoint: /user/upload_card_image
		Token: yes

	Response:
		200: The image have been added to the s3 bucket and is now available for the user.
		400: The body is not valid or the image have a wrong format.
		401: Failed to upload the image to the s3 bucket.
	"""
	# check if image size is 136*88, if not resize it
	@ns.jwt_required()
	@ns.s3_bucket_health_check()
	@ns.db_health_check()
	@ns.expect(upload_model)
	def post(self):
		try:
			args = upload_model.parse_args()
			image_file = args["image"]

			if image_file.content_type not in {"image/jpeg", "image/png"}:
				return {"message": "File format not supported."}, 400
		except Exception as e:
			logger.warning("Request validation error.", extra=logger.extra(request=request, exception=e))
			return {"message": "Content invalid or wrong type."}, 400

		user_id = g.token_payload["user_id"]
		file_ext = image_file.filename.rsplit(".", 1)[-1]

		card = None

		if args["image_id"] is not None:
			card = CardGallery.query.filter_by(id=args["image_id"], user_id=user_id).first()

		s3_url = f"card_gallery/{user_id}/{uuid4()}.{file_ext}"
		if card:
			s3_url = card.img_url

		extra_logger = logger.extra(request=request, user_id=user_id, target="aws")

		if not card:
			try:
				image_db_obj = sc.card_gallery_schema.load({"user_id": user_id, "img_url": s3_url})
				db.session.add(image_db_obj)
			except ValidationError as e:
				db.session.rollback()
				logger.warning("Validation error when trying to load the image schema.", extra=extra_logger)
				return {"message": "Failure, something wrong happened while uploading this image."}, 400
			except Exception as e:
				db.session.rollback()
				logger.critical(f"Unhandled error happened while creating image database's object.", extra=extra_logger | logger.extra(exception=e))
				return {"message": "Failure, something wrong happened while uploading this image."}, 400
		else:
			if not s3s.delete_all_resources(card.img_url):
				db.session.rollback()
				logger.critical("Unable to delete the old profile picture", extra=extra_logger)
				return {"message": "Unable to delete the old profile picture."}, 401

		image_file.stream.seek(0, 2)
		file_size = image_file.stream.tell()
		image_file.stream.seek(0)

		try:
			img = Image.open(image_file.stream)

			if image_file.content_type == "image/png":
				img = img.convert("RGBA")
			else:
				img = img.convert("RGB")

			small_image = img.resize((88, 136), Image.NEAREST)

			pixels = small_image.load()

			for y in range(136):
				for x in range(88):
					m = mask[y][x]

					if m == 0:
						pixels[x, y] = (0, 0, 0, 0)
					elif m == 2:
						pixels[x, y] = (255, 255, 255, 255)
					elif m == 1 and pixels[x, y][3] == 0:
						pixels[x, y] = (43, 42, 51, 255)

			output = BytesIO()
			format = "PNG" if image_file.content_type == "image/png" else "JPEG"
			small_image.save(output, format=format)
			output.seek(0)

			processed_file = FileStorage(
				stream=output,
				filename=image_file.filename,
				content_type=image_file.content_type,
			)
		except Exception as e:
			db.session.rollback()
			logger.critical(f"Unhandled error happened while converting the image to the good format.", extra=extra_logger, exc_info=e)
			return {"message": "Failure, something wrong happened while uploading this image."}, 400

		if not s3s.add_resource(processed_file, s3_url):
			db.session.rollback()
			logger.critical(f"Failed to upload the image.", extra=extra_logger)
			return {"message": "Failed to upload the image."}, 401

		db.session.commit()

		card_id = image_db_obj.id if card == None else card.id

		logger.info("User's card picture uploaded.", extra=extra_logger)
		return {"message": "success", "image_id": card_id}, 201

remove_card_image_model = ns.model("RemoveCardImageModel", {
	"card_id": fields.Integer(required=True)
})

update_img_model = reqparse.RequestParser()
update_img_model.add_argument(
	"image",
	type=FileStorage,
	location="files",
	required=True,
	help="Image to upload."
)

update_img_model.add_argument(
    "image_id",
    type=int,
    location="form",
    required=True,
    help="Card ID"
)

@ns.route("/remove_card_image")
class RemoveCardImage(Resource):
	"""
	Allow the user to delete one of his card image.

	API:
		Method: POST
		Endpoint: /user/remove_card_image
		Token: yes

	Response:
		200: The image have been deleted from the s3 bucket.
		400: The body is not valid.
		404: The image can't be found in the s3 bucket.
	"""
	@ns.jwt_required()
	@ns.s3_bucket_health_check()
	@ns.db_health_check()
	@ns.expect(remove_card_image_model)
	def post(self):
		try:
			data = sc.delete_card_image_schema.load(request.json)
		except ValidationError:
			logger.warning("Request validation error.", extra=logger.extra(request=request))
			return {"message": "The body is not valid."}, 400

		user_id = g.token_payload["user_id"]
		extra_logger = logger.extra(request=request, user_id=user_id, target="aws")

		user = User.query.filter_by(user_id=user_id).first()

		if not user:
			logger.warning("A non-existent user attempted to delete an image.", extra=extra_logger)
			return {"message": "A problem occured while trying to delete this image, please contact an admin if the problem persist."}, 401

		card = CardGallery.query.filter_by(user_id=user_id, id=data["card_id"]).first()
		extra_logger = logger.extra(request=request, user_id=user_id, target="aws")

		if not card:
			logger.warning("A non-existent card was attempted to be deleted.", extra=extra_logger)
			return {"message": f"No card found with the id {data["card_id"]} for the user id {user_id}."}, 404

		if user.card_back_id == data["card_id"]:
			user.card_back_id = -1

		s3s.delete_resource(card.img_url)
		db.session.delete(card)
		db.session.commit()

		logger.info("card successfully removed.", extra=extra_logger)
		return {"message": "success"}, 200

get_card_img_model = reqparse.RequestParser()
get_card_img_model.add_argument("page", type=int, default=1, help="Page number.")
get_card_img_model.add_argument("per_page", type=int, default=50, help="Image URL per page.")

@ns.route("/get_card_images", defaults={"user_id": None})
@ns.route("/get_card_images/<user_id>")
class GetCardImage(Resource):
	"""
	This endpoint is used to get ALL the card images of a user.

	API:
		Method: GET
		Endpoint: /<user_id>/get_card_images
		Token: no

	Response:
		200: Success, all the image URL can be found in the response body.
		404: No image found for the given user id, can be caused because the user don't exist or
			simply because he don't have any image.
	"""
	@ns.jwt_required()
	@ns.db_health_check()
	@ns.expect(get_card_img_model)
	def get(self, user_id):
		page = request.args.get("page", 1, type=int)
		per_page = request.args.get("per_page", 50, type=int)

		per_page = min(per_page, 100)

		if user_id:
			query = CardGallery.query.filter_by(user_id=user_id)
		else:
			query = CardGallery.query

		pagination = query.paginate(page=page, per_page=per_page, error_out=False)

		# if not pagination.items:
		# 	logger.info(f"No card image found.",
		# 		extra=logger.extra(request=request, user_id=user_id, target="aws"))
		# 	return {"message": "No card image found."}, 200

		images_url = []
		for row in pagination.items:
			url = s3s.get_resource_url(row.img_url, -1)
			if url is not None:
				images_url.append({"url": url, "image_id": row.id, "user_id": row.user_id})

		logger.info(f"Cards successfully retrieved for the user id {user_id}.",
			extra=logger.extra(request=request, user_id=user_id, target="aws"))
		return {"message": "success", "images_url": images_url}, 200
