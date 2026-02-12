from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy
import boto3, os, redis

from botocore.exceptions import ClientError

cache_token = {}

db = SQLAlchemy()
ma = Marshmallow()

r = None
try:
	r = redis.from_url(os.getenv("REDIS_URL", ""), decode_responses=True)
	r.ping()
except ValueError as e:
	print(f"A problem occured when trying to connect to redis from url ({e})", flush=True)
except ConnectionError as e:
	print(f"Failed to ping redis, service will be unavailable ({e})", flush=True)


s3 = None
try:
	AWS_REGION = os.getenv("AWS_REGION", "")
	s3 = boto3.client("s3", region_name=AWS_REGION)

	image_name = os.getenv("DEFAULT_PROFILE_PICTURE", "")
	bucket_name = os.getenv("S3_BUCKET_NAME", "")
	s3_key = os.getenv("DEFAULT_IMG_PATH") + "/" + image_name

	try:
		s3.head_object(Bucket=bucket_name, Key=s3_key)
	except ClientError as e:
		s3.upload_file(f"app/{image_name}", bucket_name, s3_key, ExtraArgs={'ContentType': 'image/jpeg'})

except Exception as e:
	print(f"A problem occured while initializing the s3 client: {e}", flush=True)
