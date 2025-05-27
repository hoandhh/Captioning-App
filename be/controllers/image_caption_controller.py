# controllers/image_caption_controller.py
from flask import request, jsonify
from services.image_service import ImageService
from services.image_caption_service import ImageCaptionService
from flask_jwt_extended import jwt_required, get_jwt_identity
import json
import threading
import os
import openpyxl
import nltk
from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
nltk.download('punkt', quiet=True)

@jwt_required()
def upload_with_caption():
    """
    API để tải lên ảnh và tự động tạo caption
    - Lưu ảnh vào MongoDB
    - Tạo caption tự động và lưu vào trường description
    """
    try:
        user_id = get_jwt_identity()
        
        # Kiểm tra xem có file được gửi lên không
        if 'image' not in request.files:
            return jsonify({"error": "Không tìm thấy file ảnh trong request"}), 400
            
        image_file = request.files['image']
        
        # Kiểm tra tên file
        if image_file.filename == '':
            return jsonify({"error": "Không có file nào được chọn"}), 400
        
        # Kiểm tra định dạng file
        if not allowed_file(image_file.filename):
            return jsonify({"error": "Định dạng file không được hỗ trợ"}), 400
        
        # Lấy tên địa điểm từ form data
        location = request.form.get('location')
        if not location:
            location = 'Không rõ'
        
        # Lấy tên file gốc nếu client gửi lên, nếu không thì lấy tên file upload
        original_filename = request.form.get('original_filename')
        if original_filename:
            img_name = os.path.basename(original_filename)
        else:
            img_name = os.path.basename(image_file.filename)
        
        # 1. Upload ảnh vào MongoDB (không có mô tả ban đầu)
        image = ImageService.upload_image(
            file=image_file,
            description="",  # Mô tả trống, sẽ được cập nhật sau
            user_id=user_id,
            location=location
        )
        
        # Lấy loại mô hình từ form data (mặc định hoặc du lịch)
        model_type = request.form.get('model_type', 'default')
        if model_type not in ['default', 'travel']:
            model_type = 'default'
        
        # Lấy ngôn ngữ từ form data (tiếng Anh hoặc tiếng Việt)
        language = request.form.get('language', 'en')
        if language not in ['en', 'vi']:
            language = 'en'
            
        # 2. Tạo caption từ dữ liệu nhị phân với mô hình đã chọn và ngôn ngữ được chọn
        caption = ImageCaptionService.generate_caption_from_binary(image.image_data, speak=False, model_type=model_type, language=language)
        
        # Bỏ log hash ảnh vào file caption log
        # img_hash = image.image_hash
        # ImageCaptionService.log_to_file(f"Hash ảnh: {img_hash}")
        # --- BLEU LOGIC ---
        try:
            test_path = os.path.join(os.path.dirname(__file__), '../test.xlsx')
            if os.path.exists(test_path):
                wb = openpyxl.load_workbook(test_path)
                ws = wb.active
                gt_dict = {}
                for row in ws.iter_rows(min_row=2, values_only=True):
                    gt_dict[str(row[0]).strip()] = str(row[1]).strip()
                if image.image_hash in gt_dict:
                    ref = gt_dict[image.image_hash]
                    ref_tokens = nltk.word_tokenize(ref)
                    hyp_tokens = nltk.word_tokenize(caption)
                    bleu1 = sentence_bleu([ref_tokens], hyp_tokens, weights=(1, 0, 0, 0), smoothing_function=SmoothingFunction().method1)
                    bleu2 = sentence_bleu([ref_tokens], hyp_tokens, weights=(0.5, 0.5, 0, 0), smoothing_function=SmoothingFunction().method1)
                    log_str = f"BLEU-1: {bleu1:.4f} | BLEU-2: {bleu2:.4f}\nRef: {ref}\nHyp: {caption}"
                    print(log_str)
                    ImageCaptionService.log_to_file(log_str)
        except Exception as e:
            print(f"[BLEU] Error: {e}")
        # --- END BLEU LOGIC ---
        
        # Tạo thread riêng để phát âm mô tả ở background
        def speak_in_background():
            try:
                ImageCaptionService.speak_caption(caption, lang=language)
            except Exception as e:
                print(f"Lỗi khi phát âm ở background: {e}")
                
        # Khởi chạy thread phát âm ở background
        threading.Thread(target=speak_in_background, daemon=True).start()
        
        # 3. Cập nhật mô tả của ảnh với caption vừa tạo
        ImageService.update_image(str(image.id), user_id, caption)
        
        # 4. Trả về kết quả
        return jsonify({
            "success": True,
            "id": str(image.id),
            "description": caption,
            "location": image.location
        }), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
        
    except Exception as e:
        print(f"Lỗi không mong đợi: {e}")
        return jsonify({"error": "Lỗi máy chủ nội bộ"}), 500

@jwt_required()
def update_caption(image_id):
    """
    API để cập nhật caption cho ảnh đã tải lên
    Người dùng có thể cập nhật caption (description) theo ý muốn
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or 'description' not in data:
            return jsonify({"error": "Thiếu mô tả mới"}), 400
            
        # Cập nhật mô tả mới
        updated = ImageService.update_image(image_id, user_id, data['description'])
        
        if not updated:
            return jsonify({"error": "Không thể cập nhật mô tả hoặc không có quyền"}), 403
            
        # Lấy thông tin ảnh đã cập nhật
        image = ImageService.get_image_by_id(image_id)
        
        # Trả về kết quả
        return jsonify({
            "success": True,
            "image": {
                "id": str(image.id),
                "description": image.description,
                "url": f"/api/images/file/{str(image.id)}",
                "created_at": image.created_at.isoformat() if hasattr(image, 'created_at') else None
            }
        }), 200
        
    except Exception as e:
        print(f"Lỗi không mong đợi: {e}")
        return jsonify({"error": "Lỗi máy chủ nội bộ"}), 500

@jwt_required()
def regenerate_caption(image_id):
    """
    API để tạo lại caption cho ảnh đã tải lên
    Sử dụng mô hình để tạo lại caption và cập nhật vào trường description
    """
    try:
        user_id = get_jwt_identity()
        
        # Lấy thông tin ảnh
        image = ImageService.get_image_by_id(image_id)
        
        if not image:
            return jsonify({"error": "Không tìm thấy ảnh"}), 404
            
        # Kiểm tra quyền
        if str(image.uploaded_by.id) != user_id and not hasattr(image.uploaded_by, 'role') or image.uploaded_by.role != 'admin':
            return jsonify({"error": "Không có quyền truy cập ảnh này"}), 403
        
        # Lấy loại mô hình và ngôn ngữ từ request JSON
        data = request.get_json() or {}
        model_type = data.get('model_type', 'default')
        if model_type not in ['default', 'travel']:
            model_type = 'default'
            
        # Lấy ngôn ngữ từ request JSON (tiếng Anh hoặc tiếng Việt)
        language = data.get('language', 'en')
        if language not in ['en', 'vi']:
            language = 'en'
            
        # Tạo caption mới từ dữ liệu nhị phân trong MongoDB với mô hình đã chọn và ngôn ngữ được chọn
        caption = ImageCaptionService.generate_caption_from_binary(image.image_data, speak=False, model_type=model_type, language=language)
        
        # Tạo thread riêng để phát âm mô tả ở background
        def speak_in_background():
            try:
                ImageCaptionService.speak_caption(caption, lang=language)
            except Exception as e:
                print(f"Lỗi khi phát âm ở background: {e}")
                
        # Khởi chạy thread phát âm ở background
        threading.Thread(target=speak_in_background, daemon=True).start()
        
        # Cập nhật mô tả với caption mới
        ImageService.update_image(image_id, user_id, caption)
        
        # Trả về kết quả
        return jsonify({
            "success": True,
            "image": {
                "id": str(image.id),
                "description": caption,
                "url": f"/api/images/file/{str(image.id)}",
                "created_at": image.created_at.isoformat() if hasattr(image, 'created_at') else None
            }
        }), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
        
    except Exception as e:
        print(f"Lỗi không mong đợi: {e}")
        return jsonify({"error": "Lỗi máy chủ nội bộ"}), 500

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS