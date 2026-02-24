from flask import request
import requests, json

from app.utils.logger import logger

def make_custom_response(bad_response, code, content):
	response = requests.Response()
	response.status_code = code
	response._content = json.dumps(content).encode("utf-8")
	response.headers = bad_response.headers

	return response

def make_request(url, method):
	"""
	Request wrapper for the API to centralize all the check and avoid redundance.

	param:
		url: The endpoint you want to access
		method: The type of request

	return:
		a request Response data type.
	"""
	response = requests.Response()
	try:
		response = requests.request(
			method=method.upper(),
			url="http://auth:5055" + url,
			json=request.get_json(silent=True),
			cookies=request.cookies,
			timeout=5
		)
	except requests.exceptions.ConnectionError as e:
		logger.warning(f"Unable to establish a connection with the url {url}", extra=logger.extra(target_service="auth"))
		return make_custom_response(response, 503,{"message": "Service currently unavailable."})
	except Exception as e:
		logger.critical(f"unhandled error happened {e}", extra=logger.extra(target_service="auth"))
		return make_custom_response(response, 401, {"message": "Failed to update user's data."})

	try:
		json_response = response.json()
	except requests.exceptions.JSONDecodeError as e:
		logger.critical("Something went wrong while decoding the response to json.", extra=logger.extra(target_service="auth"))
		return make_custom_response(response, 400, {"message": "Something wrong while trying to update user's information."})

	return response
