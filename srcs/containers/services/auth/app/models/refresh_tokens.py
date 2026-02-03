from app.extensions import db

class RefreshToken(db.Model):
	# __bind_key__ = "auth_data"
	__tablename__ = "refresh_token"

	id = db.Column(db.BigInteger, primary_key=True)
	user_id = db.Column(db.BigInteger, nullable=False)
	last_token = db.Column(db.String(255), nullable=True)
	active_token = db.Column(db.String(255), nullable=False)
	expire_date = db.Column(db.DateTime, nullable=False)
	rules = db.relationship("RefreshTokenRules", backref="token", lazy=True, uselist=False)

class RefreshTokenRules(db.Model):
	__tablename__ = "refresh_token_rules"

	id = db.Column(db.BigInteger, primary_key=True)
	token_id = db.Column(db.BigInteger, db.ForeignKey("refresh_token.id"), nullable=False)
	last_token_rules = db.Column(db.String(255), nullable=True)
	active_token_rules = db.Column(db.String(255), nullable=False)
