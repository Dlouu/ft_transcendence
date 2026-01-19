import os

class Config:
	DB_HOST = os.getenv("DB_USER_HOST", "localhost")
	DB_PORT = os.getenv("DB_PORT", "3306")
	DB_NAME = os.getenv("USER_DB_NAME", "app")
	DB_USER = os.getenv("USER_DB_USER_NAME", "user")
	DB_PASSWORD = os.getenv("USER_DB_USER_PWD", "password")
	AUTH_DATABASE_URI = os.getenv("AUTH_DATABASE_URI", "none")
	print(os.getenv("AUTH_DATABASE_URI"))

	SQLALCHEMY_DATABASE_URI = (
		# f"mysql+mysqldb://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
		AUTH_DATABASE_URI
	)
	SQLALCHEMY_TRACK_MODIFICATION = False
