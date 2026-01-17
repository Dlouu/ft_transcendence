import os

class Config:
	SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "mysql+mysqldb://user:password@db:3306/app")
	SQLALCHEMY_TRACK_MODIFICATION = False
	
