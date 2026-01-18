import os

class Config:
	DB_HOST = os.getenv("DB_HOST", "localhost")
	DB_PORT = os.getenv("DB_PORT", "3306")
	DB_NAME = os.getenv("DB_NAME", "app")
	DB_USER = os.getenv("USER_DB_NAME", "user")
	DB_PASSWORD = os.getenv("DB_USER_PWD", "password")

	# SQLALCHEMY_DATABASE_URI = (
	# 	f"mysql+mysqldb://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
	# )
	SQLALCHEMY_DATABASE_URI = (
		f"mysql+mysqldb://usr875fdg:test@user_db:3306/user_db"
	)
	SQLALCHEMY_TRACK_MODIFICATION = False

