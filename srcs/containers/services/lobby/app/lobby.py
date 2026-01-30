from flask import Flask, render_template, Blueprint, request, redirect, url_for
import random
import string

lobby = Blueprint("lobby", __name__)

lobbies = set()

@lobby.route("/")
def home():
	return render_template("home.html")

animaux_rigolol = [
    "ornithorynque",
    "blobfish",
    "axolotl",
    "capybara",
    "alpaga",
    "loutre",
    "pangolin",
    "narval",
    "maki",
    "fossa",
    "wombat",
    "tapir",
    "aye_aye",
    "saiga",
    "okapi",
    "tarsier",
    "cochon",
    "dindon",
    "albatros",
    "chinchilla",
    "marmotte",
    "crapaud",
    "taupe",
    "potoo",
    "manchot"
]

adjectifs_rigodroles = [
    "zinzin",
    "farfelu",
    "chelou",
    "loufoque",
    "fourbe",
    "absurde",
    "goguenard",
    "dingo",
    "perlimpinpin",
    "bringuebalant",
    "foufou",
    "zinzolin",
    "chelou",
    "eclate",
    "sympa",
    "mignon",
    "ridicule",
    "heroique",
    "neutre",
    "stupide",
    "drole",
    "bizarre",
    "honnete",
    "logique",
    "illegal"
]

def unique_code():
    return ''.join(random.choice(string.ascii_lowercase + string_digits, k=4))

@lobby.route("/create_lobby", methods=["POST"])
def create_lobby():
    max_attempts = 3
    attempts = 0
    while attempts < max_attempts:
        animal = random.choice(animaux_rigolol)
        adjectif = random.choice(adjectifs_rigodroles)
        lobby_room = f"{animal}_{adjectif}"
        if lobby_room not in lobbies:
            lobbies.add(lobby_room)
            return redirect(url_for("lobby.join_lobby", code=lobby_room))
        attempts += 1
    return "No more rooms available"

#joining lobby by code
@lobby.route("/join_lobby", methods=["POST"])
def join_lobby_post():
    user_code = request.form.get("code", "").strip().lower()
    if user_code not in lobbies:
        return "wrong room code"
    return redirect(url_for("lobby.join_lobby", code=user_code))

#joining lobby after creation
@lobby.route("/<code>", methods=["GET"])
def join_lobby(code):
    code = code.strip()
    return render_template("game.html", code=code)
