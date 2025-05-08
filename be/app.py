# app.py
from flask import Flask
from flask_cors import CORS
from database.set_up import initialize_db
from routes.user_route import user_routes
from routes.image_route import image_routes
from routes.admin_route import admin_routes
from routes.image_caption_route import image_caption_routes
from routes.auth_route import auth_routes
from controllers.group_caption_controller import group_caption_bp
from controllers.location_controller import location_bp
from flask_jwt_extended import JWTManager
import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE"], "allow_headers": ["Content-Type", "Authorization"]}})


app.config["MONGODB_SETTINGS"] = {"host": os.getenv("MONGODB_URI")}
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(days=1)

# Khởi tạo JWT
jwt = JWTManager(app)

# Khởi tạo cơ sở dữ liệu
initialize_db(app)

# Đăng ký blueprints
app.register_blueprint(auth_routes, url_prefix="/api/auth")
app.register_blueprint(user_routes, url_prefix="/api/users")
app.register_blueprint(image_routes, url_prefix="/api/images")
app.register_blueprint(admin_routes, url_prefix="/api/admin")
app.register_blueprint(image_caption_routes, url_prefix="/api/image-caption")
app.register_blueprint(group_caption_bp)
app.register_blueprint(location_bp)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
