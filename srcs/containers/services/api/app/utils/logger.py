import logging
import os
from ecs_logging import StdlibFormatter

SERVICE_NAME = os.getenv("SERVICE_NAME", "api")
ENVIRONMENT = os.getenv("ENVIRONMENT", "dev")

logger = logging.getLogger("api_logger")
logger.setLevel(logging.INFO)
logger.propagate = False
logger.handlers.clear()

stdout_handler = logging.StreamHandler()
stdout_handler.setFormatter(logging.Formatter('%(message)s'))
logger.addHandler(stdout_handler)

file_handler = logging.FileHandler("/logs/api.log")
file_handler.setFormatter(StdlibFormatter())
logger.addHandler(file_handler)

logger.USER_ID = "log.user.id"
logger.USER_EMAIL = "log.user.email"

import json
from flask import Request
from requests import Response

def logger_extra(**kwargs):
	extras = {}
	request = kwargs.get("request")

	if isinstance(request, Request):
		extras["url.path"] = request.path
		extras["client.ip"] = request.remote_addr
		extras["user_agent.original"] = request.headers.get("User-Agent")

	response = kwargs.get("response")
	if isinstance(response, Response):
		extras["http.response.status_code"] = response.status_code

	user_id = kwargs.get("user_id")
	if user_id:
		extras["user.id"] = user_id

	target_service = kwargs.get("target_service")
	if target_service:
		extras["service.target.name"] = target_service

	return extras


logger.extra = logger_extra
