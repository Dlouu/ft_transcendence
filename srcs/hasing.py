from flask import Blueprint, render_template, request
from dotenv import load_dotenv
import os
import hashlib


hasing = Blueprint("hasing", __name__)
load_dotenv()
PEPPER = os.getenv("SALT")

@hasing.route("/")
def home():
    return render_template("home.html")


@hasing.route("/connect", methods=["POST"])
def connect():
    public_key = request.form.get("password")
    public_key = public_key.encode().hex()
    #print("publiccccc", public_key)
    new_key = public_key + PEPPER
    #print(f"PUBLIC: {new_key}")
    hashed = hashlib.sha256(new_key.encode())
    print(hashed.hexdigest())
    return "Keys received"
