from flask import Flask, request, jsonify
from hasing import hasing

app = Flask(__name__)
app.register_blueprint(hasing, url_prefix='/') #registering

if __name__ == "__main__":
    app.run(debug=True, port=5000, use_reloader=True)

