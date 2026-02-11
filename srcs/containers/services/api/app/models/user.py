from app.extensions import db
from app.models.card_gallery import CardGallery

class User(db.Model):
	__bind_key__ = "user"
	__tablename__ = "users"

	id = db.Column(db.BigInteger, primary_key=True)
	user_id = db.Column(db.BigInteger, nullable=False, unique=True)
	username = db.Column(db.String(100), nullable=False)

	is_active = db.Column(db.Boolean, nullable=False, default=True)

	created_at = db.Column(db.DateTime, server_default=db.func.now())
	updated_at = db.Column(db.DateTime, server_default=db.func.now())

	cards = db.relationship("CardGallery", backref="card_gallery", lazy=True)
