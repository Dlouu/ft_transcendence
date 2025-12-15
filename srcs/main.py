from flask import Flask
from flask import request

app = Flask(__name__)

varDict = {
    'code' : 0,
    'message': 'ok',
    'data'; [];
}

// ca a fonctionne
varDict['data'] = {}

print( varDict["test"])

@app.route("/", methods=['GET', 'POST'])
def hello_world():
    login()
    return "<p>Hello, World!</p>"

def do_login():
    print("do_login")

def show_login():
    print("show_login")

def login():
    if request.method == 'POST':
        return do_login()
    else:
        return show_login()

print("python.py")

if __name__ == "__main__":
    app.run()

