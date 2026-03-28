from app.core.extensions import db
from datetime import datetime

#database model (how I create it)

class Friends(db.Model):
	__tablename__ = "friends"

	id = db.Column(db.BigInteger, primary_key=True)
	
	requester_id = db.Column(db.BigInteger, nullable=False)
	accepter_id = db.Column(db.BigInteger, nullable=False)

	status = db.Column(db.String(20), nullable=False, default="pending")


	created_at = db.Column(db.DateTime, server_default=db.func.now())
	updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

	__table_args__ = (
		db.UniqueConstraint('requester_id', 'accepter_id', name='unique_friendship'),
	)
