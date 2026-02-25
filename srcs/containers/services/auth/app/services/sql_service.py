from sqlalchemy.exc import SQLAlchemyError

from app.utils.logger import logger
from app.extensions import db

def safe_request(query, method="first"):
	methods = {
		"first": lambda x: x.first(),
		"all": lambda x: x.all(),
		"one": lambda x: x.one(),
		"scalar": lambda x: x.scalar()
	}

	func = methods.get(method)
	if not func:
		raise ValueError(f"Unsupported method: {method}.")

	try:
		return func(query)
	except SQLAlchemyError as e:
		logger.fatal("Unable to request the credentials database, the service might be down.", extra=logger.extra(target="auth_db"))
		return False
