from botocore.exceptions import ClientError, EndpointConnectionError
from functools import wraps
import os

from app.extensions import s3

def s3_bucket_health_check(self):
	def decorator(f):
		@wraps(f)
		def decorated(*args, **kwargs):
			if not s3:
				return {"message": "This service is temporary unavailable."}, 503

			try:
				s3.head_bucket(Bucket=os.getenv("BUCKET_NAME"))
			except ClientError as e:
				code = e.response['Error']['Code']
				if code in ["403", "AccessDenied"]:
					print("s3: access denied.", flush=True)
					return {"message": "This service is temporary unavailable."}, 503
				elif code in ["404", "NoSuchBucket"]:
					print("s3: bucket not found.", flush=True)
					return {"message": "This service is temporary unavailable."}, 503
				else:
					print(f"s3: unavailable (code {code})")
					return {"message": "This service is temporary unavailable."}, 503
			except EndpointConnectionError:
				print("s3: network error.", flush=True)
				return {"message": "This service is temporary unavailable."}, 503

			return f(*args, **kwargs)
		return decorated
	return decorator
