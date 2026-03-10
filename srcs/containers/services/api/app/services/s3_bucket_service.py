from botocore.exceptions import ParamValidationError, ClientError
import os

from app import extensions

def add_resource(image_file, url):
	"""
	Add a new resources to the s3 bucket.

	param:
		image_file: the file you want to add.
		url: the url of the file, it is the location of the file in the bucket.

	return:
		True if the file have beend added otherwise False.
	"""
	try:
		extensions.s3.upload_fileobj(image_file, os.getenv("S3_BUCKET_NAME", ""), url, ExtraArgs={
				"ContentType": image_file.content_type
			})
	except AttributeError:
		return False
	except ParamValidationError:
		return False
	return True

def does_resource_exist(key):
	"""
	Used to know if a resource exist in the s3 bucket.

	param:
		key: The key to check, have to contain the full path to the file.

	return:
		True if exist otherwise False.
	"""
	try:
		extensions.s3.head_object(Bucket=os.getenv("S3_BUCKET_NAME", ""), Key=key)
	except ClientError as e:
		if e.response["Error"]["Code"] == "404":
			return False
	return True


def get_resource_url(key, expire=3600):
	"""
	Generate a resource url with expiration time

	param:
		key: The file you want to create an url from.
		expire: The time before the url expire.

	return:
		a string containing the url or None if the key don't exist.
	"""
	if not does_resource_exist(key):
		return None

	bucket_name = os.getenv("S3_BUCKET_NAME", "")

	print(key, flush=True)
	if expire == -1:
		return bucket_name + ".s3.amazonaws.com" + "/" + key
	resource = extensions.s3.generate_presigned_url(
		ClientMethod="get_object",
		Params={"Bucket": bucket_name, "Key": key},
		ExpiresIn = expire
	)

	return resource

def delete_resource(key):
	"""
	Used to delete a resource.

	param:
		key: The resource to delete.

	return:
		True if the file have been deleted (also True if the file don't exist), if a problem occured False.
	"""
	try:
		extensions.s3.delete_object(Bucket=os.getenv("S3_BUCKET_NAME", ""), Key=key)
	except Exception as e:
		return False
	return True

def delete_all_resources(prefix):
	"""
	Delete all the resource at the given location.

	param:
		prefix: the location

	return:
		True if the resources have been deleted otherwise False.
	"""
	try:
		response = extensions.s3.list_objects_v2(Bucket=os.getenv("S3_BUCKET_NAME", ""), Prefix=prefix)
	except ParamValidationError:
		return False

	if "Contents" not in response:
		return True

	for obj in response["Contents"]:
		delete_resource(obj["Key"])

	return True
