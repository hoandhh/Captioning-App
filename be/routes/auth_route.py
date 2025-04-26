# routes/auth_routes.py
from flask import Blueprint
from controllers.auth_controller import (
    register, login, change_password, forgot_password, reset_password
)

auth_routes = Blueprint('auth_routes', __name__)

auth_routes.route('/register', methods=['POST'])(register)
auth_routes.route('/login', methods=['POST'])(login)
auth_routes.route('/change-password', methods=['POST'])(change_password)
auth_routes.route('/forgot-password', methods=['POST'])(forgot_password)
auth_routes.route('/reset-password', methods=['POST'])(reset_password)
