import logging
import os
from ecs_logging import StdlibFormatter

SERVICE_NAME = os.getenv("SERVICE_NAME", "auth")
ENVIRONMENT = os.getenv("ENVIRONMENT", "dev")

logger = logging.getLogger("auth_logger")
logger.setLevel(logging.INFO)
logger.propagate = False
logger.handlers.clear()

stdout_handler = logging.StreamHandler()
stdout_handler.setFormatter(logging.Formatter('%(message)s'))
logger.addHandler(stdout_handler)

file_handler = logging.FileHandler("/logs/auth.log")
file_handler.setFormatter(StdlibFormatter())
logger.addHandler(file_handler)

logger.USER_ID = "log.user.id"
logger.USER_EMAIL = "log.user.email"

import json
from flask import Request
from requests import Response

key_checker = {
	"request": lambda x: True if isinstance(x, Request) else False,
	"response": lambda x: True if isinstance(x, Response) else False,
	"user_id": lambda x: True if isinstance(x, str) and x.isdigit() else False,
	"more": lambda x: True if isinstance(x, dict) and all(isinstance(k, str) for k in x.keys()) else False
}

key_manager = {
	"request": lambda x: {"url.path": x.path, "client.ip": x.remote_addr, "user_agent.original": x.headers.get("User-Agent")},
	"response": lambda x: {"http.response.status_code": x.status_code},
	"user_id": lambda x: {"user.id": x},
	"more": lambda x: x
}

def logger_extra(**kwargs):
	extras = {}

	for k, v in kwargs.items():
		check = key_checker.get(k)
		if not check:
			continue

		extras.update(key_manager[k](v))
	return extras

logger.extra = logger_extra
