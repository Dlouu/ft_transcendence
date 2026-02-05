from flask_restx import Namespace, Resource, fields

from app.decorators.s3_bucket_health_check import s3_bucket_health_check
from app.decorators.jwt_required import jwt_required
from app.extensions import s3

ns = Namespace("bucket", description="S3 bucket operation")

