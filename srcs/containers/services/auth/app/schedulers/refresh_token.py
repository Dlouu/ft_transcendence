from apscheduler.schedulers.background import BackgroundScheduler
from app.models.refresh_tokens import RefreshToken
from app.extensions import db

from datetime import datetime, timezone
from sqlalchemy.orm import joinedload
import atexit, os

def init_schedulers(app):
	def refresh_token_expiration_check():
		with app.app_context():
			query = RefreshToken.query.options(joinedload(RefreshToken.rules))

			refresh_token_count = 0
			refresh_token_without_active = 0
			refresh_token_expired = 0
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

			print(f"Refresh token scheduler done. Number of existing token: {refresh_token_count}, Number of expired token: {refresh_token_expired}, Number of inactive token: {refresh_token_without_active}", flush=True)

	scheduler = BackgroundScheduler(timezone=timezone.utc)
	scheduler.add_job(refresh_token_expiration_check, "interval", seconds=int(os.getenv("REFRESH_TOKEN_EXPIRATION_CHECK_DELAY")))

	if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
		scheduler.start()
		atexit.register(lambda: scheduler.shutdown())
