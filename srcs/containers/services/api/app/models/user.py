from sqlalchemy import event

from app.models.card_gallery import CardGallery
from app.utils.logger import logger
from app.extensions import db

class User(db.Model):
	__tablename__ = "users"

	id = db.Column(db.BigInteger, primary_key=True)
	user_id = db.Column(db.BigInteger, nullable=False, unique=True)
	username = db.Column(db.String(255), nullable=False)
	profile_picture_url = db.Column(db.String(255), nullable=False)
	card_back_id = db.Column(db.BigInteger, nullable=False)

	is_active = db.Column(db.Boolean, nullable=False, default=True)

	created_at = db.Column(db.DateTime, server_default=db.func.now())
	updated_at = db.Column(db.DateTime, server_default=db.func.now())


	cards = db.relationship("CardGallery", backref="card_gallery", lazy=True)

@event.listens_for(User, "after_insert")
def create_gamestats(mapper, connection, target):
    connection.execute(
        db.metadata.tables["gamestats"].insert().values(user_id=target.user_id)
    )


