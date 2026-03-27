from app.core.extensions import db

class CardGallery(db.Model):
	__tablename__ = "card_gallery"

	id = db.Column(db.BigInteger, primary_key=True)
	user_id = db.Column(db.BigInteger, db.ForeignKey("users.user_id"), nullable=False)
	img_url = db.Column(db.String(255), nullable=False)
