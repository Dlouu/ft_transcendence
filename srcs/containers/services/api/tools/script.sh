#!/bin/sh

export FLASK_APP="app.main:app"
flask db upgrade

python -m app.main
