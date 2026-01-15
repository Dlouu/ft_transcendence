# This Makefile simplifies Docker service management using Docker Compose. Below are the key targets and their usage:
#
# 	build: make build DOCK="service_name" - Builds the Docker image for the specified service.
# 	run: make run DOCK="service_name" - Starts the service in detached mode.
# 	stop: make stop DOCK="service_name" - Stops the service and removes the container.
# 	restart: make restart DOCK="service_name" - Stops and restarts the service.
# 	logs: make logs DOCK="service_name" - Tails the logs of the specified service.
# 	clean: make clean - Placeholder (no action).
# 	fclean: make fclean - Removes stopped containers, unused volumes, and prunes the system.
# 	re: make re - Cleans up resources and rebuilds services.
# 	enter: make enter DOCK="service_name" - Opens an interactive shell inside the container.
# 	ps: make ps - Displays the status of all running containers.
# 	privileged: make privileged - Starts a privileged container for troubleshooting.
# 	commit: make commit MESSAGE="Commit message" - Add all changes to the staging area and make a snapshot.


COMPOSE_PATH = ./srcs/docker-compose.yml
COMPOSE_PATH_OVERRIDE = ./srcs/docker-compose.override.yml
COMPOSE	:= docker compose -f $(COMPOSE_PATH) -f $(COMPOSE_PATH_OVERRIDE)

all: build run

build:
	$(COMPOSE) build $(DOCK)

run:
	$(COMPOSE) up -d $(DOCK)

stop:
	$(COMPOSE) down $(DOCK)

restart: stop all

logs:
	$(COMPOSE) logs -f $(DOCK)

clean:
	@echo "Useless instruction, please refer to stop, restart or fclean."

fclean: stop
	@docker compose rm -f -s -v 2>/dev/null || true
	@docker volume rm -f $$(docker volume ls -q) 2>/dev/null || true
	@docker system prune -a -f || true

re: fclean all

enter:
	@if [ -n $(DOCK) ]; then \
		$(COMPOSE) exec -it $(DOCK) bash; \
	fi

ps:
	$(COMPOSE) ps

privileged:
	@docker run --rm -it --privileged -v /home/tclaereb:/host ubuntu bash

commit:
	@git add .
	@git commit -m "$(MESSAGE)"

.PHONY: all build run stop restart create logs clean fclean re enter ps privileged
