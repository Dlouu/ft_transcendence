from app import create_app
from app.core.extensions import socketio
app = create_app()

@app.after_request
def after_request_handler(response):
    response.set_cookie(
        "session_token",
        f"Bearer_custom_cookie",
        httponly=True,
        secure=True,
        samesite="None",
        max_age= 60
    )
    return response

if __name__ == "__main__":
    socketio.run(app, debug=True, port=5002, host="0.0.0.0", use_reloader=True, allow_unsafe_werkzeug=True)

'''
generer des tokens a create et join lobby
renvoyer les token dans les cookies de la reponse (de create et join)
verifier la validite du token a levent connect
faire des tests --> que se passe til si la connection est refusee
'''