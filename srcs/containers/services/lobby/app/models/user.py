from app.core.extensions import db

#json serialization

class User(db.Model):
	__tablename__ = "users"

	id = db.Column(db.BigInteger, primary_key=True)
	user_id = db.Column(db.BigInteger, nullable=False, unique=True)
	username = db.Column(db.String(255), nullable=False, unique=True)
	profile_picture_url = db.Column(db.String(255), nullable=False)

	is_active = db.Column(db.Boolean, nullable=False, default=True)

	created_at = db.Column(db.DateTime, server_default=db.func.now())
	updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
