from app import create_app
from dotenv import load_dotenv

load_dotenv()
app = create_app()

from app.utils.refresh_token_rules import generate_refresh_token_rules

generate_refresh_token_rules()

if __name__ == "__main__":
    app.run(debug=True, port=5001, use_reloader=True, host='0.0.0.0')
