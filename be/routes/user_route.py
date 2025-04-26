# routes/user_routes.py
from flask import Blueprint
from controllers.user_controller import (
    get_profile, update_profile, get_user_by_id
)

user_routes = Blueprint('user_routes', __name__)

user_routes.route('/profile', methods=['GET'])(get_profile)
user_routes.route('/profile', methods=['PUT'])(update_profile)
user_routes.route('/<user_id>', methods=['GET'])(get_user_by_id)
