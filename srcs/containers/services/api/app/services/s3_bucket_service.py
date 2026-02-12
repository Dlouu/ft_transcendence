from botocore.exceptions import ParamValidationError, ClientError
import os

from app.extensions import s3

def add_resource(image_file, url):
	try:
		s3.upload_fileobj(image_file, os.getenv("S3_BUCKET_NAME", ""), url, ExtraArgs={"ContentType": image_file.content_type})
	except AttributeError:
		print("Failed to upload, the image file dont have a file format.", flush=True)
		return False
	except ParamValidationError:
		print(f"Failed to upload the image, it can caused by one of the following reasons: bucket name is invalid (check env var) or the URL is invalid.", flush=True)
		return False
	return True

def does_resource_exist(key):
	try:
		s3.head_object(Bucket=os.getenv("S3_BUCKET_NAME", ""), Key=key)
	except ClientError as e:
		if e.response["Error"]["Code"] == "404":
			return False
	return True


def get_resource_url(key, expire=3600):
	if not does_resource_exist(key):
		return None

	resource = s3.generate_presigned_url(
		ClientMethod="get_object",
		Params={"Bucket": os.getenv("S3_BUCKET_NAME", ""), "Key": key},
		ExpiresIn = expire
	)

	return resource

def delete_resource(key):
	s3.delete_object(Bucket=os.getenv("S3_BUCKET_NAME", ""), Key=key)
	return True

def delete_all_resources(prefix):
	try:
		response = s3.list_objects_v2(Bucket=os.getenv("S3_BUCKET_NAME", ""), Prefix=prefix)
	except ParamValidationError:
		print(f"Failed to delete the images, it might be because of the s3 bucket name env var.", flush=True)
		return False

	if "Contents" not in response:
		return True

	for obj in response["Contents"]:
		delete_resource(obj["Key"])

	return True
