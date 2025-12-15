COMPOSE	:= docker compose -f ./srcs/compose.yml

all: build run

build: create_dir
	$(COMPOSE) build $(DOCK)

run: create_dir
	$(COMPOSE) up -d $(DOCK)

stop:
	$(COMPOSE) down $(DOCK)

restart: stop all

logs:
	$(COMPOSE) logs -f $(DOCK)

test:
	env

clean:
	@echo "Useless instruction, please refer to stop, restart or fclean."

fclean: stop
	@docker compose rm -f -s -v 2>/dev/null || true
	@docker volume rm -f $$(docker volume ls -q) 2>/dev/null || true
	@docker system prune -a -f || true

re: fclean all

create_dir:
	@sh -c 'mkdir -p "$$(grep "^VOLUME_PATH=" srcs/.env | cut -d "=" -f2-)"'
	@sh -c 'mkdir -p "$$(grep "^VOLUME_PATH=" srcs/.env | cut -d "=" -f2-)/wordpress"'
	@sh -c 'mkdir -p "$$(grep "^VOLUME_PATH=" srcs/.env | cut -d "=" -f2-)/mariadb"'
	@sh -c 'mkdir -p "$$(grep "^VOLUME_PATH=" srcs/.env | cut -d "=" -f2-)/website"'
	@sh -c 'mkdir -p "$$(grep "^VOLUME_PATH=" srcs/.env | cut -d "=" -f2-)/adminer"'
	@sh -c 'mkdir -p "$$(grep "^VOLUME_PATH=" srcs/.env | cut -d "=" -f2-)/portainer"'

enter:
	@if [ -n $(DOCK) ]; then \
		$(COMPOSE) exec -it $(DOCK) bash; \
	fi

ps:
	$(COMPOSE) ps

privileged:
	@docker run --rm -it --privileged -v /home/tclaereb:/host ubuntu bash

.PHONY: all build run stop restart logs clean fclean re create_dir enter ps privileged
