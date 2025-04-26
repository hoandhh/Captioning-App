# routes/image_routes.py
from flask import Blueprint
from controllers.image_controller import (
    upload_image, get_image, get_all_images, get_user_images, 
    update_image_description, delete_image, report_image, get_reports, update_report_status
)

image_routes = Blueprint('image_routes', __name__)

image_routes.route('/', methods=['POST'])(upload_image)
image_routes.route('/file/<image_id>', methods=['GET'])(get_image)
image_routes.route('/', methods=['GET'])(get_all_images)
image_routes.route('/my-images', methods=['GET'])(get_user_images)
image_routes.route('/<image_id>/description', methods=['PUT'])(update_image_description)
image_routes.route('/<image_id>', methods=['DELETE'])(delete_image)
image_routes.route('/<image_id>/report', methods=['POST'])(report_image)
image_routes.route('/reports', methods=['GET'])(get_reports)
image_routes.route('/reports/<report_id>', methods=['PUT'])(update_report_status)