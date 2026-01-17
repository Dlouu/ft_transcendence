from flask_restx import Api
from .resources.user import ns as user_ns

api = Api(title="TranscendenceAPI", version="1.0", description="Transcendence REST API")

api.add_namespace(user_ns, path="/users")
