from flask_restx import Api, Namespace
from .decorators.jwt_required import jwt_required

Namespace.jwt_required = jwt_required

from .resources.user import ns as user_ns

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
