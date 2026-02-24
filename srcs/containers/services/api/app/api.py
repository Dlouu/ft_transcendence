from flask_restx import Api, Namespace

from app.decorators.jwt_required import jwt_required
Namespace.jwt_required = jwt_required

from app.decorators.s3_bucket_health_check import s3_bucket_health_check
Namespace.s3_bucket_health_check = s3_bucket_health_check

from app.resources.authentification import ns as authentification_ns
from app.resources.user import ns as haha_ns
from app.resources.test import ns as test_ns

api = Api(title="TranscendenceAPI",
	version="1.0",
	description="Transcendence REST API",
	security="BearerAuth",
	authorizations={
		"BearerAuth": {
			"type": "apiKey",
			"in": "header",
			"name": "Authorization",
			"description": "Add a JWT with 'Bearer <token>'"
		}
	})

api.add_namespace(authentification_ns, path="/auth")
api.add_namespace(haha_ns, path="/user")
api.add_namespace(test_ns, path="/test")

from app.utils.logger import logger
