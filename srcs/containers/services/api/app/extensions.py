from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy
import boto3, os

cache_token = {}

db = SQLAlchemy()
ma = Marshmallow()

s3 = None
try:
	AWS_REGION = os.getenv("AWS_REGION", "")
	s3 = boto3.client("s3", region_name=AWS_REGION)
except Exception as e:
	print(f"A problem occured while initializing the s3 client: {e}", flush=True)
