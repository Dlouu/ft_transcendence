from botocore.exceptions import ClientError, EndpointConnectionError, ParamValidationError
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
				s3.head_bucket(Bucket=os.getenv("S3_BUCKET_NAME", ""))
			except ClientError as e:
				code = e.response['Error']['Code']
				if code in ["403", "AccessDenied"]:
					print(f"s3: access denied ({e})", flush=True)
					return {"message": "This service is temporary unavailable."}, 503
				elif code in ["404", "NoSuchBucket"]:
					print(f"s3: bucket not found ({e})", flush=True)
					return {"message": "This service is temporary unavailable."}, 503
				else:
					print(f"s3: unavailable (code {code})", flush=True)
					return {"message": "This service is temporary unavailable."}, 503
			except EndpointConnectionError as e:
				print(f"s3: network error({e})", flush=True)
				return {"message": "This service is temporary unavailable."}, 503
			except ParamValidationError as e:
				print(f"s3: parameter error ({e})", flush=True)
				return {"message": "This service is temporary unavailable."}, 503
			except Exception as e:
				print(f"s3: unhandled error ({e})", flush=True)
				return {"message": "This service is temporary unavailable."}, 503

			return f(*args, **kwargs)
		return decorated
	return decorator
