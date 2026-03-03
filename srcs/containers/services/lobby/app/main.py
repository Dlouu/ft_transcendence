from app import create_app
from app.core.extensions import socketio
app = create_app()


'''
generer des tokens a create et join lobby
renvoyer les token dans les cookies de la reponse (de create et join)
verifier la validite du token a levent connect
faire des tests --> que se passe til si la connection est refusee
'''
