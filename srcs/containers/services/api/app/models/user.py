from app.extensions import db
from sqlalchemy.sql import func

class User(db.Model):
	__bind_key__ = "user"
	__tablename__ = "users"

	id = db.Column(db.BigInteger, primary_key=True)
	email = db.Column(db.String(255), unique=True, nullable=False)
	username = db.Column(db.String(100), nullable=True)

	is_active = db.Column(db.Boolean, nullable=False, default=True)

	created_at = db.Column(db.DateTime, server_default=func.now(), nullable=False)
	updated_at = db.Column(
		db.DateTime,
		server_default=None,
		onupdate=func.now()
	)

