from flask_restx import Namespace, Resource, fields, reqparse
from werkzeug.datastructures import FileStorage
from uuid import uuid4

from app.extensions import s3

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
	@ns.expect(upload_model)
	@ns.jwt_required()
	@ns.s3_bucket_health_check()
	def post(self):
		args = upload_model.parse_args()
		image_file = args["image"]

		if image_file.content_type not in {"image/jpeg", "image/png"}:
			return {"message": "File format not supported."}, 400

		return {"message": "success"}, 201
