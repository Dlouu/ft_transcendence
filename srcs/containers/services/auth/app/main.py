from app import create_app
from dotenv import load_dotenv

load_dotenv()
app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5001, use_reloader=True, host='0.0.0.0')
