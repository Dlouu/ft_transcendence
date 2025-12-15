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

	# Crée le dossier du service et copie le template
	@mkdir -p ./srcs/services/$(DOCK)
	@cp -r ./srcs/services/template/* ./srcs/services/$(DOCK)/


	# Ajouter le réseau (si nécessaire)
	@echo "Adding network $(DOCK)_network to $(COMPOSE_PATH)..."
	@sed -i "/networks:/a \\  $(DOCK)_network:\n    driver: bridge" $(COMPOSE_PATH)

	# Ajouter le service au docker-compose.yml
	@echo "Adding service $(DOCK) to $(COMPOSE_PATH)..."
	@awk '/services:/ {\
		print; \
		print "  $(DOCK):"; \
		print "    container_name: $(DOCK)_container"; \
		print "    build: ./services/$(DOCK)"; \
		print "    restart: unless-stopped"; \
		print "    env_file: .env"; \
		print "    volumes:"; \
		print "      - $(DOCK)_volume:/app"; \
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

.PHONY: all build run stop restart logs clean fclean re enter ps privileged
