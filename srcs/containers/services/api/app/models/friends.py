from app.extensions import db

class Friends(db.Model):
	__bind_key__ = "user"
	__tablename__ = "friends"
	id = db.Column(db.BigInteger, primary_key=True)
	user_id = db.Column(db.BigInteger, nullable=False, unique=True)
	username = db.Column(db.String(255), nullable=False)

	profile_picture_url = db.Column(db.String(255), nullable=False)
	is_active = db.Column(db.Boolean, nullable=False, default=True)

	friend_id = db.Column(db.BigInteger) #liste de tous ses friends
	status = db.Column(db.String(20)) #pending, accepted none

	created_at = db.Column(db.DateTime, server_default=db.func.now())
	updated_at = db.Column(db.DateTime, server_default=db.func.now())

