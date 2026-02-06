from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy
import boto3, os, redis

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
except Exception as e:
	print(f"A problem occured while initializing the s3 client: {e}", flush=True)
