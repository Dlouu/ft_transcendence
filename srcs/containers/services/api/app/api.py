from flask_restx import Api, Namespace
from app.decorators.jwt_required import jwt_required

Namespace.jwt_required = jwt_required

from app.resources.user import ns as user_ns
from app.resources.test import ns as test_ns
from app.resources.aws_s3_bucket import ns as bucket_ns

api = Api(title="TranscendenceAPI",
	version="1.0",
	description="Transcendence REST API",
	security="BearerAuth",  # default security for all endpoints
	authorizations={
		"BearerAuth": {
			"type": "apiKey",
			"in": "header",
			"name": "Authorization",
			"description": "Add a JWT with 'Bearer <token>'"
		}
	})

api.add_namespace(user_ns, path="/users")
api.add_namespace(test_ns, path="/tests")
api.add_namespace(bucket_ns, path="/bucket")
