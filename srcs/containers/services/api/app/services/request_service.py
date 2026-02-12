from flask import request
import requests, json

def make_custom_response(bad_response, code, content):
	response = requests.Response()
	response.status_code = code
	response._content = json.dumps(content).encode("utf-8")
	response.headers = bad_response.headers

	return response

def make_request(url, method):
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
		print(f"{request.path}: Unable to communicate with the url {url} ({e})", flush=True)
		return make_custom_response(response, 503,{"message": "Service currently unavailable."})
		# return {"message": "Service currently unavailable."}, 503
	except Exception as e:
		print(f"{request.path}: WARNING: unhandled error happened: ({e})", flush=True)
		return make_custom_response(response, 401, {"message": "Failed to update user's data."})
		# return {"message": "Failed to update user's data."}, 401

	try:
		json_response = response.json()
	except requests.exceptions.JSONDecodeError as e:
		print(f"{request.path}: Something went wrong while decoding the response to json, the auth service may have encountered an error and crashed.", flush=True)
		return make_custom_response(response, 400, {"message": "Something wrong while trying to update user's information."})
		# return {"message": "Something wrong while trying to update user's information."}, 400

	return response
