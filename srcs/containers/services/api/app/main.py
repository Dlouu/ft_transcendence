from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()

if  __name__ == "__main__":
	app.run(debug=True, host="0.0.0.0")
