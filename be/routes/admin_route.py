# routes/admin_routes.py
from flask import Blueprint
from controllers.admin_controller import (
    get_all_users, update_user, delete_user, get_all_images, 
    admin_delete_image, get_reports, update_report, get_stats,
    toggle_user_status, change_user_role
)

admin_routes = Blueprint('admin_routes', __name__)

admin_routes.route('/users', methods=['GET'])(get_all_users)
admin_routes.route('/users/<user_id>', methods=['PUT'])(update_user)
admin_routes.route('/users/<user_id>', methods=['DELETE'])(delete_user)
admin_routes.route('/users/change-status/<user_id>', methods=['PUT'])(toggle_user_status)
admin_routes.route('/users/change-role/<user_id>', methods=['PUT'])(change_user_role)

admin_routes.route('/images', methods=['GET'])(get_all_images)
admin_routes.route('/images/<image_id>', methods=['DELETE'])(admin_delete_image)
admin_routes.route('/reports', methods=['GET'])(get_reports)
admin_routes.route('/reports/<report_id>', methods=['PUT'])(update_report)

admin_routes.route('/stats', methods=['GET'])(get_stats)
