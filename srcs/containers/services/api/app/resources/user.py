from flask_restx import Namespace, Resource, fields
from flask import request
from app.models.user import User
from app.extensions import db
from app.schemas.user import user_schema, users_schema
from marshmallow import ValidationError

ns = Namespace("users", description="User operations")

user_model = ns.model("User", {
	"email": fields.String(required=True),
	"username": fields.String(required=False)
})

@ns.route("/")
class UserList(Resource):
	@ns.marshal_list_with(user_model)
	def	get(self):
		return User.query.all(), 200

	@ns.expect(user_model)
	@ns.marshal_with(user_model, code=201)
	def	post(self):
		user = None
		try:
			user = user_schema.load(request.json)
		except ValidationError as err:
			return {"message": err.messages}, 400
		db.session.add(user)
		db.session.commit()
		return user, 201
