import os

class Config:
	SQLALCHEMY_BINDS = {
		"credential": os.getenv("CREDENTIAL_DATABASE_URI"),
		"user": os.getenv("USER_DATABASE_URI")
	}
	SQLALCHEMY_TRACK_MODIFICATION = False
