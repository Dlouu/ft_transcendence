from flask_restx import Namespace, Resource, fields, reqparse
from werkzeug.datastructures import FileStorage
from marshmallow import ValidationError
from flask import request, g
from uuid import uuid4
import os

from app.schemas.card_gallery import card_gallery_schema
from app.utils import session_token as st
from app.extensions import s3, db

ns = Namespace("bucket", description="S3 bucket operation")

@ns.route("/ping")
class Ping(Resource):
	@ns.s3_bucket_health_check()
	def get(self):
		return {"message": "success"}, 200

upload_model = reqparse.RequestParser()
upload_model.add_argument(
	"image",
	type=FileStorage,
	location="files",
	required=True,
	help="Image to upload."
)

@ns.route("/upload")
class Upload(Resource):
	@ns.jwt_required()
	@ns.expect(upload_model)
	@ns.s3_bucket_health_check()
	def post(self):
		try:
			args = upload_model.parse_args()
			image_file = args["image"]

			if image_file.content_type not in {"image/jpeg", "image/png"}:
				return {"message": "File format not supported."}, 400
		except Exception as e:
			print(f"A problem occured while parsing data ({e})", flush=True)
			return {"message": "Bad request"}, 400

		payload = g.token_payload

		file_ext = image_file.filename.rsplit(".", 1)[-1]
		s3_url = f"card_gallery/{payload["user_id"]}/{uuid4()}.{file_ext}"

		print(s3_url, flush=True)

		if True:
			return {"message": "bypass"}, 200

		try:
			image_db_obj = card_gallery_schema.load({"user_id": payload["user_id"], "img_url": s3_url})
			db.session.add(image_db_obj)
		except ValidationError as e:
			db.session.rollback()
			print(f"Something wrong happened while creating image database's object for user id {payload["user_id"]} ({g.token}), the image '{image_file.filename}' will not be uploaded.", flush=True)
			return {"message": "Failure, something wrong happened while uploading this image."}, 400
		except Exception as e:
			db.session.rollback()
			print(f"Unhandled error happened while creating image database's object for user id {payload["user_id"]} ({g.token}), handle this error as soons as possible ({e}).", flush=True)
			return {"message": "Failure, something wrong happened while uploading this image."}, 400

		try:
			s3.upload_fileobj(image_file, os.getenv("S3_BUCKET_NAME", ""), s3_url, ExtraArgs={"ContentType": image_file.content_type})
		except Exception as e:
			db.session.rollback()
			print(f"Something wrong happened while uploadtingthe image to the s3 bucket for user id {payload["user_id"]} ({g.token}), resolve this issue as soon as possible ({e})", flush=True)
			return {"message": "Failure, something wrong happened while uploading this image."}, 400

		db.session.commit()
		return {"message": "success"}, 201
