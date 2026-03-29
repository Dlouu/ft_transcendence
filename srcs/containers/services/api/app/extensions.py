from redis.exceptions import ConnectionError
from botocore.exceptions import ClientError
from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy
import boto3, os, redis

from app.utils.logger import logger

cache_token = {}

db = SQLAlchemy()
ma = Marshmallow()

r = None
try:
	r = redis.from_url(os.getenv("REDIS_URL", ""), decode_responses=True)
	r.ping()
except ValueError as e:
	logger.fatal("A problem occured when trying to connect to redis from url.", extra=logger.extra(target="redis", exception=e))
except ConnectionError as e:
	logger.fatal("Failed to ping redis.", extra=logger.extra(target="redis", exception=e))
except Exception as e:
	logger.fatal("Undefined error happened while trying to ping redis's service.", extra=logger.extra(target="redis", exception=e))

def s3_init_app():
	try:
		AWS_REGION = os.getenv("AWS_REGION", "")
		s3 = boto3.client("s3", region_name=AWS_REGION)

		bucket_name = os.getenv("S3_BUCKET_NAME", "")

		image_name = os.getenv("DEFAULT_PROFILE_PICTURE", "")
		s3_key = image_name
		try:
			s3.head_object(Bucket=bucket_name, Key=s3_key)
		except ClientError as e:
			print(f"app/{image_name}", flush=True)
			s3.upload_file(f"app/{image_name}", bucket_name, s3_key, ExtraArgs={'ContentType': 'image/png'})
			return None

		image_name = os.getenv("DEFAULT_BACK_CARD", "")
		s3_key = image_name
		try:
			s3.head_object(Bucket=bucket_name, Key=s3_key)
		except ClientError as e:
			s3.upload_file(f"app/{image_name}", bucket_name, s3_key, ExtraArgs={'ContentType': 'image/png'})
			return None

	except Exception as e:
		print(e, flush=True)
		logger.fatal("A problem occured while initializing the s3 client.", extra=logger.extra(target="aws", exception=e))
		return None

	return s3

s3 = s3_init_app()
