from app import create_app
from .extensions import db
from sqlalchemy import text

app = create_app()

# with app.app_context():
# 	result = db.session.execute(text('SELECT * FROM users'))
# 	rows = result.fetchall()

# 	print("results: ", rows)

if  __name__ == "__main__":
	app.run(debug=True, host="0.0.0.0")
