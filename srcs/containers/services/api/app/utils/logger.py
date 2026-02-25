from ecs_logging import StdlibFormatter
from requests import Response
from flask import Request
import traceback
import logging
import json
import os


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

key_checker = {
	"request": lambda x: isinstance(x, Request),
	"response": lambda x: isinstance(x, Response),
	"user_id": lambda x: isinstance(x, str) and x.isdigit(),
	"category": lambda x: isinstance(x, str),
	"target_service": lambda x: isinstance(x, str),
	"exception": lambda x: isinstance(x, Exception),
	"more": lambda x: isinstance(x, dict) and all(isinstance(k, str) for k in x.keys())
}

key_manager = {
	"request": lambda x: {"url.path": x.path, "client.ip": x.remote_addr, "user_agent.original": x.headers.get("User-Agent")},
	"response": lambda x: {"http.response.status_code": x.status_code},
	"user_id": lambda x: {"log.user.id": x},
	"category": lambda x: {"event.category": x},
	"exception": lambda x: {"error.type": x.__class__.__name__, "error.message": str(x), "error.args": x.args,
								"error.stack_trace": "".join(traceback.format_exception(type(x), x, x.__traceback__)
							)},
	"target_service": lambda x: {"service.target.name": x},
	"more": lambda x: x
}

def logger_extra(**kwargs):
	extras = {}

	for k, v in kwargs.items():
		if not key_checker.get(k):
			continue

		extras.update(key_manager[k](v))
	return extras

logger.extra = logger_extra
