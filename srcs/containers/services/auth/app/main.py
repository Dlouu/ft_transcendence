from flask import Flask, request, jsonify
from hashing import hashing
from oauth import oauth

app = Flask(__name__)
app.register_blueprint(hashing, url_prefix='/') #registering
app.register_blueprint(oauth)
print(" registereddddddddddddddddddddveffwoeghddddddd.")

if __name__ == "__main__":
    app.run(debug=True, port=5000, use_reloader=True, host='0.0.0.0')

