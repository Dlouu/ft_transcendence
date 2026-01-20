from flask import Flask, request, jsonify
from hashing import hashing
from oauth import oauth

app = Flask(__name__)
app.register_blueprint(hashing, url_prefix='/tesy') #registering
app.register_blueprint(oauth, url_prefix='/') #registering
if __name__ == "__main__":
    # Avoid double-process reloader so Ctrl+C exits once and logs are consistent.
    app.run(debug=True, port=5001, use_reloader=True, host='0.0.0.0')
