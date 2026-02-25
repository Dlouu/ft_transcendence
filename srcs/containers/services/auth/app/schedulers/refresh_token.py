from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timezone
from sqlalchemy.orm import joinedload
from sqlalchemy import text
import atexit, os

from apscheduler.schedulers.background import BackgroundScheduler
from app.decorators.db_health_check import db_health_check
from app.models.refresh_tokens import RefreshToken
from app.utils.logger import logger
from app.extensions import db

def init_schedulers(app):
	"""
		This scheduler check all refresh token's expiration date and move them to the old_token column
		when a token expired.
		The interval is defined by the environment variable REFRESH_TOKEN_EXPIRATION_CHECK_DELAY.
	"""
	def refresh_token_expiration_check():
		with app.app_context():
			query = RefreshToken.query.options(joinedload(RefreshToken.rules))

			refresh_token_count = 0
			refresh_token_without_active = 0
			refresh_token_expired = 0
			try:
				for row in query.yield_per(50):
					refresh_token_count += 1
					if row.active_token is None or row.expire_date is None:
						refresh_token_without_active += 1
						continue

					expire_date_aware = row.expire_date.replace(tzinfo=timezone.utc)
					if expire_date_aware > datetime.now(tz=timezone.utc):
						continue

					row.last_token = row.active_token
					row.rules.last_token_rules = row.rules.active_token_rules

					row.active_token = None
					row.rules.active_token_rules = None
					row.expire_date = None

					db.session.commit()
					refresh_token_expired += 1
					refresh_token_without_active += 1
			except SQLAlchemyError as e:
				logger.fatal("Unable to communicate with the credentials database. Service might be down.", extra={"error.args": e.args})
				return

			logger.info(f"Refresh token scheduler: {refresh_token_count - refresh_token_without_active} active, {refresh_token_without_active} inactive, {refresh_token_expired} expired.", extra=logger.extra(category="token"))

	scheduler = BackgroundScheduler(timezone=timezone.utc)
	scheduler.add_job(refresh_token_expiration_check, "interval",
		seconds=int(os.getenv("REFRESH_TOKEN_EXPIRATION_CHECK_DELAY", 1)))

	if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
		scheduler.start()
		atexit.register(lambda: scheduler.shutdown())
