# This Makefile simplifies Docker service management using Docker Compose. Below are the key targets and their usage:
#
# 	build: make build DOCK="service_name" - Builds the Docker image for the specified service.
# 	run: make run DOCK="service_name" - Starts the service in detached mode.
# 	stop: make stop DOCK="service_name" - Stops the service and removes the container.
# 	restart: make restart DOCK="service_name" - Stops and restarts the service.
# 	create: make create DOCK="service_name" - Creates a new service from a template, adding it to docker-compose.yml.
# 	logs: make logs DOCK="service_name" - Tails the logs of the specified service.
# 	clean: make clean - Placeholder (no action).
# 	fclean: make fclean - Removes stopped containers, unused volumes, and prunes the system.
# 	re: make re - Cleans up resources and rebuilds services.
# 	enter: make enter DOCK="service_name" - Opens an interactive shell inside the container.
# 	ps: make ps - Displays the status of all running containers.
# 	privileged: make privileged - Starts a privileged container for troubleshooting.
# 	commit: make commit MESSAGE="Commit message" - Add all changes to the staging area and make a snapshot.


COMPOSE_PATH = ./srcs/compose.yml
COMPOSE	:= docker compose -f $(COMPOSE_PATH)

all: build run

build:
	$(COMPOSE) build $(DOCK)

run:
	$(COMPOSE) up -d $(DOCK)

stop:
	$(COMPOSE) down $(DOCK)

restart: stop all

create:
	@if [ -z "$(DOCK)" ]; then \
		echo "Service name need to be provided with the var name DOCK (ex: make create DOCK=\"ServiceName\")."; \
		exit 1; \
	fi

	@if [ -d ./srcs/services/$(DOCK) ]; then \
		echo "The service '$(DOCK)' already exists."; \
		exit 1; \
	fi

	@mkdir -p ./srcs/services/$(DOCK)
	@cp -r ./srcs/services/template/* ./srcs/services/$(DOCK)/


	@echo "Adding network $(DOCK)_network to $(COMPOSE_PATH)..."
	@awk '/networks:/ {\
		print; \
		print "  $(DOCK)_network:"; \
		print "    driver: bridge"; \
		next \
	} 1' $(COMPOSE_PATH) > $(COMPOSE_PATH).tmp && mv $(COMPOSE_PATH).tmp $(COMPOSE_PATH)


	@echo "Adding service $(DOCK) to $(COMPOSE_PATH)..."
	@awk '/services:/ {\
		print; \
		print "  $(DOCK):"; \
		print "    container_name: $(DOCK)_container"; \
		print "    build: ./services/$(DOCK)"; \
		print "    restart: unless-stopped"; \
		print "    env_file: .env"; \
		print "    networks:"; \
		print "      - $(DOCK)_network"; \
		next \
	} 1' $(COMPOSE_PATH) > $(COMPOSE_PATH).tmp && mv $(COMPOSE_PATH).tmp $(COMPOSE_PATH)

	@echo "Service $(DOCK) and volume added to $(COMPOSE_PATH)."

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
