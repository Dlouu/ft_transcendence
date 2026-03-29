from app.extensions import db

class CardGallery(db.Model):
	__tablename__ = "card_gallery"

	id = db.Column(db.BigInteger, primary_key=True)
	user_id = db.Column(db.BigInteger, db.ForeignKey("users.user_id"), nullable=False)
	img_url = db.Column(db.String(255), nullable=False)

	created_at = db.Column(db.DateTime, server_default=db.func.now())
	updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())