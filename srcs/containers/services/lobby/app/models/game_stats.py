from app.extensions import db
from app.models import user
from datetime import datetime

#database model (how I create it)

class GameStats(db.Model):
	__tablename__ = "gamestats"

	id = db.Column(db.BigInteger, primary_key=True)

	user_id = db.Column(
		db.BigInteger,
		db.ForeignKey("users.user_id", ondelete="CASCADE"),
		nullable=False,
		unique=True
	)

	winrate = db.Column(db.Float, default=0)
	games_played = db.Column(db.BigInteger, default=0)
	games_won = db.Column(db.BigInteger, default=0)
	games_lose = db.Column(db.BigInteger, default=0)
	nbr_uno = db.Column(db.BigInteger, default=0)
	nbr_uwu = db.Column(db.BigInteger, default=0)
	nbr_4cards = db.Column(db.BigInteger, default=0)
	nbr_drew = db.Column(db.BigInteger, default=0)
	biggest_hand = db.Column(db.BigInteger, default=0)

	user = db.relationship("User", backref=db.backref("stats", uselist=False))

	created_at = db.Column(db.DateTime, server_default=db.func.now())
	updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
