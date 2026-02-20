from app.extensions import db
from datetime import datetime

class Friends(db.Model):
	__bind_key__ = "user"
	__tablename__ = "friends"

	id = db.Column(db.BigInteger, primary_key=True)
	
	requester_id = db.Column(db.BigInteger, nullable=False)
	accepter_id = db.Column(db.BigInteger, nullable=False)

	status = db.Column(db.String(20), nullable=False, default="pending")

	created_at = db.Column(db.datetime, default=datetime.utcnow)
	updated_at = db.Column(db.datetime, default=datetime.utcnow, onupdate=datetime.utcnow)

	__table_args__ = (
		db.UniqueConstraint('requester_id', 'accepter_id', name='unique_friendship'),
	)
