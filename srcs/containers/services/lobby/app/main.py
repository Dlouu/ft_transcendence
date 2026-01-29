from flask import Flask
from lobby import lobby

app = Flask(__name__)

app.register_blueprint(lobby, url_prefix='/')

if __name__ == "__main__":
    # Avoid double-process reloader so Ctrl+C exits once and logs are consistent.
    app.run(debug=True, port=5002, use_reloader=True, host='0.0.0.0')
'''
Creation du lobby
suppression du lobby
suppression du lobby apres un certain temps
'''