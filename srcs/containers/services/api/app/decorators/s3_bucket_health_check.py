from botocore.exceptions import ClientError, EndpointConnectionError, ParamValidationError
from functools import wraps
import os

from app.utils.logger import logger
from app import extensions

def s3_bucket_health_check(self):
	"""
	This decorator is used to check the state of the s3 bucket and make sure he is online and accessible in order
	to avoid server crash and undefined behavior.
	"""
	def decorator(f):
		@wraps(f)
		def decorated(*args, **kwargs):
			if not extensions.s3:
				extensions.s3 = extensions.s3_init_app()
			try:
				extensions.s3.head_bucket(Bucket=os.getenv("S3_BUCKET_NAME", ""))
			except ClientError as e:
				code = e.response['Error']['Code']
				if code in ["403", "AccessDenied"]:
					logger.critical("The API no longer have access to the aws bucket.", extra=logger.extra(target="aws"))
					return {"message": "This service is temporary unavailable."}, 503
				elif code in ["404", "NoSuchBucket"]:
					logger.critical("The S3 bucket can't be found.", extra=logger.extra(target="aws"))
					return {"message": "This service is temporary unavailable."}, 503
				else:
					logger.critical(f"Service unavailable. (code: {code})", extra=logger.extra(target="aws"))
					return {"message": "This service is temporary unavailable."}, 503
			except EndpointConnectionError as e:
				logger.critical("S3 network error..", extra=logger.extra(target="aws"))
				return {"message": "This service is temporary unavailable."}, 503
			except ParamValidationError as e:
				logger.critical("S3 parameter error.", extra=logger.extra(target="aws"))
				return {"message": "This service is temporary unavailable."}, 503
			except Exception as e:
				logger.critical(f"Unhandled error happened in the s3 bucket health check.", extra=logger.extra(target="aws", exception=e))
				return {"message": "This service is temporary unavailable."}, 503

			return f(*args, **kwargs)
		return decorated
	return decorator
