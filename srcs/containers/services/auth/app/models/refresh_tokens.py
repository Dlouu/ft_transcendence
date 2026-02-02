from app.extensions import db

class RefreshToken(db.Model):
	# __bind_key__ = "auth_data"
	__tablename__ = "refresh_tokens"

	id = db.Column(db.BigInteger, primary_key=True)
	user_id = db.Column(db.BigInteger, nullable=False)
	last_token = db.Column(db.String(255), nullable=True)
	active_token = db.Column(db.String(255), nullable=False)
	expire_date = db.Column(db.DateTime, nullable=False)

