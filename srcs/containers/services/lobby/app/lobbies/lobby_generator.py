import random
import string

from app.core.state import lobbies, three_letters, four_letters
from app.lobbies.services import lobby_removal


MAX_LOBBIES = 36 ** 4
MAX_RANDOM_ATTEMPTS = 100


def generate_room_code_second_edition():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=4)).upper()


def generate_room_code_first_edition():
    random_value = random.randint(0, 2)
    if random_value == 0:
        room_name = str(random.randint(1, 9)) + random.choice(three_letters)
    elif random_value == 1:
        room_name = random.choice(three_letters) + str(random.randint(1, 9))
    else:
        room_name = random.choice(four_letters)
    return room_name.upper()


def generate_code():
    for _ in range(MAX_RANDOM_ATTEMPTS):
        if len(lobbies) < 1015:
            room_name = generate_room_code_first_edition()
        else:
            room_name = generate_room_code_second_edition()

        if room_name not in lobbies:
            return room_name, None
    return None, ("Failed to generate unique room", 602)


def create_lobby_or_error(supreme_master_user_id=None):
    if len(lobbies) > MAX_LOBBIES:
        return None, ("No more rooms available", 603)

    room_name, error = generate_code()
    if error:
        return None, error

    lobbies[room_name] = {
        "players": {},  # {user_id: {sid, ready, connected}}
        "bots": 0,
        "game_started": False,
        "game_ended": False,
        "theme": False,
        "supreme_master_user_id": supreme_master_user_id,
        "supreme_master_sid": None,  # derived from players
        "supreme_master_starts": False,
        "privacy": True,
    }

    lobby_removal(room_name, delay=600)
    return room_name, None
