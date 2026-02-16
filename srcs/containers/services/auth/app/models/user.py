from app.extensions import db

class User(db.Model):
	__tablename__ = "credentials"

	id = db.Column(db.BigInteger, primary_key=True)
	username = db.Column(db.String(255), unique=True, nullable=False)
	email = db.Column(db.String(255), unique=True, nullable=False)
	password = db.Column(db.String(255), nullable=False)
