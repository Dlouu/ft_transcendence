from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text
from functools import wraps

from app.utils.logger import logger
from app.extensions import db

def db_health_check(self):
	def decorator(f):
		@wraps(f)
		def decorated(*args, **kwargs):
			try:
				db.session.execute(text("SELECT 1;"))
			except SQLAlchemyError as e:
				logger.fatal("Unable to communicate with the user database. Service might be down.",
					extra=logger.extra(target="user_db", more={"error.args": e.args}))
				return {"message": "Service currently unavailable."}, 503
			return f(*args, **kwargs)
		return decorated
	return decorator
